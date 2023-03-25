import { useEffect, useState } from "react";
import Icon from "./Icon";
import moment from "moment";

interface ITable {
    caption: string,
    columns: any[],
    sourceData: any[],
    searchTerms: string,
    onSearchTermsChange: any,
    onRowClick: any
}

const Table = ({ caption, columns, sourceData, searchTerms, onSearchTermsChange, onRowClick }: ITable) => {
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [data, setData] = useState<any>([]);

    useEffect(() => {
        setData(sourceData);
        if (!sortField)
            setSortField(columns[0].accessor);
    }, [sourceData]);

    const sort = (newSortField: string, currentSortOrder: string, type: string) => {
        let newSortOrder = currentSortOrder == "asc" ? "desc" : "asc";

        if (newSortField != sortField) 
            newSortOrder = "asc";

        setSortOrder(newSortOrder);
        setSortField(newSortField);

        if (newSortField) {
            const sorted = [...data].sort((a, b) => {
                if (a[newSortField] === null) return 1;
                if (b[newSortField] === null) return -1;
                if (a[newSortField] === null && b[newSortField] === null) return 0;

                switch (type) {
                    case "lastNameFirstName":
                        return (
                            (a.lastName + " " + a.firstName).toString().localeCompare((b.lastName + " " + b.firstName).toString(), "en") 
                            * (newSortOrder === "asc" ? 1 : -1)                 
                        );
                        break;
                    default:
                        return (
                            a[newSortField].toString().localeCompare(b[newSortField].toString(), "en", {
                                numeric: true,
                            }) * (newSortOrder === "asc" ? 1 : -1)                   
                        );
                        break;
                }
            });

            setData(sorted);
        };
    }

    return (
        <div className="table">
            <div className="header">
                <div className="caption">{caption}</div>
                <input type="text" className="search-terms" value={searchTerms} onChange={onSearchTermsChange}></input>   
                <Icon name="search" className="search-terms-icon"></Icon>                
            </div>
            <table>
                <thead>
                    <tr>
                        {columns.map(({ label, accessor, sortable, type }) => {
                            const cl = sortable !== false
                                ? sortField === accessor && sortOrder === "asc"
                                    ? "up"
                                    : sortField === accessor && sortOrder === "desc"
                                        ? "down"
                                        : "default"
                                : "";
                            return (
                                <th key={accessor} className={cl} onClick={() => sort(accessor, sortOrder, type)}>
                                    <span>{label}</span>
                                    { sortField === accessor ? 
                                        <Icon name={`caret-${cl}`} className="sort-icon"></Icon>
                                        :
                                        <></>
                                    }
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item: any) => {
                        return (
                            <tr key={item.id} onClick={() => onRowClick(item)}>
                                {columns.map(({ accessor, type }) => {
                                    let cell = "-";
                                    
                                    if (item[accessor]) {
                                        switch (type) {
                                            case "date":
                                                cell = moment.utc(item[accessor]).format("MM/DD/YYYY");
                                                break;
                                            case "datetime":
                                                cell = moment(item[accessor]).format("MM/DD/YYYY [at] hh:mma");
                                                break;                                    
                                            default:
                                                cell = item[accessor];
                                                break;
                                        }                                    
                                    }
                                
                                    return <td key={accessor}>{cell}</td>;
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    )
};

export default Table;