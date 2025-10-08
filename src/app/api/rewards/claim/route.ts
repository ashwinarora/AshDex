import { NextResponse } from 'next/server'
import { AuthenticatedRequest, withAuth } from '@/app/api/middleware'
import { prisma } from '@/lib/prisma'
import { Address } from 'viem'
import { KMSClient, GetPublicKeyCommand } from '@aws-sdk/client-kms'
import { computeAddress } from 'ethers'
import { makeKmsWallet } from '@/services/kmsSign'
import { getUsdSendPayload } from '@/utils/hyperliquid/UsdSend'
import { splitSignature } from '@/utils/utils'
import { HYPERLIQUID_API_MAINNET, HYPERLIQUID_API_TESTNET, isTestnet } from '@/utils/constants'

function getKMSClient() {
  const region = process.env.MY_AWS_REGION ?? 'ap-south-1'
  const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID ?? ''
  const secretAccessKey = process.env.MY_AWS_SECRET_ACCESS_KEY ?? ''

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('MY_AWS_ACCESS_KEY_ID and MY_AWS_SECRET_ACCESS_KEY must be set')
  }

  return new KMSClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  })
}

async function getEthAddress(): Promise<Address> {
  const keyId = process.env.MY_KMS_KEY_ID ?? 'alias/eth-admin'
  const kms = getKMSClient()

  const { PublicKey } = await kms.send(new GetPublicKeyCommand({ KeyId: keyId }))
  if (!PublicKey) throw new Error('KMS returned no public key')
  const spkiDer = Buffer.from(PublicKey)
  const rawXY = spkiDer.subarray(-64)
  const uncompressedKey = Buffer.concat([Buffer.from([0x04]), rawXY])
  const uncompressedHex = '0x' + uncompressedKey.toString('hex')
  const address = computeAddress(uncompressedHex)
  return address as Address
}

const claimRewardsHandler = async (request: AuthenticatedRequest) => {
  try {
    const destination = request.wallet_id as Address
    // @ts-expect-error payload is not typed
    const claimAmount = request.payload.claimAmount

    // Create KMS wallet
    const address = await getEthAddress()
    const kmsWallet = await makeKmsWallet(address)
    const nonce = Date.now()

    const user = await prisma.user.findUnique({ where: { wallet_id: destination } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // TODO: check if claimAmount is correct

    const chainId = '42161'

    const action = {
      type: 'usdSend',
      destination,
      amount: claimAmount.toString(),
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
      amount: claimAmount.toString()
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signature = await kmsWallet.signTypedData(typedData as any)
    const splitSig = splitSignature(signature)

    // Make the request directly to Hyperliquid API
    const hyperliquidUrl =
      process.env.HYPERLIQUID_NETWORK !== 'mainnet'
        ? HYPERLIQUID_API_TESTNET
        : HYPERLIQUID_API_MAINNET

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
      rewards_claimed: claimAmount,
      txn_hash: result.txnHash,
      address: kmsWallet.address
    })
  } catch (error) {
    console.error('Error in claim rewards route:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const POST = withAuth(claimRewardsHandler)
