'use client'
import React from 'react'
import Image from 'next/image'
import { VAULT_ACTION_OPTIONS } from '@/utils/constants'

interface VaultActionButtonsProps {
  isDepositsDisabled: boolean
  isAutoCloseWithdraw: boolean
  handleVaultAction: (actionKey: string | null) => void
  activeVaultAction?: string | null
}

export default function VaultActionButtons({
  isDepositsDisabled,
  isAutoCloseWithdraw,
  handleVaultAction,
  activeVaultAction
}: VaultActionButtonsProps) {
  const getVaultActionLabel = (
    actionKey: string,
    label: string,
    isDepositsDisabled: boolean,
    isAutoCloseWithdraw: boolean
  ): string => {
    switch (actionKey) {
      case 'disableDeposits':
        return isDepositsDisabled ? 'Enable Deposits' : 'Disable Deposits'
      case 'enableAutoClose':
        return isAutoCloseWithdraw
          ? 'Disable Auto-Close on Withdraw'
          : 'Enable Auto-Close on Withdraw'
      default:
        return label
    }
  }

  return (
    <>
      {VAULT_ACTION_OPTIONS?.map((action) => {
        const dynamicLabel = getVaultActionLabel(
          action?.key,
          action?.label,
          isDepositsDisabled,
          isAutoCloseWithdraw
        )
        return (
          <button
            key={action?.key}
            className={`w-full max-lg:text-sm text-base font-medium cursor-pointer text-start flex rounded-xl items-center gap-x-2.5 max-lg:px-2 px-4 py-2 ${
              action?.key === activeVaultAction ? 'bg-white/10' : ''
            } ${'textColor' in action ? action?.textColor : 'text-[#E8E0F1]'} hover:bg-white/10`}
            onClick={(e) => {
              e.stopPropagation()
              handleVaultAction(action?.key)
            }}
          >
            <Image src={action?.icon} alt={dynamicLabel} style={{ width: 15, height: 'auto' }} />
            {dynamicLabel}
          </button>
        )
      })}
    </>
  )
}
