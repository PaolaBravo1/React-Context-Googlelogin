import { useApi } from "@/contexts/useApi";
import { States } from "@/helpers/states";
import moment from "moment";
import { useEffect, useState } from "react";

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
  
  const { isMakingRequest } = useApi();
  
  useEffect(() => {  
    if (value && value.length > 0) {
      setText("");
      setText(value);
      setIsValid(true);
    }
    else
      setText("");   
  }, [entityID]);
  
  useEffect(() => {  
    if (group != null && groupError == group && text.length == 0)   
      setIsGroupValid(false); 
    else
      setIsGroupValid(true);             
  }, [groupError]);
    
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
      setIsValid(new RegExp(regex).test(val));
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

  const className = `input-container ${isValid ? "valid" : "not-valid"} ${isGroupValid ? "" : "group-not-valid"}`;
  const groupName = group != null ? `group-${group}` : "";

  switch (type) {
    case "state":
      return (
        <div className={className}>
          <select className={groupName} required={required!} disabled={isMakingRequest} name={name} value={text} onChange={handleChangeDate} onBlur={handleBlurDate}>
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
          <input className={groupName} required={required!} disabled={isMakingRequest} name={name} type={type} value={moment.utc(text).format("YYYY-MM-DD")} onChange={handleChangeDate} onBlur={handleBlurDate} />
          <label className={text && "filled"} htmlFor={name}>{label}</label>
        </div>
      );

    default:
      return (
        <div className={className}>
          <input className={groupName} required={required!} disabled={isMakingRequest} name={name} type={type} value={text} onChange={handleChange} onBlur={handleBlur} />
          <label className={text && "filled"} htmlFor={name}>{label}</label>
        </div>
      );
  }
}

export default TextInput