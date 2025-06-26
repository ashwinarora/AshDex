import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { useToast } from '@/context/ToastContext'
import { HYPERLIQUID_DEPOSIT, USDC_ARBITRUM } from '@/utils/constants'
import { useERC20Data } from '@/hooks/useERC20Data'
import { toHumanNumber, toRealNumber } from '@/utils/utils'
import { IconChevronDown } from '@tabler/icons-react'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogDescription } from '../ui/dialog'
import { Input } from '../ui/input'
import { DropdownMenu, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import Loading from '../common/Loading'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
}

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount()
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState<bigint>(0n)
  const { data: usdc } = useERC20Data(USDC_ARBITRUM)
  const { data: balance } = useReadContract({
    address: USDC_ARBITRUM,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: {
      enabled: !!address
    }
  })
  const { writeContractAsync } = useWriteContract()

  const onDepositClick = async () => {
    if (!usdc) return
    try {
      setIsLoading(true)
      await writeContractAsync({
        address: usdc.address,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [HYPERLIQUID_DEPOSIT, amount]
      })
      setIsLoading(false)
      onClose()
      showToast(
        'success',
        'Deposit confirmed. Balance will update on the next block.',
        `<span className="text-green">Arbiscan Link</span>`
      )
    } catch (error) {
      console.error('Deposit error:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit to Nexon</DialogTitle>
          <DialogDescription>
            Deposit USDC from Arbitrum to Nexon
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (<div className='flex items-center justify-center w-full h-full'>
          <Loading
            title={'Deposit in progress…'}
            subTitle={'You will need to sign this transaction in your wallet:'}
            className="py-[1rem] px-[1rem]"
          />
        </div>) : (<>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <div className='flex items-center justify-between text-xs text-white/50'>
                <p>Amount</p>
                <div className='flex items-center gap-1'>
                  Available to deposit:
                  <Button variant='link' className='text-xs h-fit p-0'>
                    {toHumanNumber(balance ?? 0n, usdc?.decimals, 2)} {'USDC'}
                  </Button>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Input
                  type="text"
                  id="amount"
                  className='text-left flex-1 h-10'
                  value={toHumanNumber(amount, usdc?.decimals, 2) || ''}
                  onChange={(e) => setAmount(toRealNumber(e.target.value, usdc?.decimals))}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild disabled>
                    <Button
                      variant='outline'
                      className='w-fit'
                    >
                      USDC
                      <IconChevronDown className='size-4' />
                    </Button>
                  </DropdownMenuTrigger>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <Separator />
          <Button className='w-full' disabled={!amount || parseFloat(amount.toString()) === 0} onClick={onDepositClick}>
            Deposit
          </Button>
        </>)}
      </DialogContent>
    </Dialog>
  )
}
export default DepositModal
