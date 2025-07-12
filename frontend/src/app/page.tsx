'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, useActiveWallet } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";

import { usePrivy } from '@privy-io/react-auth'
import BottomBar from '@/components/BottomBar'


export default function HomePage() {
  const router = useRouter();
  const thirdwebWallet = useActiveWallet();

  const client = createThirdwebClient({
    clientId: "9b6f9196120187dcd8df2cd28da401ff",
  });

  const wallets = [
    inAppWallet({ auth: { options: [] } }),
    createWallet("io.metamask"),
    createWallet("com.socios.app"),
  ];

  useEffect(() => {
    if (thirdwebWallet && typeof thirdwebWallet === 'object') {
      // @ts-ignore
      const address = thirdwebWallet.address || thirdwebWallet.data?.address;
      if (address) {
        router.push('/profile');
      }
    }
  }, [thirdwebWallet, router]);

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#23272F] to-[#444857] w-full px-4 py-8">
      <div className="flex flex-col items-center justify-center flex-1 w-full">
        <h1 className="text-3xl font-bold text-white mb-3 text-center">Welcome to Sokai Club</h1>
        <p className="text-white text-base mb-8 text-center">Join the club and track your football journey on-chain.</p>
        <div className="w-full max-w-xs flex flex-col gap-3">
          <ConnectButton
            client={client}
            connectModal={{ size: "compact" }}
            wallets={wallets}
            connectButton={{
              style: {
                borderRadius: 9999,
                background: "#3AA93A",
                color: "#fff",
                fontWeight: 600,
                fontSize: "1.125rem",
                boxShadow: "0 4px 16px 0 rgba(60, 180, 60, 0.15)",
                padding: "0.75rem 2rem",
                width: "100%",
                transition: "all 0.2s",
              },
            }}
          />
        </div>
      </div>
      <BottomBar />
    </main>
  )
}
