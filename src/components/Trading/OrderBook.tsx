'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import Image from 'next/image'
import type { WsBook, WsLevel } from '../../utils/hyperliquid/hyperLiquidTypes'
import Filter1 from '../../assets/images/tabler-icon-layout-filled.svg'
import Filter2 from '../../assets/images/tabler-icon-layout-filledAlt.svg'
import Filter3 from '../../assets/images/tabler-icon-layout-filled-mirrored.svg'

import { useHyperliquid } from '@/store/HyperliquidStore'
import { generatePrecisionLabels } from '@/utils/utils'
import { cn } from '@/lib/utils'
import ReactiveText from '../common/ReactiveText'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Skeleton } from '../ui/skeleton'
import { EventL2BookParameters } from '@nktkas/hyperliquid'
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react'

interface IOrderBookProps {
  selectedAsset: string
  layout?: 'horizontal' | 'vertical'
}

const OrderBook = ({ selectedAsset }: IOrderBookProps) => {
  const { sdkSubscriptionClient, allMids } = useHyperliquid()
  const [l2Book, setL2Book] = useState<WsBook>()
  const [isLoading, setIsLoading] = useState(true)
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null)
  const prevPriceRef = useRef<number | null>(null)
  const visibleRows = {
    sells: 9,
    buys: 9
  }
  const [selectedLayoutType, setSelectedLayouttype] = useState<number>(1)
  const [selectedPrecision, setSelectedPrecision] = useState<{ value: string; label: string }>({
    value: '4',
    label: '0.0001'
  })
  const [spread, setSpread] = useState<number>(0.0)
  const [showPriceInUSD, setShowPriceInUSD] = useState<boolean>(false)

  useEffect(() => {
    if (!sdkSubscriptionClient || !selectedAsset) return

    let isMounted = true
    let sub: { unsubscribe: () => void } | null = null

    const nSigFigs = Number(selectedPrecision.value)
    let mantissa = null
    const handler = (data: WsBook) => {
      if (isMounted) {
        setL2Book(data)
        setIsLoading(false)
      }
    }
    setIsLoading(true)
    if (nSigFigs === 5) {
      mantissa = 5
    } else if (nSigFigs === 6) {
      mantissa = 2
    } else if (nSigFigs === 7) {
      mantissa = null
    }

    // Use an async IIFE to use await inside useEffect
    ;(async () => {
      sub = await sdkSubscriptionClient.l2Book(
        {
          coin: selectedAsset,
          nSigFigs: Math.min(nSigFigs, 5) as EventL2BookParameters['nSigFigs'],
          mantissa: mantissa as EventL2BookParameters['mantissa']
        },
        handler
      )
    })()

    // Cleanup
    return () => {
      isMounted = false
      if (sub) {
        sub.unsubscribe()
      }
    }
  }, [sdkSubscriptionClient, selectedAsset, selectedPrecision.value])

  // Initialize precision label when component mounts or asset changes
  useEffect(() => {
    const initialOption = generatePrecisionLabels(Number(allMids[selectedAsset]) || 0).find(
      (option) =>
        (option.value === null ? 'null' : option.value.toString()) === selectedPrecision.value
    )
    if (initialOption) {
      setSelectedPrecision({
        value: initialOption.value?.toString() ?? '0',
        label: initialOption.label
      })
    }
  }, [selectedAsset, allMids, selectedPrecision.value])

  const processOrders = (orders: WsLevel[]) => {
    let runningTotal = 0
    return orders.map((order) => {
      runningTotal += Number(order.sz)
      return { ...order, cumulative: runningTotal }
    })
  }

  const [rawBuys, rawSells] = l2Book?.levels ?? [[], []]

  const barData = useMemo(() => {
    if (selectedLayoutType === 1) {
      return {
        sells: processOrders(rawSells.slice(0, 9)),
        buys: processOrders(rawBuys.slice(0, 9))
      }
    } else if (selectedLayoutType === 2) {
      return { sells: [], buys: processOrders(rawBuys.slice(0, 18)) }
    } else if (selectedLayoutType === 3) {
      return { sells: processOrders(rawSells.slice(0, 18)), buys: [] }
    }
    return { sells: [], buys: [] }
  }, [rawBuys, rawSells, selectedLayoutType])

  console.log('🚀 ~ barData ~ barData:', barData)

  const maxSellCumulative = barData?.sells[barData.sells.length - 1]?.cumulative ?? 0
  const maxBuyCumulative = barData?.buys[barData.buys.length - 1]?.cumulative ?? 0
  const maxCumulative = Math.max(maxSellCumulative, maxBuyCumulative)

  useEffect(() => {
    if (allMids[selectedAsset]) {
      const currentPrice = allMids[selectedAsset]
      if (prevPriceRef.current !== null) {
        if (Number(currentPrice) > Number(prevPriceRef.current)) {
          setPriceChange('up')
        } else if (Number(currentPrice) < Number(prevPriceRef.current)) {
          setPriceChange('down')
        }
      }
      prevPriceRef.current = Number(currentPrice)
    }
  }, [allMids, selectedAsset])

  useEffect(() => {
    const _spread = (Number(rawSells[0]?.px || 0) - Number(rawBuys[0]?.px || 0)).toFixed(8)
    setSpread(Number(_spread))
    return () => {}
  }, [rawBuys, rawSells])

  const handlePrecision = (precision: string, label: string) => {
    setSelectedPrecision({ value: precision, label })
  }

  return (
    <div className="flex flex-col pt-2 gap-2 w-full h-full text-white/50">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-white text-sm font-semibold">Order Book</h1>
        <ToggleGroup
          size={'sm'}
          type="single"
          className="bg-white/5"
          value={selectedLayoutType.toString()}
          onValueChange={(value) => value !== '' && setSelectedLayouttype(Number(value))}
        >
          {[1, 2, 3].map((item) => (
            <ToggleGroupItem
              value={item.toString()}
              key={item}
              className={cn(
                'px-4 py-1 first:rounded-l-md last:rounded-r-md cursor-pointer text-xs font-semibold transition-colors duration-150 focus:outline-none',
                selectedLayoutType === item
                  ? 'bg-primary text-white'
                  : 'bg-transparent text-white/50'
              )}
            >
              <Image
                src={item === 1 ? Filter1 : item === 2 ? Filter2 : Filter3}
                height={12}
                width={12}
                className="size-4"
                alt=""
              />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="flex items-center gap-2 px-2 justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={'sm'}
              className="text-xs w-20 flex items-center justify-start"
              // className="flex items-center gap-1 ml-auto font-medium text-xs align-middle cursor-pointer"
            >
              <p className="text-xs flex-1 w-full">{selectedPrecision.label}</p>
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-20 flex flex-col gap-1" align="end">
            {/* <DropdownMenuItem onClick={() => setIsInputUsd(true)}>
              <p className="text-xs w-10 text-center">USD</p>
            </DropdownMenuItem> */}
            {generatePrecisionLabels(Number(allMids[selectedAsset]) || 0).map((level, index) => (
              <DropdownMenuItem
                className={cn(
                  selectedPrecision.label === level.label
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-transparent text-white/50'
                )}
                key={index}
                onClick={() => handlePrecision(level.value?.toString() ?? '0', level.label)}
              >
                <p className="text-xs w-full text-center">{level.label}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size={'sm'}
              className="text-xs w-20 flex items-center justify-start"
              // className="flex items-center gap-1 ml-auto font-medium text-xs align-middle cursor-pointer"
            >
              <p className="text-xs flex-1 w-full">{showPriceInUSD ? 'USD' : selectedAsset}</p>
              <IconChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-20 flex flex-col gap-1" align="end">
            <DropdownMenuItem
              onClick={() => {
                setShowPriceInUSD(true)
              }}
            >
              <p className="text-xs w-full text-center">USD</p>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setShowPriceInUSD(false)
              }}
            >
              <p className="text-xs w-full text-center">{selectedAsset}</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator orientation="horizontal" />
      <div className="flex items-center justify-between px-2">
        <p className="font-medium text-xs text-left">Price </p>
        <p className="font-medium text-xs text-center flex-1">
          Amount ({showPriceInUSD ? 'USD' : selectedAsset})
        </p>
        <p className="font-medium text-xs text-right">
          Total ({showPriceInUSD ? 'USD' : selectedAsset})
        </p>
      </div>
      <Separator orientation="horizontal" className="bg-white/5 -mb-1" />
      {
        isLoading ? (
          <div className="flex p-2 h-full w-full flex-col gap-1 items-center justify-between">
            {Array(visibleRows.sells)
              .fill(0)
              .map((_, index) => (
                <Skeleton className="px-2 py-1 w-full rounded-none h-full bg-red/20" key={index} />
              ))}
            <Skeleton className="px-2 py-1 w-full rounded-none h-full bg-accent" />
            {Array(visibleRows.buys)
              .fill(0)
              .map((_, index) => (
                <Skeleton
                  className="px-2 py-1 w-full rounded-none h-full bg-green/20"
                  key={index}
                />
              ))}
          </div>
        ) : (
          <div className="w-full h-full rounded-b-md overflow-hidden flex flex-col gap-1 items-center justify-between">
            {barData?.sells
              .sort((a, b) => Number(b.px) - Number(a.px))
              .map((sell, index) => (
                <div className="relative h-full w-full py-1 px-2 flex items-center" key={index}>
                  <div className="flex items-center z-10 w-full justify-between text-sm text-white">
                    <p className="font-medium text-xs text-left flex-1 text-red">{sell.px}</p>
                    <p className="font-medium text-xs">{sell.sz}</p>
                    {showPriceInUSD ? (
                      <ReactiveText
                        precision={0}
                        type="number"
                        className="text-right flex-1 text-xs"
                        value={Number(sell.px) * Number(sell.cumulative)}
                      />
                    ) : (
                      <ReactiveText
                        precision={4}
                        type="number"
                        className="text-right flex-1 text-xs"
                        value={Number(sell.cumulative)}
                      />
                    )}
                  </div>
                  <div className="absolute flex items-center justify-end top-0 z-0 left-0 w-full h-full">
                    <div
                      className="bg-red/20 h-full"
                      style={{ width: `${(sell.cumulative / maxCumulative) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            <div className="flex items-center justify-between px-2 w-full text-xs h-10 bg-accent py-3 z-10">
              <p
                className={cn(
                  'text-sm flex-1 font-semibold flex items-center gap-2',
                  priceChange === 'up'
                    ? 'text-green'
                    : priceChange === 'down'
                      ? 'text-red'
                      : 'text-white'
                )}
              >
                ${allMids[selectedAsset]}
                {priceChange === 'up' ? (
                  <IconChevronDown className="size-4" />
                ) : priceChange === 'down' ? (
                  <IconChevronUp className="size-4" />
                ) : (
                  ''
                )}
              </p>
              <p className="">{isNaN(spread) ? '-' : spread}</p>
              <p className="text-right flex-1">
                {isNaN(spread) || !allMids[selectedAsset]
                  ? '-'
                  : ((Number(spread) / Number(allMids[selectedAsset])) * 100).toFixed(3)}
                %
              </p>
            </div>
            {barData?.buys.map((buy, index) => (
              <div className="relative h-full w-full py-1 px-2 flex items-center" key={index}>
                <div className="flex items-center z-10 w-full justify-between text-sm text-white">
                  <p className="font-medium text-xs text-left flex-1 text-green">{buy.px}</p>
                  <p className="font-medium text-xs">{buy.sz}</p>
                  {showPriceInUSD ? (
                    <ReactiveText
                      precision={0}
                      type="number"
                      className="text-right flex-1 text-xs"
                      value={Number(buy.px) * Number(buy.cumulative)}
                    />
                  ) : (
                    <ReactiveText
                      precision={4}
                      type="number"
                      className="text-right flex-1 text-xs"
                      value={Number(buy.cumulative)}
                    />
                  )}
                </div>
                <div className="absolute last:rounded-b-md flex items-center justify-end top-0 z-0 left-0 w-full h-full">
                  <div
                    className={cn(
                      'bg-green/20 h-full',
                      index === barData?.buys.length - 1 ? 'rounded-b-md' : ''
                    )}
                    style={{ width: `${(buy.cumulative / maxCumulative) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )
        // <div className={cn('flex h-full w-full flex-col gap-1 items-center justify-between overflow-hidden')}>
        //   <div className={cn('flex flex-col gap-1 justify-between h-full w-full', selectedLayoutType === 2 ? 'hidden' : 'block')}>
        //     {barData?.sells.sort((a, b) => Number(b.px) - Number(a.px)).map((sell, index) => (
        //       <div className='relative h-fit py-1 px-2' key={index}>
        //         <div className='flex items-center z-10 justify-between text-sm text-white'>
        //           <p className="font-medium text-xs text-left flex-1">{sell.px}</p>
        //           <p className="font-medium text-xs">{sell.sz}</p>
        //           {showPriceInUSD ? (
        //             <ReactiveText
        //               precision={0}
        //               type="number"
        //               className='text-right flex-1 text-xs'
        //               value={Number(sell.px) * Number(sell.cumulative)}
        //             />
        //           ) : (
        //             <ReactiveText
        //               precision={4}
        //               type="number"
        //               className='text-right flex-1 text-xs'
        //               value={Number(sell.cumulative)}
        //             />
        //           )}
        //         </div>
        //         <div className='absolute flex items-center justify-end top-0 z-0 left-0 w-full h-full'>
        //           <div className='bg-red/20 h-full' style={{ width: `${(sell.cumulative / maxCumulative) * 100}%` }}></div>
        //         </div>
        //       </div>
        //     ))}
        //   </div>
        //   {/* Middle - Fixed Price */}
        //   <div className='flex items-center justify-between px-2 w-full text-xs h-10 bg-accent py-1 z-10'>
        //     <p className={cn('text-sm flex-1 font-semibold flex items-center gap-2', priceChange === 'up' ? 'text-green' : priceChange === 'down' ? 'text-red' : 'text-white')}>
        //       ${allMids[selectedAsset]}
        //       {priceChange === "up" ? <ChevronUpIcon className='size-4' /> : priceChange === 'down' ? <ChevronDownIcon className='size-4' /> : ''}
        //     </p>
        //     <p className=''>{isNaN(spread) ? '-' : spread}</p>
        //     <p className="text-right flex-1">
        //       {isNaN(spread) || !allMids[selectedAsset]
        //         ? '-'
        //         : ((spread / allMids[selectedAsset]) * 100).toFixed(3)}
        //       %
        //     </p>
        //   </div>
        //   <div className={cn('flex flex-col gap-1 rounded-b-md h-full justify-between w-full', selectedLayoutType === 3 ? 'hidden' : 'block')}>
        //     {barData?.buys.map((buy, index) => (
        //       <div className='relative flex-1' key={index}>
        //         <div className='flex last:rounded-b-md items-center z-10 justify-between px-2 text-sm text-white py-1.5'>
        //           <p className="font-medium text-xs text-left flex-1">{buy.px}</p>
        //           <p className="font-medium text-xs">{buy.sz}</p>
        //           {showPriceInUSD ? (
        //             <ReactiveText
        //               precision={0}
        //               type="number"
        //               className='text-right flex-1 text-xs'
        //               value={Number(buy.px) * Number(buy.cumulative)}
        //             />
        //           ) : (
        //             <ReactiveText
        //               precision={4}
        //               type="number"
        //               className='text-right flex-1 text-xs'
        //               value={Number(buy.cumulative)}
        //             />
        //           )}
        //         </div>
        //         <div className='absolute last:rounded-b-md flex items-center justify-end top-0 z-0 left-0 w-full h-full'>
        //           <div className={cn('bg-green/20 h-full', index === barData?.buys.length - 1 ? 'rounded-b-md' : '')} style={{ width: `${(buy.cumulative / maxCumulative) * 100}%` }}></div>
        //         </div>
        //       </div>
        //     ))}
        //   </div>
        // </div>
      }
    </div>

    //   {showTotalColumn && (
    //     <div className="flex justify-between my-1 px-3 py-1 w-full font-medium text-[#E8E0F1]">
    //       <p className="font-medium text-xs text-left">Price </p>
    //       <p className="font-medium text-xs">
    //         Amount ({showPriceInUSD ? 'USD' : getCoinName(selectedAsset)})
    //       </p>
    //       <p className="font-medium text-xs text-right">
    //         Total ({showPriceInUSD ? 'USD' : getCoinName(selectedAsset)})
    //       </p>
    //     </div>
    //   )}

    //   <div className="flex flex-col flex-1 h-full overflow-hidden">
    //     {/* Top - Sells */}
    //     <div
    //       ref={sellsContainerRef}
    //       className={`flex-col no-scrollbar h-full order-2 ${selectedLayoutType === 2 ? 'hidden' : 'flex h-[50%] order-1'}`}
    //     >
    //       {isLoading
    //         ? Array(visibleRows?.sells)
    //             .fill(0)
    //             .map((_, i) => <div key={i}>{renderSkeletonRow(true, i)}</div>)
    //         : (selectedLayoutType !== 3 ? [...sells].reverse() : sells).map((order, index) => {
    //             const pct = maxCumulative ? (order.cumulative / maxCumulative) * 100 : 0
    //             return (
    //               <div
    //                 key={`sell-${index}`}
    //                 className="justify-between grid grid-cols-7 my-[1px] px-3 py-1"
    //                 style={{
    //                   background: `linear-gradient(to left, rgba(239,68,68,0.1) ${pct}%, transparent ${pct}%)`
    //                 }}
    //               >
    //                 <p className="flex col-span-2 font-medium text-red text-xs">{order.px}</p>
    //                 <div className="flex col-span-2 opacity-90 ml-auto text-white text-xs">
    //                   {showPriceInUSD ? (
    //                     <ReactiveText
    //                       precision={0}
    //                       type="number"
    //                       value={Number(order.px) * Number(order.sz)}
    //                     />
    //                   ) : (
    //                     <ReactiveText precision={4} type="number" value={Number(order.sz)} />
    //                   )}
    //                 </div>
    //                 {showTotalColumn && (
    //                   <div className="flex col-span-3 opacity-90 ml-auto text-white text-xs">
    //                     {showPriceInUSD ? (
    //                       <ReactiveText
    //                         precision={0}
    //                         type="number"
    //                         value={Number(order.px) * Number(order.cumulative)}
    //                       />
    //                     ) : (
    //                       <ReactiveText
    //                         precision={4}
    //                         type="number"
    //                         value={Number(order.cumulative)}
    //                       />
    //                     )}
    //                   </div>
    //                 )}
    //               </div>
    //             )
    //           })}
    //     </div>

    //     {/* Middle - Fixed Price */}
    //     {allMids[selectedAsset] && (
    //       <div
    //         className={`z-10 bg-white/5 py-2 my-0.5 pointer-events-none ${selectedLayoutType === 1 ? 'order-2' : 'order-1'}`}
    //       >
    //         <div className="flex justify-between items-center px-3 rounded-md pointer-events-auto">
    //           <p
    //             className={`text-sm font-semibold font-proxima-nova items-center flex ${
    //               priceChange === 'up'
    //                 ? 'text-green'
    //                 : priceChange === 'down'
    //                   ? 'text-red'
    //                   : 'text-white'
    //             }`}
    //           >
    //             ${allMids[selectedAsset]}
    //             {priceChange === 'up' ? (
    //               <IconArrowUp className="inline w-4 h-4" />
    //             ) : (
    //               <IconArrowDown className="inline w-4 h-4" />
    //             )}
    //           </p>
    //           <p>{isNaN(spread) ? '-' : spread}</p>
    //           <p className="text-right">
    //             {isNaN(spread) || !allMids[selectedAsset]
    //               ? '-'
    //               : ((spread / allMids[selectedAsset]) * 100).toFixed(3)}
    //             %
    //           </p>
    //         </div>
    //       </div>
    //     )}

    //     {/* Bottom - Buys */}
    //     <div
    //       ref={buysContainerRef}
    //       className={`flex-col no-scrollbar h-full order-2 ${selectedLayoutType === 3 ? 'hidden' : 'flex h-[50%] order-3'}`}
    //     >
    //       {isLoading
    //         ? Array(visibleRows.buys)
    //             .fill(0)
    //             .map((_, i) => <div key={i}>{renderSkeletonRow(false, i)}</div>)
    //         : buys.map((order, index) => {
    //             const pct = maxCumulative ? (order.cumulative / maxCumulative) * 100 : 0
    //             return (
    //               <div
    //                 key={`buy-${index}`}
    //                 className="justify-between grid grid-cols-7 my-[1px] px-3 py-1"
    //                 style={{
    //                   background: `linear-gradient(to left, rgba(34,197,94,0.1) ${pct}%, transparent ${pct}%)`
    //                 }}
    //               >
    //                 <p className="flex col-span-2 font-medium text-green text-xs">{order.px}</p>
    //                 <div className="flex col-span-2 opacity-90 ml-auto text-white text-xs">
    //                   {showPriceInUSD ? (
    //                     <ReactiveText
    //                       precision={0}
    //                       type="number"
    //                       value={Number(order.px) * Number(order.sz)}
    //                     />
    //                   ) : (
    //                     <ReactiveText precision={4} type="number" value={Number(order.sz)} />
    //                   )}
    //                 </div>
    //                 {showTotalColumn && (
    //                   <div className="flex col-span-3 opacity-90 ml-auto text-white text-xs">
    //                     {showPriceInUSD ? (
    //                       <ReactiveText
    //                         precision={0}
    //                         type="number"
    //                         value={Number(order.cumulative * Number(order.px))}
    //                       />
    //                     ) : (
    //                       <ReactiveText
    //                         precision={4}
    //                         type="number"
    //                         value={Number(order.cumulative)}
    //                       />
    //                     )}
    //                   </div>
    //                 )}
    //               </div>
    //             )
    //           })}
    //     </div>
    //   </div>
    // </div>
  )
}

export default OrderBook
