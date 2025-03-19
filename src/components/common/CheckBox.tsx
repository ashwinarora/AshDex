import React, { useState } from "react";

interface CheckBoxProps {
  label: string;
  onChange?: (checked: boolean) => void;
}

const CheckBox: React.FC<CheckBoxProps> = ({ label, onChange }) => {
  const [isChecked, setIsChecked] = useState(false);

const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setIsChecked(e.target.checked);
    if (onChange) onChange(e.target.checked);
  };

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      {!isChecked ? (
        <>
          <input
            type="checkbox"
            className="hidden peer"
            onChange={handleChange}
          />
          <div className="p-[9px] rounded-lg border border-[#FFFFFF0F] bg-[#0F081680] peer-checked:hidden flex items-center justify-center transition-all"></div>
        </>
      ) : (
        <input type="checkbox" className="p-[9px] accent-[#5F46F9] rounded-lg" checked onChange={handleChange} />
      )}
      <span className="checkbox-text">{label}</span>
    </label>
  );
};

export default CheckBox;
