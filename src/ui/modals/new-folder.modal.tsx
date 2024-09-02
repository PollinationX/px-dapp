import useTranslation from 'next-translate/useTranslation'
import { FC, useEffect, useRef } from 'react'
import { Label, Modal, TextInput } from 'flowbite-react'

interface INewFolderModalProps {
  show: boolean
  onClose: any
}

const NewFolderModal: FC<INewFolderModalProps> = ({ show, onClose }) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>()

  const handleOnClose = (): void => {
    onClose(inputRef.current.value)
    inputRef.current.value = ''
  }

  const handleOnKeyUp = (event: any): void => {
    event.key !== 'Enter' || handleOnClose()
  }

  useEffect(() => {
    inputRef?.current?.focus()
  })

  return (
    <Modal className='newFolderModal' show={show} size='md' popup={true} onClose={() => onClose(null)}>
      <Modal.Header className='rounded-t px-6 py-4 bg-white dark:bg-pollinationx-black'>
        <div className='px-4 text-base font-semibold text-gray-900 lg:text-xl dark:text-white'>{t('createNewFolder')}</div>
      </Modal.Header>
      <Modal.Body
        className='border-t  dark:border-gray-600 bg-white dark:bg-gradient-to-b
                                                    from-pollinationx-black to-pollinationx-purple'
      >
        <div className='py-4'>
          <div>
            <div className='mb-2 block'>
              <Label className='text-pollinationx-grey text-sm' htmlFor='name' value={t('folderName')} />
            </div>
            <TextInput id='name' type='text' required={true} ref={inputRef} onKeyUp={handleOnKeyUp} />
          </div>
          <div className='w-full'>
            <button
              type='button'
              onClick={handleOnClose}
              className='relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 mt-4
                                                    overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br
                                                    from-pollinationx-honey to-pollinationx-purple group-hover:from-pollinationx-honey group-hover:to-pollinationx-purple
                                                    hover:text-white dark:text-white focus:outline-none focus:ring-0
                                                    dark:focus:ring-blue-800'
            >
              <span className='relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-neutral-900 rounded-md group-hover:bg-opacity-0'>
                {t('confirm')}
              </span>
            </button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default NewFolderModal
