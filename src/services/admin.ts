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

// /** Sign data using AWS KMS and return the signature. */
// export async function signData(data: string): Promise<Hex> {
//   try {
//     // Use viem's hashMessage to ensure exact same format as verifyMessage
//     const messageHash = hashMessage(data);

//     console.log('Message hash (Ethereum format):', messageHash);

//     // Convert hex to Uint8Array for KMS
//     const messageHashBytes = hexToBytes(messageHash);

//     // Sign the hash using KMS
//     const { Signature } = await kms.send(new SignCommand({
//       KeyId: keyId,
//       Message: messageHashBytes,
//       MessageType: 'DIGEST',
//       SigningAlgorithm: 'ECDSA_SHA_256'
//     }));

//     if (!Signature) throw new Error("KMS returned no signature");

//     console.log('DER signature length:', Signature.length);
//     console.log('DER signature (first 20 bytes):', Buffer.from(Signature).slice(0, 20).toString('hex'));
//     console.log('Full DER signature:', Buffer.from(Signature).toString('hex'));

//     // Convert DER signature to raw r,s format
//     const derSignature = Buffer.from(Signature);
//     const rawSignature = derToRaw(derSignature);

//     console.log('Raw signature length:', rawSignature.length);
//     console.log('Raw signature:', rawSignature.toString('hex'));

//     // Add recovery ID to make it a complete Ethereum signature (65 bytes)
//     // We need to determine the correct recovery ID (0 or 1) by testing which one
//     // produces the correct address when recovered
//     const expectedAddress = await getEthAddress();

//     let finalSignature: Hex;
//     for (const recoveryId of [0, 1]) {
//       const ethereumSignature = Buffer.concat([rawSignature, Buffer.from([recoveryId])]);
//       const testSignature = toHex(ethereumSignature) as Hex;

//       try {
//         const { recoverMessageAddress } = await import('viem');
//         const recoveredAddress = await recoverMessageAddress({
//           message: data,
//           signature: testSignature
//         });

//         if (recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()) {
//           console.log(`Correct recovery ID found: ${recoveryId}`);
//           finalSignature = testSignature;
//           break;
//         }
//       } catch (error) {
//         // Try next recovery ID
//         continue;
//       }
//     }

//     if (!finalSignature!) {
//       throw new Error('Could not determine correct recovery ID');
//     }

//     console.log('Final signature (65 bytes):', finalSignature);

//     return finalSignature;
//   } catch (error) {
//     console.error('Signing failed:', error);
//     throw error;
//   }
// }

// /** Verify a signature against a message using viem and compare with KMS address. */
// export async function verifySignature(
//   message: string,
//   signature: Hex
// ): Promise<boolean> {
//   try {
//     // Get the expected address from KMS
//     const expectedAddress = await getEthAddress();
//     console.log('Expected address:', expectedAddress);
//     console.log('Message to verify:', message);
//     console.log('Signature to verify:', signature);

//     // Let's also test what address viem recovers from the signature
//     const { recoverMessageAddress } = await import('viem');
//     const recoveredAddress = await recoverMessageAddress({ message, signature });
//     console.log('Recovered address:', recoveredAddress);
//     console.log('Addresses match:', recoveredAddress.toLowerCase() === expectedAddress.toLowerCase());

//     // Use viem's verifyMessage to verify the signature
//     const isValid = await verifyMessage({
//       address: expectedAddress,
//       message,
//       signature
//     });

//     console.log('Verification result:', isValid);
//     return isValid;
//   } catch (error) {
//     console.error('Signature verification failed:', error);
//     return false;
//   }
// }

// /** Convert DER signature to raw r,s format (64 bytes). */
// function derToRaw(derSignature: Buffer): Buffer {
//   try {
//     // Validate DER structure
//     if (derSignature.length < 8 || derSignature[0] !== 0x30) {
//       throw new Error("Invalid DER signature format");
//     }

//     let offset = 2;
//     const totalLength = derSignature[1];

//     // Parse r component
//     if (offset >= derSignature.length || derSignature[offset] !== 0x02) {
//       throw new Error("Invalid r component in DER signature");
//     }
//     offset++;
//     const rLength = derSignature[offset];
//     offset++;

//     if (offset + rLength > derSignature.length) {
//       throw new Error("Invalid r length in DER signature");
//     }

//     let r = derSignature.slice(offset, offset + rLength);
//     offset += rLength;

//     // Parse s component
//     if (offset >= derSignature.length || derSignature[offset] !== 0x02) {
//       throw new Error("Invalid s component in DER signature");
//     }
//     offset++;
//     const sLength = derSignature[offset];
//     offset++;

//     if (offset + sLength > derSignature.length) {
//       throw new Error("Invalid s length in DER signature");
//     }

//     let s = derSignature.slice(offset, offset + sLength);

//     // Remove leading zero bytes (if any)
//     while (r.length > 1 && r[0] === 0) {
//       r = r.subarray(1);
//     }
//     while (s.length > 1 && s[0] === 0) {
//       s = s.subarray(1);
//     }

//     // Pad to 32 bytes each
//     const rPadded = Buffer.alloc(32);
//     const sPadded = Buffer.alloc(32);

//     if (r.length > 32 || s.length > 32) {
//       throw new Error("Signature components too long");
//     }

//     r.copy(rPadded, 32 - r.length);
//     s.copy(sPadded, 32 - s.length);

//     return Buffer.concat([rPadded, sPadded]);
//   } catch (error) {
//     console.error('DER to raw conversion failed:', error);
//     throw new Error(`Failed to convert DER signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
//   }
// }

// /** Convert raw r,s signature to DER format. */
// function rawToDer(rawSignature: Buffer): Buffer {
//   const r = rawSignature.slice(0, 32);
//   const s = rawSignature.slice(32, 64);

//   // Remove leading zeros, but handle case where all bytes are zero
//   const rFirstNonZero = r.findIndex(byte => byte !== 0);
//   const sFirstNonZero = s.findIndex(byte => byte !== 0);

//   const rTrimmed = rFirstNonZero === -1 ? Buffer.from([0]) : r.slice(rFirstNonZero);
//   const sTrimmed = sFirstNonZero === -1 ? Buffer.from([0]) : s.slice(sFirstNonZero);

//   // Build DER structure
//   const rSection = Buffer.concat([
//     Buffer.from([0x02]), // INTEGER tag
//     Buffer.from([rTrimmed.length]), // length
//     rTrimmed
//   ]);

//   const sSection = Buffer.concat([
//     Buffer.from([0x02]), // INTEGER tag
//     Buffer.from([sTrimmed.length]), // length
//     sTrimmed
//   ]);

//   const totalLength = rSection.length + sSection.length;

//   return Buffer.concat([
//     Buffer.from([0x30]), // SEQUENCE tag
//     Buffer.from([totalLength]), // total length
//     rSection,
//     sSection
//   ]);
// }
