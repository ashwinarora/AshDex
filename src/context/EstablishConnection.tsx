'use client'
import { QueryObserverResult, RefetchOptions, useQuery } from '@tanstack/react-query'
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect
} from 'react'
import { useConnection } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useTradingAccount } from '@/hooks/useTradingAccount'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import dynamic from 'next/dynamic'
import { BUILDER_ADDRESS } from '@/utils/constants'
import { treasuryAgentStatus, type TreasuryAgentStatus } from '@/utils/treasury/agentStatus'
import { treasuryPageHref } from '@/utils/treasury/route'

// Treasury orders carry no builder field, so there is no fee to approve.
// Reported as non-zero so the existing `currentFeeApproval === 0` gates pass.
const TREASURY_FEE_APPROVAL_NOT_NEEDED = 1
// How often treasury mode re-reads extraAgents, to notice expiry and removal.
const TREASURY_AGENTS_REFETCH_MS = 30_000

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
  isModalOpen: boolean
  currentFeeApproval: number
  refetchCurrentFeeApproval: (
    options?: RefetchOptions | undefined
  ) => Promise<QueryObserverResult<number, Error>>
  openDepositModal: () => void
  closeDepositModal: () => void
  isDepositModalOpen: boolean
  /** Treasury mode only (`null` in wallet mode): this browser's agent for the treasury. */
  treasuryStatus: TreasuryAgentStatus | null
  refetchTreasuryAgents: () => Promise<unknown>
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined)

export const EstablishConnectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const { isConnected } = useConnection()
  const { address, mode, treasury } = useTradingAccount()
  const isTreasury = mode === 'treasury'
  const router = useRouter()
  const { agentWallet, sdkInfoClient, treasuryAgent, cacheTreasuryAgentValidUntil } =
    useHyperliquidStore(
      useShallow((state) => ({
        agentWallet: state.agentWallet,
        sdkInfoClient: state.sdkInfoClient,
        treasuryAgent: state.treasuryAgent,
        cacheTreasuryAgentValidUntil: state.cacheTreasuryAgentValidUntil
      }))
    )

  // Treasury mode: "connected" means this browser's key is listed in
  // extraAgents(treasury) and not expired. There is no modal to open.
  const { data: treasuryAgents, refetch: refetchTreasuryAgents } = useQuery({
    queryKey: ['treasuryExtraAgents', address],
    queryFn: () => sdkInfoClient!.extraAgents({ user: address! }),
    enabled: isTreasury && !!sdkInfoClient && !!address,
    refetchInterval: TREASURY_AGENTS_REFETCH_MS,
    refetchOnWindowFocus: true
  })
  const treasuryStatus: TreasuryAgentStatus | null = isTreasury
    ? treasuryAgents
      ? treasuryAgentStatus({
          keyAddress: treasuryAgent?.address,
          cachedValidUntil: treasuryAgent?.validUntil,
          extraAgents: treasuryAgents,
          now: Date.now()
        })
      : treasuryAgent
        ? { status: 'pending' }
        : { status: 'noKey' }
    : null
  const readyValidUntil = treasuryStatus?.status === 'ready' ? treasuryStatus.validUntil : null
  useEffect(() => {
    if (readyValidUntil != null) cacheTreasuryAgentValidUntil(readyValidUntil)
  }, [readyValidUntil, cacheTreasuryAgentValidUntil])

  const { data: walletAgentApproved, refetch: refetchAgentApproval } = useQuery({
    queryKey: ['extraAgents', address, agentWallet],
    queryFn: async () => {
      if (!address) return false
      if (!sdkInfoClient) return false
      const extraAgents = await sdkInfoClient.extraAgents({
        user: address
      })
      const isAgentApproved = extraAgents.some(
        (agent) => agent.address.toLowerCase() === agentWallet?.address.toLowerCase()
      )
      return isAgentApproved
    },
    enabled: !isTreasury && isConnected && !!sdkInfoClient && !!agentWallet && !!address,
    initialData: false
  })
  const isAgentApproved = isTreasury
    ? !!agentWallet && treasuryStatus?.status === 'ready'
    : walletAgentApproved

  const { data: walletFeeApproval, refetch: refetchCurrentFeeApproval } = useQuery<number>({
    queryKey: ['maxBuilderFee', address, BUILDER_ADDRESS],
    queryFn: async () => {
      if (!address) return 0
      if (!sdkInfoClient) return 0
      if (!BUILDER_ADDRESS) return 0
      const response = await sdkInfoClient?.maxBuilderFee({
        user: address,
        builder: BUILDER_ADDRESS
      })
      return response
    },
    enabled: !isTreasury && isConnected && !!sdkInfoClient && !!agentWallet && isAgentApproved,
    initialData: 0
  })
  const currentFeeApproval = isTreasury ? TREASURY_FEE_APPROVAL_NOT_NEEDED : walletFeeApproval

  const closeModal = useCallback(() => setIsModalOpen(false), [])
  // In treasury mode the agent is approved by the co-signers in hl-tools, so
  // "establish connection" sends the user to the treasury setup page instead.
  const openModal = useCallback(() => {
    if (treasury) router.push(treasuryPageHref(treasury.network, treasury.address))
    else setIsModalOpen(true)
  }, [treasury, router])
  const openDepositModal = useCallback(() => setIsDepositModalOpen(true), [])
  const closeDepositModal = useCallback(() => setIsDepositModalOpen(false), [])

  return (
    <ConnectionContext.Provider
      value={{
        closeModal,
        openModal,
        refetchAgentApproval,
        isAgentApproved,
        currentFeeApproval,
        isModalOpen,
        refetchCurrentFeeApproval,
        isDepositModalOpen,
        openDepositModal,
        closeDepositModal,
        treasuryStatus,
        refetchTreasuryAgents
      }}
    >
      {isModalOpen && !isTreasury && <EstablishConnectionModal />}
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
