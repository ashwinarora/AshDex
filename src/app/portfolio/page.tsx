import PortfolioHeader from '@/components/Portfolio/PortfolioHeader'
import PortfolioStats from '@/components/Portfolio/PortfolioStats'
import UserData from '@/components/Trading/UserData/UserData'

const PortfolioPage = () => {
  return (
    <div className="w-full text-white/50 h-full max-h-screen flex flex-col gap-1 p-1">
      <div className="w-full h-fit shrink-0">
        <PortfolioHeader />
      </div>
      <div className="w-full h-fit shrink-0">
        <PortfolioStats />
      </div>
      <div className="w-full h-96">
        <UserData />
      </div>
    </div>
  )
}

export default PortfolioPage
