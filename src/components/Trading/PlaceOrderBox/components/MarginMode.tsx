import { cn } from '@/lib/utils'
import { IconChevronDown } from '@tabler/icons-react'
import React, { useEffect, useState } from 'react'
import { useTranslate } from '@tolgee/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useShallow } from 'zustand/react/shallow'
import { useHyperliquidStore } from '@/store/HyperliquidStore'

interface MarginModeProps {
  isCross: boolean
  setIsCross: React.Dispatch<React.SetStateAction<boolean>>
  isRTL: boolean
  selectedAsset?: string
}

const MarginMode = ({ setIsCross, isCross, isRTL, selectedAsset }: MarginModeProps) => {
  const { t } = useTranslate()
  const { activeAssetData } = useHyperliquidStore(
    useShallow((state) => ({
      activeAssetData: state.activeAssetData
    }))
  )
  const [isEdited, setIsEdited] = useState<boolean>(false)

  useEffect(() => {
    if (!activeAssetData) return
    if (isEdited) return
    setIsCross(activeAssetData.leverage.type === 'cross' ? true : false)
  }, [activeAssetData])

  useEffect(() => {
    setIsEdited(false)
  }, [selectedAsset])

  return (
    <div
      className={cn(
        'flex w-full items-center justify-between rounded-md',
        isRTL && 'flex-row-reverse'
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full h-8" asChild>
          <Button variant="outline">
            {t(isCross ? 'Cross' : 'Isolated')}
            <IconChevronDown className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              setIsCross(true)
              setIsEdited(true)
            }}
          >
            {t('Cross')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setIsCross(false)
              setIsEdited(true)
            }}
          >
            {t('Isolated')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default MarginMode
