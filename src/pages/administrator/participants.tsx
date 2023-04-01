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

const Participants = () => {
  const [participants, setParticipants] = useState<Participant[]>();
  const [searchTerms, setSearchTerms] = useState("");
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

  const handleSearchTermsChange = (event: any) => {
    setSearchTerms(event.target.value);
    searchTermsDebouncer(event.target.value);
  }

  const handleRowClick = (clickedParticipant: Participant) => {
    setParticipant({ ...clickedParticipant });
    setIsPropertyBarVisible(true);
  }

  const updateParticipantProperty = (prop: string, value: string) => {
    (participant as any)[prop] = value;
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
      <PropertyBar entityID={participant.id} isVisible={isPropertyBarVisible} onSave={handleParticipantUpdate} onCancel={handleCancel}>
        <>
          <div className="caption">{participant.fullName}</div>
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
              onChange={(value: string) => updateParticipantProperty(o.accessor, value)} />
          })}
        </>
      </PropertyBar>
    </LayoutAuthenticated>
  );
}

export default Participants