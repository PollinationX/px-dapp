import useTranslation from 'next-translate/useTranslation'
import FileManagerBreadcrumb from '@/ui/breadcrumbs/file-manager.breadcrumb'
import NewFolderModal from '@/ui/modals/new-folder.modal'
import FileDropzone from '@/ui/dropzones/file.dropzone'
import UploadFileDropzone from '@/ui/dropzones/upload-file.dropzone'
import SyncContentModal from '@/ui/modals/sync-content.modal'
import SyncBackdrop from '@/ui/backdrops/sync.backdrop'
import UploadToast from '@/ui/toasts/upload.toast'
import path from 'path'
import { FC, useEffect, useState } from 'react'
import { IBreadcrumb, IFile } from '@/components/drive/types'
import { v4 as uuidv4 } from 'uuid'
import { IContractExtraContent, ITableSort } from '@/types'
import { SyncContentEnum } from '@/enums/sync-content.enum'
import { SyncContentColorEnum } from '@/enums/sync-content-color.enum'
import { useQueueState } from 'rooks'
import { HiArrowsExpand, HiPlus, HiRefresh } from 'react-icons/hi'
import { PollinationX } from '@/utils/pollinationxLocal'

import {
  countPendingFiles,
  delay,
  findBy,
  getBase64,
  getFolderFiles,
  getPendingFiles,
  getTableSortSequence,
  orderBy,
  recursiveRemoveBy,
  updateFolderStatusOnDeleteFile,
  updateFolderStatusOnNewFile
} from '@/utils/helper'
import { useAccountContext } from '@/contexts/account/provider'
import { useIndexedDBContext } from '@/contexts/indexed-db/provider'
import { toastify } from '@/utils/toastify'
import { callApi } from '@/utils/api'
import { doReadContract, doWriteContract } from '@/utils/contract'
import { decrypt, encrypt, sha512 } from '@/utils/crypto'
import { getContentByCid } from '@/utils/btfs'
import { tableSortingConfig } from '@/config'
import { pollinationX } from '@pollinationx/core'
import * as _ from 'lodash'

