'use client'
import { useEffect, useRef, useState } from 'react'
import Chart from './Chart/Chart'
import OrderBook from './OrderBook'
import PlaceOrder from './PlaceOrderBox'
import UserData from './UserData/UserData'
import FavoriteStrip from '../FavoriteStrip/FavoriteStrip'
import useIsSpot from '@/hooks/useIsSpot'
import OverviewBox from './OverviewBox'
import PerpsSelector from './Selector/PerpsSelector'
import SpotSelector from './Selector/SpotSelector'
import { useScreenSize } from '@/hooks/useScreenSize'
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group'
import FooterCompact from '../FooterCompact'
import { Drawer, DrawerContent } from '../ui/drawer'
import { IconTransform, IconUserBitcoin } from '@tabler/icons-react'
import { Separator } from '../ui/separator'
import clsx from 'clsx'
import useUserStore from '@/store/userStore'
import { useTranslate } from '@tolgee/react'
import { Skeleton } from '../ui/skeleton'
import { useHyperliquidStore } from '@/store/HyperliquidStore'
import { useShallow } from 'zustand/react/shallow'
import { useAccount } from 'wagmi'
import { useSpotMeta } from '@/hooks/useSpotMeta'
import { isTestnet } from '@/utils/constants'

interface TradingProps {
  defaultAsset?: string
}

