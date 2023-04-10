import "bootstrap/dist/css/bootstrap.css"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useApi } from "@/contexts/useApi"
import LayoutAuthenticated from "@/components/LayoutAuthenticated"

const Dashboard = () => {
 
  return (
    <LayoutAuthenticated header="Dashboard">
      <div className="row no-gutter">
      </div>
    </LayoutAuthenticated>
  );
}

export default Dashboard
