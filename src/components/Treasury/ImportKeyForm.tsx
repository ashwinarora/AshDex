'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { parsePrivateKey } from '@/utils/treasury/agentKey'

/** Paste an existing treasury agent key (e.g. exported from another browser). */
const ImportKeyForm = ({
  onImport,
  onCancel
}: {
  onImport: (privateKey: string) => void
  onCancel: () => void
}) => {
  const [value, setValue] = useState('')
  const valid = parsePrivateKey(value) !== null
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onImport(value)
      }}
    >
      <label htmlFor="treasury-import-key" className="text-xs text-white/70">
        {'Private key (0x followed by 64 hex characters)'}
      </label>
      <input
        id="treasury-import-key"
        name="treasury-import-key"
        type="password"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-8 w-full rounded-md border bg-white/10 px-3 text-sm text-white font-mono"
        data-testid="treasury-import-input"
      />
      {value && !valid && <p className="text-xs text-red">{'That is not a valid private key.'}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!valid} data-testid="treasury-import-submit">
          {'Import'}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          {'Cancel'}
        </Button>
      </div>
    </form>
  )
}

export default ImportKeyForm
