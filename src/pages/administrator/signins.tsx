import "bootstrap/dist/css/bootstrap.css"
import { useEffect, useMemo, useState } from "react"
import { useApi } from "@/contexts/useApi"
import LayoutAuthenticated from "@/components/LayoutAuthenticated"
import Table from "@/components/Table"
import moment from "moment"
import { Account } from "@/models/account"
var xlsx = require("xlsx")

const AuthenticatedAccounts = () => {
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
        label: "Last authenticated",
        accessor: "authenticatedTimestamp",
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
      "Last sign-in": o.authenticatedTimestamp == null ? null : moment(o.authenticatedTimestamp).format("MM/DD/YYYY hh:mmA")
     }});

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Sign-ins");

    const filename="Sign-ins.xlsx";
    xlsx.writeFile(wb, filename);    
  }

  return (
    <LayoutAuthenticated>      
      <div className="row no-gutter">
        {(accounts == null) ?
          <></>
          :
          <Table
            id={"sign-in-table"}
            caption={"Current sign-ins"}
            columns={columns}
            sourceData={accounts}
            isPropertyBarVisible={false}
            onSearchTermsChange={null}
            onRowClick={null}>
          </Table>
        }
      </div>
    </LayoutAuthenticated>
  );
}

export default AuthenticatedAccounts
