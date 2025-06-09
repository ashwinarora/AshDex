'use client'
import React, { useEffect, useState, useRef } from 'react'
import Tabs from '@/components/common/Tabs'
import {
  IconCheck,
  IconClipboardCheckFilled,
  IconCopy,
  IconDeviceImacFilled,
  IconEdit,
  IconX
} from '@tabler/icons-react'
import Modal from '@/components/common/Modal'
import CustomSelector from '@/components/common/CustomSelector'
import { truncateAddress } from '@/utils/utils'
import { useComponentRendered } from '@/hooks/useComponentRendered'
import { useUser } from '@/context/UserContext'
import Avatar from '@/components/common/Avatar'
import { updateUser } from '@/utils/user'
import Skeleton from '@/components/common/Skeleton'
import { toast } from 'react-toastify'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import Switch from '@/components/common/Switch'
import RadioGroup, { RadioGroupItem } from '@/components/common/RadioGroup'

// Define types for notification settings
type NotificationSettingKey =
  | 'order_updates'
  | 'liquidation_alerts'
  | 'new_feature_updates'
  | 'new_token_listings'
  | 'vaults_distribution_updates'
  | 'rewards_referrals_updates'
  | 'security_alerts'

type NotificationSettings = {
  [key in NotificationSettingKey]: {
    id: string
    value: boolean
    label: string
  }
}

type InitialNotificationSettings = {
  [key in NotificationSettingKey]: boolean
}

