import { useEffect, useState } from "react";
import Icon from "./Icon";

/*
const handleSortingChange = (accessor: string) => {
  const sortOrder =
    accessor === sortField && order === "asc" ? "desc" : "asc";
  setSortField(accessor);
  setOrder(sortOrder);
  handleSorting(accessor, sortOrder);
};

*/
/*const getDefaultSorting = (defaultTableData, columns) => {
    const sorted = [...defaultTableData].sort((a, b) => {
      const filterColumn = columns.filter((column) => column.sortbyOrder);
  
      // Merge all array objects into single object and extract accessor and sortbyOrder keys
      let { accessor = "id", sortbyOrder = "asc" } = Object.assign(
        {},
        ...filterColumn
      );
  
      if (a[accessor] === null) return 1;
      if (b[accessor] === null) return -1;
      if (a[accessor] === null && b[accessor] === null) return 0;
  
      const ascending = a[accessor]
        .toString()
        .localeCompare(b[accessor].toString(), "en", {
          numeric: true,
        });
  
      return sortbyOrder === "asc" ? ascending : -ascending;
    });
    return sorted;
  }
  
  
*/

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
                            {columns.map(({ accessor }) => {
                                const cell = item[accessor] ? item[accessor] : "-";
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