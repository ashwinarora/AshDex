import React from "react";
import { Card } from "../common/Card";
import AGTable from "../common/AGTable";

const Table = () => {
  const rowData = [
    {
      position: "BTC/USD",
      leverage: "20x",
      entryPrice: "50,000 USD",
      markPrice: "52,000 USD",
      fundingPnL: "$15.23",
      size: "1 BTC",
      unrealizedPnL: "+1,200 USD",
      liqPrice: "45,000 USD",
      margin: "5,000 USD",
      status: "Open",
      tpSl: "20,000.00 / 18,000.00",
      action: "",
    },
    {
      position: "BTC/USD",
      leverage: "10x",
      entryPrice: "50,000 USD",
      markPrice: "52,000 USD",
      fundingPnL: "$15.23",
      size: "1 BTC",
      unrealizedPnL: "+1,200 USD",
      liqPrice: "45,000 USD",
      margin: "5,000 USD",
      status: "Open",
      tpSl: "- / -",
      action: "",
    },
    {
      position: "BTC/USD",
      leverage: "30x",
      entryPrice: "50,000 USD",
      markPrice: "52,000 USD",
      fundingPnL: "$15.23",
      size: "1 BTC",
      unrealizedPnL: "+1,200 USD",
      liqPrice: "45,000 USD",
      margin: "5,000 USD",
      status: "Open",
      tpSl: "20,000.00 / 18,000.00",
      action: "",
    },
    {
      position: "BTC/USD",
      leverage: "50x",
      entryPrice: "50,000 USD",
      markPrice: "52,000 USD",
      fundingPnL: "$15.23",
      size: "1 BTC",
      unrealizedPnL: "+1,200 USD",
      liqPrice: "45,000 USD",
      margin: "5,000 USD",
      status: "Open",
      tpSl: "- / -",
      action: "",
    },
    {
      position: "BTC/USD",
      leverage: "20x",
      entryPrice: "50,000 USD",
      markPrice: "52,000 USD",
      fundingPnL: "$15.23",
      size: "1 BTC",
      unrealizedPnL: "+1,200 USD",
      liqPrice: "45,000 USD",
      margin: "5,000 USD",
      status: "Open",
      tpSl: "20,000.00 / 18,000.00",
      action: "",
    },
  ];

  const columnDefs = [
    { headerName: "Position", field: "position", sortable: true, filter: true },
    { headerName: "Leverage", field: "leverage", sortable: true },
    { headerName: "Entry Price", field: "entryPrice", sortable: true },
    { headerName: "Mark Price", field: "markPrice", sortable: true },
    { headerName: "Funding P&L", field: "fundingPnL" },
    { headerName: "Size", field: "size", sortable: true },
    {
      headerName: "Unrealized PnL",
      field: "unrealizedPnL",
      cellStyle: { color: "limegreen", fontWeight: "bold" },
    },
    {
      headerName: "Liq. Price",
      field: "liqPrice",
      cellStyle: { color: "red", fontWeight: "bold" },
    },
    { headerName: "Margin", field: "margin" },
    {
      headerName: "Status",
      field: "status",
      cellStyle: { color: "green", fontWeight: "bold" },
    },
    { headerName: "TP/SL for Position", field: "tpSl" },
    {
      headerName: "Action",
      field: "action",
      cellRenderer: () => (
        <div className="flex space-x-2">
          <button className="text-blue-500 hover:underline">Market</button>
          <button className="text-blue-500 hover:underline">Limit</button>
          <input
            type="text"
            className="w-16 bg-gray-700 text-white text-center border border-gray-600 rounded"
            placeholder="0.005"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg h-[50vh]">
      <Card className="mt-4 px-1 bg-gray-800">
        <AGTable rowData={rowData} columnDefs={columnDefs} paginationPageSize={10} />
      </Card>
    </div>
  );
};

export default Table;
