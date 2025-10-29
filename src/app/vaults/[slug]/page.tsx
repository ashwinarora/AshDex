'use client'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import vaultsDetailsData from '@/utils/VaultDetails.json'
import { ORDER_INTERVALS, VAULT_TAB } from '@/utils/constants'
import Modal from '@/components/common/Modal'
import { ValutsDetailsCard } from '@/components/Vault/ValutsDetailsCard'
import { PerformanceCard } from '@/components/Vault/PerformanceCard'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import UserData from '@/components/Vault/UserData/UserData'
import VaultsTabs from '@/components/Vault/VaultsTabs'
import VaultsActions from '@/components/Vault/VaultsActions'
import TradeVaultModal from '@/components/Vault/TradeVaultModal'
import DisableDepositsVaultModal from '@/components/Vault/DisableDepositsVaultModal'
import CloseVaultModal from '@/components/Vault/CloseVaultModal'
import AutoCloseWithdrawModal from '@/components/Vault/AutoCloseWithdrawModal'
import DistributeModal from '@/components/Vault/DistributeModal'
import VaultActionButtons from '@/components/Vault/VaultActionButtons'
import copyicon from '@/assets/images/copy_icon.svg'
import settingicon from '@/assets/images/setting_icon.svg'
import menuClose from '@/assets/images/close_icon.svg'

export interface PerformanceItem {
  value: string
  changeProfit?: string
  changeLost?: string
  period?: string
}

