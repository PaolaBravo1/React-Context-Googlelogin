import 'bootstrap/dist/css/bootstrap.css'
import { useEffect, useState } from 'react'
import LayoutUnauthenticated from '@/components/LayoutUnauthenticated'
import { useAuthentication } from '../contexts/useAuthentication';

const ThankYou = () => {
  
  return (
    <LayoutUnauthenticated id="thankyou" title="Thank you!" message="We just sent you an email with a confirmation link.  You'll need to click that link before you can login." errorMessage="">
    </LayoutUnauthenticated>
  )
}

export default ThankYou