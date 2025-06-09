'use client'
import { IconX } from '@tabler/icons-react'
import React, { useState } from 'react'

function SnackBar() {
  const [visible, setVisible] = useState(true)
  return (
    visible && (
      <div className="flex justify-between w-full p-2 px-3 text-sm text-white h-max bg-primary">
        <p>Hello Welcome to nexon!</p>
        <IconX onClick={() => setVisible(false)} className="w-4 h-4 text-white" />
      </div>
    )
  )
}

export default SnackBar
