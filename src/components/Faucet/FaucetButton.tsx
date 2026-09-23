'use client'

import { useState } from 'react'
import { IconDroplet } from '@tabler/icons-react'
import { isTestnet } from '@/utils/constants'
import { Button } from '../ui/button'
import FaucetModal from './FaucetModal'

/**
 * Header entry point for the testnet faucet. Renders nothing on the mainnet
 * deployment — there is no mainnet drip to claim.
 */
const FaucetButton = () => {
  const [isOpen, setIsOpen] = useState(false)

  if (!isTestnet) return null

  return (
    <>
      <Button
        className="flex items-center gap-2 text-xs text-white"
        variant={'outline'}
        size={'sm'}
        onClick={() => setIsOpen(true)}
        title="Claim testnet USDC"
        data-testid="faucet-button"
      >
        <IconDroplet className="size-4" />
        <span className="max-md:hidden">{'Faucet'}</span>
      </Button>
      <FaucetModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

export default FaucetButton
