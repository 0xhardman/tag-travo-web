import { SignInfo } from "@/hooks/useSign";
import {SnarkProof} from "@/hooks/zk/core/snark-proof";

export type User = {
  id: string,
  avatar?: string,
  email?: string,
  name?: string,
  sbtId?: string,
  mintAddress?: string,
  mintTime?: number
}
export enum RelationType {
  Address, Twitter, Discord, Github, Lens, Solana
}
export type RelationBindParams = {
  [RelationType.Address]: SignInfo<"bind", { commitment: string }> // Address
  [RelationType.Twitter]: { code: string } // Address
  [RelationType.Discord]: { code: string, redirect?: string } // Address
  [RelationType.Github]: { code: string } // Address
  [RelationType.Lens]: { code: string } // Address

  // Solana Hackerthon
  [RelationType.Solana]: SignInfo<"bind", { commitment: string }> // Address
}
export type Relation<T extends RelationType = RelationType> = {
  type: T
  id: string
  name?: string
  commitment?: string
  commitmentReceipt?: string[]

  secret?: string // 前端数据
  // secretInfo: {
  //   secret?: string // secret = ${user.id}-${index}
  //   commitment: string
  // }
}

export type UserRelation = {
  user: User,
  relations: Relation[],
  userCredentials: UserCredential[]
  zkProofs: ZKProof[]
}

export type Credential = {
  id: string
  name: string
  curator: string
  dataPower: number
  sbtId: string
  rules: Rule[]
  addressesRoot?: string
  addresses?: string[]
}

export enum UserCredentialState {
  Normal = "Normal", Hidden = "Hidden"
}
export type UserCredential = {
  userId: string
  credentialId: string
  isMinted: boolean
  state: UserCredentialState
}
export type ZKProof = {
  id: string
  chainId: string
  owner: string
  txHash: string
  credentialId: string
  addressesRoot: string
  snarkProof: SnarkProof
}

export enum ScanType {
  // Dune, EtherScan,
  NFTEvent,
  Custom = 100
}

export const ScanTypeName = {
  [ScanType.NFTEvent]: "NFT",
  [ScanType.Custom]: "Other"
}

export enum Chain {
  Mainnet = "mainnet",
}

export type ScanPayloads = {
  [ScanType.NFTEvent]: {
    nftAddress: string,
    valueType: "holdCount" | "holdTime"
  }
  [ScanType.Custom]: any
}

export type RulePayloads = {}

export type ValueCompare = "eq" | "ne" | "lt" | "lte" | "gt" | "gte" | "in" | "notin"

/**
 * 提交字段
 **/
export type Rule<T extends ScanType = ScanType>
  = DataWithPayload<T, RulePayloads, {
  // type: T
  // payload?: Payload<T, RulePayloads>
  typeName: string

  name: string
  detail: string

  chain?: Chain

  scanWorkName?: string
  scanWorkId?: string

  timestamp?: number
  value?: number | number[]
  compare?: ValueCompare

  resultsFilter?: string
}>;

export type Payload<T extends number | string,
  Payloads extends Record<string | number, any>> =
  { __payloads?: Payloads } & (T extends keyof Payloads ? Payloads[T] : null);

export type DataWithPayload<
  T extends number | string,
  Payloads extends Record<string | number, any>,
  Data = {}> = { type: T, payload?: Payload<T, Payloads> } & Data
