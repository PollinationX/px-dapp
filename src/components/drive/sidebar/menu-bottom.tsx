import LanguageDropdown from '@/ui/dropdowns/language.dropdown'
import SettingsDropdown from '@/ui/dropdowns/settings.dropdown'
import { FC } from 'react'

const BottomMenu: FC = () => {
  return (
    <div className='flex items-center justify-center gap-x-5'>
      <div>
        <SettingsDropdown />
      </div>
      <div>
        <LanguageDropdown />
      </div>
    </div>
  )
}

export default BottomMenu
