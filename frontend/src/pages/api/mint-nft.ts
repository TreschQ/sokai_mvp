import type { NextApiRequest, NextApiResponse } from 'next';
import { isAddress, JsonRpcProvider, Wallet, Contract } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY!;
const RPC_URL = process.env.NEXT_PUBLIC_CHILIZ_RPC!;
const NFT_IMAGE = 'https://maroon-rapid-marten-423.mypinata.cloud/ipfs/bafkreiegstt4r3z3dxkxhhqliyaopotgc2f6tr265ulqnlzqddexiygery?pinataGatewayToken=IrdARsrQqs2JC3EhSZyQ5hg_8-AQTUNoNzDcuFKVDsVU6xFickDa3QT-Dv2jp6e8';

// ABI minimal pour mintSokaiNFTFor
const ABI = [
  'function mintSokaiNFTFor(address to, uint256 score, uint256 timeSpent, string memory exercise, string memory date, string memory userId, string memory imageURI) external returns ()'
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userAddress } = req.body;
  if (!userAddress || !isAddress(userAddress)) {
    return res.status(400).json({ error: 'Adresse utilisateur invalide' });
  }

  // Valeurs fictives pour le mint automatique
  const score = 42;
  const timeSpent = 123;
  const exercise = 'Squats';
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const userId = userAddress;

  try {
    const provider = new JsonRpcProvider(RPC_URL);
    const adminWallet = new Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract = new Contract(CONTRACT_ADDRESS, ABI, adminWallet);

    // Mint le NFT pour l'utilisateur avec l'image fixe
    const tx = await contract.mintSokaiNFTFor(userAddress, score, timeSpent, exercise, date, userId, NFT_IMAGE);
    console.log('Transaction envoyée:', tx);
    const receipt = await tx.wait();
    console.log('Receipt:', receipt);
    res.status(200).json({ success: true, txHash: receipt.transactionHash });
  } catch (error: any) {
    console.error('Erreur lors du mint:', error);
    res.status(500).json({ error: error.message || 'Erreur lors du mint', details: error });
  }
}
