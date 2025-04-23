'use client'

import { FC } from 'react'
import Image from 'next/image'
import { useAccount } from 'wagmi'
import { useWalletModal } from '@/context/WalletModalContext'
import nexonLogo from '@/assets/images/logo.svg'
import roboticon from '@/assets/images/discord_icon.svg'
import linkicon from '@/assets/images/telegram_icon.svg'
import forwardicon from '@/assets/images/twitter_icon.svg'
import bridgingbtnlogo from '@/assets/images/bridge_icon.svg'
import { IconMoonFilled } from '@tabler/icons-react'

const Footer: FC = () => {
  const { toggleConnectWalletModal } = useWalletModal()
  const { isConnected } = useAccount()

  return (
    <footer
      className=" nexon-card border border-[#251A3C] rounded-2xl pt-0 p-5 md:p-8"
      style={{
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)'
      }}
    >
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-start md:justify-between items-start md:items-center">
        <div className="mt-4 md:mt-0">
          <h1 className="flex items-center mr-12 gap-2 py-2 text-[#E8E0F1] text-3xl rounded-md   font-semibold">
            <Image src={nexonLogo} alt="Nexon Logo" height={20} width={20} className="w-7 h-7" />
            Nexon
          </h1>
          <div className="text-[#8B8BA0] text-sm">Empower Your Trades. Maximize Your Gains.</div>
        </div>

        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={() => window.open('https://x.com/Nexon_xyz', '_blank')}
            className="p-3 bg-[#322944] rounded-3xl text-[#E8E0F1] hover:text-white cursor-pointer"
          >
            <Image
              src={forwardicon}
              height={20}
              width={20}
              alt="forwardicon"
              className="md:w-[15px] md:h-[15px] w-[14px] h-[14px]"
            />
          </button>
          <button className="p-3 bg-[#322944] rounded-3xl text-[#E8E0F1] hover:text-white cursor-pointer">
            <Image
              // onClick={() => window.open('https://t.me/nexon_official', '_blank')}
              src={linkicon}
              height={20}
              width={20}
              alt="linkicon"
              className="w-[13px] h-[13px] md:w-[14px] md:h-[14px]"
            />
          </button>
          <button className="p-3 bg-[#322944] rounded-3xl text-[#E8E0F1] hover:text-white cursor-pointer">
            <Image
              // onClick={() => window.open('https://discord.gg/nexon', '_blank')}
              src={roboticon}
              height={20}
              width={20}
              alt="roboticon"
              className="md:w-[15px] md:h-[15px] w-[14px] h-[14px]"
            />
          </button>
        </div>
      </div>

      {/* Links Section */}
      <div
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
        className="flex  mt-5 border-t border-b  flex-col md:flex-row justify-between items-start"
      >
        <div className="grid py-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-10 text-sm text-gray-300">
          <div>
            <div className="text-[#8B8BA0] text-sm">Trading</div>
            <ul className="mt-1 text-sm text-white space-y-1">
              <li>Futures</li>
              <li>Spot</li>
              <li>Lend/Borrow</li>
            </ul>
          </div>

          <div>
            <div className="text-[#8B8BA0] text-sm">Insights</div>
            <ul className="mt-1 text-sm text-white space-y-1">
              <li>Predictions</li>
              <li>Leaderboards</li>
              <li>Stats</li>
            </ul>
          </div>

          <div>
            <div className="text-[#8B8BA0] text-sm">Investments</div>
            <ul className="mt-1 text-sm text-white space-y-1">
              <li>Stake</li>
              <li>Vaults</li>
            </ul>
          </div>

          <div>
            <div className="text-[#8B8BA0] text-sm">Rewards</div>
            <ul className="mt-1 text-sm text-white space-y-1">
              <li>Referrals</li>
              <li>Points</li>
            </ul>
          </div>

          <div>
            <div className="text-[#8B8BA0] text-sm">Resources</div>
            <ul className="mt-1 text-sm text-white space-y-1">
              <li>Contact Us</li>
              <li>Docs</li>
            </ul>
          </div>

          <div>
            <div className="text-[#8B8BA0] text-sm">Legal</div>
            <ul className="mt-1 text-sm text-white space-y-1">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="flex pt-1 pb-5 md:py-5 items-center space-x-3">
          <button className="md:px-3 md:py-[10px] px-[10px] py-[10px] bg-[#322944] rounded-lg md:rounded-xl text-[#E8E0F1] hover:text-white cursor-pointer">
            <IconMoonFilled size={24} />
          </button>
          <button className="flex items-center bg-[#322944] px-[12px] md:px-[24px] py-[10px] rounded-lg md:rounded-xl">
            <Image src={bridgingbtnlogo} alt="Bridge" height={20} width={20} className="w-5 h-5" />
            <span className="ml-2 font-bold text-sm text-white hidden md:block">Bridge</span>
          </button>

          {!isConnected ? (
            <button
              onClick={toggleConnectWalletModal}
              className={`bg-primary font-bold block text-white   text-xs px-[15px] py-[11px] rounded-lg cursor-pointer`}
            >
              Connect Wallet
            </button>
          ) : null}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-row justify-between items-center mt-6 text-gray-400 text-sm">
        <div className="text-sm text-[#8B8BA0]">© 2025 Nexon, Inc.</div>
      </div>
    </footer>
  )
}

export default Footer
