"use client"
import { useState } from "react";
import { Button } from "../common/Button";
import SparklineChart from "../common/SparklineChart";
import Pagination from "../common/Pagination";

const vaults = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: "Liquidator",
    leader: "0xfc13...80c9",
    apr: "0.00%",
    totalFunds: "$18,190.73",
    yourDeposit: "0.00%",
    age: "731",
    status: i % 3 === 0 ? "Open" : "Closed",
    snapshot: Array.from({ length: 15 }, () => Math.floor(Math.random() * 100)),
}));

const BoardViewVaults = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);

    const totalPages = Math.ceil(vaults?.length / pageSize);
    const paginatedVaults = vaults?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="min-h-screen text-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
                {paginatedVaults?.map((vault) => (
                    <div key={vault?.id} className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold">{vault?.name}</h2>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${vault.status === "Open" ? "bg-gray-600" : "bg-gray-600"}`}>
                                {vault?.status}
                            </span>
                        </div>

                        {/* Chart */}
                        <div className="h-12 flex items-center justify-center">
                            <SparklineChart data={vault?.snapshot} />
                        </div>

                        {/* Vault Details */}
                        <div className="mt-2 text-gray-300 text-sm">
                            <p className="text-gray-400">{vault?.leader}</p>
                            <div className="grid grid-cols-2 gap-y-1 my-4 text-sm">
                                <div className="flex items-center">
                                    <p className="text-gray-400">APR</p>
                                    <p className="ml-14">{vault?.apr}</p>
                                </div>
                                <div className="flex justify-start items-center">
                                    <p className="text-gray-400">Total Funds</p>
                                    <p className="ml-1">{vault?.totalFunds}</p>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-gray-400">Your deposit</p>
                                    <p className="ml-1">{vault?.yourDeposit}</p>
                                </div>
                                <div className="flex justify-start items-center">
                                    <p className="text-gray-400">Age (days)</p>
                                    <p className="ml-3">{vault?.age}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex gap-2">
                            {vault?.status === "Open" ? (
                                <>
                                    <Button className="bg-gray-700 text-sm hover:bg-blue-700 px-3 w-full">Top Up</Button>
                                    <Button className="bg-gray-700 text-sm hover:bg-gray-600 px-3 w-full">Withdraw</Button>
                                </>
                            ) : (
                                <Button className="bg-gray-700 hover:bg-gray-600 px-3 text-sm w-full">Deposit</Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
            />
        </div>
    );
};

export default BoardViewVaults;
