
import React, { useState } from "react";
import Image from "next/image";
// import { useHyperLiquid } from '@/context/HyperLiquid'
import Pagination from "../../common/Pagination"; 
import editicon from "@/assets/images/edit_icon.svg";
import infoicon from "@/assets/images/info_icon.svg";
import shortingicon from "@/assets/images/shorting_icon.svg";
import bitcoinicon from "@/assets/images/bitcoin_logo.svg";

const staticPositions = Array(20).fill({
  coin: "BTC/USD",
  leverage: "20x",
  entryPx: "50,000 USD",
  markPx: "52,000 USD",
  fundingPnl: "+15.23 USD",
  size: "1 BTC",
  unrealizedPnl: "+1,200 USD",
  liquidationPx: "45,000 USD",
  marginUsed: "5,000 USD",
  status: "Open",
  market: "19,000.00",
  limit: "0.005",
  tpsl: "20,000.00/18,000.00",
});

const columns = [
  { key: "coin", label: "Position" },
  { key: "entryPx", label: "Entry Price" },
  { key: "markPx", label: "Mark Price" },
  { key: "fundingPnl", label: "Funding P&L" },
  { key: "size", label: "Size" },
  { key: "unrealizedPnl", label: "Unrealized PnL" },
  { key: "liquidationPx", label: "Liq. Price" },
  { key: "marginUsed", label: "Margin" },
  { key: "status", label: "Status" },
];

const Positions = () => {
  // const { clearingHouseState } = useHyperLiquid()
   const [currentPage, setCurrentPage] = useState(1);
   const [pageSize, setPageSize] = useState(5);
 
   const totalPages = Math.ceil(staticPositions.length / pageSize);
 
   const paginatedPositions = staticPositions?.slice(
     (currentPage - 1) * pageSize,
     currentPage * pageSize
   );

  return (
    <div className="overflow-x-auto w-full px-3">
      <table className="w-full text-white">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="pt-3 pb-1 px-3 text-sm font-normal text-[#8B8BA0] text-left"
              >
                <div className="flex justify-start items-center gap-1">
                  <Image
                    src={shortingicon}
                    alt="Sort"
                    className="w-3 h-3 cursor-pointer"
                  />
                  <span>{col.label}</span>
                  <Image
                    src={infoicon}
                    alt="Info"
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
              </th>
            ))}
            <th className="pt-3 pb-1 px-3 text-left text-sm font-normal text-[#7D67FF]">
              Close all positions
            </th>
            <th className="pt-3 pb-1 px-3 text-left text-sm font-normal text-[#8B8BA0]">
              <div className="flex justify-start items-center gap-1">
                <Image
                  src={shortingicon}
                  alt="Sort"
                  className="w-3 h-3 cursor-pointer"
                />
                <span>{"TP/SL for position"}</span>
                <Image
                  src={infoicon}
                  alt="Info"
                  className="w-4 h-4 cursor-pointer"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginatedPositions?.map((position, index) => (
            <tr key={index} className=" border-b border-white/10">
              <td className="py-4 text-[#FFFFFF] opacity-80 font-normal text-sm ">
                <div className="flex items-center gap-1">
                  <span
                    className={`w-[4px] h-[36px] rounded-sm ${
                      position?.tpsl === "" ? "bg-[#E2464A]" : "bg-[#2FA766]"
                    }`}
                  ></span>
                  <Image
                    src={bitcoinicon}
                    alt="Bitcoin"
                    className="w-6 h-6 mx-1 cursor-pointer"
                  />
                  {position.coin}{" "}
                  <span className="text-[#7D67FF] ml-1 px-1 py-1 rounded-lg bg-[#5F46F91A] font-semibold text-sm">
                    {position.leverage}
                  </span>
                </div>
              </td>
              <td className="py-4 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.entryPx}
              </td>
              <td className="py-4 opacity-80  text-[#FFFFFF] font-normal text-sm">
                {position.markPx}
              </td>
              <td className="py-4 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.fundingPnl}
              </td>
              <td className="py-4 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.size}
              </td>
              <td className="py-4 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.unrealizedPnl}
              </td>
              <td className="py-4 opacity-80 text-[#E2464A] font-normal text-sm">
                {position.liquidationPx}
              </td>
              <td className="py-4 opacity-80 text-[#FFFFFF] font-normal text-sm">
                {position.marginUsed}
              </td>
              <td className="py-4 opacity-80 text-[#FFFFFF] ">
                <span className="bg-[#1F1F30] font-medium text-sm px-2 py-1 text-[#2FA766] rounded-lg">
                  {position.status}
                </span>
              </td>
              <td className="py-4 opacity-80 text-[#7D67FF] text-sm">
                <span className="px-3 font-medium py-2 mr-2">Market</span>
                <span className="px-3 font-medium py-2">Limit</span>
                <span className="px-3 py-2 text-sm bg-[#322944] ml-2 text-white bg-opacity-10 border-2 border-white/10 border-opacity-10 rounded-md">
                  {position.market}
                </span>
                <span className="px-3 text-sm py-2 bg-[#322944] ml-2 text-white bg-opacity-10 border-2 border-white/10 border-opacity-10 rounded-md">
                  {position.limit}
                </span>
              </td>
              <td className="py-4 opacity-80 text-[#FFFFFF] font-normal text-sm ">
                {position.tpsl ? (
                  <div className="flex items-center gap-2">
                    <span className="w-17 break-words overflow-hidden">
                      {position.tpsl}
                    </span>
                    <Image
                      src={editicon}
                      alt="Edit"
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                ) : (
                  "-/-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};

export default Positions;
