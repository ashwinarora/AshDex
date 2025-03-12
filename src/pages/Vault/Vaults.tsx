"use client"
import { useState } from "react";
import { Grid, List } from "lucide-react";
import type { ColDef } from "ag-grid-community";

import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import AGTable from "../../components/common/AGTable";
import Dropdown from "../../components/common/Dropdown";
import { ToggleGroup, ToggleGroupItem } from "../../components/common/ToggleGroup";
import { Card } from "../../components/common/Card";
import BoardViewVaults from "./BoardViewVaults";

const Vaults = () => {
    const [selectedTab, setSelectedTab] = useState<"protocol" | "user">("protocol");
    const [viewMode, setViewMode] = useState<"list" | "board">("list");
    const [selectedFilter, setSelectedFilter] = useState("30d");

    const data = Array.from({ length: 10 }, () => ({
        name: "Liquidator",
        leader: "0xfc13...80c9",
        apr: "0.00%",
        totalFunds: "$18,190.73",
        yourDeposit: "$0.00",
        age: "731",
        snapshot: Array.from({ length: 10 }, () => Math.random() * 100),
        status: "Open",
    }));

    const [rowData] = useState(data);

    const columnDefs: ColDef[] = [
        { headerName: "Name", field: "name", sortable: true, filter: true },
        { headerName: "Leader", field: "leader", sortable: true, filter: true },
        { headerName: "APR", field: "apr", sortable: true, filter: true },
        { headerName: "Total Funds", field: "totalFunds", sortable: true },
        { headerName: "Your Deposit", field: "yourDeposit", sortable: true },
        { headerName: "Age (days)", field: "age", sortable: true },
        {
            headerName: "Snapshot",
            field: "snapshot",
            cellRenderer: "agSparklineCellRenderer",
            cellRendererParams: {
                sparklineOptions: {
                    type: "line",
                    line: {
                        stroke: "#4F46E5",
                        strokeWidth: 2,
                    },
                    padding: { top: 5, bottom: 5, right: 10 },
                    axis: {
                        strokeWidth: 1,
                        stroke: "#ccc",
                    },
                    marker: {
                        size: 3,
                        fill: "#4F46E5",
                    },
                },
            },
            width: 150,
        },
        { headerName: "Status", field: "status", cellRenderer: StatusRenderer },
        { headerName: "Actions", field: "actions", cellRenderer: ActionRenderer },
    ];

    function StatusRenderer(params: any) {
        return <span className="px-2 py-1 ml-4 bg-green-600 text-white rounded">{params.value}</span>;
    }

    function ActionRenderer() {
        return <Button className="bg-gray-700 px-3 rounded text-white deposit-button">Deposit</Button>;
    }

    return (
        <div id="vaults" className="min-h-screen  text-white p-6">
            <div className="">
                <h1 className="text-3xl font-bold">Vaults</h1>
                <p className="text-gray-400 mt-1 w-full md:w-[32%] text-base md:text-md leading-relaxed">
                    Vaults allow users to store and manage assets. You can create your own vault, make a deposit, or select an existing one.
                </p>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6">
                    <div>
                        <p className="text-xl font-semibold">$534,753,940</p>
                        <p className="text-sm mt-1 font-semibold text-gray-400">Total Value</p>
                    </div>
                    <Button className="bg-gray-700 mt-3 md:mt-0">Connect Wallet</Button>
                </div>
            </div>

            {/* Tab Buttons */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-8">
                <div className="flex bg-gray-700 rounded-lg p-1">
                    <Button
                        className={`px-4 py-2 ${selectedTab === "protocol" ? "bg-blue-600" : "bg-gray-700"}`}
                        onClick={() => setSelectedTab("protocol")}
                    >
                        Protocol Vaults
                    </Button>
                    <Button
                        className={`px-4 py-2 ${selectedTab === "user" ? "bg-blue-600" : "bg-gray-700"}`}
                        onClick={() => setSelectedTab("user")}
                    >
                        User Vaults
                    </Button>
                </div>
                <div className="flex bg-gray-700 rounded-lg p-1 mt-2 sm:mt-0">
                    <Button
                        className={`px-4 py-2 ${viewMode === "list" ? "bg-blue-600" : "bg-gray-700"}`}
                        onClick={() => setViewMode("list")}
                    >
                        <List size={18} />
                    </Button>
                    <Button
                        className={`px-4 py-2 ${viewMode === "board" ? "bg-blue-600" : "bg-gray-700"}`}
                        onClick={() => setViewMode("board")}
                    >
                        <Grid size={18} />
                    </Button>
                </div>
            </div>

            {/* Search and Filters Container */}
            <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                {/* Search Input */}
                <Input
                    className="bg-gray-800 text-white md:w-[20%] px-4 py-2 rounded-lg"
                    placeholder="Search by vault address, name, or leader..."
                />
                {/* Filters Section */}
                <div className="flex flex-wrap justify-end md:justify-normal items-center gap-2 w-full md:w-auto">
                    <ToggleGroup>
                        <ToggleGroupItem className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                            My Repositories
                        </ToggleGroupItem>
                        <ToggleGroupItem className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                            Deposited
                        </ToggleGroupItem>
                        <ToggleGroupItem className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                            Others
                        </ToggleGroupItem>
                        <ToggleGroupItem className="bg-gray-600 text-gray-400 px-4 py-2 rounded-lg">
                            Closed
                        </ToggleGroupItem>
                        {/* Dropdown Filter */}
                        <Dropdown
                            options={["7d", "30d", "90d", "1y"]}
                            selected={selectedFilter}
                            onSelect={setSelectedFilter}
                        />
                    </ToggleGroup>
                </div>
            </div>

            {/* Conditionally Render List or Board View */}
            {viewMode === "list" ? (
                <Card className="mt-4 px-1 bg-gray-800">
                    <AGTable rowData={rowData} columnDefs={columnDefs} paginationPageSize={10} />
                </Card>
            ) : (
                <div className="mt-4">
                    <BoardViewVaults />
                </div>
            )}
        </div>
    );
};

export default Vaults;
