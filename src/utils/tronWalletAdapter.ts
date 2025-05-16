import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters'
import { WalletConnectAdapter } from '@tronweb3/tronwallet-adapter-walletconnect'
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks'
import { useState, useCallback } from 'react'
import { toast } from 'react-toastify'

interface TronWalletAdapter {
  connect: () => Promise<void>
  connected: boolean
  address: string | null
}

// Initialize both adapters
const tronLinkAdapter = new TronLinkAdapter()
const walletConnectAdapter = new WalletConnectAdapter({
  network: 'Mainnet',
  options: {
    relayUrl: 'wss://relay.walletconnect.com',
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || '',
    metadata: {
      name: 'Nexon Bridge',
      description: 'Bridge your assets across chains',
      url: 'https://nexon.com',
      icons: ['https://nexon.com/logo.png']
    }
  }
})

// Current active adapter
let activeAdapter: TronWalletAdapter = tronLinkAdapter

// Function to switch between adapters
export const switchAdapter = (adapterType: 'tronlink' | 'walletconnect') => {
  if (adapterType === 'tronlink') {
    activeAdapter = tronLinkAdapter
  } else {
    activeAdapter = walletConnectAdapter
  }
}

export const connectTronWallet = async (adapterType: 'tronlink' | 'walletconnect' = 'tronlink') => {
  try {
    // Switch to the requested adapter
    switchAdapter(adapterType)

    // Connect using the active adapter
    await activeAdapter.connect()
    if (!activeAdapter.address) {
      throw new Error('Failed to get wallet address')
    }
    return activeAdapter.address
  } catch (error) {
    console.error('Error connecting to Tron wallet:', error)
    throw error
  }
}

export const isTronWalletConnected = () => {
  return activeAdapter.connected
}

export const getTronWalletAddress = () => {
  return activeAdapter.address
}

// Add function to get available adapters
export const getAvailableAdapters = () => {
  return [
    { type: 'tronlink', name: 'TronLink', connected: tronLinkAdapter.connected },
    { type: 'walletconnect', name: 'WalletConnect', connected: walletConnectAdapter.connected }
  ]
}

// Export hooks
export const useTronWallet = () => {
  const { connected, address, wallet, connect, disconnect, select, signTransaction, signMessage } =
    useWallet()
  return {
    isTronConnected: connected,
    tronAddress: address,
    tronWallet: wallet,
    connectTron: connect,
    disconnectTron: disconnect,
    selectTronWallet: select,
    signTronTransaction: signTransaction,
    signTronMessage: signMessage
  }
}

// New hook for Tron wallet connection
export const useTronConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false)
  const { connectTron, disconnectTron, isTronConnected, tronAddress } = useTronWallet()

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true)
      await connectTron()
      toast.success('Tron wallet connected successfully')
    } catch (error) {
      console.error('Error connecting to Tron wallet:', error)
      toast.error('Failed to connect Tron wallet')
      throw error
    } finally {
      setIsConnecting(false)
    }
  }, [connectTron])

  const disconnect = useCallback(async () => {
    try {
      await disconnectTron()
      toast.success('Tron wallet disconnected successfully')
    } catch (error) {
      console.error('Error disconnecting Tron wallet:', error)
      toast.error('Failed to disconnect Tron wallet')
      throw error
    }
  }, [disconnectTron])

  return {
    connect,
    disconnect,
    isConnecting,
    isConnected: isTronConnected,
    address: tronAddress
  }
}

// Export adapters
export const tronAdapters = {
  tronLink: tronLinkAdapter,
  walletConnect: walletConnectAdapter
}
