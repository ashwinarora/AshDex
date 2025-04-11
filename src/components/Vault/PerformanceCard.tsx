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
    <div className="bg-gradient-to-b pl-5 flex max-sm:items-center max-sm:justify-between max-sm:flex-row flex-col w-full text-center from-white/5 via-gray-400/5 border-2 border-white/10 backdrop-blur-[48px] max-sm:px-4 max-sm:py-2 p-4 rounded-xl">
      <div className="flex justify-start items-center mb-1.5 gap-x-1">
        <p className="text-[#8B8BA0] text-sm font-medium">{mainTitle}</p>
        <Image
          className="opacity-80 cursor-pointer w-[15px] h-[15px] max-sm:w-[25px] max-sm:h-[25px]"
          src={infoicon}
          alt="infoicon"
          width={15}
          height={15}
        />
      </div>
      <div className="flex items-baseline gap-x-1 flex-wrap">
        <span className="text-white text-xl max-sm:text-base font-medium">{value}</span>
        <div className="font-medium max-sm:text-xs text-base">
          {changeProfit && <span className="text-[#2FA766]">{changeProfit}</span>}
          {changeLost && <span className="text-[#E2464A]">{changeLost}</span>}
          {period && <span className="ps-1 text-[#8B8BA0]">{period}</span>}
        </div>
      </div>
    </div>
  )
}
