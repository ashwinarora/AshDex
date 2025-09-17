import { NextResponse } from 'next/server'
import { makeKmsWallet } from '@/services/kmsSign'
import { isTestnet } from '@/utils/constants'
import { splitSignature } from '@/utils/utils'
import { getUsdSendPayload } from '@/utils/hyperliquid/UsdSend'

export async function POST() {
  try {
    const destination = '0x1710022f671b4032d6C7262107Ba231f41F84cE8'
    const amount = '5'
    const chainId = '42161'

    // Create KMS wallet
    const kmsWallet = await makeKmsWallet()

    // Generate the USD send action manually to avoid HTTP transport issues
    console.log('Attempting USD send with:', { destination, amount, address: kmsWallet.address })

    // Generate nonce
    const nonce = Date.now()

    // Create the action for USD send - try with additional fields that might be required
    const action = {
      type: 'usdSend',
      destination,
      amount: amount.toString(),
      // Add fields that might be required by Hyperliquid
      signatureChainId: '0x' + parseInt(chainId).toString(16),
      hyperliquidChain: isTestnet ? 'Testnet' : 'Mainnet',
      time: nonce
    }

    // Use the existing function to generate typed data
    const typedData = getUsdSendPayload({
      chainId: parseInt(chainId),
      isTestnet,
      nonce,
      destination,
      amount: amount.toString()
    })

    // Sign the typed data with KMS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signature = await kmsWallet.signTypedData(typedData as any)
    const splitSig = splitSignature(signature)

    // Make the request directly to Hyperliquid API
    const hyperliquidUrl = isTestnet
      ? 'https://api.hyperliquid-testnet.xyz/exchange'
      : 'https://api.hyperliquid.xyz/exchange'

    const requestBody = {
      action,
      nonce,
      signature: splitSig,
      isFrontend: true
    }

    console.log('Sending request to Hyperliquid:', { url: hyperliquidUrl, body: requestBody })

    const response = await fetch(hyperliquidUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await response.text()
    console.log('Hyperliquid raw response:', responseText)

    let result
    try {
      result = JSON.parse(responseText)
      console.log('Hyperliquid parsed response:', result)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      throw new Error(
        `Hyperliquid API returned non-JSON response: ${response.status} - ${responseText}`
      )
    }

    if (!response.ok) {
      throw new Error(`Hyperliquid API error: ${response.status} - ${JSON.stringify(result)}`)
    }

    return NextResponse.json({
      success: true,
      result,
      address: kmsWallet.address
    })
  } catch (error) {
    console.error('Error in USD sign route:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
