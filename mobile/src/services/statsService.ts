import { ethers } from 'ethers';
import SokaiABI from '../../abis/SokaiSBT_abi.json';

export interface StatsUpdateData {
  tokenId: string;
  score: number;
  timeSpent: number;
  exercise: string;
  date: string;
}

export interface StatsUpdateResult {
  success: boolean;
  txHash?: string;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
  details?: string;
}

export interface UserStats {
  currentScore: number;
  currentTimeSpent: number;
  currentExercise: string;
  currentDate: string;
}

export class StatsService {
  private contractAddress: string;
  private rpcUrl: string;

  constructor() {
    this.contractAddress = process.env.EXPO_PUBLIC_CONTRACT_ADDRESS!;
    this.rpcUrl = process.env.EXPO_PUBLIC_CHILIZ_RPC!;
  }

  async autoMintSBT(walletAddress: string): Promise<boolean> {
    try {
      console.log('🎨 Auto-mint SBT pour nouveau wallet:', walletAddress);
      
      // For mobile, we'll need to implement this differently
      // This could be an API call to your backend
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/mint-nft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: walletAddress })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ SBT mint avec succès:', result.txHash);
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur mint SBT:', errorData.error);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erreur lors du mint automatique:', error);
      return false;
    }
  }

  async findUserTokenId(walletAddress: string, autoMint: boolean = true): Promise<string | null> {
    try {
      // For mobile, we'll need to use a different approach
      // This is a placeholder - in production, you'd need to:
      // 1. Use ethers with a provider that works on mobile
      // 2. Or make API calls to your backend
      
      const provider = new ethers.JsonRpcProvider(this.rpcUrl);
      const contract = new ethers.Contract(this.contractAddress, SokaiABI, provider);
      
      const balance = await contract.balanceOf(walletAddress);
      
      if (balance === BigInt(0)) {
        console.log('🔍 Aucun SBT trouvé pour ce wallet');
        
        if (autoMint) {
          console.log('🎨 Tentative de mint automatique...');
          const mintSuccess = await this.autoMintSBT(walletAddress);
          
          if (mintSuccess) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const newBalance = await contract.balanceOf(walletAddress);
            if (newBalance === BigInt(0)) {
              console.error('❌ Le mint a échoué, aucun token trouvé après mint');
              return null;
            }
          } else {
            console.error('❌ Échec du mint automatique');
            return null;
          }
        } else {
          return null;
        }
      }

      for (let i = 1; i <= 1000; i++) {
        try {
          const owner = await contract.ownerOf(i);
          if (owner.toLowerCase() === walletAddress.toLowerCase()) {
            console.log('✅ Token ID trouvé:', i);
            return i.toString();
          }
        } catch (e) {
          continue;
        }
      }

      console.error('❌ Token ID introuvable pour ce wallet');
      return null;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche du token ID:', error);
      return null;
    }
  }

  async getCurrentStats(tokenId: string): Promise<UserStats | null> {
    try {
      const provider = new ethers.JsonRpcProvider(this.rpcUrl);
      const contract = new ethers.Contract(this.contractAddress, SokaiABI, provider);
      
      const tokenURI = await contract.tokenURI(tokenId);
      
      if (tokenURI.startsWith("data:application/json;utf8,")) {
        const jsonData = tokenURI.replace("data:application/json;utf8,", "");
        const metadata = JSON.parse(jsonData);
        const attributes = metadata.attributes || [];
        
        return {
          currentScore: attributes.find((attr: any) => attr.trait_type === "Score")?.value || 0,
          currentTimeSpent: attributes.find((attr: any) => attr.trait_type === "Total Time")?.value || 0,
          currentExercise: attributes.find((attr: any) => attr.trait_type === "Exercise")?.value || "",
          currentDate: attributes.find((attr: any) => attr.trait_type === "Date")?.value || ""
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats actuelles:', error);
      return null;
    }
  }

  async updateStatsViaAPI(data: StatsUpdateData): Promise<StatsUpdateResult> {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/update-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Stats updated via API:', result);
        return {
          success: true,
          txHash: result.txHash,
          blockNumber: result.blockNumber,
          gasUsed: result.gasUsed
        };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API update failed');
      }
    } catch (error: any) {
      console.error('❌ Erreur API:', error);
      return {
        success: false,
        error: error.message,
        details: error.details
      };
    }
  }

  async updateStats(data: StatsUpdateData): Promise<StatsUpdateResult> {
    console.log('🏆 Début mise à jour stats:', data);
    
    const apiResult = await this.updateStatsViaAPI(data);
    if (apiResult.success) {
      return apiResult;
    }

    console.error('❌ Toutes les méthodes ont échoué');
    return {
      success: false,
      error: 'Toutes les méthodes de mise à jour ont échoué',
      details: `API Error: ${apiResult.error}`
    };
  }

  static getLevel(score: number): string {
    if (score >= 50) return 'Expert';
    if (score >= 30) return 'Avancé';
    if (score >= 15) return 'Intermédiaire';
    if (score >= 5) return 'Débutant';
    return 'Novice';
  }

  static formatTimeDisplay(totalSeconds: number): string {
    if (totalSeconds < 60) {
      return `${totalSeconds} secondes`;
    } else {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      if (seconds === 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
      } else {
        return `${minutes}m ${seconds}s`;
      }
    }
  }
}

export const statsService = new StatsService();