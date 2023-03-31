import "bootstrap/dist/css/bootstrap.css"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useApi } from "@/contexts/useApi"
import LayoutAuthenticated from "@/components/LayoutAuthenticated"
import Table from "@/components/Table"
import { debounce } from "lodash"
import PropertyBar from "@/components/PropertyBar"
import TextInput from "@/components/TextInput"
import { Participant } from "@/models/participant"

const Participants = () => {
  const [participants, setParticipants] = useState<Participant[]>();
  const [searchTerms, setSearchTerms] = useState("");
  const [editableParticipant, setEditableParticipant] = useState<Participant>();
  const [isPropertyBarVisible, setIsPropertyBarVisible] = useState(false);
  
  const { searchParticipants, updateParticipant } = useApi();

  const columns = useMemo(
    () => [
      {
        label: "Name",
        accessor: "fullName",
        type: "lastNameFirstName"
      },
      {
        label: "Email address",
        accessor: "emailAddress"
      },
      {
        label: "Internal ID",
        accessor: "internalID"
      },
      {
        label: "Date of birth",
        accessor: "dateOfBirth",
        type: "date"
      },
      {
        label: "Last authenticated",
        accessor: "authenticatedTimestamp",
        type: "datetime"
      }
    ],
    [],
  );

  const fields = useMemo(
    () => [
      {
        label: "First name",
        accessor: "firstName",
        type: "text",
        required: true
      },
      {
        label: "Middle name",
        accessor: "middleName",
        type: "text"
      },
      {
        label: "Last name",
        accessor: "lastName",
        type: "text",
        required: true
      },
      {
        label: "Address",
        accessor: "address",
        type: "text"
      },
      {
        label: "Apartment, suite, etc.",
        accessor: "Address2",
        type: "text"
      },
      {
        label: "City",
        accessor: "City",
        type: "text"
      },
      {
        label: "Email address",
        accessor: "emailAddress",
        type: "text",        
        required: true
      },
      {
        label: "Date of birth",
        accessor: "dateOfBirth",
        type: "date",        
        required: true
      }
    ],
    [],
  );

  const handleSearchTermsDebounce = async (inputValue: string) => {   
    await searchParticipants(inputValue) 
      .then(result => {  
        setParticipants(result.data);            
      })
      .catch(error => {
        console.log(JSON.stringify(error));
      });   
  }

  const handleSearchTermsChange = (event: any) => {
    setSearchTerms(event.target.value);
    searchTermsDebouncer(event.target.value);
  }

  const handleRowClick = (participant: Participant) => {
    let clone = { ...participant };
    setEditableParticipant(clone);
    setIsPropertyBarVisible(true);
  }

  function updateParticipantProperty(prop: string, value: string) {
    (editableParticipant as any)[prop] = value;    
  }

  const handleParticipantUpdate = async () => {    
    await updateParticipant(editableParticipant!);
    handleSearchTermsDebounce(searchTerms);
  }

  const searchTermsDebouncer = useCallback(debounce(handleSearchTermsDebounce, 250), []);

  useEffect(() => {
    handleSearchTermsDebounce("");  
  }, []);

  return (
    <LayoutAuthenticated>
      <div className="row no-gutter">
        {(participants == null) ?
          <></>
          :
          <Table 
            id={"participant-table"}
            caption={"Participants"} 
            columns={columns} 
            sourceData={participants} 
            searchTerms={searchTerms} 
            isPropertyBarVisible={isPropertyBarVisible}
            onSearchTermsChange={handleSearchTermsChange}
            onRowClick={handleRowClick} />
        }
      </div>
      <PropertyBar entityID={editableParticipant?.id ?? null} isVisible={isPropertyBarVisible} onSave={handleParticipantUpdate} onCancel={() => setIsPropertyBarVisible(false) }>
        { (editableParticipant != undefined) ? 
        <>
        <div className="caption">{editableParticipant.fullName}</div>
        { fields.map((o, i) => {
            return <TextInput 
              key={o.accessor}
              type={o.type} 
              label={o.label} 
              name={o.accessor} 
              value={(editableParticipant as any)[o.accessor]} 
              required={o.required ?? false}
              onChange={(value:string) => updateParticipantProperty(o.accessor, value)}/>
        })}     
        </>
        : 
        <></>
        }
      </PropertyBar>
    </LayoutAuthenticated>
  );
}

export default Participants
