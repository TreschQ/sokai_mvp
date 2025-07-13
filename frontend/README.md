# 🏆 SOKAI MVP - Football Performance Soulbound Tokens

## 📖 Concept
SOKAI is a football fitness app leveraging Soulbound Tokens (SBTs) on the Chiliz blockchain to certify and prove players’ real-world performance.

---

## 🎯 What is a SBT (Soulbound Token)?

A Soulbound Token is a special type of NFT with unique characteristics:

- 🔒 **Non-transferable**: Unlike classic NFTs, cannot be sold, exchanged, or transferred.
- 👤 **Permanent**: Forever attached to a single wallet address.
- 🏆 **Personal Certification**: Perfect for certifying achievements, diplomas, or performances.
- 🛡️ **Proof of Authenticity**: Impossible to fake, guaranteed by blockchain.

---

## 🏃‍♂️ User Flow – From Exercise to SBT

1. **Wallet Connection**
   - The user connects their wallet (Privy/MetaMask).
   - The frontend auto-detects the user’s wallet address.
2. **“Touch & Dash” Exercise**
   - The user performs their football exercises.
   - The app measures and records:
     - Score (0-100) based on performance
     - Time spent (training minutes)
     - Date of the session
     - Type of exercise ("Touch & Dash")
3. **Performance Recording**
   - Data is entered in the mint form.
   - `userId` is automatically set as the wallet address.
   - Optional profile photo via `imageURI`.
4. **Minting the SBT (Once per Wallet)**
   - Blockchain security: Only one SBT per wallet address.
   - Metadata is permanently stored on Chiliz.
   - Creates an immutable proof of performance.

---

## 🛡️ Smart Contract Safeguards & Rules

```solidity
// Only one SBT per wallet
require(!_hasMinted[msg.sender], "One SBT per wallet allowed");

// Non-transferable (Soulbound)
function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override {
    if (from != address(0) && to != address(0)) {
        revert("Soulbound: non-transferable");
    }
    super._beforeTokenTransfer(from, to, tokenId, batchSize);
}
```

---

## 🎯 On-Chain Metadata

```typescript
interface PlayerStats {
  score: number        // Performance score (0-100)
  timeSpent: number    // Training minutes
  exercise: string     // "Touch & Dash"
  date: string         // Session date
  userId: string       // Wallet address (identity)
  imageURI: string     // Profile photo (optional)
}
```

## Update Stats Example

```
🔄 Updating stats with admin wallet: 0xbE26738753aB8A8B7ca9CA4407f576c23097A114
📊 Stats to update: {
  tokenId: '6',
  score: 5,
  timeSpent: 120,
  exercise: 'Touch and Dash',
  date: '2025-07-13'
}
📡 Transaction sent: 0xfc6dff1dd87fa045ee45e70a4b152cecfb5e35ff6e312c6004a296a900eca0c8
✅ Transaction confirmed in block: 26255265
```

---

## 🎯 Why Use SBTs for Sports?

- **Proof of Activity**: Blockchain-based proof of real physical activity
- **Gamification**: Collect non-falsifiable sporting achievements
- **Social Proof**: Share certified, verifiable performances
- **Permanent History**: Track progress over time
- **Chiliz Ecosystem**: Fully compatible with Fan Tokens
- **Web2-like UX**: Familiar UI, blockchain under the hood

---

## 🔗 Data Architecture

```sql
Frontend (Web2-like) ←→ Smart Contract SBT ←→ Chiliz Blockchain
     │                          │
     │                      ┌───▼───┐
     │                      │ Stats │
     │                      ├───────┤
     └─ Profile Photo       │ Score │
     └─ UI Components       │ Time  │
                            │ Date  │ 
                            │ User  │
                            └───────┘
```

---

## 🔄 Advanced Smart Contract Features

- Admin can update existing stats (for corrections)
- Gasless minting: Admin can mint for users
- Read functions: Public performance checks
- Blockchain events: Full on-chain audit trail

