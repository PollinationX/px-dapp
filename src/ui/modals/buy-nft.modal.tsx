import abi from '@/abi/PX.json'
import useTranslation from 'next-translate/useTranslation'
import SyncBackdrop from '@/ui/backdrops/sync.backdrop'
import { FC, useState, useEffect } from 'react'
// import { INftPackage, INftBandwidthPackage } from '@/components/drive/types'
import { INftBandwidthPackage, INftPackage } from '@/types'
import { BigNumber } from 'ethers'
import { getWei, fromWei } from '@/utils/helper'
import { toastify } from '@/utils/toastify'
import { doWriteContract } from '@/utils/contract'
import { Card, Modal, Spinner, Tabs, Label, TextInput, Button } from 'flowbite-react'
import { useAccountContext } from '@/contexts/account/provider'

interface IBuyNftModalProps {
  show: boolean
  onClose: any
  tokenId: string
  nftSize: number
}

const BuyNftModal: FC<IBuyNftModalProps> = ({ show, onClose, tokenId, nftSize }) => {
  const { t } = useTranslation()
  const [getNfts, setGetNfts] = useState<boolean>(false)
  const [openSyncBackdrop, setOpenSyncBackdrop] = useState<boolean>(false)
  const [syncBackdropText, setSyncBackdropText] = useState<string>('')
  const { account } = useAccountContext()

  const [nftPackages, setNftPackages] = useState<INftPackage[]>(account.packages)
  const [nftBandwitdhPackages, setNftBandwidthPackages] = useState<INftBandwidthPackage[]>(account.bandwidthPackages)

  const [packageQuota, setPackageQuota] = useState('')
  const [price, setPrice] = useState('')
  const [priceBandwidth, setPriceBandwidth] = useState('')
  const [bandwidthLimit, setBandwidthLimit] = useState('')
  const [bandwidthLimitSize, setBandwidthLimitSize] = useState('')
  const [formSubmitted, setFormSubmitted] = useState(false)

  useEffect(() => {
    if (account.packages) {
      setNftPackages(account.packages)
      setNftBandwidthPackages(account.bandwidthPackages)
    }
  }, [account.packages, account.bandwidthPackages])

  const handleUpgradeStorageOnClick = async (nftPackage: INftPackage): Promise<void> => {
    if (nftSize < nftPackage.size) {
      setOpenSyncBackdrop(true)
      setSyncBackdropText(t('waitingForUserConfirmation'))
      setNftPackages(
        nftPackages.map((nftPackageObj: INftPackage) => ({
          ...nftPackageObj,
          disabled: true,
          processing: nftPackageObj.id === nftPackage.id
        }))
      )
      const upgradeTokenPackageRes = await doWriteContract(
        'upgradeTokenPackage',
        [parseInt(tokenId), nftPackage.id],
        { value: BigNumber.from(nftPackage.price.toString()), gasLimit: BigNumber.from(4000000) },
        account.nfts[account.defaultNftIndex].contract.address,
        abi
      )
      if (!upgradeTokenPackageRes?.error) {
        setSyncBackdropText(t('waitingForBlockchainConfirmation'))
        await upgradeTokenPackageRes.wait(1)
        setNftPackages(
          nftPackages.map((nftPackageObj: INftPackage) => ({
            ...nftPackageObj,
            disabled: false,
            processing: false,
            done: nftPackageObj.id === nftPackage.id
          }))
        )
        toastify(t('upgradeStorageSuccess'))
      } else {
        setNftPackages(
          nftPackages.map((nftPackageObj: INftPackage) => ({
            ...nftPackageObj,
            disabled: false,
            processing: false,
            done: false
          }))
        )
        toastify(`${upgradeTokenPackageRes.error.message} ${upgradeTokenPackageRes.error?.data?.message || ''}`, 'error')
      }
      setOpenSyncBackdrop(false)
    }
  }

  const handleMintNewStorageOnClick = async (nftPackage: INftPackage): Promise<void> => {
    setOpenSyncBackdrop(true)
    setSyncBackdropText(t('waitingForUserConfirmation'))
    setNftPackages(
      nftPackages.map((nftPackageObj: INftPackage) => ({
        ...nftPackageObj,
        disabled: true,
        processing: nftPackageObj.id === nftPackage.id
      }))
    )

    const mintRes = await doWriteContract(
      'mint',
      [nftPackage.id],
      { value: BigNumber.from(nftPackage.price.toString()), gasLimit: BigNumber.from(4000000) },
      account.nfts[account.defaultNftIndex].contract.address,
      abi
    )
    if (!mintRes?.error) {
      setSyncBackdropText(t('waitingForBlockchainConfirmation'))
      await mintRes.wait(1)
      setNftPackages(
        nftPackages.map((nftPackageObj: INftPackage) => ({
          ...nftPackageObj,
          disabled: false,
          processing: false,
          done: nftPackageObj.id === nftPackage.id
        }))
      )
      setGetNfts(true)
      toastify(t('mintStorageSuccess'))
    } else {
      setNftPackages(
        nftPackages.map((nftPackageObj: INftPackage) => ({
          ...nftPackageObj,
          disabled: false,
          processing: false,
          done: false
        }))
      )
      toastify(`${mintRes.error.message} ${mintRes.error?.data?.message || ''}`, 'error')
    }
    setOpenSyncBackdrop(false)
  }
  const handleMintNewBandwidthOnClick = async (nftBandwidthPackage: INftBandwidthPackage): Promise<void> => {
    setOpenSyncBackdrop(true)
    setSyncBackdropText(t('waitingForUserConfirmation'))
    setNftBandwidthPackages(
      nftBandwitdhPackages.map((nftBandwidthPackageObj: INftBandwidthPackage) => ({
        ...nftBandwidthPackageObj,
        disabled: true,
        processing: nftBandwidthPackageObj.id === nftBandwidthPackage.id
      }))
    )
    const buyMoreBandwidthRes = await doWriteContract(
      'buyMoreBandwidth',
      [parseInt(tokenId), nftBandwidthPackage.id],
      { value: BigNumber.from(nftBandwidthPackage.price.toString()) },
      account.nfts[account.defaultNftIndex].contract.address,
      abi
    )

    if (!buyMoreBandwidthRes?.error) {
      setSyncBackdropText(t('waitingForBlockchainConfirmation'))
      await buyMoreBandwidthRes.wait(1)
      setNftBandwidthPackages(
        nftBandwitdhPackages.map((nftBandwidthPackageObj: INftBandwidthPackage) => ({
          ...nftBandwidthPackageObj,
          disabled: false,
          processing: false,
          done: nftBandwidthPackageObj.id === nftBandwidthPackage.id
        }))
      )
      setGetNfts(true)
      toastify(t('mintBandwidthSuccess'))
    } else {
      setNftBandwidthPackages(
        nftBandwitdhPackages.map((nftBandwidthPackageObj: INftBandwidthPackage) => ({
          ...nftBandwidthPackageObj,
          disabled: false,
          processing: false,
          done: false
        }))
      )
      toastify(`${buyMoreBandwidthRes.error.message} ${buyMoreBandwidthRes.error?.data?.message || ''}`, 'error')
    }
    setOpenSyncBackdrop(false)
  }

  const formatValue = value => {
    return value.replace(',', '.')
  }

  const handleAddNewPackage = async () => {
    if (price && packageQuota && bandwidthLimit) {
      const formattedPrice = formatValue(price)

      setOpenSyncBackdrop(true)
      setSyncBackdropText(t('waitingForUserConfirmation'))

      const addNewRes = await doWriteContract(
        'addNewPackage',
        [BigNumber.from(getWei(formattedPrice)), packageQuota, bandwidthLimit],
        '',
        account.nfts[account.defaultNftIndex].contract.address,
        abi
      )

      if (!addNewRes?.error) {
        setSyncBackdropText(t('waitingForBlockchainConfirmation'))
        await addNewRes.wait(1)
        setPackageQuota('')
        setBandwidthLimit('')
        setPrice('')
        setOpenSyncBackdrop(false)
        setFormSubmitted(true)
        toastify(`New package added!`, 'success')
      } else {
        toastify(`${addNewRes.error.message} ${addNewRes.error?.data?.message || ''}`, 'error')
        setOpenSyncBackdrop(false)
        setFormSubmitted(true)
      }

      console.log('Submitted:', { packageQuota, formattedPrice })
    }
  }
  const handleAddNewBandwidthPackage = async () => {
    if (priceBandwidth && bandwidthLimitSize) {
      const formattedPrice = formatValue(priceBandwidth)

      setOpenSyncBackdrop(true)
      setSyncBackdropText(t('waitingForUserConfirmation'))

      const addNewRes = await doWriteContract(
        'addNewBandwidthPackage',
        [BigNumber.from(getWei(formattedPrice)), bandwidthLimitSize],
        '',
        account.nfts[account.defaultNftIndex].contract.address,
        abi
      )

      if (!addNewRes?.error) {
        setSyncBackdropText(t('waitingForBlockchainConfirmation'))
        await addNewRes.wait(1)
        setBandwidthLimitSize('')
        setPriceBandwidth('')
        setOpenSyncBackdrop(false)
        setFormSubmitted(true)
        toastify(`New bandwidth package added!`, 'success')
      } else {
        toastify(`${addNewRes.error.message} ${addNewRes.error?.data?.message || ''}`, 'error')
        setOpenSyncBackdrop(false)
        setFormSubmitted(true)
      }

      console.log('Submitted:', { packageQuota, formattedPrice })
    }
  }

  return (
    <>
      <Modal show={show} position='bottom-left' onClose={() => onClose(true, getNfts)}>
        <Modal.Header className='dark:bg-neutral-800 dark:border-gray-700 modalHeader'>{t('pollinationXStorageNft')}</Modal.Header>
        <Modal.Body className='dark:bg-neutral-800'>
          <div className='space-y-6 p-3 overflow-x-scroll '>
            <Tabs.Group style='default' className='tabsItem'>
              <Tabs.Item active={true} title={t('upgradeStorage')}>
                <div className='grid grid-cols-2 gap-2'>
                  {nftPackages.map((nftPackage: INftPackage) => (
                    <Card key={nftPackage.id}>
                      <h5 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>
                        {nftPackage.size} {nftPackage.storageUnit}
                      </h5>
                      <p className='font-normal text-gray-700 dark:text-gray-400'>
                        {t('price')}: {fromWei(nftPackage.price)} {account.symbol}
                        <br />
                        {Boolean(nftPackage.bandwidthLimit) && nftPackage.bandwidthLimit !== 0 && (
                          <label className='font-normal text-gray-700 dark:text-gray-400'>
                            {t('bandwidth')}: {nftPackage.bandwidthLimit}
                          </label>
                        )}
                      </p>
                      <p className='font-normal text-gray-700 dark:text-gray-400'>
                        <button
                          disabled={nftPackage.disabled}
                          onClick={() => handleUpgradeStorageOnClick(nftPackage)}
                          type='button'
                          className={`cursor-pointer relative inline-flex items-center justify-center p-0.5 mb-2 mr-2
                                                    overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
                                                    from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
                                                    hover:text-white dark:text-white focus:outline-none focus:ring-0
                                                    dark:focus:ring-blue-800 ${nftSize >= nftPackage.size ? 'opacity-70 pointer-events-none' : ''}`}
                        >
                          <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
                            {!nftSize || nftSize < nftPackage.size ? (
                              <>
                                {nftPackage.processing ? <Spinner className='mr-3' /> : ''}{' '}
                                {t(nftPackage.processing ? 'upgrading' : nftPackage.done ? 'upgraded' : 'upgradeStorage')}
                              </>
                            ) : (
                              t('upgraded')
                            )}
                          </span>
                        </button>
                      </p>
                    </Card>
                  ))}
                </div>
              </Tabs.Item>
              <Tabs.Item title={t('mintNewStorageNft')}>
                <div className='grid grid-cols-2 gap-2'>
                  {nftPackages.map((nftPackage: INftPackage) => (
                    <Card key={nftPackage.id}>
                      <h5 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>
                        {nftPackage.size} {nftPackage.storageUnit}
                      </h5>
                      <p className='font-normal text-gray-700 dark:text-gray-400'>
                        {t('price')}: {fromWei(nftPackage.price)} {account.symbol}
                        <br />
                        {Boolean(nftPackage.bandwidthLimit) && nftPackage.bandwidthLimit !== 0 && (
                          <label className='font-normal text-gray-700 dark:text-gray-400'>
                            {t('bandwidth')}: {nftPackage.bandwidthLimit}
                          </label>
                        )}
                      </p>

                      <p className='font-normal text-gray-700 dark:text-gray-400'>
                        <button
                          onClick={() => handleMintNewStorageOnClick(nftPackage)}
                          type='button'
                          className='cursor-pointer relative inline-flex items-center justify-center p-0.5 mb-2 mr-2
                                                    overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
                                                    from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
                                                    hover:text-white dark:text-white focus:outline-none focus:ring-0
                                                    dark:focus:ring-blue-800'
                        >
                          <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
                            {nftPackage.processing ? <Spinner className='mr-3' /> : ''}{' '}
                            {t(nftPackage.processing ? 'minting' : nftPackage.done ? 'minted' : 'mintNew')}
                          </span>
                        </button>
                      </p>
                    </Card>
                  ))}
                </div>
              </Tabs.Item>
              <Tabs.Item disabled={nftBandwitdhPackages?.length === 0} title={t('buyAdditionalBandwidth')}>
                <div className='grid grid-cols-2 gap-2'>
                  {nftBandwitdhPackages?.map((nftBandwitdhPackage: INftBandwidthPackage) => (
                    <Card key={nftBandwitdhPackage.id}>
                      <h5 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>{nftBandwitdhPackage.bandwidth} bandwidth</h5>
                      <p className='font-normal text-gray-700 dark:text-gray-400'>
                        {t('price')}: {fromWei(nftBandwitdhPackage.price)} {account.symbol}
                      </p>
                      <p className='font-normal text-gray-700 dark:text-gray-400'>
                        <button
                          onClick={() => handleMintNewBandwidthOnClick(nftBandwitdhPackage)}
                          type='button'
                          className='cursor-pointer relative inline-flex items-center justify-center p-0.5 mb-2 mr-2
                                                    overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
                                                    from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
                                                    hover:text-white dark:text-white focus:outline-none focus:ring-0
                                                    dark:focus:ring-blue-800'
                        >
                          <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
                            {nftBandwitdhPackage.processing ? <Spinner className='mr-3' /> : ''}{' '}
                            {t(nftBandwitdhPackage.processing ? 'minting' : nftBandwitdhPackage.done ? 'minted' : 'mintNewBandtwidth')}
                          </span>
                        </button>
                      </p>
                    </Card>
                  ))}
                </div>
              </Tabs.Item>
              {account.address == account.contractOwner ? (
                <Tabs.Item title={t('addNewPackage')}>
                  {formSubmitted ? (
                    <div>
                      <p className='text-gray-900 dark:text-white'>Form submitted successfully!</p>
                    </div>
                  ) : null}
                  <div className='grid grid-cols-2 gap-2'>
                    <form className='flex max-w-md flex-col gap-4'>
                      <div>
                        <div className='mb-2 block'>
                          <Label htmlFor='price1' value='Price (insert decimals not wei)' />
                        </div>
                        <TextInput id='price1' required onBlur={e => setPrice(e.target.value)} type='text' />
                      </div>
                      <div>
                        <div className='mb-2 block'>
                          <Label htmlFor='size1' value='Size' />
                        </div>
                        <TextInput id='size1' required onBlur={e => setPackageQuota(e.target.value)} type='text' />
                      </div>
                      <div>
                        <div className='mb-2 block'>
                          <Label htmlFor='bandwidth1' value='Bandwidth' />
                        </div>
                        <TextInput id='bandwidth1' required onBlur={e => setBandwidthLimit(e.target.value)} type='text' />
                      </div>
                      <Button onClick={() => handleAddNewPackage()} type='button'>
                        Submit
                      </Button>
                    </form>
                  </div>
                </Tabs.Item>
              ) : (
                <Tabs.Item disabled title=''></Tabs.Item>
              )}{' '}
              {account.address == account.contractOwner ? (
                <Tabs.Item title={t('addNewBandwidthPackage')}>
                  {formSubmitted ? (
                    <div>
                      <p className='text-gray-900 dark:text-white'>Form submitted successfully!</p>
                    </div>
                  ) : null}
                  <div className='grid grid-cols-2 gap-2'>
                    <form className='flex max-w-md flex-col gap-4'>
                      <div>
                        <div className='mb-2 block'>
                          <Label htmlFor='price1' value='Price (insert decimals not wei)' />
                        </div>
                        <TextInput id='price1' required onBlur={e => setPriceBandwidth(e.target.value)} type='text' />
                      </div>
                      <div>
                        <div className='mb-2 block'>
                          <Label htmlFor='bandwidth2' value='Bandwidth Size' />
                        </div>
                        <TextInput id='bandwidth2' required onBlur={e => setBandwidthLimitSize(e.target.value)} type='text' />
                      </div>
                      <Button onClick={() => handleAddNewBandwidthPackage()} type='button'>
                        Submit
                      </Button>
                    </form>
                  </div>
                </Tabs.Item>
              ) : (
                <Tabs.Item disabled title=''></Tabs.Item>
              )}
            </Tabs.Group>
          </div>
        </Modal.Body>
        <Modal.Footer className='dark:bg-neutral-800 dark:border-0'></Modal.Footer>
      </Modal>
      <SyncBackdrop open={openSyncBackdrop} text={syncBackdropText} />
    </>
  )
}

export default BuyNftModal
