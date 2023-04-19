import "bootstrap/dist/css/bootstrap.css"
import { useEffect, useMemo, useState } from "react"
import { useApi } from "contexts/useApi"
import { LayoutAuthenticated } from "layouts/LayoutAuthenticated"
import Table from "components/Table"
import moment from "moment"
import { Account } from "models/Account"
var xlsx = require("xlsx")

const SignIns = () => {
  const [accounts, setAccounts] = useState<Account[]>();
  
  const { getAuthenticatedAccounts } = useApi();

  const columns = useMemo(
    () => [      
      {
        label: "Email address",
        accessor: "emailAddress"
      },
      {
        label: "Role",
        accessor: "role"
      },      
      {
        label: "Signed in",
        accessor: "sessionAuthenticatedTimestamp",
        type: "datetime"
      },
      {
        label: "Last active",
        accessor: "lastActiveTimestamp",
        type: "datetime"
      }
    ],
    [],
  );

  useEffect(() => {    
    const asyncGetAuthenticatedAccounts = async () => {
      await getAuthenticatedAccounts()
      .then(result => {
        setAccounts(result.data);
      })
      .catch(error => {
        console.log(JSON.stringify(error));        
      });   
    }

    asyncGetAuthenticatedAccounts();
  }, []);

  const handleExport = () => {
    const data = accounts?.map((o, i) => { return { 
      "Email address": o.emailAddress,
      "Role": o.role,
      "Signed in": o.sessionAuthenticatedTimestamp == null ? null : moment(o.sessionAuthenticatedTimestamp).format("MM/DD/YYYY hh:mmA"),
      "Last active": o.lastActiveTimestamp == null ? null : moment(o.lastActiveTimestamp).format("MM/DD/YYYY hh:mmA")
     }});

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Sign-ins");

    const filename="Sign-ins.xlsx";
    xlsx.writeFile(wb, filename);    
  }

  return (
    <LayoutAuthenticated header="Current sign-ins">   
      <div className="inner">
        {(accounts == null) ?
          <></>
          :
          <Table
            id={"sign-in-table"}
            columns={columns}
            sourceData={accounts}
            isPropertyBarVisible={false}
            onSearchTermsChange={null}
            onRowClick={null} 
            onExport={handleExport}>
          </Table>
        }
      </div>
    </LayoutAuthenticated>
  );
}

export default SignIns