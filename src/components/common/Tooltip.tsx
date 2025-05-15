import React, { useState } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-pointer"
      >
        {children}
      </span>
      {show && (
        <div className="absolute tracking-normal z-50 left-1/2 font-normal -translate-x-1/2 top-full mt-2 w-64 p-3 text-sm text-white bg-secondary rounded-lg shadow-lg backdrop-blur-md border border-white/10">
          {content}
        </div>
      )}
    </span>
  )
}

export default Tooltip
