'use client'
import { useScreenSize } from '@/hooks/useScreenSize'
import {
  IconCheck,
  IconExclamationCircle,
  IconInfoCircle,
  IconLoader,
  IconX
} from '@tabler/icons-react'
import { Toaster } from 'sonner'

interface ToastClassnames {
  toast?: string
  title?: string
  description?: string
  loader?: string
  closeButton?: string
  cancelButton?: string
  actionButton?: string
  success?: string
  error?: string
  info?: string
  warning?: string
  loading?: string
  default?: string
  content?: string
  icon?: string
}

interface ToastOptions {
  className?: string
  closeButton?: boolean
  descriptionClassName?: string
  style?: React.CSSProperties
  cancelButtonStyle?: React.CSSProperties
  actionButtonStyle?: React.CSSProperties
  duration?: number
  unstyled?: boolean
  classNames?: ToastClassnames
  closeButtonAriaLabel?: string
}
type Offset =
  | {
      top?: string | number
      right?: string | number
      bottom?: string | number
      left?: string | number
    }
  | string
  | number

type Position =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center'
type SwipeDirection = 'top' | 'right' | 'bottom' | 'left'

interface ToastIcons {
  success?: React.ReactNode
  info?: React.ReactNode
  warning?: React.ReactNode
  error?: React.ReactNode
  loading?: React.ReactNode
  close?: React.ReactNode
}

interface ToasterProps {
  invert?: boolean
  theme?: 'light' | 'dark' | 'system'
  position?: Position
  hotkey?: string[]
  richColors?: boolean
  expand?: boolean
  duration?: number
  gap?: number
  visibleToasts?: number
  closeButton?: boolean
  toastOptions?: ToastOptions
  className?: string
  style?: React.CSSProperties
  offset?: Offset
  mobileOffset?: Offset
  dir?: 'rtl' | 'ltr' | 'auto'
  swipeDirections?: SwipeDirection[]
  icons?: ToastIcons
  containerAriaLabel?: string
}

export const Toast = () => {
  const { isMobile } = useScreenSize()
  const toastOptionsDesktop: ToasterProps = {
    position: 'bottom-left',
    richColors: true,
    swipeDirections: ['top', 'right', 'left'],
    closeButton: false,
    visibleToasts: 9,
    duration: 3000,
    icons: {
      success: <IconCheck className="size-4" />,
      error: <IconExclamationCircle className="size-4" />,
      info: <IconInfoCircle className="size-4" />,
      warning: <IconExclamationCircle className="size-4" />,
      loading: <IconLoader className="size-4 animate-spin" />,
      close: <IconX className="size-4" />
    },
    toastOptions: {
      classNames: {
        toast: '!rounded-md !w-80 !bg-popover',
        closeButton: '!bg-accent !border-none !text-white !size-4',
        success: '!text-green !border-green/50',
        error: '!text-red !border-red/50',
        info: '!text-blue-400 !border-blue-400/50',
        warning: '!text-yellow-600 !border-yellow-600/50',
        loading: '!text-accent-foreground !border-accent-foreground/50'
      }
    }
  }
  const toastOptionsMobile: ToasterProps = {
    position: 'top-center',
    visibleToasts: 1,
    duration: 3000,
    swipeDirections: ['top', 'right', 'left'],
    mobileOffset: {
      left: '0',
      top: '0'
    },
    icons: {
      success: <IconCheck className="size-4" />,
      error: <IconExclamationCircle className="size-4" />,
      info: <IconInfoCircle className="size-4" />,
      warning: <IconExclamationCircle className="size-4" />,
      loading: <IconLoader className="size-4 animate-spin" />,
      close: <IconX className="size-4" />
    },
    toastOptions: {
      classNames: {
        toast: '!bg-accent !border-transparent !text-white !rounded-none !h-9 !w-full',
        success: '!bg-green !text-white',
        error: '!bg-red',
        info: '!bg-primary',
        warning: '!bg-yellow-600',
        loading: '!bg-primary'
      }
    }
  }

  return <Toaster {...(isMobile ? toastOptionsMobile : toastOptionsDesktop)} />
}
