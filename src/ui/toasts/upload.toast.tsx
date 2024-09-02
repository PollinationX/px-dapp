import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { Spinner, Toast } from 'flowbite-react'

interface IUploadToastProps {
  show: boolean
  filename: string
  counter: number
  count: number
}

const UploadToast: FC<IUploadToastProps> = ({ show, filename, counter, count }) => {
  const { t } = useTranslation()
  if (!show) return <></>

  return (
    <Toast className='fixed bottom-5 right-5'>
      <Spinner />
      <div className='ml-3 text-sm font-normal'>
        {t('uploading')}: {filename} ({counter}/{count} {Number(((counter - 1) / count) * 100).toFixed(0)}%)
      </div>
      <Toast.Toggle />
    </Toast>
  )
}

export default UploadToast
