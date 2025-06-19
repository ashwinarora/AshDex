import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type NumberInputHandling = {
  value: string
  min?: number
  max?: number
}

export function numberInputValidator({ value, min, max }: NumberInputHandling): {
  isValid: boolean
  error: string | null
} {
  if (value === '') {
    return {
      isValid: false,
      error: 'Value cannot be empty'
    }
  }
  if (isNaN(Number(value))) {
    return {
      isValid: false,
      error: 'Value is not a number'
    }
  }
  if (min && Number(value) < min) {
    return {
      isValid: false,
      error: `Value must be greater than ${min}`
    }
  }
  if (max && Number(value) > max) {
    return {
      isValid: false,
      error: `Value must be less than ${max}`
    }
  }
  return {
    isValid: true,
    error: null
  }
}
