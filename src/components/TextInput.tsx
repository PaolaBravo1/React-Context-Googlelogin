import { AuthenticationContext } from "contexts/AuthenticationContext";
import { States } from "helpers/states";
import moment from "moment";
import { useEffect, useState } from "react";
import InputMask from "react-input-mask";

interface ITextInput {
    entityID?: number,
    label: string,
    name: string,
    type: string,
    required?: boolean,
    value: string | null,
    group?: string,
    groupError?: string,
    regex?: string,
    onChange: any    
}

const TextInput = ({entityID = 0, type = "text", required = false, label, name, value, group, groupError, regex, onChange} : ITextInput) => {     
  const [text, setText] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [isGroupValid, setIsGroupValid] = useState(true);
  
  useEffect(() => {  
    if (!value || value.length == 0) {
      setText("");
      return;
    }

    switch (type) {
      case "date":
        try { 
          console.log(value);
          const formatted = moment.utc(value).format("MM/DD/YYYY");
          setText(formatted);
          console.log(formatted);
          setIsValid(true);
       } catch {}
       break;

      default:
        setText(value);   
        setIsValid(true);
        break;      
    }   
  }, [entityID]);
  
  useEffect(() => {  
    if (group != null && groupError == group && text.length == 0)   
      setIsGroupValid(false); 
    else
      setIsGroupValid(true);             
  }, [group, text, groupError]);
    
  const handleChange = (e:any) => {
    setText(e.target.value);   

    if (!regex)
      setIsValid(!required || e.target.value.length > 0);

    if (typeof onChange === "function") {
      onChange(e.target.value);
    }
  }

  const handleBlur = (e:any) => {    
    if (regex) {
      const val = e.target.value.trim();
      setText(val);

      if (val.length == 0 && !required)
        setIsValid(true);
      else
        setIsValid(new RegExp(regex).test(val));
    }
  }
  
  const handleChangeDate = (e:any) => {
    if (e.target.value.length == 0)
      return;
    
    setText(e.target.value);       
    
    if (typeof onChange === "function") {
      onChange(e.target.value);
    }
  }

  const handleBlurDate = (e:any) => {
    if (e.target.value.length == 0)
      return;
      
    handleBlur(e);
  }

  const className = `input-container ${isValid ? "valid" : "not-valid"}${isGroupValid ? "" : " group-not-valid"} type-${type}`;
  const groupName = group != null ? `group-${group}` : "";
  
  switch (type) {
    case "state":
      return (
        <div className={className}>
          <select className={groupName} required={required!} name={name} value={text} onChange={handleChangeDate} onBlur={handleBlurDate}>
            <option value=" " className="empty-option"></option>
            {States.map( (x,y) => 
            <option key={y} value={x.abbreviation}>{x.abbreviation} - {x.name}</option> )
            }
          </select>
          <label className={text && "filled"} htmlFor={name}>{label}</label>
        </div>
      );

    case "date":
      return (
        <div className={className}>
          <InputMask className={groupName} required={required!} name={name} placeholder="MM/DD/YYYY" mask="99/99/9999" value={text} onChange={handleChangeDate} onBlur={handleBlurDate} />
          <label className={text && "filled"} htmlFor={name}>{label}</label>
        </div>
      );

    default:
      return (
        <div className={className}>
          <input className={groupName} required={required!} name={name} type={type} value={text} onChange={handleChange} onBlur={handleBlur} />
          <label className={text && "filled"} htmlFor={name}>{label}</label>
        </div>
      );
  }
}

export default TextInput