"use client"
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { HyperLiquidContext } from "../../context/HyperLiquid"

interface ISelectorProps {
  selectedAsset: string,
  setSelectedAsset: (asset: string) => void,
}

const Selector = ({selectedAsset, setSelectedAsset}: ISelectorProps) => {
  const { allMids } = useContext(HyperLiquidContext);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filter assets based on the search term
  const assetEntries = useMemo(() => (
    Object.entries(allMids).filter(([key]) =>
      !key.startsWith("@")
    ).filter(([key]) =>
      key.includes("PERP")
    ).filter(([key]) =>
      key.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ), [allMids, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex justify-start items-center gap-x-6">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-2xl text-white p-2 rounded flex justify-start items-center focus:outline-none gap-x-3"
        >
          <span>
            {selectedAsset ? `${selectedAsset}` : "Select an asset"}
          </span>
          {/* <FaChevronDown /> */}
        </button>
        {selectedAsset && (
          <div className="text-2xl">
            {allMids[selectedAsset]}
          </div>
        )}
      </div>
      {isOpen && (
        <div className="absolute mt-1 w-full bg-gray-700 rounded shadow-lg z-10">
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 bg-gray-600 text-white placeholder-gray-300 rounded-t focus:outline-none"
          />
          <ul className="max-h-60 overflow-auto">
            {assetEntries.length > 0 ? (
              assetEntries.map(([key, value]) => (
                <li
                  key={key}
                  onClick={() => {
                    setSelectedAsset(key);
                    // onSelect({ key, value });
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className="p-2 hover:bg-gray-600 cursor-pointer"
                >
                  {key} ({value})
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-400">No assets found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Selector