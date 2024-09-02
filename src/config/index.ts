import { IAppConfig, IAuthGuardOptions, IPollinationXConfig, ITableSortingConfig } from '@/config/types'
import { ThemeCtrlState } from '@web3modal/core/dist/_types/src/types/controllerTypes'

export const appConfig: IAppConfig = {
  locale: 'en'
}

export const authGuardOptions: IAuthGuardOptions = {
  publicPaths: ['/']
}

export const pollinationXConfig: IPollinationXConfig = {
  url: process.env.STORAGE_NODE_URL,
  auth: {
    message: 'This request will check your PollinationX storage NFT and it will not trigger a blockchain transaction or cost any gas fees.'
  },
  newNft: {
    message: 'This request will check your PollinationX storage NFT and it will not trigger a blockchain transaction or cost any gas fees.'
  }
}

export const tableSortingConfig: ITableSortingConfig = {
  default:
    'M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z',
  asc: 'M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z',
  desc: 'M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z',
  sequence: ['default', 'asc', 'desc'],
  defaultValues: {
    files: [
      { id: 0, sort: 'default' },
      { id: 1, sort: 'default' },
      { id: 2, sort: 'default' },
      { id: 3, sort: 'default' }
    ]
  }
}

export const themeConfig: ThemeCtrlState = {
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent-color': '#484848',
    '--w3m-background-color': '#42298F'
  }
}
