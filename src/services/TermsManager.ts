import { PrismaClient, Terms } from '@/lib/prisma/client'

class TermsManager {
  private static instance: TermsManager
  private prisma: PrismaClient

  private constructor() {
    this.prisma = new PrismaClient()
  }

  public static getInstance(): TermsManager {
    if (!TermsManager.instance) {
      TermsManager.instance = new TermsManager()
    }
    return TermsManager.instance
  }

  public async getLatestTerms(): Promise<Terms | null> {
    return this.prisma.terms.findFirst({
      orderBy: { created_at: 'desc' }
    })
  }

  public async getTermsById(id: number): Promise<Terms | null> {
    return this.prisma.terms.findUnique({
      where: { id }
    })
  }

  public async hasUserSignedLatestTerms(wallet_id: string): Promise<boolean> {
    // Find the latest terms
    const latestTerms = await this.prisma.terms.findFirst({
      orderBy: { created_at: 'desc' }
    })
    if (!latestTerms) {
      return false
    }

    // Find the user by wallet_id
    const user = await this.prisma.user.findUnique({
      where: { wallet_id }
    })
    if (!user) {
      return false
    }

    // Check if the user has a signature for the latest terms
    const signature = await this.prisma.userTermsSignature.findUnique({
      where: {
        user_id_terms_id: {
          user_id: user.id,
          terms_id: latestTerms.id
        }
      }
    })

    return !!signature
  }
}

export default TermsManager.getInstance()