---

## 💡 Use Cases & Impact

- **Sporting Certification**: Digital performance diplomas
- **Motivation**: Permanent achievements encourage activity
- **Competitions**: Leaderboards based on verified data
- **Club Partnerships**: Integrate with professional football teams
- **Chiliz Ecosystem**: Synergy with club Fan Tokens

The SBT becomes a "permanent digital certificate" of each user’s sporting achievements, impossible to fake thanks to the Chiliz blockchain. 🏆⚽

---

## ⚽ SBT Metadata Structure

```typescript
interface PlayerStats {
  score: number        // Performance score (0-100)
  timeSpent: number    // Training time (minutes)
  exercise: string     // Exercise type ("Touch & Dash")
  date: string         // Session date
  userId: string       // Player ID (wallet)
  imageURI: string     // Profile photo (optional)
}
```

---

## 🚀 Quick Start

1. **Clone the project**

```bash
git clone <repo-url>
cd sokai-chiliz
```

2. **Install dependencies**

```bash
yarn install
# or
npm install
```

3. **Set up environment variables**

Create a `.env.local` file at the project root, based on `.env.example`:

```env
PRIVY_APP_ID=your-privy-app-id
NEXT_PUBLIC_CONTRACT_ADDRESS=0xd7ece5177d3b3ad4e26cd9f65facb525eae0afe6
NEXT_PUBLIC_CHILIZ_RPC=https://spicy-rpc.chiliz.com/
NEXT_PUBLIC_CHAIN_ID=88882
```
Replace `your-privy-app-id` with your Privy project key.

4. **Place your contract's ABI**

Put your ABI file (`SokaiSBT_abi.json`) in the `/abis` directory.
(Export it from Remix > Compilation Details > Copy ABI)

5. **Run the development server**

```bash
yarn dev
# or
npm run dev
```

The app will be available at http://localhost:3000

---

## 🧑‍💻 How to Use

- Connect your wallet (Privy or MetaMask)
- Fill in the mint form (score, timeSpent, exercise, date, userId, imageURI)
- Click "Mint my SOKAI NFT"
- Watch the transaction status (pending, success, error)
- After mint, the NFT and its metadata are displayed (reads from tokenURI)

---

## ⚙️ Tech Stack

- **Next.js 14** (App Directory)
- **TypeScript**
- **TailwindCSS**
- **ethers.js** (blockchain interaction)
- **Thirdweb** (wallet connection Metamask, or Socios)

---

## 📝 Key Files

- `/src/app`: main app components
- `/abis/SokaiSBT_abi.json`: your contract ABI
- `.env.local`: config (Privy, contract address, RPC)
- `/src/components/MintForm.tsx`: mint form and logic
- `/src/components/NFTDisplay.tsx`: NFT metadata display
- `/src/components/WalletConnect.tsx`: wallet connection logic
- `/src/components/NetworkChecker.tsx`: network validation

---

## 🧩 Bonus / Optional

- ✅ Detect wrong network (alert if not on Chiliz)
- ✅ Prepare a hook/component for the updateStats function
- ✅ Add animations and UX polish for successful mint
- ✅ MetaMask fallback connection

---

## 🟢 Testnet Demo

The smart contract is already deployed on Chiliz Spicy Testnet:

- **Address**: `0xd7ece5177d3b3ad4e26cd9f65facb525eae0afe6`
- **Chain ID**: `88882`
- **RPC**: https://spicy-rpc.chiliz.com/

---

## 🔧 Development Notes

- Replace the placeholder ABI in `/abis/SokaiSBT_abi.json` with your actual contract ABI
- Make sure your Privy app is configured for Chiliz Spicy Testnet
- The app includes network switching functionality for user convenience
- Future updateStats functionality is scaffolded in `/src/hooks/useUpdateStats.tsx`

---

## 🚀 Let's mint