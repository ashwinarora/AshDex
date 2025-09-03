import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import CheckIcon from '@/assets/images/check_icon.svg'
interface CheckBoxProps {
  label: string
  setIsChecked?: (isChecked: boolean) => void
  isChecked?: boolean
  toggleStyle?: 'pill' | 'box'
}

const CheckBox: React.FC<CheckBoxProps> = ({
  label,
  setIsChecked,
  isChecked,
  toggleStyle = 'box'
}) => {
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
      {toggleStyle === 'pill' ? (
        <button
          type="button"
          className={`relative w-5 h-5 rounded-full  transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-[#1A1332]'} border border-[#FFFFFF0F]`}
          onClick={handleChange}
        >
          <span
            className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full  bg-white transition-transform duration-200 ${checked ? 'translate-x-1' : ''}`}
          />
        </button>
      ) : (
        <div
          className={`h-4 w-4 rounded  border border-[#ffffff0f] bg-[#0F081680] ${checked ? 'bg-primary' : ''} peer-checked:hidden flex items-center justify-center transition-all`}
          onClick={handleChange}
        >
          {checked && (
            <Image src={CheckIcon} alt="check" style={{ height: 'auto' }} className="w-2 h-2" />
          )}
        </div>
      )}
      <span className="text-white/50checkbox-text">{label}</span>
    </label>
  )
}

export default CheckBox
