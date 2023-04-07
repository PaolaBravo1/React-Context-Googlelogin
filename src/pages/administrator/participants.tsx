import "bootstrap/dist/css/bootstrap.css"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useApi } from "@/contexts/useApi"
import LayoutAuthenticated from "@/components/LayoutAuthenticated"
import Table from "@/components/Table"
import { debounce } from "lodash"
import PropertyBar from "@/components/PropertyBar"
import TextInput from "@/components/TextInput"
import { Participant } from "@/models/participant"
import { ErrorCode } from "@/helpers/errorcodes"
import { postalCodeRegex } from "@/helpers/constants"
import moment from "moment"
import { faMonument } from "@fortawesome/free-solid-svg-icons"
import Icon from "@/components/Icon"
var xlsx = require("xlsx")

const Participants = () => {
  const [participants, setParticipants] = useState<Participant[]>();
  const [participant, setParticipant] = useState<Participant>(Object);
  const [isPropertyBarVisible, setIsPropertyBarVisible] = useState(false);
  const [groupError, setGroupError] = useState("");

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
        type: "text",
        group: "addressBlock"
      },
      {
        label: "Apartment, suite, etc.",
        accessor: "address2",
        type: "text"
      },
      {
        label: "City",
        accessor: "city",
        type: "text",
        group: "addressBlock"
      },
      {
        label: "State",
        accessor: "state",
        type: "state",
        group: "addressBlock"
      },
      {
        label: "Postal code",
        accessor: "postalCode",
        type: "text",
        regex: postalCodeRegex,
        group: "addressBlock"
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

  const handleCancel = () => {
    setIsPropertyBarVisible(false);
    setTimeout(() => { setParticipant(new Participant()); }, 500)
  }

  const handleSearchTermsDebounce = async (inputValue: string) => {
    await searchParticipants(inputValue)
      .then(result => {
        setParticipants(result.data);
      })
      .catch(error => {
        console.log(JSON.stringify(error));
      });
  }

  const handleSearchTermsChange = (terms: string) => {
    searchTermsDebouncer(terms);
  }

  const handleRowClick = (clickedParticipant: Participant) => {
    setParticipant({ ...clickedParticipant });
    setIsPropertyBarVisible(true);
  }

  const updateParticipantProperty = (prop: string, value: string, type: string) => {  
    switch (type) {
      case "date":
        try {
          const date = moment.utc(value, "MM/DD/YYYY").format();
          (participant as any)[prop] = value;
        } catch {}
        break;

      default:
        (participant as any)[prop] = value;
        break; 
    }
  }

  const validateParticipantAddressBlock = (): boolean => {
    let completedAddressFields
      = (participant.address?.length > 0 ? 1 : 0)
      + (participant.city?.length > 0 ? 1 : 0)
      + (participant.state?.trim()?.length > 0 ? 1 : 0)
      + (participant.postalCode?.length > 0 ? 1 : 0);

    if (completedAddressFields != 0 && completedAddressFields != 4)
      return false;

    if (((participant.address?.length ?? 0) == 0) && ((participant.address2?.length ?? 0) > 0))
      return false;

    return true;
  }

  const handleParticipantUpdate = async () => {
    setGroupError("");

    if (!validateParticipantAddressBlock()) {
      setGroupError("addressBlock");
      throw (ErrorCode.ParticipantAddressBlockIncomplete);
    }

    await updateParticipant(participant);
    handleSearchTermsDebounce(""); 
  }

  const handleAddUser = () => {
    setParticipant(Object);
    setIsPropertyBarVisible(true);
  }

  const handleExport = () => {
    const data = participants?.map((o, i) => { return { 
      "First name": o.firstName,
      "Middle name": o.middleName,
      "Last name": o.lastName,
      "Address": o.address,
      "Apartment/suite": o.address2,
      "City": o.city,
      "State": o.state,
      "Postal code": o.postalCode,
      "Internal ID": o.internalID,
      "Email address": o.emailAddress,
      "Date of birth": o.dateOfBirth == null ? null : moment.utc(o.dateOfBirth).format("MM/DD/YYYY"),
      "Last sign-in": o.authenticatedTimestamp == null ? null : moment(o.authenticatedTimestamp).format("MM/DD/YYYY hh:mmA")
     }});

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Participants");

    const filename="Participants.xlsx";
    xlsx.writeFile(wb, filename);    
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
            isPropertyBarVisible={isPropertyBarVisible}
            onSearchTermsChange={handleSearchTermsChange}
            onRowClick={handleRowClick}
            onExport={handleExport}>
              <Icon toolTip="Add user" className="context-icon" name="user-plus" onClick={handleAddUser} />
            </Table>
        }
      </div>
      <PropertyBar entityID={participant.id} isVisible={isPropertyBarVisible} onSave={handleParticipantUpdate} onCancel={handleCancel}>
        <>        
          <div className="caption">{participant.id == undefined ? "New participant" : participant.fullName}</div>
          {fields.map((o, i) => {          
            return <TextInput
              entityID={participant.id}
              key={o.accessor}
              type={o.type}
              label={o.label}
              name={o.accessor}
              value={(participant as any)[o.accessor]}
              required={o.required ?? false}
              group={o.group as any}
              groupError={groupError}
              regex={o.regex as any}
              onChange={(value: string) => updateParticipantProperty(o.accessor, value, o.type)} />
          })}
        </>
      </PropertyBar>
    </LayoutAuthenticated>
  );
}

export default Participants
