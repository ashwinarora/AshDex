'use client'
import { useState } from 'react'
import { isTestnet } from '@/utils/constants'
import Chart from './Chart'
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

const Trading = () => {
  const { t } = useTranslate()
  const isSpot = useIsSpot()
  const [selectedAsset, setSelectedAsset] = useState<string>(
    isSpot ? (isTestnet ? '@1035' : '@107') : 'BTC'
  ) // @1035 and @107 is HYPE

  const isRTL = useUserStore((state) => state.preferredLanguage === 'ar')
  const { isTablet, isMobile } = useScreenSize()

  const [drawerOpen, setDrawerOpen] = useState(false)

  const [mobileState, setMobileState] = useState<{
    firstToggle: 'chart' | 'orderbook' | 'placeorder'
    secondToggle: 'trade' | 'overview' | ''
  }>({
    firstToggle: 'chart',
    secondToggle: ''
  })

  if (isMobile) {
    return (
      <div className="flex relative flex-col gap-1 p-1 mb-12 h-fit w-full">
        {isSpot ? (
          <SpotSelector
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
            isRTL={isRTL}
          />
        ) : (
          <PerpsSelector
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
            isRTL={isRTL}
          />
        )}
        <FavoriteStrip setSelectedAsset={setSelectedAsset} isRTL={isRTL} />
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
          <ToggleGroupItem className="rounded-l-md bg-white/5 h-full" value="chart">
            <p>{t('Chart')}</p>
          </ToggleGroupItem>
          <ToggleGroupItem className="rounded-r-md h-full bg-white/5" value="orderbook">
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
          <UserData setSelectedAsset={setSelectedAsset} />
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
      <div className="hidden md:flex xl:hidden flex-col gap-1 p-1 mb-8 h-fit w-full">
        <FavoriteStrip setSelectedAsset={setSelectedAsset} isRTL={isRTL} />
        {isSpot ? (
          <SpotSelector
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
            isRTL={isRTL}
          />
        ) : (
          <PerpsSelector
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
            isRTL={isRTL}
          />
        )}
        <div className="flex items-start justify-center w-full h-96">
          <div className="flex w-full h-full flex-col gap-1">
            <Chart selectedAsset={selectedAsset} selectedInterval="30" />
          </div>
        </div>

        <div className="flex items-start justify-center w-full h-[484px] gap-1">
          <div className="h-full flex-1 flex-col basis-sm gap-2 ">
            <UserData setSelectedAsset={setSelectedAsset} />
          </div>
          {/* <div className="h-full max-w-sm flex-1 flex-col basis-sm gap-2 ">
            <OverviewBox />
          </div> */}
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
    <div className="hidden xl:flex flex-col gap-1 p-1 mb-8 h-fit w-full">
      <div className={`flex-1 grid grid-cols-18 gap-1 max-h-3/4 h-3/4 min-h-3/4 overflow-hidden`}>
        <div
          className={clsx(
            `col-span-10 h-full flex-1 basis-xl flex flex-col gap-1`,
            isRTL ? '-order-1' : 'order-1'
          )}
        >
          <FavoriteStrip setSelectedAsset={setSelectedAsset} isRTL={isRTL} />
          {isSpot ? (
            <SpotSelector
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              isRTL={isRTL}
            />
          ) : (
            <PerpsSelector
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              isRTL={isRTL}
            />
          )}
          <Chart selectedAsset={selectedAsset} selectedInterval="30" />
        </div>
        <div
          className={clsx(
            `col-span-4 h-full flex-col basis-sm gap-2`,
            isRTL ? '-order-2' : 'order-2'
          )}
        >
          <OrderBook selectedAsset={selectedAsset} isRTL={isRTL} />
        </div>
        <div
          className={clsx(
            `col-span-4 h-full flex-col basis-sm gap-2`,
            isRTL ? '-order-3' : 'order-3'
          )}
        >
          <PlaceOrder selectedAsset={selectedAsset} isRTL={isRTL} />
        </div>
      </div>
      <div className="grid grid-cols-18 gap-1 h-fit">
        <div className={clsx(`col-span-14 h-full w-full`, isRTL ? '-order-1' : 'order-1')}>
          <UserData setSelectedAsset={setSelectedAsset} />
        </div>
        <div className={clsx(`col-span-4 h-full w-full`, isRTL ? '-order-2' : 'order-2')}>
          <OverviewBox isRTL={isRTL} />
        </div>
      </div>
      <FooterCompact />
    </div>
  )
}

export default Trading
