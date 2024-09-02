import useTranslation from 'next-translate/useTranslation'
import ResetNftSecretModal from '@/ui/modals/reset-nft-secret.modal'
import { FC, useState } from 'react'
import { useRouter } from 'next/router'
import { disconnect } from '@wagmi/core'
import { HiCog, HiKey, HiLogout } from 'react-icons/hi'
import { Dropdown } from 'flowbite-react'

const SettingsDropdown: FC = () => {
  const { t } = useTranslation()
  const { push } = useRouter()
  const [showResetNftSecretModal, setShowResetNftSecretModal] = useState<boolean>(false)

  const handleLogoutOnClick = async (): Promise<void> => {
    await disconnect()
    push({
      pathname: '/'
    })
  }

  return (
    <>
      <Dropdown
        arrowIcon={false}
        inline
        label={<HiCog className='text-2xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white' />}
      >
        <ul className='py-1' role='none'>
          <li>
            <div
              onClick={() => setShowResetNftSecretModal(true)}
              className='block py-2 px-4 text-sm text-gray-700 hover:bg-neutral-100 dark:text-gray-400 dark:hover:bg-neutral-600 dark:hover:text-white cursor-pointer'
            >
              <div className='inline-flex items-center'>
                <HiKey className='text-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white  mr-2' />
                <span className='whitespace-nowrap'>{t('resetNftSecret')}</span>
              </div>
            </div>
          </li>
          <li>
            <div
              onClick={handleLogoutOnClick}
              className='block py-2 px-4 text-sm text-gray-700 hover:bg-neutral-100 dark:text-gray-400 dark:hover:bg-neutral-600 dark:hover:text-white cursor-pointer'
            >
              <div className='inline-flex items-center'>
                <HiLogout className='text-xl text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white  mr-2' />
                <span className='whitespace-nowrap'>{t('logout')}</span>
              </div>
            </div>
          </li>
        </ul>
      </Dropdown>
      <ResetNftSecretModal show={showResetNftSecretModal} onClose={setShowResetNftSecretModal} />
    </>
  )
}

export default SettingsDropdown
