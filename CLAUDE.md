# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SOKAI MVP is a football fitness app leveraging Soulbound Tokens (SBTs) on the Chiliz blockchain to certify and prove players' real-world performance. The project consists of:

- **Frontend**: Next.js 15 app with TypeScript, Tailwind CSS, ethers.js for blockchain interaction, and Privy for wallet connection
- **AI API**: FastAPI ball detection service using YOLOv8
- **Backend**: Dockerized services (currently minimal)

## Architecture

### Frontend Structure
- **App Router**: Uses Next.js 15 app directory structure (`src/app/`)
- **Components**: Organized by feature in `src/components/`
  - `nft/`: NFT minting, display, and player card components
  - `wallet/`: Wallet connection and network management
- **Context**: OpenCV and wallet providers for global state
- **Utils**: Constants, image handling, and blockchain utilities

### Key Technologies
- **Blockchain**: Chiliz Spicy Testnet (Chain ID: 88882)
- **Wallet**: Privy integration with MetaMask fallback
- **Smart Contract**: Soulbound Token (SBT) with one-per-wallet restriction
- **AI**: YOLOv8 for ball detection and performance measurement

### Smart Contract Integration
- Contract address: `0xd7ece5177d3b3ad4e26cd9f65facb525eae0afe6`
- Admin wallet: `0xbE26738753aB8A8B7ca9CA4407f576c23097A114`
- Two mint functions: `mintSokaiNFT()` and `mintSokaiNFTFor()`
- Non-transferable SBTs with performance metadata

## Development Commands

### Frontend (in `/frontend` directory)
```bash
# Development
npm run dev

# Build
npm run build

# Production start
npm run start

# Linting
npm run lint
```

### AI API (in `/ai_api` directory)
```bash
# Docker (recommended)
docker-compose up --build

# Local development
pip install -r requirements.txt
uvicorn main:app --reload
```

## Environment Setup

Required environment variables in `frontend/.env.local`:
```bash
PRIVY_APP_ID=your-privy-app-id
NEXT_PUBLIC_CONTRACT_ADDRESS=0xd7ece5177d3b3ad4e26cd9f65facb525eae0afe6
NEXT_PUBLIC_CHILIZ_RPC=https://spicy-rpc.chiliz.com/
NEXT_PUBLIC_CHAIN_ID=88882
```

## Key Implementation Details

### Wallet Management
- Primary: Privy for seamless wallet creation and login
- Fallback: Direct MetaMask integration via `WalletProvider.tsx`
- Admin detection using `isAdminWallet()` in `constants.ts`

### NFT Minting Flow
1. User connects wallet (Privy/MetaMask)
2. Performance data captured (score, time, exercise type)
3. Admin can mint for users or users can self-mint (if admin)
4. One SBT per wallet address enforced by smart contract
5. Metadata stored on-chain with player performance stats

### Player Performance Structure
```typescript
interface PlayerStats {
  score: number        // 0-100 performance score
  timeSpent: number    // Training minutes
  exercise: string     // "Touch & Dash"
  date: string         // Session date
  userId: string       // Wallet address
  imageURI: string     // Optional profile photo
}
```

### AI Integration
- Ball detection API at `/ai_api`
- YOLOv8 model for ball tracking and target intersection
- Docker containerized for easy deployment

## Common Patterns

### Component Structure
- Use TypeScript interfaces for all props
- Implement proper error handling with user-friendly messages
- Include loading states for blockchain operations
- Follow existing naming conventions (PascalCase for components)

### Blockchain Interactions
- Always check network before transactions
- Use static calls to validate before sending transactions
- Handle MetaMask and Privy providers consistently
- Include comprehensive error messages for debugging

### Testing Approach
- Debug tools integrated in `MintForm.tsx` for contract interaction testing
- Console logging for blockchain operation debugging
- Network validation and contract existence checks

## Current Branch Structure
- `main`: Production branch
- `dev_blockchain_ty`: Current development branch
- Feature branches follow pattern: `[number]-feature-[description]`

## Important Notes
- SBTs are non-transferable by design
- Only one SBT per wallet address allowed
- Admin wallet has special minting privileges
- All performance data is permanently stored on Chiliz blockchain