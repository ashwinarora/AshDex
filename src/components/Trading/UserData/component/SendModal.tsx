import React, { useMemo, useState } from 'react'
import { useHyperliquid } from '@/store/HyperliquidStore'
import { toast } from 'react-toastify'
import { getUsdSendPayload } from '@/utils/hyperliquid/UsdSend'
import { isTestnet } from '@/utils/constants'
import { hyperliquidAxios } from '@/config/axios'
import { splitSignature } from '@/utils/utils'
import { useAccount, useSignTypedData } from 'wagmi'
import { getSpotSendPayload } from '@/utils/hyperliquid/SpotSend'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { IconChevronDown, IconSend } from '@tabler/icons-react'

interface SendModalProps {
  spotDefaultName?: string
}

const SendModal: React.FC<SendModalProps> = ({ spotDefaultName }) => {
  const [destination, setDestination] = useState('')
  const [isPerp, setIsPerp] = useState(spotDefaultName ? false : true)
  const [selectedToken, setSelectedToken] = useState(spotDefaultName || 'USDC')
  const [amount, setAmount] = useState('')
  const { chainId } = useAccount()
  const { clearingHouseState, spotState } = useHyperliquid()
  const { signTypedDataAsync } = useSignTypedData()
  const { data: spotMeta } = useSpotMeta()

  const spotData = useMemo(() => {
    // HACK: SpotMeta has USDC-SPOT, but spotState has USDC. So we need to use USDC-SPOT here.
    const tokenName = selectedToken === 'USDC' ? 'USDC-SPOT' : selectedToken
    const token = spotMeta?.tokens.find((t) => t.name === tokenName)
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='link' className='text-accent-foreground !p-0 h-fit w-full flex items-center gap-1 justify-end'>
          <h1 className='text-xs'>Send</h1>
          <IconSend className='size-3' />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Tokens</DialogTitle>
          <DialogDescription>Send tokens to another account on Nexon</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className='flex gap-2 w-full items-end'>
            <div className='flex-1 flex flex-col gap-2'>
              <h1 className='text-xs text-white/50'>Destination Address</h1>
              <Input value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className='h-10 text-left placeholder:text-white/50 text-white'
                placeholder="Address (0x...)" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='w-32'>
                  {isPerp ? 'Perps Account' : 'Spot Account'}
                  <IconChevronDown className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-40' align='end'>
                <DropdownMenuItem onClick={() => setIsPerp(true)}>Perps Account</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPerp(false)}>Spot Account</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
          <div className='flex items-center justify-between -mb-2'>
            <h1 className='text-xs text-white/50'>Amount</h1>
            <Button
              variant='link'
              className='text-accent-foreground h-fit text-xs p-0'
              onClick={() => setAmount(maxAmount.toString())}
            >
              Use Max ({Number(maxAmount).toFixed(4)} {isPerp ? 'USDC' : selectedToken.split('(')[0]})
            </Button>
          </div>
          <div className='flex gap-2 w-full items-end'>
            <div className='flex-1 flex flex-col gap-1'>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className='h-10 text-left placeholder:text-white/50 text-white'
                placeholder="Amount"
                type="number"
                min="0"
                max={maxAmount}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger disabled={isPerp} asChild>
                <Button variant='outline' className='w-24'>
                  {isPerp ? 'USDC' : selectedToken.split('(')[0]}
                  <IconChevronDown className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-40' align='end'>
                {spotState?.balances.map((token) => (
                  <DropdownMenuItem key={token.coin} className='flex items-center justify-between w-full' onClick={() => setSelectedToken(token.coin)}>
                    <h1 className='text-sm text-white'>{token.coin}</h1>
                    <p className='text-xs text-white/50'>{Number(token.total) - Number(token.hold)} {token.coin}</p>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
          className='mt-2'
            disabled={
              !destination || !amount || Number(amount) <= 0 || Number(amount) > Number(maxAmount)
            }
            onClick={async () => {
              if (!chainId) return
              const toastId = toast.loading('Sending...')
              if (isPerp) {
                try {
                  const payload = getUsdSendPayload({
                    destination: destination,
                    amount: amount,
                    chainId: chainId,
                    isTestnet: isTestnet,
                    nonce: Date.now()
                  })
                  const sign = await signTypedDataAsync(payload)
                  const body = {
                    action: payload.message,
                    nonce: payload.message.time,
                    signature: splitSignature(sign)
                  }
                  const res = await hyperliquidAxios.post('/exchange', body)
                  if (res.data.status === 'err') {
                    toast.update(toastId, {
                      render: '❌' + res.data.response,
                      type: 'error',
                      isLoading: false,
                      autoClose: 4000
                    })
                    return
                  }
                  toast.update(toastId, {
                    render: '✅ Send successful',
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000
                  })
                } catch (error) {
                  console.log(error)
                  toast.update(toastId, {
                    render: '❌ Send failed',
                    type: 'error',
                    isLoading: false,
                    autoClose: 4000
                  })
                }
              } else {
                if (!spotData) return
                try {
                  const payload = getSpotSendPayload({
                    destination: destination,
                    amount: amount,
                    chainId: chainId,
                    isTestnet: isTestnet,
                    nonce: Date.now(),
                    tokenName: spotData.tokenName,
                    tokenId: spotData.tokenId
                  })
                  const sign = await signTypedDataAsync(payload)
                  const body = {
                    action: payload.message,
                    nonce: payload.message.time,
                    signature: splitSignature(sign)
                  }
                  const res = await hyperliquidAxios.post('/exchange', body)
                  if (res.data.status === 'err') {
                    toast.update(toastId, {
                      render: '❌' + res.data.response,
                      type: 'error',
                      isLoading: false,
                      autoClose: 4000
                    })
                    return
                  }
                  toast.update(toastId, {
                    render: '✅ Send successful',
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000
                  })
                } catch (error) {
                  console.log(error)
                  toast.update(toastId, {
                    render: '❌ Send failed',
                    type: 'error',
                    isLoading: false,
                    autoClose: 4000
                  })
                }
              }
            }}
          >
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SendModal
