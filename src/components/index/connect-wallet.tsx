import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useState } from 'react'
import { IAccount } from '@/types'
import { useWeb3Modal } from '@web3modal/react'
import { useAccount, useNetwork, useConnect } from 'wagmi'
import { mergeNfts, truncateAddress } from '@/utils/helper'
import { useIndexedDBContext } from '@/contexts/indexed-db/provider'
import { decrypt, encrypt } from '@/utils/crypto'
import { useAccountContext } from '@/contexts/account/provider'
import { getNfts } from '@/utils/btfs'
import { appConfig } from '@/config'
import { toastify } from '@/utils/toastify'
import { Spinner } from 'flowbite-react'
interface IConnectWalletProps {
  show: boolean
  onClose: any
}

const ConnectWallet: FC<IConnectWalletProps> = ({ show, onClose }) => {
  const { t } = useTranslation()
  const { open } = useWeb3Modal()
  const { isConnected, address } = useAccount()
  const { indexedDB } = useIndexedDBContext()
  const { account } = useAccountContext()
  const { chain } = useNetwork()
  const [agreeState, setAgreeState] = useState<boolean>(false)
  const [connectedAccount, setConnectedAccount] = useState<IAccount>(null)
  const [accountPassword, setAccountPassword] = useState<string>('')
  const [accountPasswordText, setAccountPasswordText] = useState<string>('')
  const [accountInvalidPassword, setAccountInvalidPassword] = useState<boolean>(false)
  const [isLoadingButton, setIsLoadingButton] = useState<boolean>(false)

  const { connect, connectors, isLoading, pendingConnector } = useConnect()
  const handleConnectWalletOnClick = async (): Promise<void> => {
    await open()
  }

  const handleOnKeyUp = async (event: any): Promise<void> => {
    event.key !== 'Enter' || (await handleSetPasswordOnClick())
  }

  const handleSetPasswordOnClick = async (): Promise<void> => {
    if (!connectedAccount) {
      account.address = address
      account.password = encrypt(accountPassword)
      account.locale = appConfig.locale
      account.defaultNftIndex = 0
      account.contractAddress = null
      account.chainAddress = chain.id + '_' + address
      account.symbol = null
      account.contractOwner = null
      account.table = { sorting: null }
    } else {
      setAccountInvalidPassword(false)
      if (decrypt(connectedAccount.password) !== accountPassword) {
        setAccountInvalidPassword(true)
        return
      }
      account.address = connectedAccount.address
      account.password = connectedAccount.password
      account.locale = connectedAccount.locale
      account.defaultNftIndex = connectedAccount.defaultNftIndex
      account.contractAddress = connectedAccount.contractAddress
      account.contractOwner = connectedAccount.contractOwner
      account.symbol = connectedAccount.symbol
      account.nfts = connectedAccount.nfts
      account.packages = connectedAccount.packages
      account.bandwidthPackages = connectedAccount.bandwidthPackages
      account.chainAddress = chain.id + '_' + connectedAccount.address
      account.table = connectedAccount.table
    }
    setIsLoadingButton(true)
    const nftsRes = await getNfts(address)
    if (!nftsRes?.error) {
      account.contractAddress = nftsRes.contractAddress
      account.contractOwner = nftsRes.contractOwner
      account.packages = nftsRes.packages
      account.bandwidthPackages = nftsRes.bandwidthPackages
      account.symbol = nftsRes.symbol
      account.nfts = mergeNfts(account.nfts, nftsRes.nfts)
      await indexedDB.put(account)
      onClose(true)
    } else {
      toastify(t(nftsRes?.error?.message), 'error')
    }
    setIsLoadingButton(false)
  }

  const _handleCheckAccount = async (): Promise<void> => {
    const currentAccount = await indexedDB.get(chain.id + '_' + address)
    setAccountPasswordText('newAccountPasswordText')
    setConnectedAccount(null)
    if (currentAccount) {
      setConnectedAccount(currentAccount)
      setAccountPasswordText('accountPasswordText')
    }
  }

  useEffect(() => {
    !isConnected || !indexedDB || _handleCheckAccount()
  }, [isConnected, indexedDB, chain])

  useEffect(() => {
    if (!show) {
      setAgreeState(false) // Reset the agreeState when the modal is closed
    }
  }, [show])

  if (!show) return <></>

  return isConnected ? (
    <>
      <div className='fixed inset-0 bg-gray-600 bg-opacity-70 overflow-y-auto h-full w-full' id='my-modal-overlay'></div>
      <div id='crypto-modal' className='fixed z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)]'>
        <div className='relative w-full h-full max-w-md md:h-auto '>
          <div
            className='relative bg-white rounded-lg shadow dark:bg-gradient-to-b
                                                    from-pollinationx-black to-pollinationx-purple'
          >
            <button
              type='button'
              onClick={() => onClose(false)}
              className='absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white'
              data-modal-hide='crypto-modal'
            >
              <svg aria-hidden='true' className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                ></path>
              </svg>
              <span className='sr-only'>{t('close')}</span>
            </button>
            <div className='px-6 py-4 border-b rounded-t dark:border-gray-600'>
              <h3 className='text-base font-semibold text-gray-900 lg:text-xl dark:text-white'>
                {t('account')} ({truncateAddress(address)})
              </h3>
            </div>
            <div className='p-6'>
              <p className='text-pollinationx-grey text-sm'>{t(accountPasswordText)}</p>
              <ul className='my-4 space-y-3'>
                <li>
                  <div>
                    <label htmlFor='account-password' className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'>
                      {t('enterAccountPassword')}
                    </label>
                    <input
                      type='password'
                      id='account-password'
                      autoFocus={true}
                      onChange={event => setAccountPassword(event.target.value)}
                      onKeyUp={handleOnKeyUp}
                      className='bg-transparent border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-transparent dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                      required
                    />
                    {accountInvalidPassword && <span className='text-sm text-red-600'>{t('invalidAccountPassword')}</span>}
                  </div>
                  <button
                    type='button'
                    disabled={isLoadingButton}
                    onClick={handleSetPasswordOnClick}
                    className={`relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 mt-4
    overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
    from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
    hover:text-white dark:text-white focus:outline-none focus:ring-0
    dark:focus:ring-blue-800 ${isLoadingButton ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
                      {isLoadingButton ? <Spinner className='mr-3' /> : ''}
                      {isLoadingButton ? t('loggingIn') : t('confirm')}
                    </span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className='fixed inset-0 bg-neutral-600 bg-opacity-70 overflow-y-auto h-full w-full' id='my-modal-overlay'></div>
      <div id='crypto-modal' className='fixed z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)]'>
        <div className='relative w-full h-full max-w-md md:h-auto'>
          <div className='relative bg-white rounded-lg shadow dark:bg-neutral-700'>
            <button
              type='button'
              onClick={() => onClose(false)}
              className='absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-neutral-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-neutral-800 dark:hover:text-white'
              data-modal-hide='crypto-modal'
            >
              <svg aria-hidden='true' className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                ></path>
              </svg>
              <span className='sr-only'>{t('close')}</span>
            </button>
            <div className='px-6 py-4 border-b rounded-t dark:border-gray-600'>
              <h3 className='text-base font-semibold text-gray-900 lg:text-xl dark:text-white'>{t('connectWallet')}</h3>
            </div>
            <div className='p-6'>
              <p>
                <input
                  onChange={() => setAgreeState(!agreeState)}
                  id='agree-checkbox'
                  type='checkbox'
                  value=''
                  className='w-4 h-4 text-pollinationx-honey bg-neutral-100 border-gray-300 rounded ring-offset-0 dark:focus:ring-0 dark:ring-offset-0 focus:ring-0 dark:bg-neutral-700 dark:border-gray-600'
                />
                <label htmlFor='agree-checkbox' className='text-sm font-normal text-gray-500 dark:text-gray-400 ml-2'>
                  {t('iAgreeTo')}{' '}
                  <a
                    className='text-pollinationx-honey'
                    target='_blank'
                    href='https://github.com/immu3-io/static-assets/raw/main/pdf/2023-02-20_CR_Systems_Privacy_Policy.pdf'
                  >
                    {' '}
                    {t('privacyPolicy')}{' '}
                  </a>
                  {t('and')}{' '}
                  <a
                    className='text-pollinationx-honey'
                    target='_blank'
                    href='https://github.com/immu3-io/static-assets/raw/main/pdf/2023-03-13_CR_Systems_dMail_dChat_w3xshare_Software_Terms.pdf'
                  >
                    {t('softwareTerms')}
                  </a>
                </label>
              </p>
              <ul className='my-4 space-y-3'>
                {connectors
                  .slice()
                  .reverse()
                  .map(connector =>
                    connector.id == 'walletConnect' ? (
                      <li key={connector.id}>
                        <button
                          disabled={!connector.ready || !agreeState}
                          key={connector.id}
                          onClick={handleConnectWalletOnClick}
                          className='disabled:opacity-25 disabled:pointer-events-none w-full text-left flex items-center p-3 text-base font-bold text-gray-900 rounded-lg bg-neutral-50 hover:bg-neutral-100 group hover:shadow dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:text-white'
                        >
                          <img className='h-5' src={`/img/wallets/${connector.id}.svg`} />
                          <span className='flex-1 ml-3 whitespace-nowrap'>
                            {connector.name}
                            {!connector.ready && ` (${t('unsupported')})`}
                            {isLoading && connector.id === pendingConnector?.id && ` (${t('connecting')})`}
                          </span>
                        </button>
                      </li>
                    ) : (
                      <li key={connector.id}>
                        <button
                          disabled={!connector.ready || !agreeState}
                          key={connector.id}
                          onClick={() => connect({ connector })}
                          className='disabled:opacity-25 disabled:pointer-events-none w-full text-left flex items-center p-3 text-base font-bold text-gray-900 rounded-lg bg-neutral-50 hover:bg-neutral-100 group hover:shadow dark:bg-neutral-600 dark:hover:bg-neutral-500 dark:text-white'
                        >
                          <img className='h-5' src={`/img/wallets/${connector.id}.svg`} />
                          <span className='flex-1 ml-3 whitespace-nowrap'>
                            {connector.name}
                            {!connector.ready && ` (${t('unsupported')})`}
                            {isLoading && connector.id === pendingConnector?.id && ` (${t('connecting')})`}
                          </span>
                        </button>
                      </li>
                    )
                  )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ConnectWallet
