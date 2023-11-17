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

export const bnbTest = {
  id: 5_600,
  name: 'BNB Testnet',
  network: 'bnb-testnet',
  iconUrl: "/bnb.svg",
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    public: { http: ['https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org'] },
    default: { http: ['https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org'] },
  },
  blockExplorers: {
    etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
}

const { chains, publicClient } = configureChains(
  [mainnet, bsc, bnbTest],
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
      <Component {...pageProps} />
    </RainbowKitProvider>
  </WagmiConfig >
}
