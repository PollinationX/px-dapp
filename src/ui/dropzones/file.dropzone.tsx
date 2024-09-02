import moment from 'moment/moment'
import Dropzone from 'react-dropzone'
import FileSettingsDropdown from '@/ui/dropdowns/file-settings.dropdown'
import useTranslation from 'next-translate/useTranslation'
import { FC, useState } from 'react'
import { IFile } from '@/components/drive/types'
import { ITableSort } from '@/types'
import { formatBytes } from '@/utils/helper'
import { tableSortingConfig } from '@/config'
import { FileIcon, defaultStyles } from 'react-file-icon'

interface IFileDropzoneProps {
  files: IFile[]
  tableSorting: ITableSort[]
  onEdit: any
  onDelete: any
  onDrop: any
  onDoubleClick: any
  onSort: any
}

const FileDropzone: FC<IFileDropzoneProps> = ({ files, tableSorting, onEdit, onDelete, onDrop, onDoubleClick, onSort }) => {
  const { t } = useTranslation()
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const DropzoneContainer = ({ innerRef, ...other }) => <div ref={innerRef} {...other} />

  const handleOnDrop = async (acceptedFiles: any[]): Promise<void> => {
    setIsDragging(false)
    onDrop(acceptedFiles)
  }

  const _renderFileRow = (file: IFile) => {
    return (
      <tr
        key={`${file.name}${file.id}`}
        className='border-b dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer'
        onDoubleClick={() => onDoubleClick(file)}
      >
        <td scope='row' className='px-4 py-3 font-medium text-neutral-900 whitespace-nowrap dark:text-white flex items-center'>
          <div className='flex items-center'>
            <div className='h-8 w-8 mr-3'>
              {file.type === 'folder' ? <img src={file.image} /> : <FileIcon extension={file.image} {...defaultStyles[file.image]} />}
            </div>
            <div>{file.name}</div>
          </div>
        </td>
        <td className='px-4 py-3 font-medium text-neutral-900 whitespace-nowrap dark:text-white'>{moment(file.createdAt, 'x').format('D. MMM YYYY HH:mm')}</td>
        <td className='px-4 py-3 font-medium text-neutral-900 whitespace-nowrap dark:text-white'>{file.size ? formatBytes(file.size) : '/'}</td>
        <td className='px-4 py-3 whitespace-nowrap'>
          <span
            className={`banner ${
              file.status === 'uploaded'
                ? 'bg-pollinationx-purple text-white text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-pollinationx-purple dark:text-white'
                : file.status === 'uploading'
                ? 'bg-pollinationx-honey text-white text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-pollinationx-honey dark:text-white'
                : 'bg-neutral-100 text-neutral-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-neutral-700 dark:text-neutral-300'
            }`}
          >
            {t(file.status)}
          </span>
        </td>
        <td className='px-4 py-3'>
          <FileSettingsDropdown file={file} onEdit={name => onEdit(file.id, name)} onDelete={() => onDelete(file.id)} />
        </td>
      </tr>
    )
  }

  return (
    <Dropzone noClick noKeyboard onDragEnter={() => setIsDragging(true)} onDragLeave={() => setIsDragging(false)} onDrop={handleOnDrop}>
      {({ getRootProps, getInputProps }) => {
        const { ref, ...rootProps } = getRootProps()
        return (
          <DropzoneContainer innerRef={ref} {...rootProps}>
            <input {...getInputProps()} />
            <table className={`dropzone ${isDragging ? 'opacity-20' : ''} w-full text-sm text-left text-neutral-500 dark:text-neutral-400`}>
              <thead className='text-xs text-neutral-700 uppercase bg-neutral-50 dark:bg-neutral-700 dark:text-neutral-400'>
                <tr>
                  <th scope='col' className='px-4 py-3 min-w-[14rem]'>
                    {t('name')}
                    <svg
                      onClick={() => onSort(0, 'name')}
                      className='h-4 w-4 ml-1 inline-block'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                      xmlns='http://www.w3.org/2000/svg'
                      aria-hidden='true'
                    >
                      <path clipRule='evenodd' fillRule='evenodd' d={tableSortingConfig[tableSorting[0].sort]} />
                    </svg>
                  </th>
                  <th scope='col' className='px-4 py-3 min-w-[8rem] w-[8rem]'>
                    {t('date')}
                    <svg
                      onClick={() => onSort(1, 'createdAt')}
                      className='h-4 w-4 ml-1 inline-block'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                      xmlns='http://www.w3.org/2000/svg'
                      aria-hidden='true'
                    >
                      <path clipRule='evenodd' fillRule='evenodd' d={tableSortingConfig[tableSorting[1].sort]} />
                    </svg>
                  </th>
                  <th scope='col' className='px-4 py-3 min-w-[8rem] w-[8rem]'>
                    {t('fileSize')}
                    <svg
                      onClick={() => onSort(2, 'size')}
                      className='h-4 w-4 ml-1 inline-block'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                      xmlns='http://www.w3.org/2000/svg'
                      aria-hidden='true'
                    >
                      <path clipRule='evenodd' fillRule='evenodd' d={tableSortingConfig[tableSorting[2].sort]} />
                    </svg>
                  </th>
                  <th scope='col' className='px-4 py-3 min-w-[8rem] w-[8rem]'>
                    {t('status')}
                    <svg
                      onClick={() => onSort(3, 'status')}
                      className='h-4 w-4 ml-1 inline-block'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                      xmlns='http://www.w3.org/2000/svg'
                      aria-hidden='true'
                    >
                      <path clipRule='evenodd' fillRule='evenodd' d={tableSortingConfig[tableSorting[3].sort]} />
                    </svg>
                  </th>
                  <th scope='col' className='px-4 py-3 min-w-[5rem] w-[5rem]'>
                    <span className='sr-only'>{t('actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>{files.map((file: IFile) => _renderFileRow(file))}</tbody>
            </table>
          </DropzoneContainer>
        )
      }}
    </Dropzone>
  )
}

export default FileDropzone
