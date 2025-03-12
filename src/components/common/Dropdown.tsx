"use client"
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
    options: string[];
    selected: string;
    onSelect: (option: string) => void;
    className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, selected, onSelect, className }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {/* Dropdown Trigger Button */}
            <button
                className={`bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-between w-24 ${className}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selected} <ChevronDown size={18} className="ml-2" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute mt-1 w-24 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {options.map((option) => (
                        <button
                            key={option}
                            className="block w-full text-left px-4 py-2 text-black hover:bg-gray-200"
                            onClick={() => {
                                onSelect(option);
                                setIsOpen(false);
                            }}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
