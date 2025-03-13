'use client'

import { FC } from "react";
import nexonLogo from "@/assets/images/logo.svg";
import solarmoon from "@/assets/images/light_mode.svg";
import roboticon from "@/assets/images/discord_icon.svg";
import linkicon from "@/assets/images/telegram_icon.svg";
import forwardicon from "@/assets/images/twitter_icon.svg";
import bridgingbtnlogo from "@/assets/images/bridge_icon.svg";
import Image from "next/image";

const Footer: FC = () => {
    return (
        <footer className="bg-[#1b1122] border border-[#251A3C] rounded-2xl pt-0 p-5 md:p-8"
            style={{
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
            }}>
            {/* Top Section */}
            <div className="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center">
                <div className="mt-4 md:mt-0">
                    <h1 className="flex items-center mr-12 gap-2 py-2 text-[#E8E0F1] text-3xl rounded-md hover:bg-gray-900 font-semibold">
                        <Image src={nexonLogo} alt="Nexon Logo" className="w-7 h-7" />
                        Nexon
                    </h1>
                    <p className="text-[#8B8BA0] text-sm">
                        Empower Your Trades. Maximize Your Gains.
                    </p>
                </div>

                <div className="flex space-x-2 mt-4 md:mt-0">
                    <button className="p-3 bg-[#322944] rounded-3xl text-[#E8E0F1] hover:text-white cursor-pointer">
                        <Image src={forwardicon} alt="forwardicon" className="md:w-[15px] md:h-[15px] w-[14px] h-[14px]" />
                    </button>
                    <button className="p-3 bg-[#322944] rounded-3xl text-[#E8E0F1] hover:text-white cursor-pointer">
                        <Image src={linkicon} alt="linkicon" className="w-[13px] h-[13px] md:w-[14px] md:h-[14px]" />
                    </button>
                    <button className="p-3 bg-[#322944] rounded-3xl text-[#E8E0F1] hover:text-white cursor-pointer">
                        <Image src={roboticon} alt="roboticon" className="md:w-[15px] md:h-[15px] w-[14px] h-[14px]" />
                    </button>
                </div>
            </div>

            {/* Links Section */}
            <div style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} className="flex  mt-5 border-t border-b  flex-col md:flex-row justify-between items-start">
                <div className="grid py-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-10 text-sm text-gray-300">
                    <div>
                        <p className="text-[#8B8BA0] text-sm">Trading</p>
                        <ul className="mt-1 text-sm text-[#FFFFFF] space-y-1">
                            <li>Futures</li>
                            <li>Spot</li>
                            <li>Lend/Borrow</li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-[#8B8BA0] text-sm">Insights</p>
                        <ul className="mt-1 text-sm text-[#FFFFFF] space-y-1">
                            <li>Predictions</li>
                            <li>Leaderboards</li>
                            <li>Stats</li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-[#8B8BA0] text-sm">Investments</p>
                        <ul className="mt-1 text-sm text-[#FFFFFF] space-y-1">
                            <li>Stake</li>
                            <li>Vaults</li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-[#8B8BA0] text-sm">Rewards</p>
                        <ul className="mt-1 text-sm text-[#FFFFFF] space-y-1">
                            <li>Referrals</li>
                            <li>Points</li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-[#8B8BA0] text-sm">Resources</p>
                        <ul className="mt-1 text-sm text-[#FFFFFF] space-y-1">
                            <li>Contact Us</li>
                            <li>Docs</li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-[#8B8BA0] text-sm">Legal</p>
                        <ul className="mt-1 text-sm text-[#FFFFFF] space-y-1">
                            <li>Terms of Service</li>
                            <li>Privacy Policy</li>
                        </ul>
                    </div>
                </div>
                <div className="flex pt-1 pb-5 md:py-5 items-center space-x-3">
                    <button className="md:px-3 md:py-[10px] px-[10px] py-[10px] bg-[#322944] rounded-lg md:rounded-xl text-[#E8E0F1] hover:text-white cursor-pointer">
                        <Image src={solarmoon} alt="Dark Mode" className="w-5 h-5" />
                    </button>
                    <button className="flex items-center bg-[#322944] px-[12px] md:px-[24px] py-[10px] rounded-lg md:rounded-xl">
                        <Image src={bridgingbtnlogo} alt="Bridge" className="w-5 h-5" />
                        <span className="ml-2 font-bold text-sm text-[#FFFFFF] hidden md:block">Bridge</span>
                    </button>

                    <button className="bg-[#5F46F9] font-bold block text-[#FFFFFF] md:hidden text-xs px-[15px] py-[11px] rounded-lg">
                        Connect Wallet
                    </button>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-row justify-between items-center mt-6 text-gray-400 text-sm">
                <p className="text-sm text-[#8B8BA0]">© 2025 Nexon, Inc.</p>
                <p>
                    <span className="text-[#8B8BA0] text-sm mr-1">Created in</span> <span className="text-[#8B8BA0] font-bold text-white">U1CORE</span>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
