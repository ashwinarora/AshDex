'use client'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import Chart from '@/components/Trading/Chart/Chart'
import ChartHeader from '@/components/Trading/Chart/ChartHeader'
import OrderBook from '@/components/Trading/OrderBook'
import UserData from '@/components/UserData/UserData'
import OverviewBox from '@/components/Trading/OverviewBox'
import FooterCompact from '@/components/FooterCompact'
import { useChartUIStore } from '@/store/ChartUIStore'
import { useScreenSize } from '@/hooks/useScreenSize'
import type { ResolvedOutcomeMeta } from '@/utils/outcomes/template'
import type { ResolvedOutcome } from '@/utils/outcomes/types'
import OutcomeHeader from './OutcomeHeader'
import OutcomeOrderBox from './OutcomeOrderBox'
import OutcomeProbabilityChart from './OutcomeProbabilityChart'
import DeployerDisclaimerModal from './DeployerDisclaimerModal'

type Props = { outcome: ResolvedOutcome; side: 0 | 1; resolved: ResolvedOutcomeMeta }

const OutcomeTrading = ({ outcome, side, resolved }: Props) => {
  const selectedInterval = useChartUIStore((s) => s.selectedInterval)
  const { isDesktop } = useScreenSize()
  const [chartTab, setChartTab] = useState<'candles' | 'outcomes'>('candles')
  const coin = outcome.sides[side].coin
  const sideName = outcome.sides[side].name

  const probabilitySeries = useMemo(() => {
    if (outcome.questionId !== undefined) {
      const q = resolved.questions.get(outcome.questionId)
      return (q?.outcomeIds ?? [])
        .map((id) => resolved.outcomes.get(id))
        .filter((o): o is ResolvedOutcome => !!o)
        .map((o) => ({ coin: o.sides[0].coin, label: o.outcomeLabel ?? o.title }))
    }
    return outcome.sides.map((s) => ({ coin: s.coin, label: s.name }))
  }, [outcome, resolved])

  const chartPanel = (
    <div className="w-full h-full flex flex-col gap-1">
      <div className="flex items-center gap-1 px-1">
        {(['candles', 'outcomes'] as const).map((t) => (
          <button
            key={t}
            data-testid={`outcome-chart-tab-${t}`}
            onClick={() => setChartTab(t)}
            className={cn(
              'text-xs px-3 py-1.5 border-b-2 cursor-pointer',
              chartTab === t
                ? 'border-primary text-text-1'
                : 'border-transparent text-text-3 hover:text-text-1'
            )}
          >
            {t === 'candles' ? 'Candles' : 'Outcomes'}
          </button>
        ))}
      </div>
      {chartTab === 'candles' ? (
        <>
          <ChartHeader />
          <Chart selectedAsset={coin} selectedInterval={selectedInterval} />
        </>
      ) : (
        <OutcomeProbabilityChart series={probabilitySeries} />
      )}
    </div>
  )

  if (!isDesktop) {
    return (
      <div className="flex flex-col gap-1 p-1 mb-12 w-full">
        <DeployerDisclaimerModal venue={outcome.venue} />
        <OutcomeHeader outcome={outcome} side={side} resolved={resolved} />
        <div className="h-[420px]">{chartPanel}</div>
        <div className="flex flex-col md:flex-row gap-1">
          <div className="md:w-1/2 h-[520px]">
            <OrderBook selectedAsset={coin} isRTL={false} assetLabel={sideName} />
          </div>
          <div className="md:w-1/2 h-[560px]">
            <OutcomeOrderBox outcome={outcome} side={side} resolved={resolved} />
          </div>
        </div>
        <div className="h-96">
          <UserData />
        </div>
        <OverviewBox isRTL={false} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 p-1 mb-8 h-[130vh] w-full">
      <DeployerDisclaimerModal venue={outcome.venue} />
      <div className="h-[680px] 2xl:h-7/12 shrink-0 w-full flex items-start gap-1">
        <div className="w-full h-full flex-2 flex flex-col gap-1">
          <OutcomeHeader outcome={outcome} side={side} resolved={resolved} />
          {chartPanel}
        </div>
        <div className="w-72 shrink-0 2xl:w-96 h-full">
          <OrderBook selectedAsset={coin} isRTL={false} assetLabel={sideName} />
        </div>
        <div className="w-80 shrink-0 2xl:w-96 h-full">
          <OutcomeOrderBox outcome={outcome} side={side} resolved={resolved} />
        </div>
      </div>
      <div className="h-full 2xl:h-5/12 flex-1 w-full mb-1 flex items-start gap-1">
        <div className="w-full h-full">
          <UserData />
        </div>
        <div className="shrink-0 h-full w-80 2xl:w-96">
          <OverviewBox isRTL={false} />
        </div>
      </div>
      <FooterCompact />
    </div>
  )
}

export default OutcomeTrading
