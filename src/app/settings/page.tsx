'use client'
import React, { useEffect, useState } from 'react'
import { Tabs, TabsTrigger, TabsList } from '@/components/ui/tabs'
import {
  IconCheck,
  IconClipboardCheckFilled,
  IconCopy,
  IconDeviceImacFilled,
  IconEdit,
  IconX
} from '@tabler/icons-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { truncateAddress } from '@/utils/utils'
// import { useComponentRendered } from '@/hooks/useComponentRendered'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useConnection } from 'wagmi'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useLanguageSettings, useUserPreferences } from '@/store/userStore'
// import { useTolgee } from '@tolgee/react'
import { setLanguage } from '@/tolgee/language'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

// Update interface for user info (keeping for username/avatar parts that will use TanStack Query)
interface UserInfo {
  nickname: string | undefined
  address: string | undefined
  avatar: string | number
  ip: string
  lastLogin: string
  securityLevel: string
  wallet_id?: string
}

const SettingsPage = () => {
  const router = useRouter()
  const { address, isConnected } = useConnection()
  // const isRendered = useComponentRendered()

  // const tolgee = useTolgee(['language'])
  // const language = tolgee.getLanguage()

  // UserStore hooks
  const { userPreferences, updateNotificationSetting, setPopupPosition, setSoundEnabled } =
    useUserPreferences()

  const { preferredLanguage, setPreferredLanguage } = useLanguageSettings()

  // Temporary user info (will be replaced with TanStack Query)
  const userInfo: UserInfo = {
    nickname: 'User', // Will come from TanStack Query
    address: address,
    avatar: '0', // Will come from TanStack Query
    ip: '192.168.1.1',
    lastLogin: '2025-04-03 09:07',
    securityLevel: 'Low',
    wallet_id: address
  }

  const [isOpen, setIsOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [ipAddress, setIpAddress] = useState('')
  const [selectedTab, setSelectedTab] = useState('Account')

  const handleCloseModal = () => {
    setIsOpen(false)
  }

  // Notification settings configuration
  const notificationSettings = {
    order_updates: {
      id: 'order_updates' as const,
      value: userPreferences.order_updates,
      label: 'Order Updates'
    },
    liquidation_alerts: {
      id: 'liquidation_alerts' as const,
      value: userPreferences.liquidation_alerts,
      label: 'Liquidation Alerts'
    },
    new_feature_updates: {
      id: 'new_feature_updates' as const,
      value: userPreferences.new_feature_updates,
      label: 'New Feature Updates'
    },
    new_token_listings: {
      id: 'new_token_listings' as const,
      value: userPreferences.new_token_listings,
      label: 'New Token Listings'
    },
    vaults_distribution_updates: {
      id: 'vaults_distribution_updates' as const,
      value: userPreferences.vaults_distribution_updates,
      label: 'Vaults Distribution Updates'
    },
    rewards_referrals_updates: {
      id: 'rewards_referrals_updates' as const,
      value: userPreferences.rewards_referrals_updates,
      label: 'Rewards & Referrals Updates'
    },
    security_alerts: {
      id: 'security_alerts' as const,
      value: userPreferences.security_alerts,
      label: 'Security Alerts'
    }
  }

  const getIpAddress = async () => {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  }

  useEffect(() => {
    if (isConnected) {
      getIpAddress().then((ip) => {
        setIpAddress(ip)
      })
    }
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  // if (!isRendered) return null

  return (
    isConnected && (
      <div className="p-4 sm:p-8 min-h-screen text-white">
        <div className="max-w-7xl mx-auto nexon-card p-4 max-sm:p-2">
          <div className="flex flex-col sm:flex-row justify-between sm:justify-start items-center sm:items-start max-md:items-start mb-4 sm:mb-4 gap-4">
            <Tabs
              value={selectedTab}
              onValueChange={(value) => {
                setSelectedTab(value)
              }}
            >
              <TabsList>
                <TabsTrigger value="Account">Account</TabsTrigger>
                <TabsTrigger value="Notifications">Notifications</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {selectedTab === 'Account' && (
            <div className="py-4">
              <div className="flex items-center mb-6 gap-2">
                <Avatar>
                  <AvatarImage src={String(userInfo.avatar)} />
                  <AvatarFallback>{String(userInfo.avatar)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                    {userInfo?.nickname ?? <Skeleton className="w-20 h-4" />}
                    <IconEdit
                      className="w-5 h-5 cursor-pointer opacity-50"
                      onClick={() => setIsOpen(true)}
                    />
                  </div>
                  <div className="text-xs mt-1 font-medium sm:text-sm text-[#8B8BA0] flex items-center gap-2">
                    {userInfo.address ? (
                      truncateAddress(userInfo.address)
                    ) : (
                      <Skeleton className="w-20 h-2 mt-2" />
                    )}

                    {isCopied ? (
                      <div className="flex items-center gap-2">
                        <IconClipboardCheckFilled className="w-4 h-4  " />
                        <p className="text-xs text-green-500">Copied</p>
                      </div>
                    ) : (
                      <IconCopy
                        className="w-4 h-4 cursor-pointer"
                        onClick={() => {
                          if (userInfo.address) {
                            navigator.clipboard.writeText(userInfo.address)
                            setIsCopied(true)
                            setTimeout(() => {
                              setIsCopied(false)
                            }, 5000)
                            toast.success('Copied to clipboard')
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 max-sm:gap-y-1.5 gap-4 mb-6">
                <div className="nexon-rounded-xl flex max-md:items-center max-md:justify-between max-md:flex-row flex-col font-medium nexon-card max-sm:px-2 p-4 py-2">
                  <p className="text-sm text-[#8B8BA0]">IP</p>
                  <div className="text-lg max-sm:text-base text-white">
                    {ipAddress || <Skeleton className="w-full h-7" />}
                  </div>
                </div>
                <div className="nexon-rounded-xl flex max-md:items-center max-md:justify-between max-md:flex-row flex-col font-medium nexon-card max-sm:px-2 p-4 py-2">
                  <p className="text-sm text-[#8B8BA0]">Last login time</p>
                  <p className="text-lg max-sm:text-base flex items-center gap-2 text-nowrap">
                    <IconDeviceImacFilled className="w-4 h-4 opacity-70" />
                    PC | 2025-04-03 09:07
                  </p>
                </div>
                <div className="nexon-rounded-xl max-md:items-center max-md:justify-between max-md:flex-row flex-col font-medium nexon-card p-4 py-2 hidden">
                  <p className="text-sm text-[#8B8BA0]">Security Level</p>
                  <p className="text-lg text-red">Low</p>
                </div>
              </div>
              <div className="w-full sm:w-max">
                <p className="text-sm font-medium text-[#8B8BA0] mb-2">Language</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="nexon-card nexon-rounded-lg cursor-pointer"
                    >
                      {preferredLanguage}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setPreferredLanguage('en-US')
                        setLanguage('en-US')
                      }}
                    >
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setPreferredLanguage('ar-SA')
                        setLanguage('ar-SA')
                      }}
                    >
                      العربية
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="hidden">
                <p className="text-sm text-[#8B8BA0] mb-2">Session Management</p>
                <div className="nexon-rounded-xl nexon-card p-4 flex justify-between items-center mb-2">
                  <p className="text-lg font-bold flex items-center gap-2">
                    <IconDeviceImacFilled className="w-12 h-12 bg-white/10 rounded-lg p-2 text-white/80" />
                    PC | 2025-04-03 09:07
                  </p>
                  <button
                    onClick={() => {
                      toast.error('Session ended successfully')
                    }}
                    className="nexon-button nexon-rounded-xl py-1 px-3 hover:bg-opacity-90"
                  >
                    End session
                  </button>
                </div>
              </div>
            </div>
          )}
          {selectedTab === 'Notifications' && (
            <div className="flex flex-col xl:flex-row  gap-4">
              <div className="nexon-card nexon-rounded-xl max-md:p-2 p-6">
                <p className="text-xl tracking-normal font-medium text-white max-md:mb-0 mb-2">
                  Notifications
                </p>
                <div className="flex flex-row gap-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-md:px-0 p-2 w-full">
                    {Object.values(notificationSettings).map((notification) => (
                      <Switch
                        key={notification.id}
                        checked={notification.value}
                        onCheckedChange={(value) => {
                          updateNotificationSetting(notification.id, value)
                        }}
                      >
                        {notification.label}
                      </Switch>
                    ))}
                  </div>
                </div>
              </div>
              <div className="nexon-card max-md:p-2 nexon-rounded-xl p-6 w-full">
                <p className="text-xl tracking-normal font-medium text-white mb-3">
                  Display Settings
                </p>
                <div className="flex flex-col gap-2 mb-4">
                  <RadioGroup
                    className="grid grid-cols-4 max-sm:grid-cols-2 max-sm:gap-2 gap-4"
                    name="Popup"
                    value={userPreferences.popup_position.toString()}
                    onValueChange={(value) => {
                      setPopupPosition(parseInt(value))
                    }}
                  >
                    <RadioGroupItem className="order-1 max-sm:order-3" value="0" />
                    <RadioGroupItem className="order-2 max-sm:order-4" value="1" />
                    <RadioGroupItem className="order-3 max-sm:order-1" value="2" />
                    <RadioGroupItem className="order-4 max-sm:order-2" value="3" />
                  </RadioGroup>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-base mb-1 tracking-tight font-medium text-[#8B8BA0]">
                    Sound Settings
                  </label>
                  <Switch
                    checked={userPreferences.sound_enabled}
                    onCheckedChange={(value) => {
                      setSoundEnabled(value as boolean)
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        <EditNicknameModal isOpen={isOpen} onClose={handleCloseModal} userInfo={userInfo} />
      </div>
    )
  )
}

const EditNicknameModal = ({
  isOpen,
  onClose,
  userInfo
}: {
  isOpen: boolean
  onClose: () => void
  userInfo: UserInfo
}) => {
  const [nickname, setNickname] = useState<string>(userInfo.nickname || '')
  const [avatar, setAvatar] = useState<string | number>(userInfo.avatar || '0')

  useEffect(() => {
    setNickname(userInfo.nickname || '')
    setAvatar(userInfo.avatar || '0')
  }, [userInfo])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-secondary relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2 rounded-2xl border-2 border-white/5 backdrop-blur-2xl  flex items-center justify-center  "
        >
          <div className="w-96 rounded-xl  p-4 shadow-xl text-white gap-4 flex flex-col">
            <button
              onClick={onClose}
              className="w-8 h-8 float-right ml-auto text-white/70hover:text-white bg-white/10 backdrop-blur-2xl rounded-full p-2 text-sm cursor-pointer"
            >
              <IconX className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={String(avatar)} />
                <AvatarFallback>{String(avatar)}</AvatarFallback>
              </Avatar>
              <div className="bg-white/10 border-2 border-white/5 backdrop-blur-2xl rounded-lg p-2 flex items-center gap-2 w-full">
                <input
                  type="text"
                  placeholder="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="text-white text-sm placeholder-gray-400 w-full outline-none border-none"
                />
                <button className="text-white/70hover:text-white">
                  <IconEdit className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto  bg-white/10 p-2 rounded-lg">
              {Array.from({ length: 45 }).map((_, index) => (
                <div
                  key={index}
                  className={`bg-white/10 p-2 rounded-lg hover:bg-white/10 cursor-pointer border ${avatar === index ? 'border-primary' : ' border-transparent'}`}
                  onClick={() => setAvatar(index)}
                >
                  <div className="w-14 h-14  bg-gradient-to-br from-pink-500 via-red-400 to-yellow-300  relative rounded-full  ">
                    <Avatar>
                      <AvatarImage src={String(index)} />
                      <AvatarFallback>{String(index)}</AvatarFallback>
                    </Avatar>
                    {avatar === index && (
                      <IconCheck className="w-4 h-4 bg-primary rounded-full p-1 absolute bottom-0   " />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                className="nexon-button nexon-ghost flex items-center justify-center text-[#8B8BA0] hover:text-white w-full "
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className={`nexon-button flex items-center justify-center nexon-primary w-full`}
                disabled={
                  nickname === userInfo.nickname && String(avatar) === String(userInfo.avatar)
                }
                onClick={() => {
                  // TODO: This will be handled by TanStack Query
                  toast.success('Settings updated successfully')
                  onClose()
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsPage
