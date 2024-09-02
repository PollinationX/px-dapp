import IndexedDb from '@/utils/indexed-db'
import IndexedDBContext, { IIndexedDBContext } from './context'
import { FC, ReactNode, useContext, useEffect, useState } from 'react'

export const useIndexedDBContext = () => useContext(IndexedDBContext)

interface IIndexedDBProviderProps {
  children: ReactNode
}

const IndexedDBProvider: FC<IIndexedDBProviderProps> = ({ children }) => {
  const [indexedDB, setIndexedDB] = useState<IIndexedDBContext>({ indexedDB: null })

  useEffect(() => {
    ;(async () => {
      setIndexedDB({ indexedDB: await new IndexedDb().init() })
    })()
  }, [])

  return <IndexedDBContext.Provider value={indexedDB}>{children}</IndexedDBContext.Provider>
}

export default IndexedDBProvider
