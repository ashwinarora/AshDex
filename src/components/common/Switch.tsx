import React, { useEffect, useState } from 'react'

interface SwitchProps {
  label: string
  setIsChecked?: (isChecked: boolean) => void
  isChecked?: boolean
}

const Switch: React.FC<SwitchProps> = ({ label, setIsChecked, isChecked }) => {
  const [checked, setChecked] = useState<boolean>(isChecked || false)

  const handleChange = () => {
    setChecked((prev) => !prev)
    if (setIsChecked) setIsChecked(!checked)
  }

  useEffect(() => {
    if (typeof isChecked === 'boolean') {
      setChecked(isChecked)
    }
  }, [isChecked])

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        className={`relative inline-block w-9.5 h-5.5 ${checked ? 'bg-[#5F46F9]' : 'bg-white/30'} rounded-full transition-colors`}
        onClick={handleChange}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-[#E8E0F1] rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}
        />
      </div>
      <span className="checkbox-text">{label ?? ''}</span>
    </label>
  )
}

export default Switch
