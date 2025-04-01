import React from 'react'
import Image from 'next/image'
import nexonlogo from '../../assets/images/logo.svg'

interface LoadingProps {
  activeTab: string
}

const Loading: React.FC<LoadingProps> = ({ activeTab }) => {
  return (
    <div className="flex justify-center items-center h-screen w-full flex-col">
      <div className="w-16 h-16">
        <Image src={nexonlogo} alt="Nexon Logo" width={64} height={64} />
      </div>
      <p className="mt-8 text-white font-medium text-sm text-center">
        Your {activeTab?.toLowerCase()} order is being processed.
        <br />
        Please wait...
      </p>
    </div>
  )
}

export default Loading
