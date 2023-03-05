import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useApi } from '../../contexts/useApi';
import { ErrorCode } from '@/helpers/errorcodes';
import { useRouter } from 'next/router';
import { guidRegex, magicPixel } from '@/helpers/constants';

const Email = () => {
    const { query } = useRouter();
    const { setEmailReceived } = useApi();

    useEffect(() => {    
        if (!query)
            return;
           
        const imageName = query["uniqueID"];
        
        if (!(imageName))
            return;
         
        if (!imageName.toString().endsWith(".png"))
            return;
            
        const uniqueID = imageName.toString().substring(0, imageName.length - 4);
        
        if (!new RegExp(guidRegex).test(uniqueID))
            return;
        
        setEmailReceived(uniqueID);
       
   }, [query]);

   return (
    <img src={`data:image/png;base64,${magicPixel}`} alt="img" />
   );
}

export default Email