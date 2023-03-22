import "bootstrap/dist/css/bootstrap.css"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useApi } from "@/contexts/useApi"
import LayoutAuthenticated from "@/components/LayoutAuthenticated"
import Table from "@/components/Table"
import { debounce } from "lodash"

const Participants = () => {
  const [participants, setParticipants] = useState();
  const [searchTerms, setSearchTerms] = useState("");

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
  };

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
          <div className="table">
            <Table caption={"Participant List"} columns={columns} sourceData={participants} searchTerms={searchTerms} onSearchTermsChanged={handleSearchTermsChange} />
          </div>
        }
      </div>
    </LayoutAuthenticated>
  );
}

export default Participants
