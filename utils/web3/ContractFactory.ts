import fs from "fs";
import {ABI, Contract} from "./Contract";

import contracts from "./contracts.json"
import {ethereum} from "@/utils/web3/ETHInstance";

export interface Contracts {}
export type ContractName = keyof Contracts;
export type ContractOf<T extends ContractName> = Contract<Contracts[T]>

// region ABI管理

export const ContractABIs: {
  [K in ContractName]?: Contracts[K]
} = {};

export function addContract<T extends ContractName>(name: T, abi: Contracts[T]) {
  console.log("addContract", name, abi)
  ContractABIs[name] = abi;
}

// endregion

// region Contract Cache

export type ContractCache = {
  [ChainId in number]: {[CacheName: string]: string}
  // {[ChainId]: {[CacheName]: Address}}
}

export function getContractCache() {
  return contracts as ContractCache
}
export function getAddress(chainId: number, name: string) {
  return getContractCache()[chainId]?.[name];
}

// endregion

// region Contract Operations

export function getContract<T extends ContractName>(
  name: T, cacheName?: string, address?: string) {
  const res = findContract(name, cacheName, address);
  const nameStr = cacheName == name ? name : `${cacheName}(${name})`;
  if (!res) throw `${nameStr} is not found!`
  return res;
}

export function findContract<T extends ContractName>(
  name: T, cacheNameOrAddress?: string, address?: string): ContractOf<T> {
  let cacheName: string = name;
  if (cacheNameOrAddress?.startsWith("0x")) address = cacheNameOrAddress;
  else cacheName = cacheNameOrAddress || name;

  const nameStr = cacheName == name ? name : `${cacheName}(${name})`;
  console.info(`Getting ${nameStr} from ${address || "cache"}`)

  const eth = ethereum();
  const hasAddress = !!address;
  address ||= getAddress(eth.config.chainId, cacheName);

  if (!address) {
    console.error(`... Get miss!`);
    return null
  }
  if (!hasAddress) console.log(`... Cached address of ${nameStr} is ${address}`);

  const res = new Contract(
    ContractABIs[name] as Contracts[T], eth, address);

  console.info(`... Completed!`);

  return res;
}

// endregion
