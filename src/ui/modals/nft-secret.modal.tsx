import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useRef, useState } from 'react'
import { IContractExtraContent, INft } from '@/types'
import { InputColorEnum } from '@/enums/input-color.enum'
import { HiClipboardCopy, HiKey } from 'react-icons/hi'
import { useAccountContext } from '@/contexts/account/provider'
import { decrypt, encrypt, sha512 } from '@/utils/crypto'
import { useIndexedDBContext } from '@/contexts/indexed-db/provider'
import { toastify } from '@/utils/toastify'
import { doReadContract } from '@/utils/contract'
import { getContentByCid } from '@/utils/btfs'
import { Button, Label, Modal, Tabs, TabsRef, TextInput } from 'flowbite-react'
import { pollinationX } from '@pollinationx/core'
import * as _ from 'lodash'
import { Checkbox } from '@mui/material'

interface INftSecretModalProps {
  show: boolean
  onClose: any
  nft: INft
  nftIndex: number
  activeTabIndex?: number
  disableCreate?: boolean
  disableImport?: boolean
  disableExport?: boolean
}

const NftSecretModal: FC<INftSecretModalProps> = ({ show, onClose, nft, nftIndex, activeTabIndex = 0, disableCreate, disableImport, disableExport }) => {
  const { t } = useTranslation()
  const { account, setAccount } = useAccountContext()
  const { indexedDB } = useIndexedDBContext()
  const tabsRef = useRef<TabsRef>(null)
  const inputCreatePrivateKeyRef = useRef<HTMLInputElement>()
  const inputImportPrivateKeyRef = useRef<HTMLInputElement>()
  const inputExportPrivateKeyRef = useRef<HTMLInputElement>()
  const [inputImportColor, setInputImportColor] = useState<string>(InputColorEnum.DEFAULT)
  const [inputImportHelperText, setInputImportHelperText] = useState<string>('')
  const [isChecked, setIsChecked] = useState(false)

  const handleCreatePrivateKeyOnClick = async (): Promise<void> => {
    account.nfts[nftIndex].secret = encrypt(inputCreatePrivateKeyRef.current.value)
    account.nfts[nftIndex].synced = true
    await indexedDB.put(account)
    setAccount(_.cloneDeep(account))
    handleOnClose(true)
  }

  const handleImportPrivateKeyOnClick = async (event): Promise<void> => {
    event.preventDefault()
    if (!inputImportPrivateKeyRef.current.checkValidity()) {
      setInputImportColor(InputColorEnum.WARNING)
      setInputImportHelperText(t('importPrivateKeyMissing'))
      return
    }
    setInputImportColor(InputColorEnum.DEFAULT)
    setInputImportHelperText('')
    const extraContentRes = await doReadContract(
      'getExtraContent',
      [Number(nft.id.tokenId), sha512(inputImportPrivateKeyRef.current.value.trim())],
      account.nfts[nftIndex].contract.address
    )
    if (!extraContentRes?.error) {
      account.nfts[nftIndex].cid = (JSON.parse(extraContentRes as string) as IContractExtraContent).cid
      account.nfts[nftIndex].secret = encrypt(inputImportPrivateKeyRef.current.value)
      account.nfts[nftIndex].synced = true

      pollinationX.init({
        url: account.nfts[account.defaultNftIndex].endpoint,
        token: account.nfts[account.defaultNftIndex].jwt
      })

      const fileBlob = await pollinationX.download(account.nfts[account.defaultNftIndex].cid, decrypt(account.nfts[account.defaultNftIndex].secret))

      const contentRes = new TextDecoder('utf-8').decode(fileBlob)

      // const contentRes = await getContentByCid(account.nfts[nftIndex].cid, account.nfts[nftIndex].jwt)
      if (contentRes) {
        account.nfts[nftIndex].files = JSON.parse(contentRes)
        await indexedDB.put(account)
        setAccount(_.cloneDeep(account))
      }
      handleOnClose(true)
    } else if (extraContentRes.error.message.includes('Invalid Hash')) {
      setInputImportColor(InputColorEnum.FAILURE)
      setInputImportHelperText(t('importPrivateKeyInvalid'))
    }
  }

  const handleExportPrivateKeyOnClick = async (): Promise<void> => {
    inputExportPrivateKeyRef.current.value = decrypt(nft.secret)
  }

  const handleCopyToClipboardOnClick = (value: string): void => {
    navigator.clipboard.writeText(value)
    toastify(t('copiedToClipboard'))
  }

  const handleOnClose = (redirect: boolean = true): void => {
    _handleResetValues()
    onClose(redirect)
  }

  const _handleResetValues = (): void => {
    inputCreatePrivateKeyRef.current.value = ''
    inputImportPrivateKeyRef.current.value = ''
    inputExportPrivateKeyRef.current.value = ''
  }

  useEffect(() => {
    tabsRef.current?.setActiveTab(activeTabIndex)
  }, [activeTabIndex])

  return (
    <Modal className='nftSecretModal' show={show} position='center' onClose={() => handleOnClose(false)}>
      <Modal.Header className='rounded-t px-6 py-4 bg-white dark:bg-pollinationx-black'>
        <div className='px-4 text-base font-semibold text-gray-900 lg:text-xl dark:text-white'>NFT: {nft?.title}</div>
      </Modal.Header>
      <Modal.Body
        className='border-t  dark:border-gray-600 bg-white dark:bg-gradient-to-b
                                                    from-pollinationx-black to-pollinationx-purple'
      >
        <div className='space-y-6 p-3 overflow-x-scroll '>
          <Tabs.Group ref={tabsRef} style='fullWidth' className='tabsItem'>
            <Tabs.Item title={t('createNewAccount')} disabled={!!disableCreate}>
              <div>
                <div className='mb-2 block'>
                  <Label htmlFor='createPrivateKey' value={t('privateKey')} />
                  <p className='text-red-400 dark:text-red-400'>{t('createNewAccountPrivateKeyInfo')}</p>
                </div>
                <div className='flex'>
                  <TextInput
                    id='createPrivateKey'
                    className='min-w-[479px]'
                    ref={inputCreatePrivateKeyRef}
                    value={pollinationX.generateWallet().privateKey.slice(2)}
                    readOnly={true}
                    icon={HiKey}
                  />
                  <Button className='nftModalCopyToClipboard'>
                    <HiClipboardCopy
                      className='h-5 w-5 text-white text-right'
                      onClick={() => handleCopyToClipboardOnClick(inputCreatePrivateKeyRef.current.value)}
                    />
                  </Button>
                </div>
                <div className='flex items-center mt-4'>
                  <input
                    type='checkbox'
                    value=''
                    id='confirmationCheckbox'
                    className='w-4 h-4 text-pollinationx-honey bg-neutral-100 border-gray-300 rounded ring-offset-0 dark:focus:ring-0 dark:ring-offset-0 focus:ring-0 dark:bg-neutral-700 dark:border-gray-600'
                    checked={isChecked}
                    onChange={() => setIsChecked(!isChecked)}
                  />
                  <Label htmlFor='confirmationCheckbox' className='ml-2'>
                    <span className='block text-red-400 dark:text-red-400'>{t('iSavedPrivateKey')}</span>
                    <span className='block italic text-[12px]'>{t('iSavedPrivateKeyInfo')}</span>
                  </Label>
                </div>
                <button
                  disabled={!isChecked}
                  className={`relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 mt-4
                                                    overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
                                                    from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
                                                    hover:text-white dark:text-white focus:outline-none focus:ring-0
                                                    dark:focus:ring-blue-800 ${!isChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleCreatePrivateKeyOnClick}
                >
                  <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
                    {t('create')}
                  </span>
                </button>
              </div>
            </Tabs.Item>
            <Tabs.Item hidden={true} title={t('importAccount')} disabled={!!disableImport}>
              <div>
                <div className='mb-2 block'>
                  <Label htmlFor='importPrivateKey' value={t('privateKey')} />
                  <p className='text-red-400 dark:text-red-400'>{t('importAccountPrivateKeyInfo')}</p>
                </div>
                <div>
                  <TextInput
                    id='importPrivateKey'
                    ref={inputImportPrivateKeyRef}
                    icon={HiKey}
                    required={true}
                    color={inputImportColor}
                    helperText={inputImportHelperText}
                  />
                </div>
                <button
                  className='relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 mt-4
                                                    overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
                                                    from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
                                                    hover:text-white dark:text-white focus:outline-none focus:ring-0
                                                    dark:focus:ring-blue-800'
                  onClick={handleImportPrivateKeyOnClick}
                >
                  <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
                    {t('import')}
                  </span>
                </button>
              </div>
            </Tabs.Item>
            <Tabs.Item title={t('exportAccount')} disabled={!!disableExport}>
              <div>
                <div className='mb-2 block'>
                  <Label htmlFor='exportPrivateKey' value={t('privateKey')} />
                  <p className='text-red-400 dark:text-red-400'>{t('createNewAccountPrivateKeyInfo')}</p>
                </div>
                <button
                  className='relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 mt-4
                                                    overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
                                                    from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
                                                    hover:text-white dark:text-white focus:outline-none focus:ring-0
                                                    dark:focus:ring-blue-800'
                  onClick={handleExportPrivateKeyOnClick}
                >
                  <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
                    {t('showPrivateKey')}
                  </span>
                </button>
                <div className='flex'>
                  <TextInput id='exportPrivateKey' className='min-w-[479px]' ref={inputExportPrivateKeyRef} readOnly={true} icon={HiKey} />
                  <Button className='nftModalCopyToClipboard'>
                    <HiClipboardCopy
                      className='h-5 w-5 text-white text-right rounded-bl-none'
                      onClick={() => handleCopyToClipboardOnClick(inputExportPrivateKeyRef.current.value)}
                    />
                  </Button>
                </div>
              </div>
            </Tabs.Item>
          </Tabs.Group>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default NftSecretModal
