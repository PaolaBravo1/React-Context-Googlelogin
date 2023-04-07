import { useEffect, useImperativeHandle, useState } from "react";
import Icon from "./Icon";
import moment from "moment";
import React from "react";

interface ITable {
    children: any,
    id: string,
    caption: string,
    columns: any[],
    sourceData: any[],
    isPropertyBarVisible: boolean
    onSearchTermsChange: Function | null,
    onRowClick: Function | null
}

const Table = ({ children, id, caption, columns, sourceData, isPropertyBarVisible, onSearchTermsChange, onRowClick }: ITable) => {
    const [sortField, setSortField] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [data, setData] = useState<any>([]);
    const [isHoverable, setIsHoverable] = useState(true);
    const [searchTerms, setSearchTerms] = useState("");

    useEffect(() => {
        setData(sourceData);

        if (!sortField)
            setSortField(columns[0].accessor);
    }, [sourceData]);

    const unselectAllRows = () => {
        var elements = document.getElementById(id)!.getElementsByClassName("selected");
        while(elements.length > 0){
            elements[0].classList.remove("selected");
        }
    }

    const selectRow = (id: any) => {
        unselectAllRows();

        const row = document.getElementById(`row-${id}`);

        if (row)
            row.classList.add("selected");
    }

    const handleRowClick = (item: any) => {
        setIsHoverable(false);
        selectRow(item.id); 
        
        if (onRowClick != null)
            onRowClick(item);
    }

    const handleSearchTermsChange = (terms: string) => {
        setSearchTerms(terms);
        
        if (onSearchTermsChange != null)
            onSearchTermsChange(terms);
        else if (terms.length == 0) {
            sourceData.forEach((item) => {
                item.isHidden = false;   
            });                    
        } 
        else {
            const termsLower = terms.toLowerCase().split(" ");
           
            sourceData.forEach((item) => {
                let matchCount = 0;

                termsLower.forEach((term) => {
                    columns.every((column) => {
                        if (item[column.accessor].toString().toLowerCase().indexOf(term) >= 0) {
                            matchCount++;
                            return false;
                        }
                    });
                });
                
                item.isHidden = matchCount !== termsLower.length;
            });
        }
    }

    const handleMouseMove = (e: any) => {
        if (!isHoverable && !isPropertyBarVisible) {
            unselectAllRows();
            setIsHoverable(true);
        }
    }

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
        <div className={`table${isHoverable ? " is-hoverable" : ""}`}>
            <div className="header">
                <div className="caption">{caption}</div>
                <div className="table-options">
                    { children }
                    <input type="text" className="search-terms" value={searchTerms} onChange={(e) => handleSearchTermsChange(e.target.value)}></input>   
                    <Icon name="search" className="search-terms-icon"></Icon>                
                </div>                
            </div>
            <table id={id}>
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
                <tbody onMouseMove={(ev)=> handleMouseMove(ev)}>
                    {data.map((item: any) => {
                        return (
                            <tr id={`row-${item.id}`} key={item.id} className={item.isHidden ? "hidden" : "" } onClick={() => handleRowClick(item)}>
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
