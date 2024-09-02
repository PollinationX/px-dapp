import { IFile } from '@/components/drive/types'
import { TransactionReceipt } from '@ethersproject/abstract-provider/src.ts'

export type TType = 'folder' | 'file'
export type TStatus = 'pending' | 'uploading' | 'uploaded'
export type TTableSortingSequence = 'default' | 'asc' | 'desc'

export interface IError {
  error?: any
}

export interface ISignAuth {
  chain: string
  nonce: string
  signature: string
}

export interface IDoWriteContract extends IError {
  hash?: string
  wait?: (confirmations?: number) => Promise<TransactionReceipt>
}

interface IOpenSea {
  lastIngestedAt: string
}

interface IToken {
  tokenId: string
  tokenMetadata: ITokenMetadata
}

interface ITokenMetadata {
  tokenType: string
}

interface IMedia {
  bytes: number
  format: string
  gateway: string
  raw: string
  thumbnail: string
}

interface IMetadataAttribute {
  display_type?: string
  trait_type: string
  value: string | number
}

interface IMetadata {
  attributes: IMetadataAttribute[]
  description: string
  image: string
  name: string
}

interface ITokenUri {
  gateway: string
  raw: string
}

interface IContract {
  address: string
}

interface IContractMetadata {
  contractDeployer: string
  deployedBlockNumber: number
  name: string
  openSea: IOpenSea
  symbol: string
  tokenType: string
}

export interface IGetNft extends IError {
  nfts?: INft[]
  success?: boolean
  totalCount?: number
  contractAddress?: string
  contractOwner?: string
  symbol?: string
  packages?: INftPackage[]
  bandwidthPackages?: INftBandwidthPackage[]
}

export interface IGetContentByCid extends IError {
  content?: string
}

export interface INft {
  balance: string
  contract: IContract
  contractMetadata: IContractMetadata
  description: string
  endpoint: string
  id: IToken
  jwt: string
  media?: IMedia[]
  metadata: IMetadata
  timeLastUpdated: string
  title: string
  tokenUri: ITokenUri
  secret?: string
  cid?: string
  synced?: boolean
  files?: IFile[]
}
export interface INftPackage {
  id: number
  name: string
  price: number
  size: number
  sizeInBytes: number
  storageUnit: string
  active: boolean
  bandwidthLimit: number
  disabled: boolean
  processing: boolean
  done: boolean
}
export interface INftBandwidthPackage {
  id: number
  name: string
  price: number
  bandwidth: number
  active: boolean
  disabled: boolean
  processing: boolean
  done: boolean
}
export interface ITable {
  sorting: ITableSorting
}

export interface ITableSorting {
  [key: string]: ITableFolderSorting
}

export interface ITableFolderSorting {
  [key: string]: ITableSortingOptions
}

export interface ITableSortingOptions {
  id?: number
  sequence?: TTableSortingSequence
}

export interface IAccount {
  address?: string
  password?: string
  loggedIn?: boolean
  locale?: string
  symbol?: string
  contractAddress?: string
  defaultNftIndex?: number
  contractOwner?: string
  chainAddress?: string
  nfts?: INft[]
  packages?: INftPackage[]
  bandwidthPackages?: INftBandwidthPackage[]
  table?: ITable
}

export interface ITableSort {
  id: number
  sort: TTableSortingSequence
}

export interface IContractExtraContent {
  cid?: string
}

export interface ITokenUsage {
  storageUsageInBytes: number
  bandwidth: number
}

export interface IChain {
  tokens: {
    [tokenId: string]: ITokenUsage
  }
}

export interface IUsageState {
  chains: {
    [chainId: string]: IChain
  }
}
