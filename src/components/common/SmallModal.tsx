import React from 'react'
import ReactDOM from 'react-dom'
import { X } from 'lucide-react'

interface SmallModalProps {
  isOpen: boolean
  onClose: () => void
  heading: string
  children: React.ReactNode
}

const SmallModal: React.FC<SmallModalProps> = ({ isOpen, onClose, heading, children }) => {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 bg-[#0F081680] bg-opacity-30 backdrop-blur-[5px] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-[#18122B] border border-white/10 rounded-2xl shadow-lg w-full max-w-md max-md:max-w-sm p-6 max-md:p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{heading}</h2>
          <button
            className="p-2 bg-[#322944] rounded-full text-[#E8E0F1] hover:text-white hover:bg-[#443366] transition"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}

export default SmallModal
