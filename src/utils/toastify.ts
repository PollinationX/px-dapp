import { Id, toast, TypeOptions } from 'react-toastify'
import { ToastOptions } from 'react-toastify/dist/types'

export const toastify = (content: string, type: TypeOptions = 'success', options?: ToastOptions): Id =>
  toast(content, {
    className: 'bg-neutral-50 dark:bg-neutral-800 dark:text-white',
    ...options,
    type
  })
