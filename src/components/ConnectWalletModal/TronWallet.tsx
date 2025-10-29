import '@tronweb3/tronwallet-adapter-react-ui/style.css'

import { useWalletModal } from '@tronweb3/tronwallet-adapter-react-ui'
import { useTronConnect } from '@/utils/tronWalletAdapter'
import { IconLoader2 } from '@tabler/icons-react'

function ConnectTronWallet() {
  return <ConnectComponent></ConnectComponent>
}

function ConnectComponent() {
  const { isConnecting, isConnected } = useTronConnect()
  const { setVisible } = useWalletModal()

  return (
    <>
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Profile></Profile>
        ) : (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setVisible(true)}>
            {isConnecting ? (
              <>
                Connecting <IconLoader2 className="w-4 h-4 animate-spin" />
              </>
            ) : (
              'Connect Tron Wallet'
            )}
          </div>
        )}
      </div>
    </>
  )
}

function Profile() {
  const { isConnected, address, disconnect } = useTronConnect()
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm">
        <span className="text-white/70">Status: </span>
        <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </p>
      {address && (
        <p className="text-sm">
          <span className="text-white/70">Address: </span>
          <span className="text-white">{address}</span>
        </p>
      )}
      <button onClick={disconnect} className="mt-2 text-red-500 hover:text-red-400 text-sm">
        Disconnect
      </button>
    </div>
  )
}

export default ConnectTronWallet
