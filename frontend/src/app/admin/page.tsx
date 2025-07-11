import ImageOverrideAdmin from '../../components/ImageOverrideAdmin'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administration Sokai NFT
          </h1>
          <p className="text-gray-600">
            Gérez les images des NFTs sans redéployer le contrat
          </p>
        </div>
        
        <ImageOverrideAdmin />
        
        {/* Informations rapides */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">🚀 Actions Rapides</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Pour votre cas spécifique :</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>User ID :</strong> 0197f9b7-7876-75ce-a88e-eeb88a0aba28</p>
                  <p><strong>Nouvelle image :</strong></p>
                  <p className="break-all text-xs">
                    https://maroon-rapid-marten-423.mypinata.cloud/ipfs/bafkreiegstt4r3z3dxkxhhqliyaopotgc2f6tr265ulqnlzqddexiygery?pinataGatewayToken=IrdARsrQqs2JC3EhSZyQ5hg_8-AQTUNoNzDcuFKVDsVU6xFickDa3QT-Dv2jp6e8
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">✅ Avantages de cette approche :</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Pas besoin de redéployer le contrat</li>
                  <li>• Changements instantanés</li>
                  <li>• Zéro coût en gaz</li>
                  <li>• Flexible et réversible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
