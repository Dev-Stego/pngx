'use client';

import * as React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bsc, bscTestnet, base, mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Configure chains - BNB Testnet first for auto-selection
// Change to [bsc, ...] for mainnet deployment
const config = getDefaultConfig({
    appName: 'PNGX',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
    chains: [bscTestnet, bsc, base, mainnet],
    transports: {
        [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
        [bsc.id]: http('https://bsc-dataseed.binance.org'),
        [base.id]: http('https://mainnet.base.org'),
        [mainnet.id]: http('https://eth.drpc.org'),
    },
    ssr: false,
});

const queryClient = new QueryClient();

interface Web3ProviderInnerProps {
    children: React.ReactNode;
}

export function Web3ProviderInner({ children }: Web3ProviderInnerProps) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#a855f7',
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                        fontStack: 'system',
                    })}
                    modalSize="compact"
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
