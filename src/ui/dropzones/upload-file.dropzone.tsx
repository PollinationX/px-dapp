import Dropzone from 'react-dropzone'
import useTranslation from 'next-translate/useTranslation'
import { FC, useState } from 'react'
import { HiUpload } from 'react-icons/hi'

interface IUploadFileDropzoneProps {
  onDrop: any
}

const UploadFileDropzone: FC<IUploadFileDropzoneProps> = ({ onDrop }) => {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const DropzoneContainer = ({ innerRef, ...other }) => <div ref={innerRef} {...other} />

  const handleOnDrop = async (acceptedFiles: any[]): Promise<void> => {
    setIsDragging(false)
    onDrop(acceptedFiles)
  }

  return (
    <Dropzone onDragEnter={() => setIsDragging(true)} onDragLeave={() => setIsDragging(false)} onDrop={handleOnDrop}>
      {({ getRootProps, getInputProps }) => {
        const { ref, ...rootProps } = getRootProps()
        return (
          <DropzoneContainer innerRef={ref} {...rootProps} className='mx-auto max-w-screen-2xl px-4 lg:px-12 text-center'>
            <input {...getInputProps()} />
            <button
              className={`dropzone ${
                isDragging ? 'opacity-20' : ''
              } flex h-32 w-full cursor-pointer flex-col rounded border-2 items-center justify-center border-dashed border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700`}
            >
              <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                <HiUpload className='text-4xl text-gray-300' />
                <p className='py-1 text-sm text-gray-600 dark:text-gray-500'>{t('uploadFileOrDragDrop')}</p>
              </div>
              <input type='file' className='hidden' />
            </button>
          </DropzoneContainer>
        )
      }}
    </Dropzone>
  )
}

export default UploadFileDropzone
