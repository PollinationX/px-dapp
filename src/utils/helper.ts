import { INft, TStatus, TTableSortingSequence } from '@/types'
import { IFile } from '@/components/drive/types'
import { ethers } from 'ethers'
import { tableSortingConfig } from '@/config'
import * as _ from 'lodash'

export const delay = (ms: number) => new Promise(r => setTimeout(r, ms))
export const truncateAddress = (address: string, length: number = 5): string => (address ? `${address.slice(0, length)}...${address.slice(-length)}` : '')
export const getWei = (value: any, decimals: number = 18): string => (value ? ethers.utils.parseUnits(value.toString(), decimals).toString() : '0')

export const fromWei = (wei: number, decimals: number = 18): string => {
  return ethers.utils.formatUnits(wei.toString(), decimals)
}
export const getNumbersFromString = (value: string): string => value.match(/\d+/)[0]
export const findBy =
  (value: any, key: string = 'id', nestedKey: string = 'children'): any =>
  (data: any[]) =>
    data.reduce((res, obj) => (res ? res : obj[key] === value ? obj : findBy(value)(obj[nestedKey] || [])), undefined)
export const orderBy =
  (key: string = 'id', order: any): any =>
  (data: any[]) =>
    _.orderBy(data, item => (_.isNumber(item[key]) ? item[key] : item[key]?.toLowerCase()), [order])
export const recursiveRemoveBy =
  (value: any, key: string = 'id', nestedKey: string = 'children'): any =>
  (data: any[]) =>
    data
      .map(file => {
        return { ...file }
      })
      .filter(item => {
        if (nestedKey in item) {
          item[nestedKey] = recursiveRemoveBy(value)(item[nestedKey])
        }
        return item[key] !== value
      })
export const getBase64 = (file: File): Promise<string> => {
  const reader = new FileReader()
  reader.readAsDataURL(file as Blob)

  return new Promise<string>(resolve => {
    reader.onload = () => resolve(reader.result as any)
    reader.onerror = () => resolve(null)
  })
}
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const sizes = ['bytes', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals < 0 ? 0 : decimals))}${sizes[i]}`
}
export const getTableSortSequence = (sequence: TTableSortingSequence): TTableSortingSequence => {
  const index: number = tableSortingConfig.sequence.findIndex((tableSortingSequence: TTableSortingSequence) => tableSortingSequence === sequence)
  return tableSortingConfig.sequence[index + 1 === tableSortingConfig.sequence.length ? 0 : index + 1]
}
export const getPendingFiles = (files: IFile[], foldersOnly: boolean = false): IFile[] => {
  const pendingFiles: IFile[] = []
  const search = (items: IFile[]) => {
    for (const file of items) {
      if (file.status === 'pending') {
        if (!foldersOnly || (foldersOnly && file.type === 'folder')) {
          pendingFiles.push(file)
        }
      }
      if (file?.children?.length > 0) search(file.children)
    }
  }
  search(files)
  return pendingFiles
}
export const getFolderFiles =
  (id: string) =>
  (files: IFile[]): IFile[] => {
    let folderFiles: IFile[] = []
    for (const file of files) {
      if (file.type === 'folder' && file.id === id) {
        folderFiles = file.children.slice()
        break
      }
      if (file?.children?.length > 0) {
        return getFolderFiles(id)(file.children)
      }
    }
    return folderFiles
  }
export const mergeNfts = (oldNfts: INft[], newNfts: INft[]): INft[] =>
  newNfts.map((newNft: INft) => {
    const nft = oldNfts.find((oldNft: INft) => oldNft.id.tokenId === newNft.id.tokenId)
    nft
      ? (newNft = { ...newNft, cid: nft.cid, secret: nft.secret, synced: nft.synced, files: nft.files })
      : (newNft = { ...newNft, cid: null, secret: null, synced: true, files: [] })
    return newNft
  })
export const countPendingFiles = (files: IFile[]): any => {
  let filesCount = 0
  let folderCount = 0
  const search = (items: IFile[]) => {
    for (const file of items) {
      file.status !== 'pending' || (file.type === 'folder' ? file.uploaded || folderCount++ : filesCount++)
      if (file?.children?.length > 0) search(file.children)
    }
  }
  search(files)
  return { filesCount, folderCount }
}
export const updateFolderStatusOnNewFile =
  (id: string, status: TStatus = 'pending') =>
  (files: IFile[]): boolean => {
    for (const file of files) {
      if (file.id === id) return true
      if (file?.children?.length > 0 && updateFolderStatusOnNewFile(id)(file.children)) {
        file.status = status
        return true
      }
    }
  }
export const updateFolderStatusOnDeleteFile =
  (id: string) =>
  (files: IFile[]): boolean => {
    for (const file of files) {
      if (file.id === id || (file?.children && updateFolderStatusOnDeleteFile(id)(file.children))) {
        !file?.children || _updateFolderStatus(file)
        return true
      }
    }
  }
const _updateFolderStatus = (file: IFile): void => {
  const children = []
  _getAllChildren(children)(file.children)
  children.findIndex(status => status) >= 0 || _countPendingFiles(file.children) > 0 || !file.uploaded || (file.status = 'uploaded')
}
const _getAllChildren =
  (children: boolean[]) =>
  (files: IFile[]): void => {
    for (const file of files) {
      if (file?.children?.length > 0) {
        const count = _countPendingFiles(file.children)
        count > 0 || (file.status = 'uploaded')
        children.push(count > 0)
        _getAllChildren(children)(file.children)
      }
    }
  }
const _countPendingFiles = (files: IFile[]): number => {
  let count = 0
  for (const file of files) {
    file.type !== 'file' || file.status !== 'pending' || count++
  }
  return count
}
