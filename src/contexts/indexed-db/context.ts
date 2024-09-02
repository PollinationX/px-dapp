import IndexedDb from '@/utils/indexed-db'
import { createContext } from 'react'

export interface IIndexedDBContext {
  indexedDB: IndexedDb
}

const IndexedDBContext = createContext<IIndexedDBContext>({
  indexedDB: null
})

export default IndexedDBContext
