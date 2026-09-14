import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { useConnection } from 'wagmi'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { IconChevronDown, IconSend } from '@tabler/icons-react'
import { isHex } from 'viem'
import { cn } from '@/lib/utils'
import { toastSdkError } from '@/lib/toastSdkError'
import { validateAddress, validateAmount } from '@/lib/validate'

interface SendModalProps {
  spotDefaultName?: string
  isTriggeredByCustomButton?: boolean
  isOpen: boolean
  onClose: () => void
}

const SendModal: React.FC<SendModalProps> = ({
  spotDefaultName,
  isTriggeredByCustomButton = false,
  isOpen,
  onClose
}) => {
  const [destination, setDestination] = useState('')
  const [isPerp, setIsPerp] = useState(spotDefaultName ? false : true)
  const [selectedToken, setSelectedToken] = useState(spotDefaultName || 'USDC')
  const [amount, setAmount] = useState('')
  const { chainId, address } = useConnection()
  const { clearingHouseState, spotState, sdkUserSignerClient } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      spotState: state.spotState,
      sdkUserSignerClient: state.sdkUserSignerClient
    }))
  )
  const { data: spotMeta } = useSpotMeta()
  const isRTL = false
  const spotData = useMemo(() => {
    const token = spotMeta?.tokens.find((t) => t.name === selectedToken)
    if (!token) return null
    return {
      tokenName: token.name.split('-')[0],
      tokenId: token.tokenId
    }
  }, [spotMeta, selectedToken])

  const maxAmount = useMemo(() => {
    if (isPerp) {
      return clearingHouseState?.withdrawable || 0
    } else {
      const token = spotState?.balances.find((b) => b.coin === selectedToken)
      if (!token) return 0
      return Number(token.total) - Number(token.hold)
    }
  }, [isPerp, clearingHouseState, spotState, spotMeta, selectedToken])

  const destinationValidity = useMemo(() => validateAddress(destination), [destination])
  const isSelfSend = useMemo(() => {
    if (!destinationValidity.ok || !address) return false
    return destinationValidity.checksummed?.toLowerCase() === address.toLowerCase()
  }, [destinationValidity, address])
  const amountValidity = useMemo(
    () => validateAmount(amount, { max: Number(maxAmount) }),
    [amount, maxAmount]
  )

  const handleSend = async () => {
    if (!chainId) return
    if (!sdkUserSignerClient) return
    if (!destinationValidity.ok) {
      toast.error('Destination must be a valid hex address')
      return
    }
    const toastId = toast.loading('Sending...')
    if (isPerp) {
      try {
        await sdkUserSignerClient.usdSend({
          destination: destination,
          amount: amount
        })
        onClose()
        toast.success('Send successful', {
          id: toastId
        })
      } catch (error) {
        onClose()
        toastSdkError(error, 'Send failed', { id: toastId })
      }
    } else {
      if (!spotData) return
      if (!isHex(spotData.tokenId)) return
      try {
        await sdkUserSignerClient.spotSend({
          destination: destination,
          amount: amount,
          token: `${spotData.tokenName}:${spotData.tokenId}`
        })
        toast.success('Send successful', {
          id: toastId
        })
      } catch (error) {
        onClose()
        toastSdkError(error, 'Send failed', { id: toastId })
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        {!isTriggeredByCustomButton && (
          <Button
            variant="link"
            className="text-accent-foreground !p-0 h-fit w-full flex items-center gap-1 justify-end"
          >
            <h1 className="text-xs">{'Send'}</h1>
            <IconSend className="size-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{'Send Tokens'}</DialogTitle>
          <DialogDescription>{'Send tokens to another account on AshDex'}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 w-full items-end">
            <div className={cn('flex-1 flex flex-col gap-2')}>
              <h1 className="text-xs text-white/70">{'Destination Address'}</h1>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className={cn(
                  'h-10 text-start placeholder:text-white/70 text-white',
                  isRTL && 'text-end'
                )}
                placeholder={'Address (0x...)'}
                data-testid="send-address"
              />
              {/*
                Two inline warnings:
                  1. malformed address (only after they've typed something)
                  2. self-send — a common way to lose funds if the user
                     confused their own address with a friend's.
              */}
              {destination && !destinationValidity.ok && (
                <p className="text-red text-xs" data-testid="send-address-error">
                  {'Not a valid EVM address.'}
                </p>
              )}
              {isSelfSend && (
                <p className="text-yellow-500 text-xs" data-testid="send-self-warning">
                  {'This address is your own connected wallet.'}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-32">
                  {isPerp ? 'Perps Account' : 'Spot Account'}
                  <IconChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align="end">
                <DropdownMenuItem onClick={() => setIsPerp(true)}>
                  {'Perps Account'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPerp(false)}>
                  {'Spot Account'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div
            className={cn('flex items-center justify-between -mb-2', isRTL && 'flex-row-reverse')}
          >
            <h1 className="text-xs text-white/70">{'Amount'}</h1>
            <Button
              variant="link"
              className={cn(
                'text-accent-foreground h-fit text-xs p-0',
                isRTL && 'flex-row-reverse'
              )}
              onClick={() => setAmount(maxAmount.toString())}
            >
              {`${'Use Max'} (${Number(maxAmount).toFixed(4)} ${isPerp ? 'USDC' : selectedToken.split('(')[0]})`}
            </Button>
          </div>
          <div className="flex gap-2 w-full items-end">
            <div className={cn('flex-1 flex flex-col gap-1', isRTL && 'flex-row-reverse')}>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(
                  'h-10 text-start placeholder:text-white/70 text-white',
                  isRTL && 'text-end'
                )}
                placeholder={'Amount'}
                type="number"
                min="0"
                max={maxAmount}
                data-testid="send-amount"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger disabled={isPerp} asChild>
                <Button variant="outline" className={cn('w-24', isRTL && 'flex-row-reverse')}>
                  {isPerp ? 'USDC' : selectedToken.split('(')[0]}
                  <IconChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align="end">
                {spotState?.balances.map((token) => (
                  <DropdownMenuItem
                    key={token.coin}
                    className="flex items-center justify-between w-full"
                    onClick={() => setSelectedToken(token.coin)}
                  >
                    <h1 className="text-sm text-white">{token.coin}</h1>
                    <p className="text-xs text-white/70">
                      {Number(token.total) - Number(token.hold)} {token.coin}
                    </p>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            className={cn('mt-2', isRTL && 'flex-row-reverse')}
            disabled={!destinationValidity.ok || !amountValidity.ok}
            onClick={handleSend}
            data-testid="send-submit"
          >
            {'Send'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SendModal
