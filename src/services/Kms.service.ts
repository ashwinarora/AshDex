import { GetPublicKeyCommand, KMSClient, SignCommand } from '@aws-sdk/client-kms'
import { hashTypedData, type Hex, type Address, recoverAddress, keccak256 } from 'viem'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { hexToBytes } from 'viem/utils'
import { computeAddress } from 'ethers/transaction'

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

class KmsManager {
  private static instance: KmsManager
  private kms?: KMSClient
  private keyId?: string

  private constructor() {
    // Intentionally empty.
    //
    // IMPORTANT: Do not touch env vars / instantiate AWS clients at module import time.
    // Next.js can import server modules during `next build` ("Collecting page data"),
    // which would otherwise fail the build when AWS creds are not present.
  }

  public static getInstance(): KmsManager {
    if (!KmsManager.instance) {
      KmsManager.instance = new KmsManager()
    }
    return KmsManager.instance
  }

  private ensureKMSClient(): { kms: KMSClient; keyId: string } {
    if (this.kms && this.keyId) return { kms: this.kms, keyId: this.keyId }

    const region =
      process.env.MY_AWS_REGION ??
      process.env.AWS_REGION ??
      process.env.AWS_DEFAULT_REGION ??
      'ap-south-1'
    const accessKeyId = process.env.MY_AWS_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID ?? ''
    const secretAccessKey =
      process.env.MY_AWS_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY ?? ''
    const keyId = process.env.MY_KMS_KEY_ID ?? 'alias/eth-admin'

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        'Missing AWS credentials. Set MY_AWS_ACCESS_KEY_ID/MY_AWS_SECRET_ACCESS_KEY (preferred) or AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY.'
      )
    }

    const kms = new KMSClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    })

    this.kms = kms
    this.keyId = keyId
    return { kms, keyId }
  }

  /**
   * Get Ethereum address from KMS public key
   */
  public async getEthAddressFromKMS(): Promise<Address> {
    const { kms, keyId } = this.ensureKMSClient()
    const { PublicKey } = await kms.send(new GetPublicKeyCommand({ KeyId: keyId }))
    if (!PublicKey) throw new Error('KMS returned no public key')

    const spkiDer = Buffer.from(PublicKey)
    const rawXY = spkiDer.subarray(-64)
    const uncompressedKey = Buffer.concat([Buffer.from([0x04]), rawXY])
    const uncompressedHex = '0x' + uncompressedKey.toString('hex')
    const address = computeAddress(uncompressedHex)

    return address as Address
  }

  /**
   * Convert bigint to 32-byte hex string
   */
  private toHex32(n: bigint): Hex {
    return ('0x' + n.toString(16).padStart(64, '0')) as Hex
  }

  /**
   * Parse DER-encoded ECDSA signature to extract r and s values
   */
  private parseDERSignature(der: Uint8Array): { r: bigint; s: bigint } {
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

  /**
   * Sign an EIP-712 typed-data hash with AWS KMS (secp256k1), returning {r,s,v}
   */
  private async kmsSignTypedData(params: {
    address: Address
    typedData: TypedData
  }): Promise<{ r: Hex; s: Hex; v: number }> {
    const { kms, keyId } = this.ensureKMSClient()
    const { address, typedData } = params

    // 1) EIP-712 digest (keccak256 of typed data)
    const digest = hashTypedData(typedData) // 0x…32 bytes
    const digestBytes = hexToBytes(digest)

    // Ensure digest is 32 bytes
    if (digestBytes.length !== 32) {
      throw new Error(`Invalid digest length: expected 32 bytes, got ${digestBytes.length}`)
    }

    // 2) Ask KMS to sign the 32-byte digest (DON'T let KMS re-hash)
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
    const { r: rBigInt, s: sBigInt } = this.parseDERSignature(der)
    const sig = new secp256k1.Signature(rBigInt, sBigInt)
    const r = this.toHex32(sig.r)
    const s = this.toHex32(sig.s)

    // 4) Properly determine v by trying both values and validating against expected address
    const expectedAddress = address.toLowerCase()

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
      const address27 = '0x' + keccak256(pubKey27.toBytes(false).slice(1)).slice(26)

      console.log('Manual recovery v=27 result:', address27)

      if (address27.toLowerCase() === expectedAddress) {
        v = 27
        recoveredAddress = address27
      } else {
        // Try v = 28
        v = 28
        const sig28 = new secp256k1.Signature(sig.r, sig.s, 28)
        const pubKey28 = sig28.recoverPublicKey(messageHashBytes)
        const address28 = '0x' + keccak256(pubKey28.toBytes(false).slice(1)).slice(26)

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

  /**
   * Make a "wallet" that can sign typed data using KMS
   */
  public async makeKmsWallet(address: Address) {
    return {
      address, // handy if a client needs it
      signTypedData: async <T extends TypedData>(td: T): Promise<Hex> => {
        const { r, s, v } = await this.kmsSignTypedData({ address, typedData: td })
        // Return 65-byte hex (r || s || v) if the caller expects a single hex
        const vHex = ('0x' + v.toString(16).padStart(2, '0')) as Hex
        return (r + s.slice(2) + vHex.slice(2)) as Hex
      },
      // Optional helper if a caller prefers {r,s,v}
      signTypedDataRSV: async <T extends TypedData>(td: T) => {
        return this.kmsSignTypedData({ address, typedData: td })
      }
    }
  }
}

export default KmsManager.getInstance()
