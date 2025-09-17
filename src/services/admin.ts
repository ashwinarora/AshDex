// lib/kmsEth.ts
// Must run on the server (Node.js runtime).
import { KMSClient, GetPublicKeyCommand } from '@aws-sdk/client-kms'
import { createPublicKey } from 'crypto'
import { Address, getAddress, keccak256, slice } from 'viem'
import { hexToBytes, type Hex } from 'viem'

const region = process.env.AWS_REGION ?? 'ap-south-1'
const keyId = process.env.KMS_KEY_ID ?? 'alias/eth-admin'

const kms = new KMSClient({ region })

/** Returns the uncompressed secp256k1 public key as 0x04 + X(32) + Y(32). */
export async function getKmsUncompressedPublicKey(): Promise<Hex> {
  const { PublicKey } = await kms.send(new GetPublicKeyCommand({ KeyId: keyId }))
  if (!PublicKey) throw new Error('KMS returned no public key')

  // KMS returns SPKI (DER). Use Node crypto to extract x & y.
  const spkiDer = Buffer.from(PublicKey)
  const keyObj = createPublicKey({ key: spkiDer, format: 'der', type: 'spki' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jwk = keyObj.export({ format: 'jwk' }) as any
  if (jwk.kty !== 'EC' || jwk.crv !== 'secp256k1') {
    throw new Error(`Unexpected key type: ${jwk.kty}/${jwk.crv}`)
  }

  const x = Buffer.from(jwk.x, 'base64url')
  const y = Buffer.from(jwk.y, 'base64url')
  if (x.length !== 32 || y.length !== 32) throw new Error('Bad XY length')

  const uncompressed = Buffer.concat([Buffer.from([0x04]), x, y])
  return ('0x' + uncompressed.toString('hex')) as Hex
}

/** Derive EVM address from an *uncompressed* public key hex (0x04 + X + Y). */
export function uncompressedPublicKeyToAddress(uncompressed: Hex): Address {
  const pubBytes = hexToBytes(uncompressed)
  const hash = keccak256(pubBytes.slice(1)) // drop 0x04 prefix
  const addr20 = slice(hash, 12) // last 20 bytes (offset 12..32)
  return getAddress(addr20) // EIP-55 checksum
}

/** Convenience: fetch pubkey from KMS and return checksummed address. */
export async function getEthAddress(): Promise<Address> {
  const uncompressed = await getKmsUncompressedPublicKey()
  return uncompressedPublicKeyToAddress(uncompressed)
}

