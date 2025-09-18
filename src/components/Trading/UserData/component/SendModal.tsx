import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { useAccount } from 'wagmi'
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
import { isAddress, isHex } from 'viem'
import { ApiRequestError } from '@nktkas/hyperliquid'
import { useTranslate } from '@tolgee/react'
import { cn } from '@/lib/utils'
import useUserStore from '@/store/userStore'

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
  const { t } = useTranslate()
  const [destination, setDestination] = useState('')
  const [isPerp, setIsPerp] = useState(spotDefaultName ? false : true)
  const [selectedToken, setSelectedToken] = useState(spotDefaultName || 'USDC')
  const [amount, setAmount] = useState('')
  const { chainId } = useAccount()
  const { clearingHouseState, spotState, sdkUserSignerClient } = useHyperliquidStore(
    useShallow((state) => ({
      clearingHouseState: state.clearingHouseState,
      spotState: state.spotState,
      sdkUserSignerClient: state.sdkUserSignerClient
    }))
  )
  const { data: spotMeta } = useSpotMeta()
  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
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

  const handleSend = async () => {
    if (!chainId) return
    if (!sdkUserSignerClient) return
    if (!isAddress(destination)) {
      toast.error(t('Destination must be a valid hex address'))
      return
    }
    const toastId = toast.loading(t('Sending...'))
    if (isPerp) {
      try {
        await sdkUserSignerClient.usdSend({
          destination: destination,
          amount: amount
        })
        onClose()
        toast.success(t('Send successful'), {
          id: toastId
        })
      } catch (error) {
        console.log(error)
        onClose()
        if (error instanceof ApiRequestError) {
          toast.error(`${t('Send failed.')} ${error.message}`, {
            id: toastId
          })
        } else {
          toast.error(t('Send failed.'), {
            id: toastId
          })
        }
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
        toast.success(t('Send successful'), {
          id: toastId
        })
      } catch (error) {
        console.log(error)
        onClose()
        if (error instanceof ApiRequestError) {
          toast.error(`${t('Send failed.')} ${error.message}`, {
            id: toastId
          })
        } else {
          toast.error(t('Send failed.'), {
            id: toastId
          })
        }
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
            <h1 className="text-xs">{t('Send')}</h1>
            <IconSend className="size-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Send Tokens')}</DialogTitle>
          <DialogDescription>{t('Send tokens to another account on Nexon')}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 w-full items-end">
            <div className={cn('flex-1 flex flex-col gap-2')}>
              <h1 className="text-xs text-white/50">{t('Destination Address')}</h1>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className={cn(
                  'h-10 text-start placeholder:text-white/50 text-white',
                  isRTL && 'text-end'
                )}
                placeholder={t('Address (0x...)')}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-32">
                  {isPerp ? t('Perps Account') : t('Spot Account')}
                  <IconChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align="end">
                <DropdownMenuItem onClick={() => setIsPerp(true)}>
                  {t('Perps Account')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPerp(false)}>
                  {t('Spot Account')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div
            className={cn('flex items-center justify-between -mb-2', isRTL && 'flex-row-reverse')}
          >
            <h1 className="text-xs text-white/50">{t('Amount')}</h1>
            <Button
              variant="link"
              className={cn(
                'text-accent-foreground h-fit text-xs p-0',
                isRTL && 'flex-row-reverse'
              )}
              onClick={() => setAmount(maxAmount.toString())}
            >
              {`${t('Use Max')} (${Number(maxAmount).toFixed(4)} ${isPerp ? 'USDC' : selectedToken.split('(')[0]})}`}
            </Button>
          </div>
          <div className="flex gap-2 w-full items-end">
            <div className={cn('flex-1 flex flex-col gap-1', isRTL && 'flex-row-reverse')}>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(
                  'h-10 text-start placeholder:text-white/50 text-white',
                  isRTL && 'text-end'
                )}
                placeholder={t('Amount')}
                type="number"
                min="0"
                max={maxAmount}
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
                    <p className="text-xs text-white/50">
                      {Number(token.total) - Number(token.hold)} {token.coin}
                    </p>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            className={cn('mt-2', isRTL && 'flex-row-reverse')}
            disabled={
              !destination || !amount || Number(amount) <= 0 || Number(amount) > Number(maxAmount)
            }
            onClick={handleSend}
          >
            {t('Send')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SendModal
