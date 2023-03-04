import { useApi } from "@/contexts/useApi";
import { SetStateAction, useEffect, useState } from "react";

interface ITextInput {
    label: string,
    name: string,
    type: string,
    value: string,
    onChange: any
}

const TextInput = ({type = "text", label, name, onChange, value}: ITextInput) => {     
  const [text, setText] = useState('');
  
  const { isMakingRequest } = useApi();
  
  useEffect(() => {  
    if (value && value.length > 0)  
      setText(value);
  }, [value]);
    

  const handleChange = (e:any) => {
      setText(e.target.value);

      if (typeof onChange === "function") {
          onChange(e.target.value);
      }
  }

  const handleBlur = (e:any) => {
      setText(e.target.value.trim());

      if (typeof onChange === "function") {
          onChange(e.target.value.trim());
      }
  }

  return (
    <div className="input-container">
      <input disabled={isMakingRequest} name={name} type={type} value={text} onChange={handleChange} onBlur={handleBlur} />
      <label className={text && "filled"} htmlFor={name}>
        {label}
      </label>
    </div>
  );
}

export default TextInput