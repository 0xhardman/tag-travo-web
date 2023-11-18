import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import '@rainbow-me/rainbowkit/styles.css';
import { Chain } from '@wagmi/core'
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  scrollSepolia,
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  zora,
  bsc
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { Web3AuthContextProvider } from '@/components/Web3AuthContext';

export const bnbTest = {
  id: 97,
  name: 'BSC Testnet',
  network: 'bsc-testnet',
  iconUrl: "/bnb.svg",
  nativeCurrency: {
    decimals: 18,
    name: 'tBNB',
    symbol: 'tBNB',
  },
  rpcUrls: {
    public: { http: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'] },
    default: { http: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'] },
  },
  blockExplorers: {
    etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
}

const { chains, publicClient } = configureChains(
  [scrollSepolia],
  [
    // alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Data2Swap',
  projectId: '8e679bafa7f56ef5cbe81fb58f206ff3',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

export default function App({ Component, pageProps }: AppProps) {
  return <WagmiConfig config={wagmiConfig}>
    <RainbowKitProvider chains={chains}>
      <Web3AuthContextProvider>
        <Component {...pageProps} />
      </Web3AuthContextProvider>
    </RainbowKitProvider>
  </WagmiConfig >
}
