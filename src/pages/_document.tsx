import React from 'react'
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document'

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render(): JSX.Element {
    return (
      <Html lang='en' className='dark'>
        <Head>
          <link rel='icon' href='/img/favicon.png' />
        </Head>
        <body className='bg-neutral-200 dark:bg-neutral-700'>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
