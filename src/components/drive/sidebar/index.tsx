import useTranslation from 'next-translate/useTranslation'
import BottomMenu from '@/components/drive/sidebar/menu-bottom'
import BuyNftModal from '@/ui/modals/buy-nft.modal'
import FreeMint from '@/components/drive/sidebar/free-mint'
import NftSecretModal from '@/ui/modals/nft-secret.modal'
import { FC, useEffect, useState } from 'react'
import { INft } from '@/types'
import { NftSecretActiveTabEnum } from '@/enums/nft-secret-active-tab.enum'
import { HiHome, HiKey, HiRefresh, HiChartPie } from 'react-icons/hi'
import { Web3Button } from '@web3modal/react'
import { useAccountContext } from '@/contexts/account/provider'
import { useIndexedDBContext } from '@/contexts/indexed-db/provider'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { getNumbersFromString, mergeNfts } from '@/utils/helper'
import { getNfts, getUsageState } from '@/utils/btfs'
import { getNftMetadata } from '@/utils/alchemy'
import { Dropdown, Spinner, Tooltip } from 'flowbite-react'
import * as _ from 'lodash'
import { doReadContract } from '@/utils/contract'
import ChainsModal from '@/ui/modals/chains.modal'
import UsageStateModal from '@/ui/modals/usageState.modal'
interface ISidebarProps {
  nfts?: INft[]
}

