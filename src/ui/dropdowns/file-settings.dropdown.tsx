import FileSaver from 'file-saver'
import useTranslation from 'next-translate/useTranslation'
import EditNameModal from '@/ui/modals/edit-name.modal'
import { FC, useState } from 'react'
import { IFile } from '@/components/drive/types'
import { HiDownload, HiOutlinePencilAlt, HiTrash } from 'react-icons/hi'
import { useAccountContext } from '@/contexts/account/provider'
import { Dropdown } from 'flowbite-react'
import { pollinationX } from '@pollinationx/core'
import { PollinationX } from '@/utils/pollinationxLocal'
import { decrypt } from '@/utils/crypto'

interface IFileSettingsDropdownProps {
  file: IFile
  onEdit: any
  onDelete: any
}

const FileSettingsDropdown: FC<IFileSettingsDropdownProps> = ({ file, onEdit, onDelete }) => {
  const { t } = useTranslation()
  const { account } = useAccountContext()
  const [showEditNameModal, setShowEditNameModal] = useState<boolean>(false)

  const handleDownloadOnClick = async (file: IFile): Promise<void> => {
    // const pxDownload = new PxDownload();
    // pxDownload.init({
    //   url: account.nfts[account.defaultNftIndex].endpoint,
    //   token: account.nfts[account.defaultNftIndex].jwt
    // });
    //
    // try {
    //   const decryptedSecret = decrypt(account.nfts[account.defaultNftIndex].secret);
    //   console.log('decryptedSecret:', decryptedSecret);
    //
    //   const fileBlob = await pxDownload.download(file.hash, decryptedSecret);
    //   console.log("file.name");
    //   console.log(file.name);
    //   FileSaver.saveAs(new Blob([fileBlob], { type: 'application/octet-stream' }), file.name);
    // } catch (error) {
    //   console.error('Download error:', error);
    // }

    pollinationX.init({
      url: account.nfts[account.defaultNftIndex].endpoint,
      token: account.nfts[account.defaultNftIndex].jwt
    })
    // console.log('decrypt secret')
    console.log(account.nfts[account.defaultNftIndex].secret)

    try {
      const decryptedSecret = decrypt(account.nfts[account.defaultNftIndex].secret)
      // console.log('decryptedSecret:', decryptedSecret);
      // console.log('px download')
      const fileBlob = await pollinationX.download(file.hash)
      // const fileBlob = await pollinationX.download(file.hash, decryptedSecret);
      // console.log("file.name")
      // console.log(file.name)
      FileSaver.saveAs(new Blob([fileBlob], { type: 'application/octet-stream' }), file.name)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const handleOnClose = (name?: string): void => {
    setShowEditNameModal(false)
    onEdit(name)
  }

  return (
    <>
      <Dropdown
        className='bg-transparent dark:bg-neutral-700 shadow-0
                divide-0 border-none text-neutral-900 dark:border-none'
        arrowIcon={false}
        inline
        label={
          <span className='inline-flex cursor-pointer justify-center rounded p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-white'>
            <span className='sr-only'>{t('fileSettings')}</span>
            <svg className='w-5 h-5' aria-hidden='true' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
              <path d='M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z' />
            </svg>
          </span>
        }
      >
        {file.status === 'uploaded' && file.type !== 'folder' && (
          <Dropdown.Item onClick={() => handleDownloadOnClick(file)}>
            <a href='#' className='w-full flex items-center text-sm py-2 px-2 hover:bg-neutral-100 dark:hover:bg-neutral-600 dark:hover:text-white'>
              <HiDownload className='text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white' />{' '}
              <span className='ml-3'>{t('download')}</span>
            </a>
          </Dropdown.Item>
        )}
        <Dropdown.Item onClick={() => setShowEditNameModal(true)}>
          <a
            href='#'
            className='w-full flex items-center text-sm py-2 px-2 hover:bg-neutral-100 dark:hover:bg-neutral-600 dark:hover:text-white border-b border-gray-200 dark:border-gray-600'
          >
            <HiOutlinePencilAlt className='text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white' />{' '}
            <span className='ml-3'>{t('edit')}</span>
          </a>
        </Dropdown.Item>
        {/*<Dropdown.Item className='hover:bg-neutral-100 dark:hover:bg-neutral-600 dark:hover:text-white border-b border-gray-200 dark:border-gray-600'>*/}
        {/*  <a href='#' className='w-full flex items-center text-sm py-2 px-2 hover:bg-neutral-100 dark:hover:bg-neutral-600 dark:hover:text-white'>*/}
        {/*    {' '}*/}
        {/*    <HiShare className='text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white' />{' '}*/}
        {/*    <span className='ml-3'>W3XShare</span>*/}
        {/*  </a>*/}
        {/*</Dropdown.Item>*/}
        <Dropdown.Item className='hover:bg-neutral-100 dark:hover:bg-neutral-600 dark:hover:text-white' onClick={onDelete}>
          <a href='#' className='w-full flex items-center text-sm py-2 px-2 hover:bg-neutral-100 dark:hover:bg-neutral-600 dark:hover:text-white'>
            {' '}
            <HiTrash className='text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white' />
            <span className='ml-3'>{t('delete')}</span>
          </a>
        </Dropdown.Item>
      </Dropdown>
      <EditNameModal show={showEditNameModal} onClose={handleOnClose} name={file.name} type={file.type} />
    </>
  )
}

export default FileSettingsDropdown
