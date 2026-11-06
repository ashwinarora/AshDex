'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { IconCopy, IconEye } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { exportTreasuryAgentKey, type TreasuryAgentRecord } from '@/utils/treasury/agentKey'

/** Reveal this browser's treasury agent key (to import it in another browser). */
const ExportKey = ({ record }: { record: TreasuryAgentRecord }) => {
  const [shown, setShown] = useState(false)
  const key = exportTreasuryAgentKey(record)
  return (
    <section
      className="bg-secondary rounded-md p-4 flex flex-col gap-2"
      data-testid="treasury-export"
    >
      <h2 className="text-sm font-medium text-white">{'Export this key'}</h2>
      <p className="text-xs text-amber-200">
        {'Whoever has this key can trade this treasury until it expires or is removed'}
      </p>
      {shown ? (
        <div className="flex flex-col gap-2">
          <code
            className="break-all rounded bg-white/10 p-2 text-xs text-white"
            data-testid="treasury-export-key"
          >
            {key}
          </code>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(key)
                toast.success('Key copied')
              }}
            >
              <IconCopy className="size-3" />
              {'Copy'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShown(false)}>
              {'Hide'}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="w-fit"
          onClick={() => setShown(true)}
          data-testid="treasury-export-show"
        >
          <IconEye className="size-3" />
          {'Show key'}
        </Button>
      )}
    </section>
  )
}

export default ExportKey
