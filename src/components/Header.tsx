'use client'
import React, { useState, FC, useEffect } from 'react';
import { useAccount, useBalance, useConnect } from 'wagmi';
import { toHumanNumber, truncateAddress } from '../utils/utils';
import nexonlogo from "@/assets/images/logo.svg";
import bridgingbtnlogo from "@/assets/images/bridge_icon.svg";
import moonicon from "@/assets/images/dark_mode.svg";
import walleticon from "@/assets/images/wallet_icon.svg";
import menuline from "@/assets/images/menu_icon.svg";
import menuClose from "@/assets/images/close_icon.svg";
import Image from 'next/image';

const Header: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>("Futures");
  const [notificationCount] = useState(5);
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  return (
    <>
      <header style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} className="flex border-b items-center bg-[#1c0c30] justify-between md:px-10 md:py-5 px-0 py-1">
        <div className="flex items-center justify-center space-x-4">
          <h1 className="flex items-center mr-6 md:mr-12 gap-2 px-3 py-2 text-[#E8E0F1] text-2xl rounded-md hover:bg-gray-900 font-semibold">
            <Image src={nexonlogo} alt="Nexon Logo" className="w-6 h-6" />
            Nexon
          </h1>
          <nav className="md:flex hidden text-[#8B8BA0] text-base items-center space-x-5">
            {["Futures", "Spot", "Lend/Borrow", "Predictions", "Stake", "Vaults"].map((menu) => (
              <a
                key={menu}
                href="#"
                onClick={() => setActiveMenu(menu)}
                className={`py-[5px] px-[16px] rounded-full transition-all duration-300
                  ${activeMenu === menu ? "text-[#08030D] bg-[#E8E0F1]" : "hover:text-[#08030D] hover:bg-[#E8E0F1]"}`}
              >
                {menu}
              </a>
            ))}

            {/* More Dropdown */}
            <button
              className={`flex items-center gap-x-1.5 transition-all duration-300 
                ${activeMenu === "More" ? "text-blue-500" : "hover:text-blue-500"}`}
              onClick={() => setActiveMenu("More")}
            >
              More
              {/* <FaChevronDown /> */}
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button className="md:px-[20px] px-[10px] py-[10px] flex items-center  bg-[#322944] font-bold text-[#FFFFFF] text-sm rounded-md cursor-pointer">
            <Image src={bridgingbtnlogo} alt="bridgingbtnlogo" className="w-4 h-4 md:mr-2" />
            <span className="font-bold text-sm text-[#FFFFFF] hidden md:block">Bridge</span>
          </button>
          <button className="p-1 md:block hidden hover:text-blue-400 text-gray-400">
            <Image src={moonicon} alt="moonicon" className="w-4 h-4 mr-2" />
          </button>
          <button className="p-1 md:block hidden hover:text-blue-400 text-gray-400">
            {/* <FaRegCircleQuestion className='text-lg' /> */}
          </button>
          <button className="relative p-1 hover:text-blue-400 text-gray-400">
            {/* <FaRegBell className='text-lg' /> */}
            {notificationCount > 0 && (<span className="absolute -top-1 -right-1 flex items-center justify-center w-[18px] h-[17px] 
                bg-[#5F46F9] text-[#FFFFFF] text-[11px] font-['Proxima Nova'] font-normal leading-[140%] 
                rounded-[12px]">
              {notificationCount}
            </span>)}
          </button>

          {isConnected ? (
            <div className="flex items-center px-4 py-2 bg-[#1c0c30] rounded-md shadow">
              <span className="text-sm text-[#E8E0F1]">
                {toHumanNumber(balanceData?.value, balanceData?.decimals, 4)} {balanceData?.symbol}
              </span>
              <span className="border-l border-gray-600 h-4 mx-2"></span>
              <span className="font-medium">{truncateAddress(address!)}</span>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="md:px-[20px] px-[11px] ml:1 md:ml-4 flex items-center py-[10px] bg-[#5F46F9] font-bold text-[#FFFFFF] text-sm rounded-md md:rounded-xl cursor-pointer"
            >
              <Image src={walleticon} alt="walleticon" className="w-4 h-4" />
              <span className="ml-2 hidden md:block">Connect Wallet</span>
            </button>
          )}
          <button onClick={() => setIsOpen((prev) => !prev)} className="p-1 md:hidden block hover:text-blue-400 text-[#ffffff]">
            <Image src={isOpen ? menuClose : menuline} alt="menu-icon" className={`w-[20px] h-[20px] mr-5`} />
          </button>
        </div>
      </header>

      {/* Sidebar Menu */}
      {isOpen && (
        <div className="left-0 top-0 w-full h-full bg-[#1a1027] px-3 py-4 shadow-lg">
          <div className='flex mb-3 ml-1 gap-2'>
            <button className="md:px-[20px] px-[10px] py-[10px] flex items-center  bg-[#322944] font-bold text-[#FFFFFF] text-sm rounded-md cursor-pointer">
              {/* <FaRegCircleQuestion className='text-lg text-[#8B8BA0]' /> */}
            </button>
            <button className="md:px-[20px] px-[10px] py-[10px] flex items-center  bg-[#322944] font-bold text-[#FFFFFF] text-sm rounded-md cursor-pointer">
              <Image src={moonicon} alt="moonicon" className="w-4 h-4 md:mr-2" />
            </button>
          </div>
          <nav className="flex flex-start flex-col text-[#8B8BA0] text-sm items-center">
            {["Futures", "Spot", "Lend/Borrow", "Predictions", "Stake", "Vaults", "Leaderboards", "Referrals", "Points", "Sub-accounts", "Stats", "Docs", "Vocabulary for novices", "Settings"].map((menu) => (
              <a
                key={menu}
                href="#"
                onClick={() => setActiveMenu(menu)}
                className={`py-[5px] w-full px-[12px] mb-2 rounded-full transition-all duration-300
                  ${activeMenu === menu ? "text-[#08030D] bg-[#E8E0F1]" : "hover:text-[#08030D] hover:bg-[#E8E0F1]"}`}
              >
                {menu}
              </a>
            ))}
          </nav>
        </div>)}

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
                <Image src="https://images.ctfassets.net/clixtyxoaeas/1ezuBGezqfIeifWdVtwU4c/d970d4cdf13b163efddddd5709164d2e/MetaMask-icon-Fox.svg" alt="Metamask" className="inline-block w-6 h-6 mr-2" />
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
