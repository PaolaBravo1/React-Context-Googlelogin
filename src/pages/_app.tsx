import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import React, { useCallback, useEffect, useState } from 'react';
import { AuthenticationProvider } from '../contexts/useAuthentication';
import IdlePopup from '@/components/IdlePopup';

function Hammerbeam({ Component, pageProps }: AppProps) {    
  return (
    <AuthenticationProvider>
      <Component {...pageProps} />
    </AuthenticationProvider>    
  )
}

export default Hammerbeam
