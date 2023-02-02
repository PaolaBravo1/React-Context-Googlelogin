import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import React from 'react';

function Hammerbeam({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default Hammerbeam
