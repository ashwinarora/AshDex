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
      document.body.style.overflow = 'hidden'
      setTopPosition(window.scrollY)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = '' // Cleanup on unmount
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className={`absolute left-0 right-0 z-50 flex items-center justify-center bg-[#0F081680] bg-opacity-70 backdrop-blur-[40px] h-screen`}
      style={{ top: topPosition + 'px' }}
      onClick={onClose}
    >
      <div className="w-full h-full flex items-center justify-center">{children}</div>
    </div>
  )
}

export default Modal
