'use client'
import { QueryObserverResult, RefetchOptions, useQuery } from '@tanstack/react-query'
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { useHyperLiquid } from './HyperLiquid'
import { IExtraAgent } from '@/utils/hyperliquid/hyperLiquidTypes'
import dynamic from 'next/dynamic'

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
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined)

export const EstablishConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { hyperliquidAxios, agentWallet } = useHyperLiquid()

  const { data: isAgentApproved, refetch: refetchAgentApproval } = useQuery({
    queryKey: ['extraAgents', 'new'],
    queryFn: async () => {
      const response = await hyperliquidAxios.post('/info', {
        type: 'extraAgents',
        user: address
      })
      const extraAgents = response.data as IExtraAgent[]
      const isAgentApproved = extraAgents.some(
        (agent) => agent.address.toLowerCase() === agentWallet?.address.toLowerCase()
      )
      return isAgentApproved
    },
    enabled: isConnected && !!hyperliquidAxios && !!agentWallet,
    initialData: false
  })

  console.log('asdfasdf', isAgentApproved)

  return (
    <ConnectionContext.Provider
      value={{
        closeModal: () => setIsModalOpen(false),
        openModal: () => setIsModalOpen(true),
        refetchAgentApproval,
        isAgentApproved
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
