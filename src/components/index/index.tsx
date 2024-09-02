import ConnectWallet from '@/components/index/connect-wallet'
import useTranslation from 'next-translate/useTranslation'
import NftSecretModal from '@/ui/modals/nft-secret.modal'
import ChainsModal from '@/ui/modals/chains.modal'
import { FC, useState, useEffect } from 'react'
import { useAccountContext } from '@/contexts/account/provider'
import { useRouter } from 'next/router'
import { useNetwork, useSwitchNetwork } from 'wagmi'
import { Web3Button } from '@web3modal/react'

const Index: FC = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { push } = useRouter()
  const { account } = useAccountContext()
  const [showConnectWallet, setShowConnectWallet] = useState<boolean>(false)
  const [showNftSecretModal, setShowNftSecretModal] = useState<boolean>(false)
  const [showChainsModal, setShowChainsModal] = useState<boolean>(false)
  const { chain: currentChain } = useNetwork()
  const { chains } = useSwitchNetwork()

  useEffect(() => {
    if (chains.length > 0) {
      const isCurrentChainSupported = chains.some(chain => chain.id === (currentChain?.id || 0))
      setShowChainsModal(!isCurrentChainSupported)
    } else {
      setShowChainsModal(false)
    }
  }, [currentChain])

  const handleNftSecret = (redirect): void => {
    setShowConnectWallet(false)
    if (redirect) {
      account.nfts.length > 0 && !account.nfts[account.defaultNftIndex].secret ? setShowNftSecretModal(true) : handleRedirect()
    }
  }

  const handleNftSecretOnClose = (redirect: boolean): void => {
    setShowNftSecretModal(false)
    !redirect || handleRedirect()
  }
  const handleChainsModalOnClose = (): void => {
    if (chains.length > 0) {
      const checkIfChainSupported = chains.some(chain => chain.id === (currentChain?.id || 0))
      setShowChainsModal(!checkIfChainSupported)
    } else {
      setShowChainsModal(false)
    }
  }

  const handleRedirect = (): void => {
    account.loggedIn = true
    push(
      {
        pathname: `/drive`
      },
      null,
      { locale: account.locale !== router.defaultLocale ? account.locale : false }
    )
  }
  // const [file, setFile] = useState(null)
  // const [encryptedFile, setEncryptedFile] = useState(null)
  // const [encryptedSymmetricKey, setEncryptedSymmetricKey] = useState(null)
  // const [fileSize, setFileSize] = useState(0)
  //
  // const selectFile = e => {
  //   setFile(e.target.files[0])
  //   setEncryptedFile(null)
  //   setEncryptedSymmetricKey(null)
  //   setFileSize(0)
  // }

  // const encryptFile = async () => {
  //   if (file === null) {
  //     alert('Please select a file before encrypting!')
  //     return
  //   }
  //
  //   const { encryptedFile, encryptedSymmetricKey } = await lit.encryptFile(file)
  //   setEncryptedFile(encryptedFile)
  //   setEncryptedSymmetricKey(encryptedSymmetricKey)
  //   setFileSize(0)
  // }
  //
  // const decryptFile = async () => {
  //   if (encryptedFile === null) {
  //     alert('Please encrypt your file first!')
  //     return
  //   }
  //
  //   try {
  //     const decrypted = await lit.decryptFile(encryptedFile, encryptedSymmetricKey)
  //     setFileSize(decrypted.byteLength)
  //   } catch (error) {
  //     alert('The access control condition check failed! You should have at least 0 ETH to decrypt this file.')
  //   }
  // }

  return (
    <>
      {chains.length > 0 && (
        <nav className='fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-neutral-800 border-0 px-4 lg:px-6 py-2.5'>
          <div className='px-3 lg:px-5 lg:pl-0'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center justify-start'></div>
              <div className='flex items-center'>
                <Web3Button />
                <div className='relative my-1 flex items-center justify-center ml-4'>
                  <div className='relative'>
                    <button
                      type='button'
                      name='language_selection'
                      className='flex h-9 w-9 items-center justify-center rounded-full border border-muted-200 bg-white ring-1 ring-transparent transition-all duration-300 hover:ring-muted-200 hover:ring-offset-4 dark:border-muted-700 dark:bg-pollinationx-purple dark:ring-offset-pollinationx-purple dark:hover:ring-pollinationx-purple'
                      onClick={() => setShowChainsModal(true)}
                    >
                      <img className='h-8 w-8 rounded-full' src={`/img/chains/${currentChain?.id}.svg`} alt={`${currentChain?.name} icon`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}
      {/*<div className="App">*/}
      {/*  <h1>Encrypt & Decrypt a file using Lit SDK</h1>*/}
      {/*  <input type="file" name="file" onChange={selectFile} />*/}
      {/*  <div>*/}
      {/*    <button onClick={encryptFile}>Encrypt</button>*/}
      {/*    <button onClick={decryptFile}>Decrypt</button>*/}
      {/*  </div>*/}
      {/*  {(encryptedFile !== null && fileSize === 0) && (*/}
      {/*      <h3>File Encrypted: {file.name}. Thanks for using Lit!</h3>*/}
      {/*  )}*/}
      {/*  {fileSize > 0 && (*/}
      {/*      <h3>File Decrypted: {file.name} of {fileSize} bytes</h3>*/}
      {/*  )}*/}
      {/*</div>*/}

      <section className='gradient-form bg-neutral-200 dark:bg-neutral-700 flex h-screen'>
        <div className='container h-full p-10 m-auto'>
          <div className='g-6 flex h-full flex-wrap items-center justify-center text-neutral-800 dark:text-neutral-200'>
            <div className='w-full'>
              <div className='block rounded-lg bg-white shadow-lg dark:bg-neutral-800'>
                <div className='g-0 lg:flex lg:flex-wrap'>
                  <div className='px-4 md:px-0 lg:w-6/12'>
                    <div className='md:mx-6 md:p-12'>
                      <div className='text-center'>
                        <img className='mx-auto w-80 block dark:hidden' src='/img/px-logo-white.svg' alt='PollinationX Logo' />
                        <img className='mx-auto w-80 hidden dark:block' src='/img/px-logo-white.svg' alt='PollinationX Logo' />
                      </div>
                      <form>
                        <ul className='max-w-md space-y-2 text-gray-500 list-inside dark:text-gray-400 text-sm pt-14 pb-6'>
                          <li className='flex items-center'>
                            <svg
                              className='w-4 h-4 mr-1.5 text-pollinationx-honey flex-shrink-0'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                fillRule='evenodd'
                                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                clipRule='evenodd'
                              ></path>
                            </svg>
                            {t('permissionlessDecentralizedStorageAccess')}
                          </li>
                          <li className='flex items-center'>
                            <svg
                              className='w-4 h-4 mr-1.5 text-pollinationx-honey flex-shrink-0'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                fillRule='evenodd'
                                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                clipRule='evenodd'
                              ></path>
                            </svg>
                            {t('nftAuthorization')}
                          </li>
                          <li className='flex items-center'>
                            <svg
                              className='w-4 h-4 mr-1.5 text-pollinationx-honey flex-shrink-0'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                              xmlns='http://www.w3.org/2000/svg'
                            >
                              <path
                                fillRule='evenodd'
                                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                clipRule='evenodd'
                              ></path>
                            </svg>
                            {t('multiChainSupport')}
                          </li>
                        </ul>
                        <div className='mb-12 pt-1 pb-1 text-center'>
                          <button
                            type='button'
                            onClick={() => setShowConnectWallet(true)}
                            className='relative inline-flex items-center justify-center p-0.5 mb-2 mr-2
                                                    overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
                                                    from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
                                                    hover:text-white dark:text-white focus:outline-none focus:ring-0
                                                    dark:focus:ring-blue-800'
                          >
                            <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
                              {chains.length > 0 ? t('goToApp') : t('connectWallet')}
                            </span>
                          </button>
                        </div>
                        <div className='flex items-center justify-between pb-6'>
                          <div className='flex justify-center space-x-2 text-neutral-700 dark:text-neutral-300'>
                            <a target='_blank' href='https://twitter.com/PollinationX_io'>
                              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                                <path d='M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z' />
                              </svg>
                            </a>
                            <a target='_blank' href='https://github.com/PollinationX'>
                              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                                <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                              </svg>
                            </a>
                          </div>
                          <a
                            target='_blank'
                            href='https://wiki.pollinationx.io/'
                            className='hover:text-pollinationx-honey inline-block px-6 pt-1 text-xs font-medium uppercase leading-normal text-danger transition duration-150 ease-in-out focus:outline-none focus:ring-0'
                          >
                            {t('readMore')} <span aria-hidden='true'>→</span>
                          </a>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div
                    className='flex items-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none'
                    style={{ background: 'linear-gradient(to right, #222222, #42298F' }}
                  >
                    <div className='px-4 py-6 text-white md:mx-6 md:p-12'>
                      <h4 className='mb-6 text-xl font-semibold'>{t('decentralizedDrive')}</h4>
                      <p className='text-sm'>{t('decentralizedDriveText')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <nav className='fixed bottom-0 z-50 w-full bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-neutral-800 border-0 px-4 lg:px-6 py-2.5'>
        <div className='px-3 lg:px-5 lg:pl-0 text-center text-gray-700 dark:text-white text-sm'>
          Discover the PollinationX dApp. Please note that there might be technical issues during this testing period.
          <br /> Avoid saving any files you're not okay with losing. Your cooperation is highly valued.
        </div>
      </nav>
      <ConnectWallet show={showConnectWallet} onClose={handleNftSecret} />
      <NftSecretModal
        show={showNftSecretModal}
        onClose={handleNftSecretOnClose}
        nft={account.nfts[account.defaultNftIndex]}
        nftIndex={account.defaultNftIndex}
        disableExport={true}
      />
      <ChainsModal show={showChainsModal} onClose={handleChainsModalOnClose} />
    </>
  )
}

export default Index
