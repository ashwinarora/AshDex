'use client'
import { QueryObserverResult, RefetchOptions, useQuery } from '@tanstack/react-query'
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useHyperliquid } from '@/store/HyperliquidStore'
import dynamic from 'next/dynamic'
import { BUILDER_ADDRESS } from '@/utils/constants'

const EstablishConnectionModal = dynamic(
  () => import('@/components/EstablishConnectionModal/EstablishConnectionModal'),
  { ssr: false }
)

interface ConnectionContextType {
  closeModal: () => void
  openModal: () => void
  refetchAgentApproval: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<boolean, Error>>
  isAgentApproved: boolean
  currentFeeApproval: number
  refetchCurrentFeeApproval: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<number, Error>>
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined)

export const EstablishConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { agentWallet, sdkInfoClient } = useHyperliquid()

  const { data: isAgentApproved, refetch: refetchAgentApproval } = useQuery({
    queryKey: ['extraAgents'],
    queryFn: async () => {
      if (!address) return false
      if (!sdkInfoClient) return false
      const extraAgents = await sdkInfoClient.extraAgents({
        user: address
      })
      console.log('extraAgents', extraAgents)
      const isAgentApproved = extraAgents.some(
        (agent) => agent.address.toLowerCase() === agentWallet?.address.toLowerCase()
      )
      return isAgentApproved
    },
    enabled: isConnected && !!sdkInfoClient && !!agentWallet,
    initialData: false
  })

  const { data: currentFeeApproval, refetch: refetchCurrentFeeApproval } = useQuery<number>({
    queryKey: ['maxBuilderFee', address, BUILDER_ADDRESS],
    queryFn: async () => {
      if (!address) return 0
      if (!sdkInfoClient) return 0
      if (!BUILDER_ADDRESS) return 0
      const response = await sdkInfoClient?.maxBuilderFee({
        user: address,
        builder: BUILDER_ADDRESS
      })
      console.log('currentFeeApproval', response)
      return response
    },
    enabled: isConnected && !!sdkInfoClient && !!agentWallet && isAgentApproved,
    initialData: 0
  })

  const closeModal = useCallback(() => setIsModalOpen(false), [])
  const openModal = useCallback(() => setIsModalOpen(true), [])

  return (
    <ConnectionContext.Provider
      value={{
        closeModal,
        openModal,
        refetchAgentApproval,
        isAgentApproved,
        currentFeeApproval,
        refetchCurrentFeeApproval
      }}
    >
      {isModalOpen && <EstablishConnectionModal />}
      {children}
    </ConnectionContext.Provider>
  )
}

export const useAgentApproval = (): ConnectionContextType => {
  const context = useContext(ConnectionContext)
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider')
  }
  return context
}
