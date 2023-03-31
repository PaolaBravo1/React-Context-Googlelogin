import { useApi } from "@/contexts/useApi";
import moment from "moment";
import { useEffect, useState } from "react";

interface ITextInput {
    label: string,
    name: string,
    type: string,
    required?: boolean,
    value: string | null,
    onChange: any
}

const TextInput = ({type = "text", required = false, label, name, onChange, value}: ITextInput) => {     
  const [text, setText] = useState("");
  const [isValid, setIsValid] = useState(true);
  
  const { isMakingRequest } = useApi();
  
  useEffect(() => {  
    if (value && value.length > 0)  
      setText(value);
    else
      setText("");
   
  }, [value]);
    
  const handleChange = (e:any) => {
    setText(e.target.value);
    setIsValid(!required || e.target.value.length > 0);
  
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

  const handleChangeDate = (e:any) => {
    if (e.target.value.length == 0)
      return;

    handleChange(e);
  }

  const handleBlurDate = (e:any) => {
    if (e.target.value.length == 0)
      return;
      
    handleBlur(e);
  }

  switch (type) {
    case "date":
      return (
        <div className={`input-container ${isValid ? "is-valid" : "is-not-valid"}`}>
          <input required={required!} disabled={isMakingRequest} name={name} type={type} value={moment.utc(text).format("YYYY-MM-DD")} onChange={handleChangeDate} onBlur={handleBlurDate} />
          <label className={text && "filled"} htmlFor={name}>{label}</label>
        </div>
      );

    default:
      return (
        <div className={`input-container ${isValid ? "is-valid" : "is-not-valid"}`}>
          <input required={required!} disabled={isMakingRequest} name={name} type={type} value={text} onChange={handleChange} onBlur={handleBlur} />
          <label className={text && "filled"} htmlFor={name}>{label}</label>
        </div>
      );
  }
}

export default TextInput