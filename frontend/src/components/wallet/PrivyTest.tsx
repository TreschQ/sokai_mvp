'use client'

import { usePrivy } from '@privy-io/react-auth'

export default function PrivyTest() {
  const { ready, authenticated, login, logout, user } = usePrivy()

  return (
    <div className="border-2 border-blue-500 p-4 m-4 rounded">
      <h3 className="font-bold text-blue-600">🔍 Test Privy Debug</h3>
      <div className="mt-2 space-y-1">
        <p><strong>Ready:</strong> {ready ? '✅' : '❌'}</p>
        <p><strong>Authenticated:</strong> {authenticated ? '✅' : '❌'}</p>
        <p><strong>User:</strong> {user ? '✅ Présent' : '❌ Absent'}</p>
        {user && (
          <p><strong>Wallet:</strong> {user.wallet?.address || 'Pas de wallet'}</p>
        )}
      </div>
      
      {ready && !authenticated && (
        <button 
          onClick={login}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 cursor-pointer"
        >
          Test Login Privy
        </button>
      )}

      {authenticated && (
        <button 
          onClick={async () => { await logout(); window.location.reload(); }}
          className="bg-red-500 text-white px-4 py-2 rounded mt-4 cursor-pointer"
        >
          Test Logout Privy
        </button>
      )}
    </div>
  )
}
