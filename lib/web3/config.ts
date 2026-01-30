import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, base, baseSepolia, bsc, bscTestnet } from 'wagmi/chains';

// Ensure we have a projectId for WalletConnect (or use default public one for dev)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'public';

// BNB Greenfield chains (for reference - not directly supported by wagmi yet)
export const greenfieldTestnet = {
    id: 5600,
    name: 'Greenfield Testnet',
    nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org'] },
    },
    blockExplorers: {
        default: { name: 'Greenfield Scan', url: 'https://testnet.greenfieldscan.com' },
    },
    testnet: true,
} as const;

export const greenfieldMainnet = {
    id: 1017,
    name: 'Greenfield Mainnet',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://greenfield-chain.bnbchain.org'] },
    },
    blockExplorers: {
        default: { name: 'Greenfield Scan', url: 'https://greenfieldscan.com' },
    },
    testnet: false,
} as const;

export const config = createConfig({
    chains: [
        // Primary: BNB Smart Chain (for contract deployment)
        bsc,
        bscTestnet,
        // Secondary: Keep others for flexibility
        mainnet,
        sepolia,
        base,
        baseSepolia,
    ],
    transports: {
        [bsc.id]: http(),
        [bscTestnet.id]: http(),
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [base.id]: http(),
        [baseSepolia.id]: http(),
    },
    ssr: true,
});

// Default chain for PNGX
export const DEFAULT_CHAIN = bscTestnet; // Change to bsc for mainnet
