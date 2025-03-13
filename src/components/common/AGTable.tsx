"use client"
import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AgChartsCommunityModule } from "ag-charts-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { SparklinesModule } from "ag-grid-enterprise";

ModuleRegistry.registerModules([AllCommunityModule, SparklinesModule.with(AgChartsCommunityModule),]);

interface AGTableProps {
    rowData: object[];
    columnDefs: object[];
    className?: string;
    pagination?: boolean;
    paginationPageSize?: number;
}

const AGTable: React.FC<AGTableProps> = ({
    rowData,
    columnDefs,
    className = "w-full",
    pagination = true,
    paginationPageSize = 10
}) => {
    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            minWidth: 150,
            resizable: true,
        };
    }, []);
    return (
        <div
            className={`custom-ag-grid ${className} rounded-lg`}
        >
            <div style={{ minWidth: "600px" }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    pagination={pagination}
                    paginationPageSize={paginationPageSize}
                    domLayout="autoHeight"
                    rowHeight={50}
                    defaultColDef={defaultColDef}
                />
            </div>
        </div>
    );
};

export default AGTable;