export default function VaultDetails() {
  const { vault, performance, vaultsDescription } = vaultsDetailsData
  const leaderRef = useRef<HTMLSpanElement | null>(null)
  const strategiesRef = useRef<HTMLSpanElement | null>(null)
  const vaultsRef = useRef<HTMLSpanElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const [copiedRef, setCopiedRef] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedInterval, setSelectedInterval] = useState<(typeof ORDER_INTERVALS)[number]>('1D')
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeVaultAction, setActiveVaultAction] = useState<string | null>(null)
  const [isDepositsDisabled, setIsDepositsDisabled] = useState(false)
  const [isAutoCloseWithdraw, setIsAutoCloseWithdraw] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  const handleCopy = (ref: React.RefObject<HTMLSpanElement | null>, refName: string) => {
    if (ref.current) {
      const text = ref.current.innerText
      navigator.clipboard.writeText(text)
      setCopiedRef(refName)
      setTimeout(() => setCopiedRef(null), 2000)
    }
  }

  const handleVaultAction = (actionKey: string | null) => {
    setShowDropdown(false)
    setActiveVaultAction(actionKey)
  }

  const renderVaultActionModal = () => {
    switch (activeVaultAction) {
      case 'trade':
        return (
          <TradeVaultModal
            isVaultModal={!!activeVaultAction}
            openVaultsModal={() => handleVaultAction(null)}
          />
        )
      case 'disableDeposits':
        return (
          <DisableDepositsVaultModal
            isVaultModal={!!activeVaultAction}
            openVaultsModal={() => handleVaultAction(null)}
            isDepositsDisabled={isDepositsDisabled}
            setIsDepositsDisabled={setIsDepositsDisabled}
          />
        )
      case 'enableAutoClose':
        return (
          <AutoCloseWithdrawModal
            isVaultModal={!!activeVaultAction}
            openVaultsModal={() => handleVaultAction(null)}
            isAutoCloseWithdraw={isAutoCloseWithdraw}
            setIsAutoCloseWithdraw={setIsAutoCloseWithdraw}
          />
        )
      case 'distribute':
        return (
          <DistributeModal
            isVaultModal={!!activeVaultAction}
            openVaultsModal={() => handleVaultAction(null)}
          />
        )
      case 'closeVault':
        return (
          <CloseVaultModal
            isVaultModal={!!activeVaultAction}
            openVaultsModal={() => handleVaultAction(null)}
          />
        )
      default:
        return null
    }
  }

  const handleCloseVaultActionMenu = () => {
    setShowDropdown((prev) => !prev)
  }

  const renderVaultActionMenu = () => {
    return (
      <>
        <Modal isOpen={showDropdown} onClose={handleCloseVaultActionMenu}>
          <div
            className="w-full max-w-md max-md:max-w-sm border-white/10 border-[2px] bg-[#0F0816] max-md:py-3 max-md:px-2 p-6 rounded-2xl shadow-lg 
           relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-1">
              <button
                onClick={handleCloseVaultActionMenu}
                className="p-2 bg-[#322944] rounded-3xl text-white/70hover:text-white cursor-pointer"
              >
                <Image
                  width={20}
                  height={20}
                  src={menuClose}
                  alt="menuclose"
                  className="w-[13px] h-[13px]"
                />
              </button>
            </div>
            <div className="flex flex-col space-y-2">
              <VaultActionButtons
                isDepositsDisabled={isDepositsDisabled}
                isAutoCloseWithdraw={isAutoCloseWithdraw}
                handleVaultAction={handleVaultAction}
                activeVaultAction={activeVaultAction}
              />
            </div>
          </div>
        </Modal>
      </>
    )
  }

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!showDropdown || !isDesktop) return
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDesktop, showDropdown])

  return (
    <>
      <div className="w-full 2xl:px-14  px-4 pt-5">
        <Breadcrumbs mainTitle="Vaults" subtitle={vault.name} />
        <div className="grid grid-cols-1 min-[1025px]:grid-cols-4 gap-5 mt-5">
          <div className="min-xl:col-span-3 space-y-6">
            <div className="flex max-lg:flex-col max-lg:items-start items-center justify-between mb-5">
              <div className="flex max-md:w-full max-md:justify-between flex-row items-center gap-x-8 py-4">
                <div className="">
                  <h2 className="text-base flex items-center gap-x-1 text-white font-bold">
                    {vault?.name}
                    {isDepositsDisabled && (
                      <span
                        className={`rounded-lg text-sm py-0.5 px-1.5 font-medium flex items-center bg-[#f139391a] text-red`}
                      >
                        Deposits Disabled
                      </span>
                    )}
                    {isAutoCloseWithdraw && (
                      <span
                        className={`rounded-lg text-sm py-0.5 px-1.5 font-medium flex items-center bg-[#1F1F30] text-green`}
                      >
                        Auto-Close Enabled
                      </span>
                    )}
                  </h2>
                  <p className="text-sm gap-x-2 mt-2 flex items-center text-[#8B8BA0] font-medium">
                    <span ref={vaultsRef}>{vault?.type}</span>
                    <button
                      className="opacity-70 cursor-pointer"
                      onClick={() => handleCopy(vaultsRef, 'vaults')}
                    >
                      <Image
                        className={`${copiedRef === 'vaults' ? 'filter-green' : ''}`}
                        style={{ width: 15, height: 'auto' }}
                        src={copyicon}
                        alt="Copy"
                      />
                    </button>
                  </p>
                </div>
                <div
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="bg-white/6 rounded-xl p-3 cursor-pointer relative"
                >
                  <Image src={settingicon} alt="Setting" style={{ width: 17, height: 'auto' }} />
                  {showDropdown && (
                    <div
                      ref={dropdownRef}
                      className="absolute max-md:hidden flex flex-col top-12 px-1.5 left-0 bg-[#0F0816] shadow-lg rounded-xl w-80 py-2 z-50"
                    >
                      <VaultActionButtons
                        isDepositsDisabled={isDepositsDisabled}
                        isAutoCloseWithdraw={isAutoCloseWithdraw}
                        handleVaultAction={handleVaultAction}
                        activeVaultAction={activeVaultAction}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex max-lg:w-full max-md:gap-2 flex-wrap gap-4">
                {Object.entries(vault?.details)?.map(([key, value]) => (
                  <ValutsDetailsCard key={key} title={key} value={value} />
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-b pb-5 from-white/5 to-gray-600/5 p-4 max-lg:px-1 max-lg:py-3 rounded-xl">
              <h3 className="text-xl pt-1 pb-3 px-2 text-white font-medium">Performance</h3>
              <div className="grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 grid-cols-2 max-[765px]:grid-cols-1 px-2 flex-wrap max-[765px]:gap-2  gap-3">
                {Object.entries(performance).map(([key, value]: [string, PerformanceItem]) => (
                  <PerformanceCard
                    key={key}
                    mainTitle={key}
                    value={value.value}
                    changeProfit={value.changeProfit}
                    changeLost={value.changeLost}
                    period={value.period}
                  />
                ))}
              </div>
            </div>
            {/* Tab Section */}
            <div className="bg-gradient-to-b pb-5 from-white/5 to-gray-600/5 max-lg:px-1 p-4 rounded-xl">
              <VaultsTabs
                tabs={[...VAULT_TAB]}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedInterval={selectedInterval}
                setSelectedInterval={setSelectedInterval}
                intervals={Array.from(ORDER_INTERVALS)}
              />
            </div>
            {/* Leader */}
            <div className="bg-gradient-to-b pb-5 from-white/5 to-gray-600/5 p-1 min-lg:p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base pt-1 px-2 pb-2 text-white font-medium">Leader</h3>
                <p className="text-[#8B8BA0] flex items-center tracking-normal px-2 font-normal text-sm align-middle">
                  <span ref={leaderRef}>0x63c6...3a00</span>
                  <button
                    onClick={() => handleCopy(leaderRef, 'leader')}
                    className="px-3 py-1 opacity-70 cursor-pointer"
                  >
                    <Image
                      className={copiedRef === 'leader' ? 'filter-green' : ''}
                      src={copyicon}
                      alt="Copy"
                      style={{ width: 16, height: 'auto' }}
                    />
                  </button>
                </p>
              </div>
              <h3 className="text-base pt-1 px-2 text-white font-medium">Description</h3>
              {vaultsDescription?.map((desc, index) => (
                <p
                  key={index}
                  className="text-[#8B8BA0] tracking-normal px-2 font-normal text-sm align-middle my-2"
                >
                  {desc}
                </p>
              ))}
              <p className="text-[#8B8BA0] tracking-normal px-2 font-normal text-sm align-middle my-2">
                This vault uses the following vaults as component strategies:
              </p>
              <p className="text-white flex items-center tracking-normal px-2 font-normal text-sm align-middle my-2 opacity-80">
                <span className="overflow-hidden" ref={strategiesRef}>
                  0x010461c14e146ac35fe42271bdc1134ee31c703a
                  0x2e3d94f0562703b25c83308a05046ddaf9a8dd14
                  0x31ca8395cf837de08b24da3f660e77761dfb974b
                </span>
                <button
                  onClick={() => handleCopy(strategiesRef, 'strategies')}
                  className="min-lg:px-3 pl-4 max-sm:w-1/3 py-1 opacity-70 cursor-pointer"
                >
                  <Image
                    className={`${copiedRef === 'strategies' ? 'filter-green' : ''} w-auto h-auto`}
                    style={{ width: 16, height: 'auto' }}
                    src={copyicon}
                    alt="Copy"
                  />
                </button>
              </p>
            </div>
          </div>
          <div>
            <VaultsActions />
          </div>
        </div>
        <UserData />
      </div>
      {renderVaultActionModal()}
      {showDropdown && <div className="max-md:block hidden">{renderVaultActionMenu()}</div>}
    </>
  )
}
