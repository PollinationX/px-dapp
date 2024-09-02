import useTranslation from 'next-translate/useTranslation'
import Link from 'next/link'
import { FC } from 'react'
import { useRouter } from 'next/router'
import { useAccountContext } from '@/contexts/account/provider'
import { useIndexedDBContext } from '@/contexts/indexed-db/provider'
import { Dropdown } from 'flowbite-react'
import * as _ from 'lodash'

const LanguageDropdown: FC = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { account, setAccount } = useAccountContext()
  const { indexedDB } = useIndexedDBContext()

  const handleLanguageOnClick = async (locale: string): Promise<void> => {
    account.locale = locale
    setAccount(_.cloneDeep(account))
    await indexedDB.put(account)
  }

  return (
    <Dropdown
      arrowIcon={false}
      inline
      label={
        <span className='inline-flex cursor-pointer justify-center rounded p-2 text-gray-500 hover:bg-neutral-100 hover:text-gray-900 dark:hover:bg-neutral-700 dark:hover:text-white'>
          <span className='sr-only'>{t('currentLanguage')}</span>
          <img className='h-6 w-6 rounded-full' src={`/img/flag/${router.locale}.svg`} />
        </span>
      }
    >
      <ul className='py-1' role='none'>
        <li>
          <Link
            href='/drive'
            locale='en'
            onClick={() => handleLanguageOnClick('en')}
            className='block py-2 px-4 text-sm text-gray-700 hover:bg-neutral-100 dark:text-gray-400 dark:hover:bg-neutral-600 dark:hover:text-white'
          >
            <div className='inline-flex items-center'>
              <img className='mr-2 h-4 w-4 rounded-full' src='/img/flag/en.svg' />
              <span className='whitespace-nowrap'>EN</span>
            </div>
          </Link>
        </li>
        <li>
          <Link
            href='/drive'
            locale='si'
            onClick={() => handleLanguageOnClick('si')}
            className='block py-2 px-4 text-sm text-gray-700 hover:bg-neutral-100 dark:text-gray-400 dark:hover:bg-neutral-600 dark:hover:text-white'
          >
            <div className='inline-flex items-center'>
              <img className='mr-2 h-4 w-4 rounded-full' src='/img/flag/si.svg' />
              <span className='whitespace-nowrap'>SI</span>
            </div>
          </Link>
        </li>
      </ul>
    </Dropdown>
  )
}

export default LanguageDropdown
