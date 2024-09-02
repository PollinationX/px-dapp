import { IDBPDatabase, openDB } from 'idb'
import { IAccount } from '@/types'
import { EnvironmentEnum } from '@/enums/environment.enum'

export default class IndexedDb {
  private _database: IDBPDatabase

  public init = async (): Promise<this | null> => {
    try {
      this._database = await openDB(process.env.INDEXED_DB_NAME, 1, {
        upgrade(database: IDBPDatabase) {
          database.objectStoreNames.contains(process.env.INDEXED_DB_STORE) ||
            database.createObjectStore(process.env.INDEXED_DB_STORE, { autoIncrement: true, keyPath: 'chainAddress' })
        }
      })
      if (process.env.ENVIRONMENT === EnvironmentEnum.DEVELOPMENT) await this._database.clear(process.env.INDEXED_DB_STORE)
      return this
    } catch (error) {
      return null
    }
  }

  public all = async (): Promise<IAccount[]> =>
    await this._database.transaction(process.env.INDEXED_DB_STORE, 'readonly').objectStore(process.env.INDEXED_DB_STORE).getAll()

  public get = async (key: string): Promise<IAccount> =>
    await this._database.transaction(process.env.INDEXED_DB_STORE, 'readonly').objectStore(process.env.INDEXED_DB_STORE).get(key)

  public put = async (value: object): Promise<IDBValidKey> =>
    await this._database.transaction(process.env.INDEXED_DB_STORE, 'readwrite').objectStore(process.env.INDEXED_DB_STORE).put(value)
}
