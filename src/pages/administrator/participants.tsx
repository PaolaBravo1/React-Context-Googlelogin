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
  
  const { searchParticipants } = useApi();

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
        type: "text"
      },
      {
        label: "Middle name",
        accessor: "middleName",
        type: "text"
      },
      {
        label: "Last name",
        accessor: "lastName",
        type: "text"
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
        type: "text"
      },
      {
        label: "Date of birth",
        accessor: "dateOfBirth",
        type: "date"
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
    setEditableParticipant(participant);
    setIsPropertyBarVisible(true);
  }

  function updateParticipant(prop: string, value: string) {
    (editableParticipant as any)[prop] = value;
    setEditableParticipant(editableParticipant);    
  }

  const searchTermsDebouncer = useCallback(debounce(handleSearchTermsDebounce, 250), []);

  useEffect(() => {
    handleSearchTermsDebounce("");  
  }, []);

  useEffect(() => {
    if (editableParticipant)
      console.log(editableParticipant.firstName);
  }, [editableParticipant]);

  return (
    <LayoutAuthenticated>
      <div className="row no-gutter">
        {(participants == null) ?
          <></>
          :
          <div className="table">
            <Table 
              caption={"Participant List"} 
              columns={columns} 
              sourceData={participants} 
              searchTerms={searchTerms} 
              onSearchTermsChange={handleSearchTermsChange}
              onRowClick={handleRowClick} />
          </div>
        }
      </div>
      <PropertyBar isVisible={isPropertyBarVisible}>
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
              onChange={(value:string) => updateParticipant(o.accessor, value)}/>
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
