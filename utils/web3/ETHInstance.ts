import Web3 from "web3";
import chains from "./chains.json";
import {provider, Account, BlockNumber} from "web3-core";

export const Chains = chains

export type ChainType = "ethereum" | "goerli" | "polygon" | "mumbai" | "zksync-test" | "zksync" | string;
export type ChainConfig = {
  url: string
  explorer?: string
  chainId?: number
}

export function toEther(wei: string) {
  return Number(windowEthereum().web3.utils.fromWei(wei))
}
export function toWei(ether: string | number) {
  return windowEthereum().web3.utils.toWei(ether.toString());
}

const DefaultChain: ChainType = "scroll-test"
export function chainName() {
  return process.env.CHAIN || DefaultChain
}
export function chain() { return Chains[chainName()] }

let _windowEthereum;
export function windowEthereum() {
  return _windowEthereum ||= new ETHInstance(window["ethereum"] as any)
}

let _ethereum;
export function ethereum() {
  console.log("ethereum-Chain", process.env.CHAIN)
  if (!chain()) return windowEthereum()
  return _ethereum ||= new ETHInstance(chain())
}

export class ETHInstance {

  public config: ChainConfig;
  public web3: Web3
  public account?: Account

  constructor(providerOrConfig: provider | ChainConfig) {
    if (typeof providerOrConfig != "string" &&
      "url" in providerOrConfig) {
      this.config = providerOrConfig
      this.web3 = new Web3(this.config.url);
    } else
      this.web3 = new Web3(providerOrConfig);
  }

  public async getBlock(blockHashOrBlockNumber: BlockNumber | string) {
    return this.web3.eth.getBlock(blockHashOrBlockNumber);
  }
  public async getTransaction(txHash: string) {
    return this.web3.eth.getTransaction(txHash);
  }
}
