'use client'

import { Button } from '../ui/button'
import { IconBuildingBridge } from '@tabler/icons-react'
import BridgeModal from './BridgeModal'
import { useState } from 'react'

const BridgeButton = () => {
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false)
  return (
    <>
      <Button
        className="flex items-center gap-2 text-xs text-white"
        variant={'outline'}
        size={'sm'}
        onClick={() => setIsBridgeModalOpen(true)}
      >
        <IconBuildingBridge className="size-4" />
        {'Bridge'}
      </Button>
      <BridgeModal isOpen={isBridgeModalOpen} onClose={() => setIsBridgeModalOpen(false)} />
    </>
  )
}

export default BridgeButton
