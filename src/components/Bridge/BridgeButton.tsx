'use client'

import { Button } from '../ui/button'
import { IconBuildingBridge } from '@tabler/icons-react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useTranslate } from '@tolgee/react'
import { LiFiBridge } from './LiFiBridge'

const BridgeButton = () => {
  const { t } = useTranslate()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="flex items-center gap-2 text-xs text-white"
          variant={'outline'}
          size={'sm'}
        >
          <IconBuildingBridge className="size-4" />
          {t('Bridge')}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-fit p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Bridge</DialogTitle>
        </VisuallyHidden>
        <LiFiBridge />
      </DialogContent>
    </Dialog>
  )
}

export default BridgeButton
