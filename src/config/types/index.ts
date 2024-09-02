import { ITableSort, TTableSortingSequence } from '@/types'

export interface IAppConfig {
  locale: string
}

export interface IAuthGuardOptions {
  publicPaths: string[]
}

interface IPollinationXAuthOptions {
  message: string
}

export interface IPollinationXConfig {
  url: string
  auth: IPollinationXAuthOptions
  newNft: IPollinationXAuthOptions
}

export interface ITableSortingDefaultValues {
  files: ITableSort[]
}

export interface ITableSortingConfig {
  default: string
  asc: string
  desc: string
  sequence: TTableSortingSequence[]
  defaultValues: ITableSortingDefaultValues
}
