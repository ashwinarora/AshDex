"use client"
import { toHumanNumber, truncateAddress } from '@/utils/utils';
import React, { useState, FC } from 'react';
import { useAccount, useBalance, useConnect } from 'wagmi';


const Header: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { data: balanceData } = useBalance({ address });

  const handleConnectWallet = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center justify-center space-x-4">
          <h1 className="px-3 py-2 text-white text-xl rounded-md hover:bg-gray-900 font-semibold">
            Nexon
          </h1>
          <nav className="flex items-center space-x-4 ">
            <a href="#" className="hover:text-blue-500">
              Futures
            </a>
            <a href="#" className="hover:text-blue-500">
              Spot
            </a>
            <a href="#" className="hover:text-blue-500">
              Lend/Borrow
            </a>
            <a href="#" className="hover:text-blue-500">
              Predictions
            </a>
            <a href="#" className="hover:text-blue-500">
              Stake
            </a>
            {/* <Link to="/vaults" className="hover:text-blue-500"> */}
              Vaults
            {/* </Link> */}
            <button className="flex items-center gap-x-1.5 hover:text-blue-500">
              More
              {/* <FaChevronDown /> */}
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-1 hover:text-blue-400">
            {/* <FaRegCircleQuestion /> */}
          </button>
          <button className="p-1 hover:text-blue-400">
            {/* <FaRegBell /> */}
          </button>

          <button className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 cursor-pointer">
            Bridging
          </button>

          {isConnected ? (
            <div className="flex items-center px-4 py-2 bg-gray-800 rounded-md shadow">
              <span className="text-sm text-gray-300">
                {toHumanNumber(balanceData?.value, balanceData?.decimals, 4)} {balanceData?.symbol}
              </span>
              <span className="border-l border-gray-600 h-4 mx-2"></span>
              <span className="font-medium">{truncateAddress(address!)}</span>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-neutral-900 opacity-85"
          onClick={handleOverlayClick}
        >
          <div
            className="w-full max-w-md p-6 bg-neutral-800 rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Connect Wallet</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <ul className="space-y-2">
              <li
                className="p-3 bg-gray-900 hover:bg-gray-800 rounded cursor-pointer" role='button'
                onClick={() => {
                  connect({ connector: connectors[0] })
                  handleCloseModal()
                }}
              >
                <img src="https://images.ctfassets.net/clixtyxoaeas/1ezuBGezqfIeifWdVtwU4c/d970d4cdf13b163efddddd5709164d2e/MetaMask-icon-Fox.svg" alt="Metamask" className="inline-block w-6 h-6 mr-2" />
                Metamask
              </li>
              <li className="p-3 bg-gray-900 hover:bg-gray-800 rounded cursor-pointer">
                Wallet 2
              </li>
              <li className="p-3 bg-gray-900 hover:bg-gray-800 rounded cursor-pointer">
                Wallet 3
              </li>
              <li className="p-3 bg-gray-900 hover:bg-gray-800 rounded cursor-pointer">
                Wallet 4
              </li>
              <li className="p-3 bg-gray-900 hover:bg-gray-800 rounded cursor-pointer">
                Other wallet
              </li>
            </ul>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">Don’t you have a wallet?</p>
              <button className="px-4 py-2 mt-2 text-white bg-blue-600 rounded cursor-pointer hover:bg-blue-700">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
