'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { ReactNode, createContext, useContext, useState, useEffect } from 'react'

interface WalletProviderProps {
  children: ReactNode
}

interface MetaMaskContextType {
  metamaskProvider: any
  isMetaMaskAvailable: boolean
}

const MetaMaskContext = createContext<MetaMaskContextType>({
  metamaskProvider: null,
  isMetaMaskAvailable: false
})

export const useMetaMask = () => useContext(MetaMaskContext)

export function WalletProvider({ children }: WalletProviderProps) {
  const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cmcxapx3c01fzl50mjef8oyal'
  const [metamaskProvider, setMetamaskProvider] = useState<any>(null)
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false)

  // Fonction pour détecter et utiliser MetaMask spécifiquement
  const getMetaMaskProvider = () => {
    if (typeof window === 'undefined') return null
    
    // Chercher spécifiquement MetaMask dans window.ethereum ou les providers
    if (window.ethereum) {
      // Si c'est directement MetaMask
      if (window.ethereum.isMetaMask && !window.ethereum.isPhantom) {
        return window.ethereum
      }
      
      // Si il y a plusieurs providers (MetaMask + Phantom)
      if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
        const metamask = window.ethereum.providers.find((provider: any) => 
          provider.isMetaMask && !provider.isPhantom
        )
        if (metamask) return metamask
      }
    }
    
    return null
  }

  useEffect(() => {
    const provider = getMetaMaskProvider()
    setMetamaskProvider(provider)
    setIsMetaMaskAvailable(!!provider)
    
    console.log('MetaMask détecté:', !!provider)
    console.log('Phantom présent:', !!(window as any).phantom)
  }, [])

  console.log('Privy App ID utilisé:', privyAppId)

  return (
    <MetaMaskContext.Provider value={{ metamaskProvider, isMetaMaskAvailable }}>
      <PrivyProvider
        appId={privyAppId}
        config={{
          appearance: {
            theme: 'light',
            accentColor: '#3b82f6',
          },
          loginMethods: ['email', 'wallet'],
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        {children}
      </PrivyProvider>
    </MetaMaskContext.Provider>
  )
}
