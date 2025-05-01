import Image from 'next/image'
import nexticon from '../../assets/images/next_icon.svg'

type BreadcrumbsProps = {
  mainTitle: string
  subtitle: string
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ mainTitle, subtitle }) => {
  return (
    <div className="flex items-center text-[#8B8BA0] text-sm font-medium px-2 gap-x-2.5">
      <span>{mainTitle}</span>
      <span>
        <Image
          className="opacity-70"
          style={{ width: 5, height: 'auto' }}
          src={nexticon}
          alt="nexticon"
        />
      </span>
      <span className="text-white">{subtitle}</span>
    </div>
  )
}
