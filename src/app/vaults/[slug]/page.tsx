'use client'
import React, { useRef, useState } from 'react'
import Image from 'next/image'
import vaultsDetailsData from '@/utils/VaultDetails.json'
import { ORDER_INTERVALS, VAULT_TAB } from '@/utils/constants'
import { ValutsDetailsCard } from '@/components/Vault/ValutsDetailsCard'
import { PerformanceCard } from '@/components/Vault/PerformanceCard'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import TabsVaultsDetails from '@/components/Vault/TabsVaultsDetails'
import VaultsTabs from '@/components/Vault/VaultsTabs'
import VaultsActions from '@/components/Vault/VaultsActions'
import lido from '../../../assets/images/lido.svg'
import copyicon from '@/assets/images/copy_icon.svg'

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
  const [copiedRef, setCopiedRef] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedInterval, setSelectedInterval] = useState<(typeof ORDER_INTERVALS)[number]>('1D')

  const handleCopy = (ref: React.RefObject<HTMLSpanElement | null>, refName: string) => {
    if (ref.current) {
      const text = ref.current.innerText
      navigator.clipboard.writeText(text)
      setCopiedRef(refName)
      setTimeout(() => setCopiedRef(null), 2000)
    }
  }

  return (
    <>
      <div className="w-full 2xl:px-14  px-4 pt-5">
        <Breadcrumbs mainTitle="Vaults" subtitle={vault.name} />
        <div className="grid grid-cols-1 min-[1025px]:grid-cols-4 gap-5 mt-5">
          <div className="min-xl:col-span-3 space-y-6">
            <div className="flex max-lg:flex-col max-lg:items-start items-center justify-between mb-5">
              <div className="flex items-center space-x-4 py-4">
                <Image src={lido} alt="WETH" width={35} height={35} />
                <div>
                  <h2 className="text-base text-white font-bold">{vault.name}</h2>
                  <p className="text-sm text-[#8B8BA0] font-medium">{vault.type}</p>
                </div>
              </div>
              <div className="flex max-lg:w-full max-md:gap-2 flex-wrap gap-4">
                {Object.entries(vault.details)?.map(([key, value]) => (
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
                      height={16}
                      width={16}
                      src={copyicon}
                      alt="Copy"
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
              <p className="text-[#FFFFFF] flex items-center tracking-normal px-2 font-normal text-sm align-middle my-2 opacity-80">
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
                    height={16}
                    width={16}
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
        <TabsVaultsDetails />
      </div>
    </>
  )
}
