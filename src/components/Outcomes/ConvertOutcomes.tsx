'use client'
import { useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Separator } from '@/components/ui/separator'
import { IconWallet, IconLoader2 } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { toastSdkError } from '@/lib/toastSdkError'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useWalletModal } from '@/context/WalletModalContext'
import { useAgentApproval } from '@/context/EstablishConnection'
import { quoteAvailable, sideAvailable } from '@/utils/outcomes/positions'
import type { ResolvedOutcomeMeta } from '@/utils/outcomes/template'
import type { ResolvedOutcome } from '@/utils/outcomes/types'
import { normalizeDecimalString } from '@/utils/decimalString'
import { formatShares } from './outcomeFormat'

type Mode = 'split' | 'merge' | 'mergeQuestion' | 'negate'

const MODE_LABEL: Record<Mode, string> = {
  split: 'Split Outcome',
  merge: 'Merge Outcome',
  mergeQuestion: 'Merge Question',
  negate: 'Negate Outcome'
}

/**
 * Manual share conversions (HIP-4 `userOutcome` action):
 *  split   X quote        → X Yes + X No of one outcome
 *  merge   X Yes + X No   → X quote
 *  mergeQ  X Yes of every named outcome of a question → X quote
 *  negate  X No of one named outcome → X Yes of every other named outcome
 */
const ConvertOutcomes = ({
  outcome,
  resolved
}: {
  outcome: ResolvedOutcome
  resolved: ResolvedOutcomeMeta
}) => {
  const { isConnected } = useConnection()
  const { openConnectWalletModal } = useWalletModal()
  const { isAgentApproved, currentFeeApproval, openModal: openAgentModal } = useAgentApproval()
  const { sdkL1ActionClient, spotState } = useHyperliquidStore(
    useShallow((s) => ({ sdkL1ActionClient: s.sdkL1ActionClient, spotState: s.spotState }))
  )
  const [mode, setMode] = useState<Mode>('split')
  const [amount, setAmount] = useState('')
  const [pending, setPending] = useState(false)

  const question =
    outcome.questionId !== undefined ? resolved.questions.get(outcome.questionId) : undefined
  const siblings = useMemo(
    () =>
      question
        ? question.outcomeIds
            .map((id) => resolved.outcomes.get(id))
            .filter((o): o is ResolvedOutcome => !!o)
        : [],
    [question, resolved]
  )
  const modes: Mode[] = question
    ? ['split', 'merge', 'mergeQuestion', 'negate']
    : ['split', 'merge']
  const balances = spotState?.balances
  const [yes, no] = outcome.sides

  const max = useMemo(() => {
    switch (mode) {
      case 'split':
        return quoteAvailable(balances, outcome.quoteToken)
      case 'merge':
        return Math.min(
          sideAvailable(balances, yes.balanceCoin),
          sideAvailable(balances, no.balanceCoin)
        )
      case 'mergeQuestion':
        return siblings.length
          ? Math.min(...siblings.map((s) => sideAvailable(balances, s.sides[0].balanceCoin)))
          : 0
      case 'negate':
        return sideAvailable(balances, no.balanceCoin)
    }
  }, [mode, balances, outcome.quoteToken, yes.balanceCoin, no.balanceCoin, siblings])

  const amt = Number(amount)
  const valid = Number.isFinite(amt) && amt > 0 && amt <= max + 1e-9 && !outcome.isFallback

  const description = (() => {
    const a = amount || 'X'
    switch (mode) {
      case 'split':
        return `Convert ${a} ${outcome.quoteToken} into ${a} ${yes.name} and ${a} ${no.name} shares.`
      case 'merge':
        return `Convert ${a} ${yes.name} + ${a} ${no.name} shares into ${a} ${outcome.quoteToken}.`
      case 'mergeQuestion':
        return `Convert ${a} Yes shares of every outcome in this question into ${a} ${outcome.quoteToken}.`
      case 'negate':
        return `Convert ${a} ${no.name} shares of "${outcome.outcomeLabel ?? outcome.title}" into ${a} Yes shares of every other outcome in this question.`
    }
  })()

  const into = (() => {
    const a = amount || '0'
    switch (mode) {
      case 'split':
        return `${a} ${yes.name} + ${a} ${no.name}`
      case 'merge':
      case 'mergeQuestion':
        return `${a} ${outcome.quoteToken}`
      case 'negate':
        return `${a} Yes × ${Math.max(0, siblings.length - 1)} outcomes`
    }
  })()

  const submit = async () => {
    if (!sdkL1ActionClient || !valid) return
    setPending(true)
    const toastId = toast.loading(`${MODE_LABEL[mode]}…`)
    const value = normalizeDecimalString(amount)
    try {
      const params =
        mode === 'split'
          ? { splitOutcome: { outcome: outcome.outcomeId, amount: value } }
          : mode === 'merge'
            ? { mergeOutcome: { outcome: outcome.outcomeId, amount: value } }
            : mode === 'mergeQuestion'
              ? { mergeQuestion: { question: outcome.questionId!, amount: value } }
              : {
                  negateOutcome: {
                    question: outcome.questionId!,
                    outcome: outcome.outcomeId,
                    amount: value
                  }
                }
      await sdkL1ActionClient.userOutcome(params)
      toast.success(`${MODE_LABEL[mode]} complete`, { id: toastId })
      setAmount('')
    } catch (e) {
      toastSdkError(e, `${MODE_LABEL[mode]} failed`, { id: toastId })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-2 w-full" data-testid="convert-outcomes">
      <p className="text-sm font-semibold text-text-1">Convert Outcomes</p>
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(v) => v && setMode(v as Mode)}
        className="flex flex-wrap gap-1 bg-transparent"
      >
        {modes.map((m) => (
          <ToggleGroupItem
            key={m}
            value={m}
            data-testid={`convert-mode-${m}`}
            className="text-xs h-7 px-2 rounded-md bg-white/5 data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
          >
            {MODE_LABEL[m]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-xs text-text-2">{description}</p>
      {outcome.isFallback && (
        <p className="text-xs text-red">Fallback outcomes cannot be converted directly.</p>
      )}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] text-text-3">
          <span>Convert from</span>
          <button
            className="text-primary cursor-pointer"
            onClick={() => setAmount(formatShares(Math.floor(max)))}
          >
            MAX: {formatShares(max)}
          </button>
        </div>
        <Input
          data-testid="convert-amount"
          value={amount}
          onChange={(e) => /^[0-9]*\.?[0-9]*$/.test(e.target.value) && setAmount(e.target.value)}
          placeholder="0"
          className="h-9 text-sm bg-surface-1 border-surface-3"
        />
      </div>
      <Separator />
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-3">Convert into</span>
        <span className="text-text-1" data-testid="convert-into">
          {into}
        </span>
      </div>
      {!isConnected ? (
        <Button onClick={openConnectWalletModal} className="w-full font-semibold">
          <IconWallet className="size-4" /> Connect Wallet
        </Button>
      ) : !isAgentApproved || currentFeeApproval === 0 ? (
        <Button onClick={() => openAgentModal()} className="w-full font-semibold">
          Enable Trading
        </Button>
      ) : (
        <Button
          data-testid="convert-submit"
          onClick={submit}
          disabled={!valid || pending}
          className={cn('w-full font-semibold', !valid && 'bg-white/10')}
        >
          {pending && <IconLoader2 className="size-4 animate-spin" />}
          {MODE_LABEL[mode]}
        </Button>
      )}
    </div>
  )
}

export default ConvertOutcomes
