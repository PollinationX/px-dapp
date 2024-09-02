import { createContext, Dispatch } from 'react'
import { IAccount } from '@/types'
import { appConfig } from '@/config'

export interface IAccountContext {
  account: IAccount
  setAccount?: Dispatch<any>
}

const AccountContext = createContext<IAccountContext>({
  account: {
    address: null,
    password: null,
    loggedIn: false,
    locale: appConfig.locale,
    defaultNftIndex: 0,
    nfts: [],
    table: {
      sorting: null
    }
  },
  setAccount: () => ({})
})

export default AccountContext
