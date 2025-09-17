import { KMSClient, SignCommand } from '@aws-sdk/client-kms'
import { hashTypedData, type Hex, type Address, recoverAddress, keccak256 } from 'viem'
import { secp256k1 } from '@noble/curves/secp256k1'
import { hexToBytes } from 'viem/utils'
import { getEthAddress } from './admin'

type TypedData = {
  domain: {
    name: string
    version: string
    chainId: number
    verifyingContract: Hex
  }
  types: Record<string, { name: string; type: string }[]>
  primaryType: string
  message: Record<string, unknown>
}

function toHex32(n: bigint) {
  return ('0x' + n.toString(16).padStart(64, '0')) as Hex
}

function parseDERSignature(der: Uint8Array): { r: bigint; s: bigint } {
  // DER format: 0x30 [length] 0x02 [r-length] [r] 0x02 [s-length] [s]
  let pos = 0

  if (der[pos++] !== 0x30) throw new Error('Invalid DER: expected SEQUENCE')
  const seqLen = der[pos++]
  if (seqLen !== der.length - 2) throw new Error('Invalid DER: sequence length mismatch')

  // Parse r
  if (der[pos++] !== 0x02) throw new Error('Invalid DER: expected INTEGER for r')
  const rLen = der[pos++]
  const rBytes = der.slice(pos, pos + rLen)
  pos += rLen

  // Parse s
  if (der[pos++] !== 0x02) throw new Error('Invalid DER: expected INTEGER for s')
  const sLen = der[pos++]
  const sBytes = der.slice(pos, pos + sLen)

  // Convert to bigint, handling leading zeros
  const r = BigInt(
    '0x' +
      Array.from(rBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
  )
  const s = BigInt(
    '0x' +
      Array.from(sBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
  )

  return { r, s }
}

/** Sign an EIP-712 typed-data hash with AWS KMS (secp256k1), returning {r,s,v}. */
async function kmsSignTypedData(params: {
  kms: KMSClient
  keyId: string
  address: Address // checksummed signer address (from your getEthAddress)
  typedData: TypedData
}): Promise<{ r: Hex; s: Hex; v: number }> {
  const { kms, keyId, typedData } = params

  // 1) EIP-712 digest (keccak256 of typed data)
  const digest = hashTypedData(typedData) // 0x…32 bytes
  const digestBytes = hexToBytes(digest)

  // Ensure digest is 32 bytes
  if (digestBytes.length !== 32) {
    throw new Error(`Invalid digest length: expected 32 bytes, got ${digestBytes.length}`)
  }

  // 2) Ask KMS to sign the 32-byte digest (DON’T let KMS re-hash)
  const { Signature } = await kms.send(
    new SignCommand({
      KeyId: keyId,
      Message: digestBytes,
      MessageType: 'DIGEST',
      SigningAlgorithm: 'ECDSA_SHA_256' // for ECC_SECG_P256K1 keys
    })
  )
  if (!Signature) throw new Error('KMS returned no signature')

  // 3) KMS returns DER-encoded ECDSA. Decode to (r,s) and normalize S (low-s)
  const der = new Uint8Array(Signature)
  // Parse DER format manually to get r and s values
  const { r: rBigInt, s: sBigInt } = parseDERSignature(der)
  const sig = new secp256k1.Signature(rBigInt, sBigInt)
  const r = toHex32(sig.r)
  const s = toHex32(sig.s)

  // 4) Properly determine v by trying both values and validating against expected address
  const expectedAddress = params.address.toLowerCase()
  
  console.log('KMS Signature Recovery Debug:', {
    expectedAddress,
    digest,
    r,
    s,
    signatureLength: (r + s.slice(2)).length
  })
  
  // Try v = 27 first
  let v = 27
  let recoveredAddress: string
  
  try {
    const signatureWithV27 = (r + s.slice(2) + '1b') as Hex // 0x1b = 27
    console.log('Attempting recovery with v=27, signature:', signatureWithV27)
    
    recoveredAddress = await recoverAddress({
      hash: digest,
      signature: signatureWithV27
    })
    
    console.log('Recovery with v=27 result:', recoveredAddress)
    
    if (recoveredAddress.toLowerCase() !== expectedAddress) {
      // Try v = 28
      v = 28
      const signatureWithV28 = (r + s.slice(2) + '1c') as Hex // 0x1c = 28
      console.log('Attempting recovery with v=28, signature:', signatureWithV28)
      
      recoveredAddress = await recoverAddress({
        hash: digest,
        signature: signatureWithV28
      })
      
      console.log('Recovery with v=28 result:', recoveredAddress)
    }
  } catch (error) {
    console.log('Viem recoverAddress failed, using manual recovery:', error)
    
    // Fallback to manual recovery using secp256k1
    const messageHash = digest
    const messageHashBytes = hexToBytes(messageHash)
    
    // Try v = 27
    const sig27 = new secp256k1.Signature(sig.r, sig.s, 27)
    const pubKey27 = sig27.recoverPublicKey(messageHashBytes)
    const address27 = '0x' + keccak256(pubKey27.toRawBytes(false).slice(1)).slice(26)
    
    console.log('Manual recovery v=27 result:', address27)
    
    if (address27.toLowerCase() === expectedAddress) {
      v = 27
      recoveredAddress = address27
    } else {
      // Try v = 28
      v = 28
      const sig28 = new secp256k1.Signature(sig.r, sig.s, 28)
      const pubKey28 = sig28.recoverPublicKey(messageHashBytes)
      const address28 = '0x' + keccak256(pubKey28.toRawBytes(false).slice(1)).slice(26)
      
      console.log('Manual recovery v=28 result:', address28)
      recoveredAddress = address28
    }
  }
  
  console.log('Final signature recovery result:', {
    expectedAddress,
    recoveredAddress,
    v,
    match: recoveredAddress.toLowerCase() === expectedAddress
  })
  
  // Validate that the recovered address matches the expected address
  if (recoveredAddress.toLowerCase() !== expectedAddress) {
    throw new Error(
      `Signature recovery failed: expected ${expectedAddress}, got ${recoveredAddress}. ` +
      `This indicates a problem with the KMS signing process. ` +
      `Digest: ${digest}, R: ${r}, S: ${s}, V: ${v}`
    )
  }

  return { r, s, v }
}

/** Make a "wallet" that Hyperliquid signers can call. */
export async function makeKmsWallet(kms: KMSClient, keyId: string) {
  const address = await getEthAddress() // from your existing code
  return {
    address, // handy if a client needs it
    async signTypedData<T extends TypedData>(td: T): Promise<Hex> {
      const { r, s, v } = await kmsSignTypedData({ kms, keyId, address, typedData: td })
      // Return 65-byte hex (r || s || v) if the caller expects a single hex
      const vHex = ('0x' + v.toString(16).padStart(2, '0')) as Hex
      return (r + s.slice(2) + vHex.slice(2)) as Hex
    },
    // Optional helper if a caller prefers {r,s,v}
    async signTypedDataRSV<T extends TypedData>(td: T) {
      return kmsSignTypedData({ kms, keyId, address, typedData: td })
    }
  }
}
