'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { createUser, getUserByWalletId, User } from '@/utils/user'

interface UserContextProps {
  isCreatingUser: boolean
  userCreationError: string | null
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextProps | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [userCreationError, setUserCreationError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const { isConnected, address } = useAccount()

  const checkAndCreateUser = async () => {
    if (!isConnected || !address) {
      setCurrentUser(null)
      return
    }

    try {
      setIsCreatingUser(true)
      setUserCreationError(null)

      console.log('Checking if user exists')
      // Check if user exists
      const existingUser = await getUserByWalletId(address)

      if (existingUser) {
        console.log('User already exists')
        setCurrentUser(existingUser)
        console.log(existingUser)
      } else {
        // Generate a random username based on wallet address
        const randomUsername = `user_${address.slice(2, 8)}`

        // Create new user
        const newUser = await createUser(address, randomUsername)

        if (newUser) {
          console.log('New user created successfully')
          setCurrentUser(newUser)
        } else {
          setUserCreationError('Failed to create user account')
        }
      }
    } catch (error) {
      console.error('Error checking/creating user:', error)
      setUserCreationError('Failed to create user account')
    } finally {
      setIsCreatingUser(false)
    }
  }

  // Check if user exists and create if not
  useEffect(() => {
    checkAndCreateUser()
  }, [isConnected, address])

  return (
    <UserContext.Provider
      value={{
        isCreatingUser,
        userCreationError,
        currentUser,
        setCurrentUser,
        refreshUser: checkAndCreateUser
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
