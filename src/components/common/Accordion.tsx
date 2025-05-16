import { IconChevronDown } from '@tabler/icons-react'
import { useState } from 'react'

interface AccordionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`border-white/5 border-t ${className}`}>
      <div className="flex justify-between items-center p-2 px-4 w-full text-left">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex justify-between items-center w-full text-left duration-200 cursor-pointer"
        >
          <h3 className="text-white text-sm">{title}</h3>
        </div>
        <IconChevronDown
          className={`w-4 h-4 text-white/50 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export default Accordion
