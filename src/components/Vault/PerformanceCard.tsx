import Image from 'next/image'
import infoicon from '../../assets/images/info_icon.svg'
import { PerformanceItem } from '@/app/vaults/[slug]/page'

interface PerformanceCardProps extends PerformanceItem {
  mainTitle: string
}
export const PerformanceCard: React.FC<PerformanceCardProps> = ({
  mainTitle,
  value,
  changeProfit,
  changeLost,
  period
}) => {
  return (
    <div className="bg-gradient-to-b px-5 w-full text-center from-white/5 via-gray-400/5 border-2 border-white/10 backdrop-blur-[48px] p-4 rounded-xl">
      <div className="flex justify-start items-center mb-1.5 gap-x-1">
        <p className="text-[#8B8BA0] text-sm font-medium">{mainTitle}</p>
        <Image
          className="opacity-80 cursor-pointer"
          src={infoicon}
          alt="infoicon"
          width={15}
          height={15}
        />
      </div>
      <div className="flex items-baseline gap-1 flex-wrap">
        <span className="text-white text-xl font-bold">{value}</span>
        <div className="font-bold text-base">
          {changeProfit && <span className="text-[#2FA766]">{changeProfit}</span>}
          {changeLost && <span className="text-[#E2464A]">{changeLost}</span>}
          {period && <span className="ps-1 text-[#8B8BA0]">{period}</span>}
        </div>
      </div>
    </div>
  )
}
