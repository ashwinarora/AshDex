import React from 'react'

interface InputProps {
  name: string
  label: string
  value: string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string
  type?: string
}

const InputFeild: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  name,
  onBlur,
  type = 'text'
}) => {
  return (
    <div className="mt-5 flex flex-col gap-2">
      <label className="text-sm font-normal text-[#8B8BA0]">{label}</label>
      <div>
        <input
          name={name}
          type={type}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3 py-4 rounded-md bg-[#FFFFFF0F] text-white text-base font-medium border-2 ${error ? 'border-[#E2464A29]' : 'border-[#FFFFFF0F]'} focus:outline-none`}
        />
        {error && <p className="text-[#E2464A] text-sm mt-1">{error}</p>}
      </div>
    </div>
  )
}

export default InputFeild
