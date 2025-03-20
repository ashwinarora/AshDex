import { useEffect, useState } from 'react'

export const useComponentRendered = () => {
  const [isRendered, setRendered] = useState(false)
  useEffect(() => {
    setRendered(true)
  }, [])
  return { isRendered }
}
