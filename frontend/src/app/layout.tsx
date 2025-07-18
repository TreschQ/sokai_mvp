import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletProvider } from '@/components/wallet/WalletProvider'
import { ThirdwebWalletProvider } from '@/components/wallet/ThirdwebWalletProvider'
import { OpenCVProvider } from '@/context/OpenCVContext';
import OpenCVLoader from '@/components/OpenCVLoader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SOKAI MVP - Mint Your Soulbound NFT',
  description: 'Mint SOKAI NFTs on Chiliz Spicy Testnet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OpenCVProvider>
          <ThirdwebWalletProvider>
            <WalletProvider>
              {children}
            </WalletProvider>
          </ThirdwebWalletProvider>
          <OpenCVLoader />
        </OpenCVProvider>
        
      </body>
    </html>
  )
}
