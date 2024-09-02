import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { disconnect } from '@wagmi/core'
import { useAccountContext } from '@/contexts/account/provider'
import { useRouter } from 'next/router'
import { useIndexedDBContext } from '@/contexts/indexed-db/provider'
import { Button, Modal } from 'flowbite-react'

interface IResetNftSecretModalProps {
  show: boolean
  onClose: any
}

const ResetNftSecretModal: FC<IResetNftSecretModalProps> = ({ show, onClose }) => {
  const { t } = useTranslation()
  const { push } = useRouter()
  const { indexedDB } = useIndexedDBContext()
  const { account } = useAccountContext()

  const handleResetOnClick = async () => {
    account.nfts[account.defaultNftIndex].cid = null
    account.nfts[account.defaultNftIndex].secret = null
    account.nfts[account.defaultNftIndex].synced = true
    await indexedDB.put(account)
    await disconnect()
    push({
      pathname: '/'
    })
  }

  return (
    <Modal show={show} size='2xl' popup={true} onClose={() => onClose(false)}>
      <Modal.Header>
        <div className='px-4 text-base font-semibold text-gray-900 lg:text-xl dark:text-white'>{t('resetNftSecret')}</div>
      </Modal.Header>
      <Modal.Body>
        <div className='text-center'>
          <HiOutlineExclamationCircle className='mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200' />
          <h2 className='mb-5 text-xl font-normal text-gray-500 dark:text-gray-400'>
            {t('resetNftSecretTitle')}: {account?.nfts[account.defaultNftIndex]?.title}?
          </h2>
          <h3 className='mb-5 sm:text-lg font-normal text-red-500 dark:text-red-400'>{t('resetNftSecretSubtitle')}</h3>
          <div className='flex justify-center gap-4'>
            <Button onClick={handleResetOnClick} color='failure'>
              {t('yesSure')}
            </Button>
            <Button onClick={() => onClose(false)} color='gray'>
              {t('noCancel')}
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default ResetNftSecretModal
