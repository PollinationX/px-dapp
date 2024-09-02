import type { NextPage } from 'next'
import Index from '@/components/index'
import Head from 'next/head'

const IndexPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>PXdApp</title>
        <meta name='description' content='PollinationX Decentralized Drive' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta http-equiv='Content-Security-Policy' content='upgrade-insecure-requests' />
      </Head>
      <Index />
    </>
  )
}

export default IndexPage