const Main: FC = () => {
  const { t } = useTranslation()
  const { account, setAccount } = useAccountContext()
  const { indexedDB } = useIndexedDBContext()
  const [breadcrumbs, setBreadcrumbs] = useState<IBreadcrumb[]>([])
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false)
  const [showSyncContentModal, setShowSyncContentModal] = useState<boolean>(false)
  const [showUploadToast, setShowUploadToast] = useState<boolean>(false)
  const [openSyncBackdrop, setOpenSyncBackdrop] = useState<boolean>(false)
  const [syncInProgress, setSyncInProgress] = useState<boolean>(false)
  const [uploadInProgress, setUploadInProgress] = useState<boolean>(false)
  const [uploadingFilesCount, setUploadingFilesCount] = useState<number>(0)
  const [uploadingFoldersCount, setUploadingFoldersCount] = useState<number>(0)
  const [uploadFileCounter, setUploadFileCounter] = useState<number>(0)
  const [uploadFileCount, setUploadFileCount] = useState<number>(0)
  const [uploadFileName, setUploadFileName] = useState<string>('')
  const [syncBtnColor, setSyncBtnColor] = useState<SyncContentColorEnum>(SyncContentColorEnum.SYNCED)
  const [uploadBtnColor, setUploadBtnColor] = useState<SyncContentColorEnum>(SyncContentColorEnum.SYNCED)
  const [tableSorting, setTableSorting] = useState<ITableSort[]>(tableSortingConfig.defaultValues.files)
  const [syncBackdropText, setSyncBackdropText] = useState<string>('')
  const [files, setFiles] = useState<IFile[]>([])
  const [uploadFiles, setUploadFiles] = useState<IFile[]>([])
  const [newFilesQueue, { enqueue, dequeue }] = useQueueState<IFile[]>([])
  const [folder, setFolder] = useState<IFile>(null)

  const handleAddFolderClick = async (name?: string): Promise<void> => {
    setShowNewFolderModal(false)
    if (name) {
      const folderFile: IFile = {
        id: uuidv4(),
        name,
        image: '/img/folder.png',
        type: 'folder',
        status: 'pending',
        uploaded: false,
        createdAt: `${Date.now()}`,
        size: 0,
        children: []
      }
      await _handleFiles([folderFile])
      enqueue([folderFile])
      updateFolderStatusOnNewFile(folderFile.id)(account.nfts[account.defaultNftIndex]?.files || [])
      await _handleUpdateIndexDB()
      setUploadFileCount(prevCount => prevCount + 1)
    }
  }

  const handleFileOnDrop = async (acceptedFiles: any[]): Promise<void> => {
    const newFiles = await _handleFiles(
      acceptedFiles.map((file: File) => ({
        id: uuidv4(),
        name: file.name,
        image: file.name.split('.').pop()?.toLowerCase(),
        type: 'file',
        status: 'pending',
        createdAt: `${Date.now()}`,
        size: file.size,
        file
      }))
    )
    enqueue(newFiles as IFile[])
    updateFolderStatusOnNewFile(newFiles[0].id)(account.nfts[account.defaultNftIndex]?.files || [])
    await _handleUpdateIndexDB()
    setUploadFileCount(prevCount => prevCount + newFiles.length)
  }

  const handleFileOnDoubleClick = async (file: IFile): Promise<void> => {
    if (file.type === 'folder') {
      _handleUpdateTableSorting(file.id)
      await _handleUpdateTableAndBreadcrumbs(file.id)
    }
  }

  const handleFileOnEdit = async (id: string, name?: string): Promise<void> => {
    if (name) {
      const file = findBy(id)(account.nfts[account.defaultNftIndex]?.files || [])
      file.name = `${name}${path.extname(file.name)}`
      await _handleRefreshFiles()
    }
  }

  const handleFileOnDelete = async (id: string): Promise<void> => {
    account.nfts[account.defaultNftIndex].files = recursiveRemoveBy(id)(account.nfts[account.defaultNftIndex]?.files || [])
    !folder || updateFolderStatusOnDeleteFile(folder.id)(account.nfts[account.defaultNftIndex]?.files || [])
    await _handleRefreshFiles()
    _handleCountPendingFiles()
  }

  const handleFileOnSort = async (id: number, key: string): Promise<void> => {
    const tableSortingTmp: ITableSort[] = tableSorting.map((tableSort: ITableSort) => (tableSort.id === id ? tableSort : { ...tableSort, sort: 'default' }))
    const currentTableSorting = findBy(id)(tableSortingTmp)
    currentTableSorting.sort = getTableSortSequence(currentTableSorting.sort)
    setTableSorting(_.cloneDeep(tableSortingTmp))
    account.table?.sorting ||
      (account.table = {
        sorting: {
          fileManager: {}
        }
      })
    account.table.sorting?.fileManager ||
      (account.table.sorting = {
        fileManager: {
          null: {}
        }
      })
    account.table?.sorting?.fileManager[folder?.id || null] ||
      (account.table.sorting.fileManager = { ...account.table.sorting.fileManager, [folder?.id || null]: {} })
    account.table.sorting.fileManager[folder?.id || null] = {
      id,
      sequence: currentTableSorting.sort
    }
    if (currentTableSorting.sort !== 'default') {
      const orderedFiles = orderBy(key, currentTableSorting.sort)(files)
      if (folder) {
        const currentFolder = findBy(folder.id)(account.nfts[account.defaultNftIndex]?.files || [])
        currentFolder.children = orderedFiles
      } else account.nfts[account.defaultNftIndex].files = orderedFiles
      setFiles(_.cloneDeep(orderedFiles))
    }
    await _handleUpdateIndexDB()
  }

  const handleBreadcrumbOnClick = async (index?: number): Promise<void> => {
    _handleUpdateTableSorting(index >= 0 ? breadcrumbs[index].id : null)
    if (index < 0) {
      breadcrumbs.slice(0, breadcrumbs.length)
      setBreadcrumbs([])
      setFolder(null)
      await _handleFiles(account.nfts[account.defaultNftIndex]?.files || [], false)
    } else await _handleUpdateTableAndBreadcrumbs(breadcrumbs[index].id)
  }

  const handleUploadFileOnClick = async (): Promise<void> => {
    const pendingFiles = getPendingFiles(account.nfts[account.defaultNftIndex]?.files || [])
    if (pendingFiles) {
      enqueue(pendingFiles)
      setUploadFileCount(pendingFiles.length)
    }
  }

  const handleSyncContentClick = async (syncContent: SyncContentEnum): Promise<any> => {
    setShowSyncContentModal(false)
    setOpenSyncBackdrop(true)
    setSyncInProgress(true)
    let isError = true
    switch (syncContent) {
      case SyncContentEnum.DOWNLOAD:
        const extraContentRes = await doReadContract(
          'getExtraContent',
          [Number(account.nfts[account.defaultNftIndex].id.tokenId), sha512(decrypt(account.nfts[account.defaultNftIndex].secret))],
          account.nfts[account.defaultNftIndex].contract.address
        )
        if (!extraContentRes?.error) {
          account.nfts[account.defaultNftIndex].cid = (JSON.parse(extraContentRes as string) as IContractExtraContent).cid
          account.nfts[account.defaultNftIndex].synced = true

          pollinationX.init({
            url: account.nfts[account.defaultNftIndex].endpoint,
            token: account.nfts[account.defaultNftIndex].jwt
          })

          const fileBlob = await pollinationX.download(account.nfts[account.defaultNftIndex].cid, decrypt(account.nfts[account.defaultNftIndex].secret))

          const contentRes = new TextDecoder('utf-8').decode(fileBlob)

          // const contentRes = await getContentByCid(account.nfts[account.defaultNftIndex].cid, account.nfts[account.defaultNftIndex].jwt)
          if (contentRes) {
            isError = false
            account.nfts[account.defaultNftIndex].files = JSON.parse(contentRes)
            account.nfts[account.defaultNftIndex].synced = true
            await _handleUpdateIndexDB()
            await _handleFiles(account.nfts[account.defaultNftIndex].files, false, true)
            _handleCountPendingFiles(true)
          }
        }
        break
      case SyncContentEnum.UPLOAD:
        setSyncBackdropText(t('waitingForUserConfirmation'))
        const tokenId = Number(account.nfts[account.defaultNftIndex].id.tokenId)
        const uploadRes = await callApi('/api/upload', {
          content: Buffer.from(JSON.stringify(account.nfts[account.defaultNftIndex].files)).toString('base64'),
          name: `extraContentNFT${tokenId}.json`,
          url: account.nfts[account.defaultNftIndex].endpoint,
          token: account.nfts[account.defaultNftIndex].jwt,
          secret: decrypt(account.nfts[account.defaultNftIndex].secret)
        })
        if (!uploadRes?.error) {
          await _handleSetNftSecret()
          const extraContentRes = await doWriteContract(
            'addExtraContent',
            [
              tokenId,
              sha512(decrypt(account.nfts[account.defaultNftIndex].secret)),
              JSON.stringify({
                cid: uploadRes.hash
              } as IContractExtraContent)
            ],
            '',
            account.nfts[account.defaultNftIndex].contract.address
          )
          if (!extraContentRes?.error) {
            setSyncBackdropText(t('waitingForBlockchainConfirmation'))
            await extraContentRes.wait(1)
            isError = false
            account.nfts[account.defaultNftIndex].cid = uploadRes.hash
            account.nfts[account.defaultNftIndex].synced = true
            await _handleUpdateIndexDB()
            _handleCountPendingFiles()
          }
        }
        break
      default:
        break
    }
    toastify(t(!isError ? 'syncExtraContentSuccess' : 'syncExtraContentFailed'), !isError ? 'success' : 'error')
    setOpenSyncBackdrop(false)
    setSyncInProgress(false)
  }

  const _handleUpdateFolderStatus = async (): Promise<void> => {
    const pendingFolders = getPendingFiles(account.nfts[account.defaultNftIndex].files, true)
    for (let i = pendingFolders.length - 1; i >= 0; i--) {
      const currentFolder = findBy(pendingFolders[i].id)(account.nfts[account.defaultNftIndex].files)
      let updateFolderStatus = true
      if (currentFolder.children) {
        const pendingFiles = getPendingFiles(currentFolder.children)
        updateFolderStatus = !pendingFiles.length
      }
      if (updateFolderStatus) {
        pendingFolders[i].status = 'uploaded'
        await _handleUpdateIndexDB()
      }
    }
  }

  const _handleUpdateTableAndBreadcrumbs = async (id: string): Promise<void> => {
    const currentFolder = findBy(id)(account.nfts[account.defaultNftIndex]?.files || [])
    setFolder(currentFolder)
    if (currentFolder.children) {
      await _handleFiles(currentFolder.children, false)
      const breadcrumbId = breadcrumbs.findIndex(breadcrumb => breadcrumb.id === currentFolder.id)
      const newBreadcrumbs: IBreadcrumb[] =
        breadcrumbId >= 0 ? breadcrumbs.slice(0, breadcrumbId + 1) : [...breadcrumbs, { id: currentFolder.id, name: currentFolder.name }]
      setBreadcrumbs(newBreadcrumbs)
    }
  }

  const _handleRefreshFiles = async (): Promise<void> => {
    await _handleUpdateIndexDB()
    if (folder) {
      const currentFolder = findBy(folder.id)(account.nfts[account.defaultNftIndex]?.files || [])
      await _handleFiles(currentFolder.children, false)
    } else {
      await _handleFiles(account.nfts[account.defaultNftIndex]?.files || [], false)
    }
  }

  const _handleUpdateTableSorting = (id?: string): void => {
    const tableSortingTmp: ITableSort[] = tableSorting.map((tableSort: ITableSort) => ({ ...tableSort, sort: 'default' }))
    if (account.table.sorting?.fileManager[id]) {
      const currentTableSorting = findBy(account.table.sorting.fileManager[id].id)(tableSortingTmp)
      currentTableSorting.sort = account.table.sorting.fileManager[id].sequence
    }
    setTableSorting(_.cloneDeep(tableSortingTmp))
  }

  const _handleCountPendingFiles = (reset?: boolean): void => {
    const { filesCount, folderCount } = !reset ? countPendingFiles(account.nfts[account.defaultNftIndex]?.files || []) : { filesCount: 0, folderCount: 0 }
    setTimeout(() => {
      setUploadingFilesCount(filesCount)
      setUploadingFoldersCount(folderCount)
    })
  }

  const _handleFiles = async (files: IFile[], concat: boolean = true, init: boolean = false): Promise<IFile[]> => {
    if (folder && concat) {
      const currentFolder = findBy(folder.id)(account.nfts[account.defaultNftIndex]?.files || [])
      currentFolder.children = currentFolder.children.concat(files)
      await _handleUpdateIndexDB()
      setFiles(currentFolder.children)
    } else {
      if (init) {
        if (account.table.sorting?.fileManager) {
          const currentTableSorting = findBy(account.table.sorting.fileManager.null.id)(tableSorting)
          currentTableSorting.sort = account.table.sorting.fileManager.null.sequence
          setTableSorting(_.cloneDeep(tableSorting))
        }
        await handleBreadcrumbOnClick(-1)
        await _handleUpdateIndexDB()
      } else if (concat) {
        account.nfts[account.defaultNftIndex].files = [...(account.nfts[account.defaultNftIndex]?.files || []), ...files]
        await _handleUpdateIndexDB()
      }
      setFiles(concat ? account.nfts[account.defaultNftIndex]?.files || [] : files)
    }
    return files.filter(file => file.status === 'pending')
  }

  const _handleUpdateIndexDB = async (): Promise<void> => {
    setAccount(_.cloneDeep(account))
    await indexedDB.put(account)
  }

  const _handleSetNftSecret = async (): Promise<void> => {
    if (!account.nfts[account.defaultNftIndex].secret) {
      account.nfts[account.defaultNftIndex].secret = encrypt(pollinationX.generateWallet().privateKey.slice(2))
      await _handleUpdateIndexDB()
    }
  }
  // const uploadToPollinationX = async (
  //   url: string,
  //   token: string,
  //   content: string,
  //   name: string,
  //   secret?: string
  // ): Promise<{ success: boolean; hash?: string; error?: string }> => {
  //   try {
  //     pollinationX.init({
  //       url,
  //       token
  //     })
  //     console.log('-------------uploadToPollinationX---------------')
  //     // const hash = await pollinationX.upload(Buffer.from(content.split(';base64,').pop(), 'base64'), name, secret)
  //     const hash = await pollinationX.upload(Buffer.from(content.split(';base64,').pop(), 'base64'), name)
  //
  //     console.log('!!!-------------uploadToPollinationX---------------!!!!')
  //
  //     return { success: true, hash }
  //   } catch (error) {
  //     return { success: false, error: error.message || 'An error occurred during the upload.' }
  //   }
  // }
  const uploadToPollinationX = async (
    url: string,
    token: string,
    content: string,
    name: string,
    secret?: string
  ): Promise<{ success: boolean; hash?: string; error?: string }> => {
    try {
      const pxInstance = new PollinationX(url, token)

      console.log('-------------uploadToPollinationX local---------------')
      const file = new File([Buffer.from(content.split(';base64,').pop() || '', 'base64')], name)
      const hash = await pxInstance.upload(file)
      console.log('!!!-------------uploadToPollinationX local---------------!!!!')

      return { success: true, hash }
    } catch (error) {
      return { success: false, error: error.message || 'An error occurred during the upload.' }
    }
  }
  const _handleUploadFile = async (file: IFile): Promise<boolean> => {
    const folderFiles = folder ? getFolderFiles(folder.id)(account.nfts[account.defaultNftIndex].files) : account.nfts[account.defaultNftIndex].files
    const uploadFile = findBy(file.id)(account.nfts[account.defaultNftIndex].files)
    if (!uploadFile) return false
    uploadFile.status = 'uploading'
    setFiles(_.cloneDeep(folderFiles))
    setUploadFileName(uploadFile.name)
    setUploadFileCounter(prevCounter => prevCounter + 1)
    if (file.type === 'file') {
      // await delay(5000)

      const endpoint = account.nfts[account.defaultNftIndex].endpoint
      const jwtToken = account.nfts[account.defaultNftIndex].jwt
      const secret = decrypt(account.nfts[account.defaultNftIndex].secret)
      const content = await getBase64(uploadFile.file)
      const name = uploadFile.name

      const uploadRes = await uploadToPollinationX(endpoint, jwtToken, content, name, secret)

      // console.log("after upload px res")
      // console.log(uploadRes)

      // const uploadRes = await callApi('/api/upload', {
      //   content: content,
      //   name: name,
      //   url: endpoint,
      //   token: jwtToken,
      //   secret: secret
      // })

      // console.log("after upload1 px res")
      // console.log(uploadRes1)

      if (!uploadRes?.error) {
        uploadFile.hash = uploadRes.hash
        uploadFile.status = 'uploaded'
        delete uploadFile.file
      } else {
        toastify(t('uploadErrorInfo'), 'error')
        uploadFile.status = 'pending'
      }
    } else {
      uploadFile.uploaded = true
      uploadFile.status = 'uploaded'
    }
    setFiles(_.cloneDeep(folderFiles))
    await _handleUpdateIndexDB()
    return true
  }

  const _handleUploadFiles = async () => {
    while (uploadFiles.length) {
      await _handleUploadFile(uploadFiles.shift())
      if (!uploadFiles.length) setUploadFiles([])
    }
  }

  useEffect(() => {
    if (uploadInProgress) {
      if (uploadFiles.length > 0) {
        _handleUploadFiles()
      } else {
        if (newFilesQueue.length === 0) {
          setUploadInProgress(false)
          setShowUploadToast(false)
          setUploadFileCounter(0)
          setUploadFileCount(0)
          _handleCountPendingFiles()
          account.nfts[account.defaultNftIndex].synced = false
          _handleUpdateIndexDB()
          _handleUpdateFolderStatus()
        } else setUploadFiles(_.cloneDeep(dequeue()))
      }
    }
  }, [uploadFiles])

  useEffect(() => {
    if (newFilesQueue.length > 0 && !uploadInProgress) {
      setUploadInProgress(true)
      setShowUploadToast(true)
      setUploadFiles(_.cloneDeep(dequeue()))
    }
  }, [newFilesQueue])

  useEffect(() => {
    if (account.address) {
      _handleFiles(account.nfts[account.defaultNftIndex]?.files || [], false, true)
      _handleCountPendingFiles()
    }
  }, [account.address, account.defaultNftIndex])

  useEffect(() => {
    if (uploadingFilesCount > 0 || uploadingFoldersCount > 0) {
      setUploadBtnColor(SyncContentColorEnum.UPLOAD)
      setSyncBtnColor(SyncContentColorEnum.DOWNLOAD)
    } else {
      setUploadBtnColor(SyncContentColorEnum.SYNCED)
      setSyncBtnColor(!account.address || account.nfts[account.defaultNftIndex].synced ? SyncContentColorEnum.SYNCED : SyncContentColorEnum.UPLOAD)
    }
  }, [uploadingFilesCount, uploadingFoldersCount, account?.nfts[account?.defaultNftIndex]?.synced])

  return (
    <div className='h-max pt-14 sm:ml-64 bg-neutral-50 dark:bg-neutral-800'>
      <div className='py-3 mt-10 sm:py-5 mt-lg:col-span-2'>
        {account?.nfts?.length > 0 && (
          <div className='grid grid-cols-4 gap-4'>
            <div>
              <div onClick={() => setShowNewFolderModal(true)} className='mx-auto max-w-screen-2xl px-4 lg:px-12 text-center'>
                <button className='flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700'>
                  <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                    <HiPlus className='text-4xl text-gray-300' />
                    <p className='py-1 text-sm text-gray-600 dark:text-gray-500'>{t('createNewFolder')}</p>
                  </div>
                </button>
              </div>
            </div>
            <div>
              <UploadFileDropzone onDrop={handleFileOnDrop} />
            </div>
            <div>
              <div className='mx-auto max-w-screen-2xl px-4 lg:px-12 text-center'>
                <button
                  onClick={handleUploadFileOnClick}
                  className={`flex h-32 w-full cursor-pointer items-center justify-center flex-col rounded border-2 border-dashed ${uploadBtnColor} hover:bg-gray-50 dark:hover:bg-gray-700`}
                >
                  <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                    <HiArrowsExpand className={`text-4xl text-gray-300 ${uploadInProgress ? 'animate-spin' : ''}`} />
                    <p className='py-1 text-sm text-gray-600 dark:text-gray-500'>{t('uploadToDecentralizedStorage')}</p>
                  </div>
                </button>
              </div>
            </div>
            <div>
              <div className='mx-auto max-w-screen-2xl px-4 lg:px-12 text-center'>
                <button
                  onClick={() => setShowSyncContentModal(true)}
                  className={`flex h-32 w-full cursor-pointer flex-col rounded border-2 justify-center items-center border-dashed ${syncBtnColor} hover:bg-gray-50 dark:hover:bg-gray-700`}
                >
                  <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                    <HiRefresh className={`text-4xl text-gray-300 ${syncInProgress ? 'animate-spin' : ''}`} />
                    <p className='py-1 text-sm text-gray-600 dark:text-gray-500'>{t('syncWithBlockchain')}</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <section className='py-3 sm:py-5'>
        <div className='mx-auto max-w-screen-2xl px-4 lg:px-12'>
          <FileManagerBreadcrumb breadcrumbs={breadcrumbs} onClick={fileId => handleBreadcrumbOnClick(fileId)} />
          <div className='pb-4 mb-10 mt-4 bg-white dark:bg-neutral-800 relative shadow-md sm:rounded-lg'>
            <div className='overflow-x-auto'>
              <FileDropzone
                files={files}
                tableSorting={tableSorting}
                onEdit={handleFileOnEdit}
                onDelete={handleFileOnDelete}
                onDrop={handleFileOnDrop}
                onDoubleClick={handleFileOnDoubleClick}
                onSort={handleFileOnSort}
              />
            </div>
          </div>
        </div>
      </section>
      <NewFolderModal show={showNewFolderModal} onClose={handleAddFolderClick} />
      <SyncBackdrop open={openSyncBackdrop} text={syncBackdropText} />
      <SyncContentModal show={showSyncContentModal} onClose={handleSyncContentClick} />
      <UploadToast show={showUploadToast} filename={uploadFileName} counter={uploadFileCounter} count={uploadFileCount} />
    </div>
  )
}

export default Main
