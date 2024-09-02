import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useState } from 'react'
import { Modal } from 'flowbite-react'
import { IUsageState } from '@/types/index'
import { doWriteContract } from '@/utils/contract'
import { BigNumber } from 'ethers'
import abi from '@/abi/PX.json'
import SyncBackdrop from '@/ui/backdrops/sync.backdrop'
import { toastify } from '@/utils/toastify'
import { setUpdateState } from '@/utils/btfs'

interface IUsageStateProps {
  show: boolean
  onClose: any
  initialUsageState: IUsageState
  contractAddress: string
  jwt: string
}

const UsageState: FC<IUsageStateProps> = ({ show, onClose, initialUsageState, contractAddress, jwt }) => {
  const { t } = useTranslation()
  const [syncBackdropText, setSyncBackdropText] = useState<string>('')
  const [openSyncBackdrop, setOpenSyncBackdrop] = useState<boolean>(false)
  const [usageState, setUsageState] = useState<IUsageState | null>(initialUsageState)

  useEffect(() => {
    setUsageState(initialUsageState)
  }, [initialUsageState])

  const handleSyncStateToBlockchain = async (usageState: IUsageState, contractAddress: string): Promise<void> => {
    try {
      if (!usageState || !usageState.chains || Object.keys(usageState.chains).length === 0) {
        console.error('Invalid usageState object')
        return
      }

      setOpenSyncBackdrop(true)
      setSyncBackdropText(t('waitingForUserConfirmation'))
      let isError = true

      const chainId = Object.keys(usageState.chains)[0] // Assuming there's only one chain in the usageState
      const tokenId = Object.keys(usageState.chains[chainId].tokens)[0] // Assuming there's only one token in the chain
      const token = usageState.chains[chainId].tokens[tokenId]
      const { storageUsageInBytes, bandwidth } = token

      const writeContractRes = await doWriteContract(
        'updateStorageUsage',
        [parseInt(tokenId), storageUsageInBytes, bandwidth],
        { gasLimit: BigNumber.from(4000000) },
        contractAddress,
        abi
      )

      if (!writeContractRes?.error) {
        setSyncBackdropText(t('waitingForBlockchainConfirmation'))
        await writeContractRes.wait(1)
        setSyncBackdropText(t('waitingForUpdateStateConfirmation'))
        const resetStateJsonRes = await setUpdateState(jwt)
        isError = false
        setUsageState(null) // Reset usageState
        // if (resetStateJsonRes.success) {
        //   isError = false
        //   setUsageState(null) // Reset usageState
        // }
      }

      setOpenSyncBackdrop(false)
      toastify(t(!isError ? 'syncUsageStateSuccess' : 'syncUsageStateFailed'), !isError ? 'success' : 'error')
    } catch (error) {
      // Handle API call errors
      console.error('Error:', error)
      setOpenSyncBackdrop(false)
      toastify(t('syncUsageStateFailed'), 'error')
    }
  }

  return (
    <>
      <Modal show={show} position='center' onClose={() => onClose(true)}>
        <Modal.Header className='dark:bg-neutral-800 dark:border-gray-700 modalHeader'>{t('usageState')}</Modal.Header>
        <Modal.Body className='border-t dark:border-gray-600 bg-white dark:bg-gradient-to-b from-pollinationx-black to-pollinationx-purple'>
          <div className='space-y-6 p-3 overflow-x-scroll'>
            {usageState && usageState.chains && Object.keys(usageState.chains).length > 0 ? (
              <div className='space-y-4'>
                {Object.entries(usageState.chains).map(([chainId, chain]) => (
                  <div key={chainId} className='p-4 border rounded-lg dark:border-gray-700'>
                    <h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
                      {/*Chain ID: <span className='text-pollinationx-honey'>{chainId}</span>*/}
                    </h3>
                    <div className='mt-2 space-y-4'>
                      {Object.entries(chain.tokens).map(([tokenId, token]) => (
                        <div key={tokenId} className='p-2 border-b dark:border-gray-600'>
                          <p className='text-md font-medium text-gray-700 dark:text-gray-300 mb-2'>
                            PX sNFT Token ID: <span className='text-pollinationx-honey'>{tokenId}</span>
                          </p>
                          <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                            <span className='font-semibold text-pollinationx-honey'>Storage Usage:</span> {token.storageUsageInBytes} bytes (
                            <span className='text-gray-700 dark:text-gray-300'>~ {(token.storageUsageInBytes / (1024 * 1024)).toFixed(2)}</span> MB)
                          </p>
                          <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                            <span className='font-semibold text-pollinationx-honey'>{t('bandwidthUsed')}:</span> {token.bandwidth}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='p-4 border rounded-lg dark:border-gray-700'>
                  <p className='text-pollinationx-honey'>{t('No usage state data available')}</p>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className='dark:bg-pollinationx-purple dark:border-gray-700'>
          <button
            onClick={() => handleSyncStateToBlockchain(usageState as IUsageState, contractAddress)}
            type='button'
            disabled={!usageState || !usageState.chains || Object.keys(usageState.chains).length === 0}
            className={`relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium rounded-lg group ${
              !usageState || !usageState.chains || Object.keys(usageState.chains).length === 0
                ? 'bg-gray-400 text-gray-400 cursor-not-allowed'
                : 'text-gray-900 cursor-pointer bg-gradient-to-br from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple hover:text-white dark:text-white focus:outline-none focus:ring-0 dark:focus:ring-blue-800'
            }`}
          >
            <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
              {t('Sync State to Blockchain')}
            </span>
          </button>
          <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>*{t('dataRefreshApprox')}</p>
        </Modal.Footer>
      </Modal>
      <SyncBackdrop open={openSyncBackdrop} text={syncBackdropText} />
    </>
  )
}

export default UsageState