const Sidebar: FC<ISidebarProps> = ({ nfts }) => {
  const { t } = useTranslation()
  const { address } = useAccount()
  const { account, setAccount } = useAccountContext()
  const { indexedDB } = useIndexedDBContext()
  const [showBuyNftModal, setShowBuyNftModal] = useState<boolean>(false)
  const [showNftSecretModal, setShowNftSecretModal] = useState<boolean>(false)
  const [disableCreate, setDisableCreate] = useState<boolean>(false)
  const [disableImport, setDisableImport] = useState<boolean>(false)
  const [disableExport, setDisableExport] = useState<boolean>(false)
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0)
  const [selectedNftIndex, setSelectedNftIndex] = useState<number>(0)
  const [nftSize, setNftSize] = useState<number>(0)
  const [refreshMetadataProgress, setRefreshMetadataProgress] = useState<boolean>(false)
  const [refreshUsageStateProgress, setRefreshUsageStateProgress] = useState<boolean>(false)
  const [showChainsModal, setShowChainsModal] = useState<boolean>(false)
  const [usageState, setUsageState] = useState<any>(null)
  const [showUsageStateModal, setShowUsageStateModal] = useState<boolean>(false)

  const { chain: currentChain } = useNetwork()
  const { chains } = useSwitchNetwork()

  useEffect(() => {
    const isCurrentChainSupported = chains.some(chain => chain.id === (currentChain?.id || 0))
    setShowChainsModal(!isCurrentChainSupported)
  }, [currentChain])

  const handleSelectedNftOnClick = async (index: number): Promise<void> => {
    setSelectedNftIndex(index)
    if (!account.nfts[index].secret) {
      setActiveTabIndex(NftSecretActiveTabEnum.CREATE)
      setDisableCreate(false)
      setDisableImport(false)
      setDisableExport(true)
      setShowNftSecretModal(true)
    } else await _handleGetSelectedNftContent(index)
  }

  const handleGetNfts = async (closeBuyNftModal?: boolean, syncNfts?: boolean): Promise<void> => {
    !closeBuyNftModal || setShowBuyNftModal(false)
    if (syncNfts) {
      const nftsRes = await getNfts(address)
      if (!nftsRes?.error) {
        account.nfts = mergeNfts(account.nfts, nftsRes.nfts)
        const nftMetadataRes = await getNftMetadata(Number(account.nfts[account.defaultNftIndex].id.tokenId), account.contractAddress)
        if (!nftMetadataRes?.error && nftMetadataRes?.media.length > 0) {
          account.nfts[account.defaultNftIndex].media = nftMetadataRes.media
          account.nfts[account.defaultNftIndex].metadata.attributes = nftMetadataRes.rawMetadata.attributes
          account.nfts[account.defaultNftIndex].timeLastUpdated = nftMetadataRes.timeLastUpdated
          account.nfts.length > 0 && !account.nfts[account.defaultNftIndex].secret ? setShowNftSecretModal(true) : setShowNftSecretModal(false)
        } else {
          const extraContentRes = await doReadContract(
            'tokenURI',
            [Number(account.nfts[account.defaultNftIndex].id.tokenId)],
            account.nfts[account.defaultNftIndex].contract.address
          )
          const json = Buffer.from(extraContentRes.substring(29), 'base64').toString()
          const result = JSON.parse(json)
          account.nfts[account.defaultNftIndex].media[0].raw = result.image
          account.nfts[account.defaultNftIndex].metadata.attributes = result.attributes
          account.nfts.length > 0 && !account.nfts[account.defaultNftIndex].secret ? setShowNftSecretModal(true) : setShowNftSecretModal(false)
        }
        await indexedDB.put(account)
        setAccount(_.cloneDeep(account))
      }
    }
  }

  const handleExportPrivateKeyOnClick = async (event, index: number): Promise<void> => {
    event.stopPropagation()
    setSelectedNftIndex(index)
    setActiveTabIndex(NftSecretActiveTabEnum.EXPORT)
    setDisableCreate(true)
    setDisableImport(true)
    setDisableExport(false)
    setShowNftSecretModal(true)
  }

  const handleNftSecretModalOnClose = async (isSecretSet: boolean): Promise<void> => {
    setShowNftSecretModal(false)
    !isSecretSet || (await _handleGetSelectedNftContent())
  }

  const handleChainsModalOnClose = (): void => {
    const checkIfChainSupported = chains.some(chain => chain.id === (currentChain?.id || 0))
    setShowChainsModal(!checkIfChainSupported)
  }
  const handleUsageStateModalOnClose = (): void => {
    setShowUsageStateModal(false)
    handleRefreshNftMetadataOnClick()
  }

  const handleRefreshNftMetadataOnClick = async (): Promise<void> => {
    setRefreshMetadataProgress(true)
    const nftMetadataRes = await getNftMetadata(Number(account.nfts[account.defaultNftIndex].id.tokenId), account.contractAddress)
    if (!nftMetadataRes?.error && nftMetadataRes?.media.length > 0) {
      account.nfts[account.defaultNftIndex].media = nftMetadataRes.media
      account.nfts[account.defaultNftIndex].metadata.attributes = nftMetadataRes.rawMetadata.attributes
      account.nfts[account.defaultNftIndex].timeLastUpdated = nftMetadataRes.timeLastUpdated
      await indexedDB.put(account)
      setAccount(_.cloneDeep(account))
    } else {
      const extraContentRes = await doReadContract(
        'tokenURI',
        [Number(account.nfts[account.defaultNftIndex].id.tokenId)],
        account.nfts[account.defaultNftIndex].contract.address
      )
      const json = Buffer.from(extraContentRes.substring(29), 'base64').toString()
      const result = JSON.parse(json)
      account.nfts[account.defaultNftIndex].media[0].raw = result.image
      account.nfts[account.defaultNftIndex].metadata.attributes = result.attributes
    }
    setRefreshMetadataProgress(false)
  }

  // useEffect(() => {
  //   const fetchUsageState = async (): Promise<void> => {
  //     if (account.nfts && account.nfts.length > 0 && account.nfts[account.defaultNftIndex] && account.nfts[account.defaultNftIndex].jwt) {
  //       console.log('fetching')
  //
  //       const usageJson = await getUsageState(account.nfts[account.defaultNftIndex].jwt)
  //       if (!usageJson || !usageJson.usageState.chains || Object.keys(usageJson.usageState.chains).length === 0) {
  //         setUsageState(null)
  //       } else {
  //         const chainId = Object.keys(usageJson.usageState.chains)[0]
  //         const tokenId = Object.keys(usageJson.usageState.chains[chainId].tokens)[0]
  //         const token = usageJson.usageState.chains[chainId].tokens[tokenId]
  //
  //         if (token.storageUsageInBytes === 0 && token.bandwidth === 0) {
  //           setUsageState(null)
  //         } else {
  //           setUsageState(usageJson.usageState)
  //         }
  //       }
  //     }
  //   }
  //
  //   const interval = setInterval(() => {
  //     fetchUsageState()
  //   }, 240000) // 240000 milliseconds = 4 minutes
  //
  //   // Fetch immediately on load without using useEffect's initial call
  //   fetchUsageState()
  //
  //   return () => clearInterval(interval) // Clean up interval on component unmount
  // }, [account.nfts, account.defaultNftIndex])

  const handleUsageStateOnClick = async (): Promise<void> => {
    setRefreshUsageStateProgress(true)
    const usageJson = await getUsageState(account.nfts[account.defaultNftIndex].jwt)
    if (!usageJson || !usageJson.usageState.chains || Object.keys(usageJson.usageState.chains).length === 0) {
      setUsageState(null)
    } else {
      const chainId = Object.keys(usageJson.usageState.chains)[0] // Assuming there's only one chain
      const tokenId = Object.keys(usageJson.usageState.chains[chainId].tokens)[0] // Assuming there's only one token
      const token = usageJson.usageState.chains[chainId].tokens[tokenId]

      if (token.storageUsageInBytes === 0 && token.bandwidth === 0) {
        setUsageState(null) // Set to null if both values are zero
      } else {
        setUsageState(usageJson.usageState) // Otherwise, set the fetched usage state
      }
    }
    // setUsageState(usageJson.usageState)
    setShowUsageStateModal(true)
    setRefreshUsageStateProgress(false)
  }

  const _handleGetSelectedNftContent = async (index?: number): Promise<void> => {
    account.defaultNftIndex = index !== undefined ? index : selectedNftIndex
    await indexedDB.put(account)
    setAccount(_.cloneDeep(account))
  }

  const _handleGetNftSizes = (): void => {
    setSelectedNftIndex(account.defaultNftIndex)
    !account.nfts[account.defaultNftIndex].metadata.attributes[1].value.toString().includes('GB') ||
      setNftSize(Number(getNumbersFromString(account.nfts[account.defaultNftIndex].metadata.attributes[1].value.toString())))
  }

  useEffect(() => {
    !account.address || !nfts.length || _handleGetNftSizes()
  }, [account.address])

  return (
    <>
      <nav className='fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-neutral-800 border-0 px-4 lg:px-6 py-2.5'>
        <div className='px-3 lg:px-5 lg:pl-0'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center justify-start'>
              <button
                data-drawer-target='logo-sidebar'
                data-drawer-toggle='logo-sidebar'
                aria-controls='logo-sidebar'
                type='button'
                className='inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-neutral-700 dark:focus:ring-gray-600'
              >
                <span className='sr-only'>{t('openSidebar')}</span>
                <svg className='w-6 h-6' aria-hidden='true' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    clipRule='evenodd'
                    fillRule='evenodd'
                    d='M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z'
                  ></path>
                </svg>
              </button>
              <a href='/' className='flex ml-2 md:mr-24'>
                <img className='h-12 mr-3 block dark:hidden' src='/img/px-logo-white.svg' alt='PollinationX Logo' />
                <img className='h-12 mr-3 hidden dark:block' src='/img/px-logo-white.svg' alt='PollinationX Logo' />
              </a>
            </div>
            <div className='flex items-center'>
              {account?.nfts?.length > 0 && (
                <div className='mr-3'>
                  <Dropdown className='w-1/2 dark:bg-neutral-700' label={t('account') + ': ' + account.nfts[account.defaultNftIndex].title}>
                    <Dropdown.Header>
                      <span className='block text-sm '>
                        {account.nfts[account.defaultNftIndex].title} ({t('size')} {account.nfts[account.defaultNftIndex].metadata.attributes[1].value},{' '}
                        {t('usage')} {account.nfts[account.defaultNftIndex].metadata.attributes[0].value}%
                        {account.nfts[account.defaultNftIndex].metadata.attributes[2] && (
                          <>
                            {' '}
                            ,{t('bandwidth')} {account.nfts[account.defaultNftIndex].metadata.attributes[2].value}
                          </>
                        )}{' '}
                        ){' '}
                        <span className='float-right ml-2 mt-1 cursor-pointer'>
                          <Tooltip
                            content={t('exportPrivateKey')}
                            animation='duration-300'
                            className='w-[156px] bg-pollinationx-black dark:bg-pollinationx-black opacity-90 shadow-lg shadow-pollinationx-honey-500/50'
                            placement='left'
                            arrow={false}
                            onClick={event => handleExportPrivateKeyOnClick(event, account.defaultNftIndex)}
                          >
                            <HiKey onClick={event => handleExportPrivateKeyOnClick(event, account.defaultNftIndex)} />
                          </Tooltip>
                        </span>
                      </span>{' '}
                      {account.nfts?.length > 1 && <span className='text-pollinationx-honey block truncate text-sm font-medium'>{t('selected')}</span>}
                    </Dropdown.Header>
                    {account.nfts.map(
                      (nft: INft, index: number) =>
                        index !== account.defaultNftIndex && (
                          <Dropdown.Item key={nft.id.tokenId} onClick={() => handleSelectedNftOnClick(index)}>
                            {nft.title} ({t('size')} {nft.metadata.attributes[1].value}, {t('usage')} {nft.metadata.attributes[0].value}%
                            {nft.metadata.attributes[2] && (
                              <>
                                {' '}
                                ,{t('bandwidth')} {nft.metadata.attributes[2].value}
                              </>
                            )}{' '}
                            ){' '}
                            {nft.secret && (
                              <span className='float-right ml-2 mt-1 cursor-pointer'>
                                <Tooltip
                                  content={t('exportPrivateKey')}
                                  animation='duration-300'
                                  className='w-[156px] bg-pollinationx-black dark:bg-pollinationx-black opacity-90 shadow-lg shadow-pollinationx-honey-500/50'
                                  placement='left'
                                  arrow={false}
                                >
                                  <HiKey onClick={event => handleExportPrivateKeyOnClick(event, index)} />
                                </Tooltip>
                              </span>
                            )}
                          </Dropdown.Item>
                        )
                    )}
                  </Dropdown>
                </div>
              )}
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
      <aside
        id='logo-sidebar'
        className='fixed top-0 left-0 z-40 w-64 h-screen pt-24 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-neutral-800 dark:border-gray-700'
        aria-label='Sidebar'
      >
        <div className='h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gradient-to-b from-neutral-800 to-pollinationx-purple'>
          <ul className='space-y-2 font-medium'>
            <li>
              <a href='#' className='flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700'>
                <HiHome className='text-2xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white' />
                <span className='ml-3'>{t('home')}</span>
              </a>
            </li>
          </ul>
        </div>
        <div className='absolute bottom-0 left-0 justify-center p-4 w-full z-20'>
          <div className='flex items-center justify-center'>
            <div className='relative bg-neutral-800 p-3 shadow-xl pxNftWrapper'>
              {account.nfts?.length > 0 ? (
                <div>
                  <div className='absolute right-4 mt-1'>
                    <Tooltip
                      content={t('refreshMetadata')}
                      animation='duration-300'
                      placement='left'
                      arrow={false}
                      className='mt-3 bg-gradient-to-br from-pollinationx-purple to-gray-700 dark:bg-gradient-to-br opacity-90'
                    >
                      <HiRefresh
                        onClick={handleRefreshNftMetadataOnClick}
                        className={`text-2xl ml-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white float-right cursor-pointer 
                        ${refreshMetadataProgress ? 'animate-spin' : ''}`}
                      />
                    </Tooltip>
                  </div>
                  {/*<div className='absolute left mt-1'>*/}
                  {/*  <Tooltip*/}
                  {/*    content={t('usageState')}*/}
                  {/*    animation='duration-300'*/}
                  {/*    placement='left'*/}
                  {/*    arrow={false}*/}
                  {/*    className='mt-3 bg-gradient-to-br from-pollinationx-purple to-gray-700 dark:bg-gradient-to-br opacity-90'*/}
                  {/*  >*/}
                  {/*    <HiChartPie*/}
                  {/*      onClick={handleUsageStateOnClick}*/}
                  {/*      className={`text-2xl ml text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white float-right cursor-pointer */}
                  {/*      ${refreshUsageStateProgress ? 'animate-bounce' : ''}`}*/}
                  {/*    />*/}
                  {/*  </Tooltip>*/}
                  {/*</div>*/}

                  <img src={account.nfts[account.defaultNftIndex]?.media[0]?.raw} className='w-full object-cover object-center' alt='' />
                  <h2 className='text-md font-bold text-pollinationx-honey mt-3'>{account.nfts[account.defaultNftIndex]?.title}</h2>
                </div>
              ) : (
                account?.nfts === null && <div className='justify-center text-center mb-5'>{<Spinner />}</div>
              )}
              <p className='text-gray-400 text-xs mb-2'>
                {account?.nfts?.length > 0 ? account.nfts[account.defaultNftIndex]?.description : t('noNftsInfo')}
                {account?.nfts?.length > 0 && account?.nfts?.[account.defaultNftIndex]?.metadata?.attributes?.[2] && (
                  <>
                    {' '}
                    <label className='text-md font-bold text-pollinationx-honey mt-3'>
                      {t('bandwidth')}: {account.nfts[account.defaultNftIndex].metadata.attributes[2].value}
                    </label>
                  </>
                )}{' '}
              </p>
              <p className='bg-neutral-600 h-[0.5px] w-full my-2'></p>
              <div className='flex items-center'>
                <img src='/img/favicon.png' alt='PollinationX' className='h-8 w-8 rounded-full mr-2' />
                <p className='text-gray-400 text-[12px]'>
                  {t('createdBy')}{' '}
                  <a href='https://pollinationx.io' target='_black' rel='no-opener' className='text-white font-bold'>
                    PollinationX
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className='mb-5 mt-7 pt-1 pb-1 text-center'>
            {account?.nfts?.length > 0 && (
              <button
                onClick={() => setShowBuyNftModal(true)}
                type='button'
                className='cursor-pointer relative inline-flex items-center justify-center p-0.5 mb-2 mr-2
                                                    overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
                                                    from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
                                                    hover:text-white dark:text-white focus:outline-none focus:ring-0
                                                    dark:focus:ring-blue-800'
              >
                <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
                  {t('upgradeStorage')}
                </span>
              </button>
            )}
            {account?.nfts?.length === 0 && <FreeMint onClose={handleGetNfts} />}
          </div>
          <BottomMenu />
        </div>
      </aside>
      <BuyNftModal
        show={showBuyNftModal}
        onClose={handleGetNfts}
        tokenId={_.get(account?.nfts, `[${account.defaultNftIndex}].id.tokenId`, '')}
        nftSize={nftSize}
      />
      <NftSecretModal
        show={showNftSecretModal}
        onClose={handleNftSecretModalOnClose}
        nft={account.nfts[selectedNftIndex]}
        nftIndex={selectedNftIndex}
        activeTabIndex={activeTabIndex}
        disableCreate={disableCreate}
        disableImport={disableImport}
        disableExport={disableExport}
      />
      <ChainsModal show={showChainsModal} onClose={handleChainsModalOnClose} />
      <UsageStateModal
        show={showUsageStateModal}
        onClose={handleUsageStateModalOnClose}
        initialUsageState={usageState}
        contractAddress={account.nfts[account.defaultNftIndex]?.contract.address}
        jwt={account.nfts[account.defaultNftIndex]?.jwt}
      />
    </>
  )
}

export default Sidebar
