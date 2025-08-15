import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { Alert } from 'react-native';
import { statsService } from '../services/statsService';

export function useAutoMint() {
  const [isChecking, setIsChecking] = useState(false);
  const [hasSBT, setHasSBT] = useState<boolean | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  
  const thirdwebAccount = useActiveAccount();

  const getWalletAddress = (): string | null => {
    if (thirdwebAccount?.address) {
      return thirdwebAccount.address;
    }
    return null;
  };

  const checkAndMintIfNeeded = async () => {
    const walletAddress = getWalletAddress();
    if (!walletAddress) {
      setHasSBT(null);
      setTokenId(null);
      return;
    }

    setIsChecking(true);
    try {
      console.log('🔍 Vérification SBT pour:', walletAddress);
      
      const existingTokenId = await statsService.findUserTokenId(walletAddress, false);
      
      if (existingTokenId) {
        console.log('✅ SBT existant trouvé:', existingTokenId);
        setHasSBT(true);
        setTokenId(existingTokenId);
      } else {
        console.log('🎨 Aucun SBT trouvé, mint automatique...');
        setIsMinting(true);
        
        const newTokenId = await statsService.findUserTokenId(walletAddress, true);
        
        if (newTokenId) {
          console.log('✅ Nouveau SBT créé:', newTokenId);
          setHasSBT(true);
          setTokenId(newTokenId);
          
          setTimeout(() => {
            Alert.alert('🎉 Bienvenue !', 'Votre SOKAI Card a été créée automatiquement !');
          }, 1000);
        } else {
          console.error('❌ Échec de la création automatique du SBT');
          setHasSBT(false);
          setTokenId(null);
        }
        
        setIsMinting(false);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification/mint:', error);
      setHasSBT(false);
      setTokenId(null);
      setIsMinting(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    const walletAddress = getWalletAddress();
    
    if (walletAddress) {
      setHasWallet(true);
      setIsChecking(true);
      
      const timer = setTimeout(() => {
        checkAndMintIfNeeded();
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      setHasWallet(false);
      setHasSBT(null);
      setTokenId(null);
      setIsChecking(false);
      setIsMinting(false);
    }
  }, [thirdwebAccount?.address]);

  const refresh = () => {
    checkAndMintIfNeeded();
  };

  return {
    isChecking,
    hasSBT,
    tokenId,
    isMinting,
    hasWallet,
    refresh,
    walletAddress: getWalletAddress(),
    isReady: hasWallet && !isChecking && !isMinting && hasSBT === true && tokenId !== null,
    isLoading: hasWallet && (isChecking || isMinting),
    needsSetup: hasWallet && !isChecking && !isMinting && hasSBT === false,
    noWallet: !hasWallet
  };
}