import { useEffect, useState } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const [topPosition, setTopPosition] = useState(0)

  useEffect(() => {
    if (isOpen) {
      // Store the current scroll position
      setTopPosition(window.scrollY)
      // Add a class to the body to prevent scrolling
      document.body.style.position = 'fixed'
      document.body.style.top = `-${window.scrollY}px`
      document.body.style.width = '100%'
    } else {
      // Restore the scroll position
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, topPosition)
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [isOpen, topPosition])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F081680] bg-opacity-70 backdrop-blur-[40px]"
      onClick={onClose}
    >
      <div className="w-full h-full flex items-center justify-center overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export default Modal
