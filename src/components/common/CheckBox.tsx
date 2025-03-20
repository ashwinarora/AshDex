import React, { useEffect, useState } from 'react'
import CheckIcon from '@/assets/images/check_icon.svg'
import Image from 'next/image'
interface CheckBoxProps {
  label: string
  setIsChecked?: React.Dispatch<React.SetStateAction<boolean>>
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
        className={`h-5 w-5 rounded-lg border border-[#FFFFFF0F] bg-[#0F081680] ${checked ? 'bg-[#5F46F9]' : ''} peer-checked:hidden flex items-center justify-center transition-all`}
        onClick={handleChange}
      >
        {checked && (
          <Image src={CheckIcon} alt="check" width={16} height={16} className="w-3 h-3" />
        )}
      </div>
      <span className="checkbox-text">{label}</span>
    </label>
  )
}

export default CheckBox
