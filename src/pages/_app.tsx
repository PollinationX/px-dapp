import '@/styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'
import type { AppProps } from 'next/app'
import IndexedDBProvider from '@/contexts/indexed-db'
import RouteGuard from '@/guards/route.guard'
import { useEffect, useState } from 'react'
import { WagmiConfig } from 'wagmi'
import { Web3Modal } from '@web3modal/react'
import { client, ethereumClient } from '@/utils/client'
import { themeConfig } from '@/config'
import { ToastContainer } from 'react-toastify'

const App = ({ Component, pageProps }: AppProps) => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <>
      {ready ? (
        <IndexedDBProvider>
          <WagmiConfig client={client}>
            <RouteGuard>
              <Component {...pageProps} />
              <ToastContainer />
            </RouteGuard>
          </WagmiConfig>
        </IndexedDBProvider>
      ) : null}
      <Web3Modal projectId={process.env.WALLET_CONNECT_PROJECT_ID} ethereumClient={ethereumClient} {...themeConfig} />
    </>
  )
}

export default App
