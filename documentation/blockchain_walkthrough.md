# Blockchain Backup Walkthrough

We have successfully implemented **Phase 2: Blockchain Backup**. Users can now securely backup their "Security Notes" (encryption keys) to the blockchain and recover them later.

## 🔒 Security Architecture
We ensure **Zero-Knowledge Privacy** even when backing up to a public blockchain:
1.  **Client-Side Encryption**: Your "Security Note" is encrypted *before* it leaves your browser.
2.  **Wallet Signature as Key**: We derive a master encryption key from your unique wallet signature.
    - Message Signed: `"Sign this message to encrypt/decrypt your PNGX backups..."`
3.  **On-Chain Storage**: Only the *encrypted* blob is stored on the smart contract. Even we (or the public) cannot read your note.

## ✨ New Features

### 1. Connect Wallet
- **Automatic**: The app prompts you to connect your wallet (MetaMask, Rainbow, etc.) when accessing Web3 features.
- **Supported Chains**: Base Sepolia (Testnet), Base Mainnet, Sepolia, Mainnet.

### 2. Backup to Blockchain
Located in the **Encryption Complete** screen (after hiding a file):
1.  Click **"Backup Now"**.
2.  **Sign** the authorization message in your wallet (this creates your encryption key).
3.  **Confirm** the transaction to write data to the blockchain.
4.  Your note is permanently stored on-chain!

### 3. Recover from Blockchain
Located in the **Decode (Recover)** tab:
1.  Click **"Recover from Chain"**.
2.  View a list of all your backups with timestamps and filenames.
3.  Click **"Decrypt"** on any backup.
4.  **Sign** the authorization message again.
5.  Your original Security Note appears!

## 🛠️ Deployment Instructions (for Developers)
To deploy the `PNGXBackup` contract to a live network:

1.  **Get Textnet ETH**: Get Base Sepolia ETH from a faucet.
2.  **Deploy Contract**: Use Remix IDE or Hardhat.
    - Copy `contracts/PNGXBackup.sol` to [Remix](https://remix.ethereum.org/).
    - Compile and Deploy using "Injected Provider" (your wallet).
3.  **Update Environment**:
    - Copy the new Contract Address.
    - Update `NEXT_PUBLIC_PNGX_CONTRACT_ADDRESS` in your `.env.local`.

## 📸 visual Verification
*(Screenshots of the flow would go here - e.g. the new Buttons and Dialogs)*
