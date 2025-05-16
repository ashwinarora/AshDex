export const formatSolanaAddress = (address: string) => {
  if (!address) return ''
  const addressStr = address.toString()
  return `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`
}
