import useTranslation from 'next-translate/useTranslation'
import { FC } from 'react'
import { SyncContentEnum } from '@/enums/sync-content.enum'
import { SyncContentColorEnum } from '@/enums/sync-content-color.enum'
import { HiOutlineCloudDownload, HiOutlineCloudUpload, HiOutlineInformationCircle } from 'react-icons/hi'
import { Modal, Tooltip } from 'flowbite-react'

interface ISyncContentModalProps {
  show: boolean
  onClose: any
}

const SyncContentModal: FC<ISyncContentModalProps> = ({ show, onClose }) => {
  const { t } = useTranslation()

  return (
    <Modal className='editNameModal' show={show} size='lg' popup={true} onClose={() => onClose(SyncContentEnum.SYNCED)}>
      <Modal.Header className='rounded-t px-6 py-4 bg-white dark:bg-pollinationx-black'>
        <div className='px-4 text-base font-semibold text-gray-900 lg:text-xl dark:text-white'>{t('syncContentTitle')}</div>
      </Modal.Header>
      <Modal.Body className='border-t dark:border-gray-600 bg-white dark:bg-gradient-to-b from-pollinationx-black to-pollinationx-purple'>
        <div className='grid grid-cols-2 gap-2 mt-8'>
          <div>
            <div className='mx-auto max-w-screen-2xl px-1 text-center'>
              <button
                onClick={() => onClose(SyncContentEnum.DOWNLOAD)}
                className={`flex h-32 w-full cursor-pointer flex-col rounded border-2 justify-center items-center border-dashed ${SyncContentColorEnum.DOWNLOAD} hover:bg-gray-50 dark:hover:bg-gray-700`}
              >
                <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                  <HiOutlineCloudDownload className='text-4xl text-gray-300' />
                  <p className='py-1 text-sm text-gray-600 dark:text-gray-500'>{t('downloadFromBlockchain')}</p>
                  <Tooltip
                    content={t('downloadFromBlockchainInfo')}
                    animation='duration-500'
                    className='bg-pollinationx-black dark:bg-pollinationx-black opacity-90'
                    placement='top'
                    arrow={false}
                  >
                    <HiOutlineInformationCircle className='text-xl text-gray-300' />
                  </Tooltip>
                </div>
              </button>
            </div>
          </div>
          <div>
            <div className='mx-auto max-w-screen-2xl px-1 text-center'>
              <button
                onClick={() => onClose(SyncContentEnum.UPLOAD)}
                className={`flex h-32 w-full cursor-pointer flex-col rounded border-2 justify-center items-center border-dashed ${SyncContentColorEnum.UPLOAD} hover:bg-gray-50 dark:hover:bg-gray-700`}
              >
                <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                  <HiOutlineCloudUpload className='text-4xl text-gray-300' />
                  <p className='py-1 text-sm text-gray-600 dark:text-gray-500'>{t('uploadToBlockchain')}</p>
                  <Tooltip
                    content={t('uploadToBlockchainInfo')}
                    animation='duration-500'
                    className='bg-pollinationx-black dark:bg-pollinationx-black opacity-90'
                    placement='top'
                    arrow={false}
                  >
                    <HiOutlineInformationCircle className='text-xl text-gray-300' />
                  </Tooltip>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default SyncContentModal
