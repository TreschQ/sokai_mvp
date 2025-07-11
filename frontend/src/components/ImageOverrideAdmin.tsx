'use client'

import { useState } from 'react'
import { 
  setUserImageOverride, 
  setTokenImageOverride, 
  removeImageOverride, 
  removeUserImageOverride,
  USER_IMAGE_OVERRIDES,
  IMAGE_OVERRIDES 
} from '../utils/imageOverrides'

export default function ImageOverrideAdmin() {
  const [activeTab, setActiveTab] = useState<'user' | 'token'>('user')
  const [userId, setUserId] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [newImageURI, setNewImageURI] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')

  const handleUserImageOverride = () => {
    if (!userId || !newImageURI) {
      setMessage('❌ Veuillez remplir tous les champs requis')
      return
    }

    try {
      setUserImageOverride(userId, '', newImageURI, reason)
      setMessage(`✅ Image mise à jour pour l'utilisateur: ${userId}`)
      
      // Réinitialiser le formulaire
      setUserId('')
      setNewImageURI('')
      setReason('')
      
      // Forcer un refresh de la page pour voir les changements
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      setMessage(`❌ Erreur: ${error}`)
    }
  }

  const handleTokenImageOverride = () => {
    if (!tokenId || !newImageURI) {
      setMessage('❌ Veuillez remplir tous les champs requis')
      return
    }

    try {
      setTokenImageOverride(tokenId, '', newImageURI, reason)
      setMessage(`✅ Image mise à jour pour le token: ${tokenId}`)
      
      // Réinitialiser le formulaire
      setTokenId('')
      setNewImageURI('')
      setReason('')
      
      // Forcer un refresh de la page pour voir les changements
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      setMessage(`❌ Erreur: ${error}`)
    }
  }

  const handleRemoveUserOverride = (userId: string) => {
    removeUserImageOverride(userId)
    setMessage(`🗑️ Remplacement supprimé pour l'utilisateur: ${userId}`)
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleRemoveTokenOverride = (tokenId: string) => {
    removeImageOverride(tokenId)
    setMessage(`🗑️ Remplacement supprimé pour le token: ${tokenId}`)
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        🔧 Administration des Images NFT
      </h2>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm">{message}</p>
        </div>
      )}

      {/* Onglets */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveTab('user')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'user'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Par User ID
        </button>
        <button
          onClick={() => setActiveTab('token')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'token'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Par Token ID
        </button>
      </div>

      {/* Formulaire User ID */}
      {activeTab === 'user' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Remplacer l&apos;image par User ID</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID *
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="0197f9b7-7876-75ce-a88e-eeb88a0aba28"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouvelle URL d&apos;image *
            </label>
            <input
              type="url"
              value={newImageURI}
              onChange={(e) => setNewImageURI(e.target.value)}
              placeholder="https://maroon-rapid-marten-423.mypinata.cloud/ipfs/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison (optionnel)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nouvelle image NFT hébergée sur IPFS"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleUserImageOverride}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Mettre à jour l&apos;image
          </button>
        </div>
      )}

      {/* Formulaire Token ID */}
      {activeTab === 'token' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Remplacer l&apos;image par Token ID</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Token ID *
            </label>
            <input
              type="number"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nouvelle URL d&apos;image *
            </label>
            <input
              type="url"
              value={newImageURI}
              onChange={(e) => setNewImageURI(e.target.value)}
              placeholder="https://maroon-rapid-marten-423.mypinata.cloud/ipfs/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison (optionnel)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nouvelle image NFT hébergée sur IPFS"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleTokenImageOverride}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Mettre à jour l&apos;image
          </button>
        </div>
      )}

      {/* Liste des remplacements actifs */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Remplacements actifs</h3>
        
        {/* Remplacements par User ID */}
        {Object.keys(USER_IMAGE_OVERRIDES).length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Par User ID:</h4>
            <div className="space-y-2">
              {Object.entries(USER_IMAGE_OVERRIDES).map(([userId, override]) => (
                <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">User: {userId}</p>
                    <p className="text-xs text-gray-600">Image: {override.newImageURI.substring(0, 50)}...</p>
                    {override.reason && (
                      <p className="text-xs text-gray-500">Raison: {override.reason}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Mis à jour: {new Date(override.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveUserOverride(userId)}
                    className="ml-4 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remplacements par Token ID */}
        {Object.keys(IMAGE_OVERRIDES).length > 0 && (
          <div>
            <h4 className="text-md font-medium mb-2">Par Token ID:</h4>
            <div className="space-y-2">
              {Object.entries(IMAGE_OVERRIDES).map(([tokenId, override]) => (
                <div key={tokenId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">Token: {tokenId}</p>
                    <p className="text-xs text-gray-600">Image: {override.newImageURI.substring(0, 50)}...</p>
                    {override.reason && (
                      <p className="text-xs text-gray-500">Raison: {override.reason}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Mis à jour: {new Date(override.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveTokenOverride(tokenId)}
                    className="ml-4 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(USER_IMAGE_OVERRIDES).length === 0 && Object.keys(IMAGE_OVERRIDES).length === 0 && (
          <p className="text-gray-500 text-sm">Aucun remplacement d&apos;image actif.</p>
        )}
      </div>

      {/* Informations */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">ℹ️ Informations importantes</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Les remplacements d&apos;images sont stockés côté client (localStorage/fichier local)</li>
          <li>• Ces changements n&apos;affectent pas la blockchain - le contrat reste inchangé</li>
          <li>• Les remplacements par User ID sont plus pratiques pour identifier les utilisateurs</li>
          <li>• Un refresh de la page est nécessaire pour voir les changements dans l&apos;interface</li>
          <li>• Pour votre cas: User ID = &quot;0197f9b7-7876-75ce-a88e-eeb88a0aba28&quot;</li>
        </ul>
      </div>
    </div>
  )
}
