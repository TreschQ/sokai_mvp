# 🏆 SOKAI MVP - Football Performance Soulbound Tokens

## 📖 Concept
SOKAI is a football fitness app leveraging Soulbound Tokens (SBTs) on the Chiliz blockchain to certify and prove players' real-world performance through AI-powered ball detection.

---

## 🎯 What is a Soulbound Token (SBT)?

A Soulbound Token is a special type of NFT with unique characteristics:

- 🔒 **Non-transferable**: Cannot be sold, exchanged, or transferred
- 👤 **Wallet-bound**: Forever attached to a single wallet address
- 🏆 **Performance Certification**: Perfect for certifying achievements and athletic performance
- 🛡️ **Immutable Proof**: Blockchain-guaranteed authenticity

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** (App Directory, TypeScript)
- **TailwindCSS** for styling
- **Privy** + **Thirdweb** for multi-wallet connection
- **ethers.js** for blockchain interactions
- **React Icons** for UI components

### AI Detection API
- **Python FastAPI** for real-time ball detection
- **YOLOv8** (Ultralytics) for computer vision
- **OpenCV** integration for live camera feed
- **Docker** containerization

### Blockchain
- **Solidity** smart contract on Chiliz Spicy Testnet
- **Chiliz Chain** (Chain ID: 88882)
- **Soulbound Token** implementation with admin controls

---

## 🏃‍♂️ User Flow – From Exercise to SBT

1. **Wallet Connection**
   - Connect wallet (Privy/MetaMask/Thirdweb)
   - Auto-detect user's wallet address

2. **"Touch & Dash" Exercise**
   - Perform football training exercises
   - AI detection tracks ball touches and movement
   - Records: Score (0-100), Time, Date, Exercise type

3. **Performance Recording**
   - Data automatically populated in mint form
   - `userId` set as wallet address
   - Optional profile photo upload

4. **SBT Minting** (One per wallet)
   - Blockchain enforced: Only one SBT per wallet
   - Metadata permanently stored on Chiliz
   - Creates immutable performance proof

---

## 🛡️ Smart Contract Architecture

```solidity
// Core SBT functionality
contract SokaiSBT is ERC721, Ownable {
    mapping(address => bool) private _hasMinted;
    
    // Only one SBT per wallet
    require(!_hasMinted[msg.sender], "One SBT per wallet allowed");
    
    // Non-transferable (Soulbound)
    function _beforeTokenTransfer(
        address from, 
        address to, 
        uint256 tokenId, 
        uint256 batchSize
    ) internal override {
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: non-transferable");
        }
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    // Admin can update stats for corrections
    function updateStats(uint256 tokenId, PlayerStats memory newStats) 
        external onlyOwner {
        playerStats[tokenId] = newStats;
        emit StatsUpdated(tokenId, newStats);
    }
}
```

---

## 🎯 On-Chain Metadata Structure

```typescript
interface PlayerStats {
  score: number        // Performance score (0-100)
  timeSpent: number    // Training minutes
  exercise: string     // "Touch & Dash"
  date: string         // Session date
  userId: string       // Wallet address
  imageURI: string     // Profile photo (optional)
}
```

---

## 🚀 Quick Start

### Option 1: Direct Development

1. **Clone the repository**
```bash
git clone <repo-url>
cd sokai_mvp
```

2. **Frontend setup**
```bash
cd frontend
npm install
```

3. **Environment configuration**
Create `.env.local` in `/frontend/`:
```env
PRIVY_APP_ID=your-privy-app-id
NEXT_PUBLIC_CONTRACT_ADDRESS=0xd7ece5177d3b3ad4e26cd9f65facb525eae0afe6
NEXT_PUBLIC_CHILIZ_RPC=https://spicy-rpc.chiliz.com/
NEXT_PUBLIC_CHAIN_ID=88882
ADMIN_PRIVATE_KEY=your-admin-private-key
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your-thirdweb-client-id
```

4. **Run development**
```bash
npm run dev
```

Frontend available at: http://localhost:3000

### Option 2: Docker (Full Stack)

1. **Start all services**
```bash
docker-compose up -d
```

This launches:
- Frontend: http://localhost:3000
- AI API: http://localhost:8000
- Ball detection with YOLO model

2. **View logs**
```bash
docker-compose logs -f
```

---

## 🔗 Architecture Overview

```
Frontend (Next.js) ←→ AI API (FastAPI) ←→ Smart Contract (Chiliz)
     │                     │                      │
     │                 ┌───▼───┐              ┌───▼───┐
     │                 │ YOLO  │              │ SBT   │
     │                 │ Model │              │ Stats │
     └─ Wallet         │ Ball  │              │ Score │
     └─ UI             │ Track │              │ Time  │
                       └───────┘              │ Date  │
                                              └───────┘
```

---

## ⚙️ Key Features

### Multi-Wallet Support
- **Privy**: Primary wallet connection
- **Thirdweb**: Alternative provider
- **MetaMask**: Direct connection fallback

### Admin System
- Admin wallet: `0xbE26738753aB8A8B7ca9CA4407f576c23097A114`
- Mint SBTs for users
- Update existing stats
- Override NFT images

### AI Integration
- Real-time ball detection
- Performance scoring algorithm
- Live camera feed processing

---

## 🔄 Smart Contract Deployment

**Chiliz Spicy Testnet:**
- **Contract**: `0xd7ece5177d3b3ad4e26cd9f65facb525eae0afe6`
- **Chain ID**: `88882`
- **RPC**: https://spicy-rpc.chiliz.com/

---

## 🧑‍💻 Development Commands

```bash
# Frontend
npm run dev        # Development server
npm run build      # Production build
npm run lint       # Code linting

# Docker
docker-compose up --build    # Rebuild and start
docker-compose down          # Stop services

# AI API (in /ai_api/)
python main.py              # Start API server
pip install -r requirements.txt
```

---

## 📁 Key Files

- `/frontend/src/components/nft/` - NFT minting and display
- `/frontend/src/hooks/` - Blockchain interaction hooks
- `/frontend/abis/SokaiSBT_abi.json` - Contract ABI
- `/ai_api/main.py` - Ball detection API
- `/ai_api/models/best.pt` - YOLOv8 model
- `/frontend/smartcontracts/SokaiSBT.sol` - Smart contract

---

## 💡 Use Cases

- **Athletic Certification**: Immutable performance records
- **Training Motivation**: Gamified fitness tracking
- **Club Integration**: Partner with football teams
- **Talent Scouting**: Verified skill assessments
- **Fan Engagement**: Chiliz ecosystem synergy

The SBT becomes a permanent digital certificate of athletic achievement, impossible to fake thanks to blockchain technology and AI verification. 🏆⚽