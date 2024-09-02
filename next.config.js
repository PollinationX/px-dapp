const nextTranslate = require('next-translate-plugin')
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    ENVIRONMENT: process.env.ENVIRONMENT,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    INDEXED_DB_NAME: process.env.INDEXED_DB_NAME,
    INDEXED_DB_STORE: process.env.INDEXED_DB_STORE,
    INDEXED_DB_SECRET: process.env.INDEXED_DB_SECRET,
    WALLET_CONNECT_PROJECT_ID: process.env.WALLET_CONNECT_PROJECT_ID,
    STORAGE_NODE_URL: process.env.STORAGE_NODE_URL
  },
  ...nextTranslate()
}

module.exports = nextConfig