const Trading = ({ defaultAsset }: TradingProps = {}) => {
  const { t } = useTranslate()
  const isSpot = useIsSpot()
  const { address } = useAccount()
  const { spotKeyToName } = useSpotMeta()
  const [selectedAsset, setSelectedAsset] = useState<string>('') // @1035 and @107 is HYPE

  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar-SA')
  const { isTablet, isMobile } = useScreenSize()

  const parentContainerRef = useRef<HTMLDivElement>(null)
  const orderBookRef = useRef<HTMLDivElement>(null)
  const placeOrderRef = useRef<HTMLDivElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [mobileState, setMobileState] = useState<{
    firstToggle: 'chart' | 'orderbook' | 'placeorder'
    secondToggle: 'trade' | 'overview' | ''
  }>({
    firstToggle: 'chart',
    secondToggle: ''
  })

  const { subscribeToActiveAssetData, unsubscribeFromActiveAssetData } = useHyperliquidStore(
    useShallow((state) => ({
      subscribeToActiveAssetData: state.subscribeToActiveAssetData,
      unsubscribeFromActiveAssetData: state.unsubscribeFromActiveAssetData
    }))
  )

  useEffect(() => {
    if (!address || !selectedAsset) return
    subscribeToActiveAssetData(address, selectedAsset)
    return () => {
      unsubscribeFromActiveAssetData()
    }
  }, [address, subscribeToActiveAssetData, selectedAsset])

  useEffect(() => {
    setSelectedAsset(
      isSpot
        ? defaultAsset && spotKeyToName.size > 0
          ? spotKeyToName.entries().find(([, value]) => value === defaultAsset)?.[0]
          : isTestnet
            ? '@1035'
            : '@107'
        : defaultAsset
          ? defaultAsset
          : 'BTC'
    )
  }, [defaultAsset, spotKeyToName, isSpot])

  if (isMobile) {
    return (
      <div className="flex relative flex-col gap-1 p-1 mb-12 h-fit w-full">
        {isSpot ? (
          <SpotSelector selectedAsset={selectedAsset} isRTL={isRTL} />
        ) : (
          <PerpsSelector selectedAsset={selectedAsset} isRTL={isRTL} />
        )}
        <FavoriteStrip isRTL={isRTL} />
        <ToggleGroup
          type="single"
          className="w-full h-12 bg-secondary p-1 gap-1"
          value={mobileState.firstToggle}
          onValueChange={(value) => {
            if (value === '') {
              return
            }
            setMobileState({
              ...mobileState,
              firstToggle: value as 'chart' | 'orderbook' | 'placeorder'
            })
          }}
        >
          <ToggleGroupItem className="rounded-l-md bg-white/10 h-full" value="chart">
            <p>{t('Chart')}</p>
          </ToggleGroupItem>
          <ToggleGroupItem className="rounded-r-md h-full bg-white/10" value="orderbook">
            <p>{t('Orderbook')}</p>
          </ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-start justify-center w-full h-96">
          <div
            data-isVisible={mobileState.firstToggle === 'chart'}
            className="[&[data-isVisible='false']]:hidden [&[data-isVisible='true']]:flex w-full h-full flex-col gap-1"
          >
            <Chart selectedAsset={selectedAsset} selectedInterval="30" />
          </div>
          {mobileState.firstToggle === 'orderbook' && (
            <OrderBook selectedAsset={selectedAsset} isRTL={isRTL} />
          )}
        </div>
        <div className="flex items-start justify-center w-full h-96">
          <UserData />
        </div>
        <div className="fixed z-40 bottom-0 left-0 w-full h-12 border-t border-white/10 bg-secondary">
          <ToggleGroup
            type="single"
            className="w-full h-full flex items-center justify-evenly"
            value={mobileState.secondToggle}
            onValueChange={(value) => {
              if (value === '') {
                setDrawerOpen(false)
              } else {
                setDrawerOpen(true)
              }
              setMobileState({ ...mobileState, secondToggle: value as 'trade' | 'overview' | '' })
            }}
          >
            <ToggleGroupItem className="flex-1 h-full flex items-center gap-2" value="trade">
              <IconTransform className="size-4" />
              <p>{t('Trade')}</p>
            </ToggleGroupItem>
            <ToggleGroupItem className="flex-1 h-full flex items-center gap-2" value="overview">
              <IconUserBitcoin className="size-4" />
              <p>{t('Overview')}</p>
            </ToggleGroupItem>
          </ToggleGroup>
          <Drawer
            open={drawerOpen}
            onOpenChange={(open) => {
              setDrawerOpen(open)
              if (!open) {
                setMobileState({ ...mobileState, secondToggle: '' })
              }
            }}
          >
            <DrawerContent className="w-full h-full bg-secondary">
              {mobileState.secondToggle === 'trade' && (
                <PlaceOrder selectedAsset={selectedAsset} isRTL={isRTL} />
              )}
              {mobileState.secondToggle === 'overview' && <OverviewBox isRTL={isRTL} />}
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    )
  }

  if (isTablet) {
    return (
      <div className="hidden md:flex xl:hidden flex-col gap-1 p-1 mb-8 h-dvh w-full">
        <div className="h-fit shrink-0">
          <FavoriteStrip isRTL={isRTL} />
        </div>
        {isSpot ? (
          <SpotSelector selectedAsset={selectedAsset} isRTL={isRTL} />
        ) : (
          <PerpsSelector selectedAsset={selectedAsset} isRTL={isRTL} />
        )}
        <div className="flex items-start justify-center w-full h-96">
          <div className="flex w-full h-full flex-col gap-1">
            <Chart selectedAsset={selectedAsset} selectedInterval="30" />
          </div>
        </div>
        <div className="flex items-start justify-center w-full h-full flex-1 gap-1">
          <div className="h-full flex-1 flex-col pb-12 basis-sm gap-2 ">
            <UserData />
          </div>
        </div>
        <div className="fixed z-40 bottom-0 left-0 w-full h-12 border-t border-white/10 bg-secondary">
          <ToggleGroup
            type="single"
            className="w-full h-full flex items-center justify-evenly"
            value={mobileState.secondToggle}
            onValueChange={(value) => {
              if (value === '') {
                setDrawerOpen(false)
              } else {
                setDrawerOpen(true)
              }
              setMobileState({ ...mobileState, secondToggle: value as 'trade' | 'overview' | '' })
            }}
          >
            <ToggleGroupItem className="flex-1 h-full flex items-center gap-2" value="trade">
              <IconTransform className="size-4" />
              <p>{t('Trade')}</p>
            </ToggleGroupItem>
          </ToggleGroup>
          <Drawer
            open={drawerOpen}
            onOpenChange={(open) => {
              setDrawerOpen(open)
              if (!open) {
                setMobileState({ ...mobileState, secondToggle: '' })
              }
            }}
          >
            <DrawerContent className="w-full h-full bg-secondary">
              {mobileState.secondToggle === 'trade' && (
                <div className="flex items-start justify-center w-full h-full">
                  <div className="h-full flex-1 flex-col basis-sm">
                    <OrderBook selectedAsset={selectedAsset} isRTL={isRTL} />
                    <Separator className="my-1" orientation="horizontal" />
                    <OverviewBox isRTL={isRTL} />
                  </div>
                  <Separator orientation="vertical" className="mx-1" />
                  <div className="h-full max-w-sm flex-1 flex-col basis-sm gap-2 ">
                    <PlaceOrder isRTL={isRTL} selectedAsset={selectedAsset} />
                  </div>
                </div>
              )}
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden xl:flex flex-col gap-1 p-1 mb-8 h-[130vh] w-full">
      <div
        className="h-[640px] 2xl:h-7/12 shrink-0 w-full flex items-start gap-1"
        ref={parentContainerRef}
      >
        <div
          className={clsx(
            'w-full h-full flex-2 flex flex-col gap-1',
            isRTL ? '-order-1' : 'order-1'
          )}
        >
          {orderBookRef.current?.clientWidth &&
          parentContainerRef.current?.clientWidth &&
          placeOrderRef.current?.clientWidth ? (
            <FavoriteStrip
              isRTL={isRTL}
              width={
                parentContainerRef.current.clientWidth -
                orderBookRef.current.clientWidth -
                placeOrderRef.current.clientWidth -
                8
              }
            />
          ) : (
            <Skeleton className="w-full h-10 bg-secondary" />
          )}
          {isSpot ? (
            <SpotSelector selectedAsset={selectedAsset} isRTL={isRTL} />
          ) : (
            <PerpsSelector selectedAsset={selectedAsset} isRTL={isRTL} />
          )}
          <Chart selectedAsset={selectedAsset} selectedInterval="30" />
        </div>
        <div
          className={clsx('w-72 shrink-0 2xl:w-96 h-full', isRTL ? '-order-2' : 'order-2')}
          ref={orderBookRef}
        >
          <OrderBook selectedAsset={selectedAsset} isRTL={isRTL} />
        </div>
        <div
          className={clsx('w-82 shrink-0 2xl:w-96 h-full', isRTL ? '-order-3' : 'order-3')}
          ref={placeOrderRef}
        >
          <PlaceOrder selectedAsset={selectedAsset} isRTL={isRTL} />
        </div>
      </div>
      <div className="h-full 2xl:h-5/12 flex-1 w-full mb-1 flex items-start gap-1">
        <div className={clsx('w-full h-full', isRTL ? '-order-1' : 'order-1')}>
          <UserData />
        </div>
        <div
          className={clsx('shrink-0 h-full', isRTL ? '-order-2' : 'order-2')}
          style={{
            width: placeOrderRef.current?.clientWidth ? placeOrderRef.current.clientWidth : 320
          }}
        >
          <OverviewBox isRTL={isRTL} />
        </div>
      </div>
      <FooterCompact />
    </div>
  )
}

export default Trading
