import { cn } from '@/lib/utils'
import { IconChevronDown } from '@tabler/icons-react'
import React from 'react'
import { useTranslate } from '@tolgee/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface MarginModeProps {
  isCross: boolean
  setIsCross: React.Dispatch<React.SetStateAction<boolean>>
  isRTL: boolean
}

const MarginMode = ({ setIsCross, isCross, isRTL }: MarginModeProps) => {
  const { t } = useTranslate()
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
          <DropdownMenuItem onClick={() => setIsCross(true)}>{t('Cross')}</DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsCross(false)}>{t('Isolated')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default MarginMode
