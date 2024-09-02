import useTranslation from 'next-translate/useTranslation'
import abi from '@/abi/PX.json'
import { FC, useEffect } from 'react'
import { BigNumber } from 'ethers'
import { Address, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi'
import { getWei } from '@/utils/helper'
import { toastify } from '@/utils/toastify'
import { Spinner } from 'flowbite-react'
import { useAccountContext } from '@/contexts/account/provider'

interface IFreeMintProps {
  onClose: any
}

const FreeMint: FC<IFreeMintProps> = ({ onClose }) => {
  const { t } = useTranslation()
  const { account } = useAccountContext()

  const {
    config,
    error: errorPrepare,
    isError: isErrorPrepare
  } = usePrepareContractWrite({
    address: account.contractAddress as Address,
    abi,
    functionName: 'mint',
    args: [0],
    overrides: { value: BigNumber.from(getWei(0)), gasLimit: BigNumber.from(4000000) }
  })
  const { data: contractData, error, isError, write: mintNFT } = useContractWrite(config)
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: contractData?.hash
  })

  const handleSuccessFreeMint = (): void => {
    toastify(t('mintStorageSuccess'))
    onClose(false, true)
  }

  useEffect(() => {
    if (isError || isErrorPrepare) toastify((error || errorPrepare)?.message, 'error')
    !isSuccess || handleSuccessFreeMint()
  }, [isError, isErrorPrepare, isSuccess])

  return (
    <button
      onClick={() => mintNFT?.()}
      disabled={!mintNFT || isLoading}
      type='button'
      className='cursor-pointer relative inline-flex items-center justify-center p-0.5 mb-2 mr-2
                                                    overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
                                                    from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
                                                    hover:text-white dark:text-white focus:ring-0 focus:outline-none
                                                    dark:focus:ring-blue-800'
    >
      <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
        {isLoading ? <Spinner className='mr-3' /> : ''}
        {isLoading ? t('minting') : t('freeMint')}
      </span>
    </button>
  )
}

export default FreeMint
