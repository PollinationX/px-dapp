import CryptoJS from 'crypto-js'

export const encrypt = (message: string): string => CryptoJS.AES.encrypt(message, process.env.INDEXED_DB_SECRET).toString()
export const decrypt = (cypherText: string): string => CryptoJS.AES.decrypt(cypherText, process.env.INDEXED_DB_SECRET).toString(CryptoJS.enc.Utf8)
export const sha512 = (message: string): string => CryptoJS.SHA512(message).toString(CryptoJS.enc.Base64)
