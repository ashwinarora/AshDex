import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import CheckIcon from '@/assets/images/check_icon.svg'
interface CheckBoxProps {
  label: string
  setIsChecked?: (isChecked: boolean) => void
  isChecked?: boolean
}

const CheckBox: React.FC<CheckBoxProps> = ({ label, setIsChecked, isChecked }) => {
  const [checked, setChecked] = useState<boolean>(isChecked || false)
  const handleChange = () => {
    setChecked((s) => !s)
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
        className={`h-5 w-5 rounded-lg border border-[#FFFFFF0F] bg-[#0F081680] ${checked ? 'bg-primary' : ''} peer-checked:hidden flex items-center justify-center transition-all`}
        onClick={handleChange}
      >
        {checked && (
          <Image
            src={CheckIcon}
            alt="check"
            style={{ width: 16, height: 'auto' }}
            className="w-3 h-3"
          />
        )}
      </div>
      <span className="checkbox-text text-[#E8E0F1]">{label}</span>
    </label>
  )
}

export default CheckBox