// Update interface for user info
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
  const { currentUser, refreshUser } = useUser()
  const { address, isConnected } = useAccount()
  const isRendered = useComponentRendered()
  // Debug log to check user data structure
  useEffect(() => {
    console.log('Current User Data:', currentUser)
    console.log('User Preferences:', currentUser?.user_preferences)
  }, [currentUser])

  // Initial values ref to track changes
  const initialValuesRef = useRef({
    language: 'English',
    popupPosition: currentUser?.user_preferences?.popup_position?.toString() || '2',
    soundEnabled: currentUser?.user_preferences?.sound_enabled || false,
    notificationSettings: {
      order_updates: currentUser?.user_preferences?.order_updates || false,
      liquidation_alerts: currentUser?.user_preferences?.liquidation_alerts || false,
      new_feature_updates: currentUser?.user_preferences?.new_feature_updates || false,
      new_token_listings: currentUser?.user_preferences?.new_token_listings || false,
      vaults_distribution_updates:
        currentUser?.user_preferences?.vaults_distribution_updates || false,
      rewards_referrals_updates: currentUser?.user_preferences?.rewards_referrals_updates || false,
      security_alerts: currentUser?.user_preferences?.security_alerts || false
    } as InitialNotificationSettings
  })

  const userInfo: UserInfo = {
    nickname: currentUser?.username,
    address: address,
    avatar: String(currentUser?.avatar_url || '0'),
    ip: '192.168.1.1',
    lastLogin: '2025-04-03 09:07',
    securityLevel: 'Low',
    wallet_id: address
  }

  const [isOpen, setIsOpen] = useState(false)
  const handleCloseModal = () => {
    setIsOpen(false)
  }

  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [isCopied, setIsCopied] = useState(false)
  const [ipAddress, setIpAddress] = useState('')
  const [selectedTab, setSelectedTab] = useState('Account')
  const [popupPosition, setPopupPosition] = useState(
    currentUser?.user_preferences?.popup_position?.toString() || '2'
  )
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    order_updates: {
      id: 'order_updates',
      value: currentUser?.user_preferences?.order_updates || false,
      label: 'Order Updates'
    },
    liquidation_alerts: {
      id: 'liquidation_alerts',
      value: currentUser?.user_preferences?.liquidation_alerts || false,
      label: 'Liquidation Alerts'
    },
    new_feature_updates: {
      id: 'new_feature_updates',
      value: currentUser?.user_preferences?.new_feature_updates || false,
      label: 'New Feature Updates'
    },
    new_token_listings: {
      id: 'new_token_listings',
      value: currentUser?.user_preferences?.new_token_listings || false,
      label: 'New Token Listings'
    },
    vaults_distribution_updates: {
      id: 'vaults_distribution_updates',
      value: currentUser?.user_preferences?.vaults_distribution_updates || false,
      label: 'Vaults Distribution Updates'
    },
    rewards_referrals_updates: {
      id: 'rewards_referrals_updates',
      value: currentUser?.user_preferences?.rewards_referrals_updates || false,
      label: 'Rewards & Referrals Updates'
    },
    security_alerts: {
      id: 'security_alerts',
      value: currentUser?.user_preferences?.security_alerts || false,
      label: 'Security Alerts'
    }
  })

  const [soundEnabled, setSoundEnabled] = useState(
    currentUser?.user_preferences?.sound_enabled || false
  )

  // Update initial values when currentUser changes
  useEffect(() => {
    if (currentUser) {
      initialValuesRef.current = {
        language: 'English',
        popupPosition: currentUser.user_preferences?.popup_position?.toString() || '2',
        soundEnabled: currentUser.user_preferences?.sound_enabled || false,
        notificationSettings: {
          order_updates: currentUser.user_preferences?.order_updates || false,
          liquidation_alerts: currentUser.user_preferences?.liquidation_alerts || false,
          new_feature_updates: currentUser.user_preferences?.new_feature_updates || false,
          new_token_listings: currentUser.user_preferences?.new_token_listings || false,
          vaults_distribution_updates:
            currentUser.user_preferences?.vaults_distribution_updates || false,
          rewards_referrals_updates:
            currentUser.user_preferences?.rewards_referrals_updates || false,
          security_alerts: currentUser.user_preferences?.security_alerts || false
        } as InitialNotificationSettings
      }

      // Update state values to match current user preferences
      setPopupPosition(currentUser.user_preferences?.popup_position?.toString() || '2')
      setSoundEnabled(currentUser.user_preferences?.sound_enabled || false)
      setNotificationSettings({
        order_updates: {
          id: 'order_updates',
          value: currentUser.user_preferences?.order_updates || false,
          label: 'Order Updates'
        },
        liquidation_alerts: {
          id: 'liquidation_alerts',
          value: currentUser.user_preferences?.liquidation_alerts || false,
          label: 'Liquidation Alerts'
        },
        new_feature_updates: {
          id: 'new_feature_updates',
          value: currentUser.user_preferences?.new_feature_updates || false,
          label: 'New Feature Updates'
        },
        new_token_listings: {
          id: 'new_token_listings',
          value: currentUser.user_preferences?.new_token_listings || false,
          label: 'New Token Listings'
        },
        vaults_distribution_updates: {
          id: 'vaults_distribution_updates',
          value: currentUser.user_preferences?.vaults_distribution_updates || false,
          label: 'Vaults Distribution Updates'
        },
        rewards_referrals_updates: {
          id: 'rewards_referrals_updates',
          value: currentUser.user_preferences?.rewards_referrals_updates || false,
          label: 'Rewards & Referrals Updates'
        },
        security_alerts: {
          id: 'security_alerts',
          value: currentUser.user_preferences?.security_alerts || false,
          label: 'Security Alerts'
        }
      })
    }
  }, [currentUser])

  // Check if any settings have changed
  const hasChanges = () => {
    // Check language
    if (selectedLanguage !== initialValuesRef.current.language) {
      return true
    }

    // Check popup position
    if (popupPosition !== initialValuesRef.current.popupPosition) {
      return true
    }

    // Check sound enabled
    if (soundEnabled !== initialValuesRef.current.soundEnabled) {
      return true
    }

    // Check notification settings
    for (const key in notificationSettings) {
      const typedKey = key as NotificationSettingKey
      if (
        notificationSettings[typedKey].value !==
        initialValuesRef.current.notificationSettings[typedKey]
      ) {
        return true
      }
    }

    return false
  }

  // Handle save changes
  const handleSaveChanges = async () => {
    try {
      // Prepare user preferences object
      const userPreferences = {
        popup_position: parseInt(popupPosition),
        sound_enabled: soundEnabled,
        order_updates: notificationSettings.order_updates.value,
        liquidation_alerts: notificationSettings.liquidation_alerts.value,
        new_feature_updates: notificationSettings.new_feature_updates.value,
        new_token_listings: notificationSettings.new_token_listings.value,
        vaults_distribution_updates: notificationSettings.vaults_distribution_updates.value,
        rewards_referrals_updates: notificationSettings.rewards_referrals_updates.value,
        security_alerts: notificationSettings.security_alerts.value
      }

      // Update user in the database
      if (currentUser && address) {
        await updateUser(address, {
          username: currentUser.username,
          avatar_url: currentUser.avatar_url,
          wallet_id: address,
          user_preferences: userPreferences
        })

        // Update initial values ref to match current values
        initialValuesRef.current = {
          language: selectedLanguage,
          popupPosition,
          soundEnabled,
          notificationSettings: {
            order_updates: notificationSettings.order_updates.value,
            liquidation_alerts: notificationSettings.liquidation_alerts.value,
            new_feature_updates: notificationSettings.new_feature_updates.value,
            new_token_listings: notificationSettings.new_token_listings.value,
            vaults_distribution_updates: notificationSettings.vaults_distribution_updates.value,
            rewards_referrals_updates: notificationSettings.rewards_referrals_updates.value,
            security_alerts: notificationSettings.security_alerts.value
          }
        }

        // Refresh user data
        await refreshUser()
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
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

  if (!isRendered) return null

  return (
    isConnected && (
      <div className="p-4 sm:p-8 min-h-screen text-white">
        <div className="max-w-7xl mx-auto nexon-card p-4 max-sm:p-2">
          <div className="flex flex-col sm:flex-row justify-between sm:justify-start items-center sm:items-start max-md:items-start mb-4 sm:mb-4 gap-4">
            <Tabs
              tabs={['Account', 'Notifications']}
              onTabSelect={(tab) => {
                setSelectedTab(tab)
              }}
            />
            {hasChanges() && (
              <button
                onClick={handleSaveChanges}
                className="nexon-button nexon-primary w-full sm:w-max hidden md:block"
              >
                Save Changes
              </button>
            )}
          </div>
          {selectedTab === 'Account' && (
            <div className="py-4">
              <div className="flex items-center mb-6 gap-2">
                <Avatar avatar={String(userInfo.avatar)} />
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
                <CustomSelector
                  options={[
                    {
                      value: 'English',
                      label: 'English',
                      flag: 'http://purecatamphetamine.github.io/country-flag-icons/3x2/US.svg'
                    },
                    {
                      value: 'Arabic',
                      label: 'العربية',
                      flag: 'http://purecatamphetamine.github.io/country-flag-icons/3x2/SA.svg'
                    }
                  ]}
                  selectedValue={selectedLanguage}
                  onChange={(value) => {
                    setSelectedLanguage(value)
                  }}
                  className="nexon-card nexon-rounded-lg cursor-pointer"
                  isPadding={true}
                />
              </div>
              <div className="hidden">
                <p className="text-sm text-[#8B8BA0] mb-2">Session Management</p>
                <div className="nexon-rounded-xl nexon-card p-4 flex justify-between items-center mb-2">
                  <p className="text-lg font-bold flex items-center gap-2">
                    <IconDeviceImacFilled className="w-12 h-12 bg-white/5 rounded-lg p-2 text-white/80" />
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
                        label={notification.label}
                        isChecked={notification.value}
                        setIsChecked={(value) => {
                          setNotificationSettings({
                            ...notificationSettings,
                            [notification.id]: {
                              ...notification,
                              value: value
                            }
                          })
                        }}
                      />
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
                    label="Popup Position"
                    value={popupPosition}
                    onChange={(value) => {
                      setPopupPosition(value)
                    }}
                  >
                    <RadioGroupItem
                      isBackground={true}
                      className="order-1 max-sm:order-3"
                      value="0"
                      label="Top Left"
                    />
                    <RadioGroupItem
                      className="order-2 max-sm:order-4"
                      value="1"
                      label="Top Right"
                      isBackground={true}
                    />
                    <RadioGroupItem
                      className="order-3 max-sm:order-1"
                      value="2"
                      label="Bottom Right"
                      isBackground={true}
                    />
                    <RadioGroupItem
                      className="order-4 max-sm:order-2"
                      value="3"
                      label="Bottom Left"
                      isBackground={true}
                    />
                  </RadioGroup>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-base mb-1 tracking-tight font-medium text-[#8B8BA0]">
                    Sound Settings
                  </label>
                  <Switch
                    label="Enable Sound on Important Events"
                    isChecked={soundEnabled}
                    setIsChecked={(value) => {
                      setSoundEnabled(value)
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          {hasChanges() && (
            <button
              onClick={handleSaveChanges}
              className="nexon-button nexon-primary w-full block md:hidden mt-4"
            >
              Save Changes
            </button>
          )}
        </div>
        <EditNicknameModal
          isOpen={isOpen}
          onClose={handleCloseModal}
          userInfo={userInfo}
          refreshUser={refreshUser}
        />
      </div>
    )
  )
}

const EditNicknameModal = ({
  isOpen,
  onClose,
  userInfo,
  refreshUser
}: {
  isOpen: boolean
  onClose: () => void
  userInfo: UserInfo
  refreshUser: () => Promise<void>
}) => {
  const [nickname, setNickname] = useState<string>(userInfo.nickname || '')
  const [avatar, setAvatar] = useState<string | number>(userInfo.avatar || '0')

  useEffect(() => {
    setNickname(userInfo.nickname || '')
    setAvatar(userInfo.avatar || '0')
  }, [userInfo])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-secondary relative lg:static max-lg:fixed max-lg:bottom-4 max-lg:left-1/2 max-lg:-translate-x-1/2 rounded-2xl border-2 border-white/5 backdrop-blur-2xl  flex items-center justify-center  "
      >
        <div className="w-96 rounded-xl  p-4 shadow-xl text-white gap-4 flex flex-col">
          <button
            onClick={onClose}
            className="w-8 h-8 float-right ml-auto text-[#E8E0F1] hover:text-white bg-white/10 backdrop-blur-2xl rounded-full p-2 text-sm cursor-pointer"
          >
            <IconX className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <Avatar avatar={String(avatar)} />
            <div className="bg-white/5 border-2 border-white/5 backdrop-blur-2xl rounded-lg p-2 flex items-center gap-2 w-full">
              <input
                type="text"
                placeholder="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="text-white text-sm placeholder-gray-400 w-full outline-none border-none"
              />
              <button className="text-[#E8E0F1] hover:text-white">
                <IconEdit className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto  bg-white/5 p-2 rounded-lg">
            {Array.from({ length: 45 }).map((_, index) => (
              <div
                key={index}
                className={`bg-white/5 p-2 rounded-lg hover:bg-white/10 cursor-pointer border ${avatar === index ? 'border-primary' : ' border-transparent'}`}
                onClick={() => setAvatar(index)}
              >
                <div className="w-14 h-14  bg-gradient-to-br from-pink-500 via-red-400 to-yellow-300  relative rounded-full  ">
                  <Avatar avatar={index.toString()} />
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
                if (userInfo.wallet_id) {
                  updateUser(userInfo.wallet_id, {
                    username: nickname,
                    avatar_url: String(avatar),
                    wallet_id: userInfo.wallet_id
                  }).then(async () => {
                    onClose()
                    await refreshUser()
                  })
                }
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default SettingsPage
