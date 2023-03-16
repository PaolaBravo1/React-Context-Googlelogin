import 'bootstrap/dist/css/bootstrap.css'
import { useEffect, useMemo, useState } from 'react'
import HTMLReactParser from 'html-react-parser'
import { useApi } from '@/contexts/useApi'
import LayoutAuthenticated from '@/components/LayoutAuthenticated'
import Icon from "../../components/Icon"
import Table from '@/components/Table'

const Dashboard = () => {
  const [participants, setParticipants] = useState<any>();

  const { getParticipants } = useApi();

  const columns = useMemo(
    () => [
      {
        label: "Name",
        accessor: "fullName"
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

  useEffect(() => {
    const asyncGetParticipants = async () => {
      await getParticipants()
        .then(result => {
          setParticipants(result.data);          
        }
        )
        .catch(error => {
          console.log(JSON.stringify(error));
        });
    }

    asyncGetParticipants();
  }, []);

  return (
    <LayoutAuthenticated>
      <div className="row no-gutter">
        {(participants == null) ?
          <div></div>
          :
          <div className="table">
            <Table caption={"Participant List"} columns={columns} sourceData={participants} />
          </div>
        }
      </div>
    </LayoutAuthenticated>
  );
}

export default Dashboard
