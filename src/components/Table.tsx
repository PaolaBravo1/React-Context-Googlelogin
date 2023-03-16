import { useEffect, useState } from "react";
import Icon from "./Icon";
import moment from "moment";

interface ITable {
    caption: string,
    columns: any[],
    sourceData: any[]
}

const Table = ({ caption, columns, sourceData }: ITable) => {
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [data, setData] = useState<any>([]);

    useEffect(() => {
        setData(sourceData);
        if (!sortField)
            setSortField(columns[0].accessor);
    }, []);

    const sort = (newSortField: string, currentSortOrder: string) => {

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
                return (
                    a[newSortField].toString().localeCompare(b[newSortField].toString(), "en", {
                        numeric: true,
                    }) * (newSortOrder === "asc" ? 1 : -1)                   
                );
            });

            setData(sorted);
        };
    }

    return (
        <table className="table">
            <thead>
                <tr>
                    {columns.map(({ label, accessor, sortable }) => {
                        const cl = sortable !== false
                            ? sortField === accessor && sortOrder === "asc"
                                ? "up"
                                : sortField === accessor && sortOrder === "desc"
                                    ? "down"
                                    : "default"
                            : "";
                        return (
                            <th key={accessor} className={cl} onClick={() => sort(accessor, sortOrder)}>
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
                        <tr key={item.id}>
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
    )
};

export default Table;