import React from 'react'

import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import Image from 'next/image'
import lido from '../../../assets/images/lido.svg'
import vaultsDetailsData from '@/utils/VaultDetails.json'
import { ValutsDetailsCard } from '@/components/Vault/ValutsDetailsCard'
import { PerformanceCard } from '@/components/Vault/PerformanceCard'

export interface PerformanceItem {
  value: string
  changeProfit?: string
  changeLost?: string
  period?: string
}

export default function VaultDetails() {
  const { vault, performance } = vaultsDetailsData
  return (
    <>
      <div className="w-full lg:px-14 md:px-10 px-4 bg-[#0d021f] pt-5">
        <Breadcrumbs mainTitle="Vaults" subtitle="WETH" />
        <div className="grid md:grid-cols-4 gap-5 mt-5">
          <div className="md:col-span-3 space-y-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-4 py-4">
                <Image src={lido} alt="WETH" width={35} height={35} />
                <div>
                  <h2 className="text-base text-white font-bold">{vault.name}</h2>
                  <p className="text-sm text-[#8B8BA0] font-medium">{vault.type}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                {Object.entries(vault.details)?.map(([key, value]) => (
                  <ValutsDetailsCard key={key} title={key} value={value} />
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-b pb-5 from-white/5 to-gray-600/5 p-4 rounded-xl">
              <h3 className="text-xl pt-1 pb-3 px-2 text-white font-bold">Performance</h3>
              <div className="grid 2xl:grid-cols-5 xl:grid-cols-4 lg:grid-cols-3 grid-cols-2 px-2 flex-wrap gap-3">
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
                {/* {supplyInfo?.map((item, index) => {
                              return (
                                <div
                                  key={index}
                                  className="bg-gradient-to-b px-5 w-[227px] text-center from-white/5 via-gray-400/5 border-2 border-white/10 backdrop-blur-[48px] p-4 rounded-xl"
                                >
                                  <div className="flex justify-start items-center mb-1.5 gap-x-1">
                                    <p className="text-[#8B8BA0] text-sm font-medium">{item?.label}</p>
                                    <Image
                                      className="opacity-80 cursor-pointer"
                                      src={infoicon}
                                      alt="infoicon"
                                      width={15}
                                      height={15}
                                    />
                                  </div>
                                  <p className="text-white flex items-center justify-start font-medium text-xl">
                                    {item?.value}
                                    {item?.difference && (
                                      <span className="px-[5px] ml-3 rounded-[8px] text-xs font-medium text-[#FFFFFF] py-[2px] bg-[#1F1F30]">
                                        {item?.difference}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              )
                            })} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
