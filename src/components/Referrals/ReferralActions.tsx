'use client'
import React, { useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import ClaimInviteCode from './ClaimInviteCode'

function ReferralActions() {
  const { t } = useTranslate()

  const [openDialog, setOpenDialog] = useState<string | null>(null)

  return (
    <div className="w-full flex justify-end items-center gap-2 bg-secondary rounded-md p-2">
      <Dialog
        open={openDialog === 'enter'}
        onOpenChange={(open) => setOpenDialog(open ? 'enter' : null)}
      >
        <DialogTrigger asChild>
          <Button variant="outline">{t('Enter Code')}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{t('Enter Code')}</DialogTitle>
          </DialogHeader>
          <div className="min-h-[250px]">
            <ClaimInviteCode />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ReferralActions
