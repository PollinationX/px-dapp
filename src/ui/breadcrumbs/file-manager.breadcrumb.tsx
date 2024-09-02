import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { IBreadcrumb } from '@/components/drive/types'
import { HiHome } from 'react-icons/hi'
import { Breadcrumb } from 'flowbite-react'

interface FileManagerBreadcrumbProps {
  breadcrumbs: IBreadcrumb[]
  onClick: any
}

const FileManagerBreadcrumb: FC<FileManagerBreadcrumbProps> = ({ breadcrumbs, onClick }) => {
  const { t } = useTranslation()

  return (
    <Breadcrumb>
      <Breadcrumb.Item icon={HiHome} onClick={() => onClick(-1)} className='cursor-pointer'>
        {t('home')}
      </Breadcrumb.Item>
      {breadcrumbs.length > 0 &&
        breadcrumbs.map((breadcrumb: IBreadcrumb, index: number) => (
          <Breadcrumb.Item key={breadcrumb.id} onClick={() => onClick(index)} className='cursor-pointer'>
            {breadcrumb.name}
          </Breadcrumb.Item>
        ))}
    </Breadcrumb>
  )
}

export default FileManagerBreadcrumb
