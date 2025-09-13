import FooterCompact from '@/components/FooterCompact'
import PortfolioHeader from '@/components/Portfolio/PortfolioHeader'
import PortfolioStats from '@/components/Portfolio/PortfolioStats'
import UserData from '@/components/Trading/UserData/UserData'

const PortfolioPage = () => {
  return (
    <div className="w-full text-white/50 mb-8 h-screen flex flex-col gap-1 p-1">
      <div className="w-full h-fit shrink-0">
        <PortfolioHeader />
      </div>
      <div className="w-full h-fit shrink-0">
        <PortfolioStats />
      </div>
      <div className="w-full h-[calc(100dvh-412px)]">
        <UserData />
      </div>
      <FooterCompact />
    </div>
  )
}

export default PortfolioPage
