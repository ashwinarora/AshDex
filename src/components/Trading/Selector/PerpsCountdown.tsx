import React, { useEffect, useState } from 'react'

const TIMETOCOUNT = 60 * 60 // 1 hour in seconds

function getTimeLeft() {
  const now = new Date()
  // Get UTC time components directly - this ensures timezone independence
  const utcMinutes = now.getUTCMinutes()
  const utcSeconds = now.getUTCSeconds()

  // Get seconds since start of current UTC hour
  const secondsSinceHour = utcMinutes * 60 + utcSeconds
  // Add 30-minute offset (1800 seconds) to mimic hyperliquid
  //   const offsetSeconds = 1800
  const adjustedSecondsSinceHour = secondsSinceHour % TIMETOCOUNT
  // Time left in current hour
  let secondsLeft = TIMETOCOUNT - adjustedSecondsSinceHour
  if (secondsLeft <= 0) secondsLeft += TIMETOCOUNT
  const hours = Math.floor(secondsLeft / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const seconds = secondsLeft % 60
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  }
}

const PerpsCountdown: React.FC = () => {
  const [time, setTime] = useState(getTimeLeft())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeLeft())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span>
      {time.hours}:{time.minutes}:{time.seconds}
    </span>
  )
}

export default PerpsCountdown
