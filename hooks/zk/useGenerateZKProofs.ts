import { Credential, Relation } from "@/utils/interfaces";
import { KVMerkleTree } from "@sismo-core/kv-merkle-tree";
import { get, put } from "@/utils/APIUtils";
import { BigNumber } from "ethers";
import { SignInfo, useSign } from "@/hooks/useSign";
import { getPoseidon } from "@/utils/PoseidonUtils";
import { useChainId } from "wagmi";
import { useContext, useState } from "react";
import { UserContext } from "@/components/contexts/UserContext";
import { getCommitment, getSecret, GetUserCredentials } from "@/hooks/useLogin";
import { useSwitchAccount } from "@/hooks/useSwitchAccount";
import { SnarkProof } from "@/hooks/zk/core/snark-proof";
import { AddressTreeHeight, HydraS1Prover, RegistryTreeHeight } from "@/hooks/zk/core/hydra-s1-prover";
import { useTag } from "@/hooks/useTag";
import { authPost } from "@/utils/AuthUtils";
import {addrEq, addrInclude} from "@/utils/AddressUtils";
import { PromiseUtils } from "@/utils/PromiseUtils";
import { getContract } from "@/utils/web3/ContractFactory";

import "./abis/ZKID"
import "./abis/ZKProfile"
import "./abis/ZKProfileProxy"
import { chain, chainName } from "@/utils/web3/ETHInstance";
import Toaster from "@/components/MyToaster";
import { LoadingBackDropContext } from "@/components/contexts/LoadingContext";
import { IsNewRelationValid } from "@/utils/APIs";
import {StringUtils} from "@/utils/StringUtils";

export const GetCredentials = get<{},
  Credential[]
>("/api/scan/credentials");

export const GetCredential = get<{
  id: string
}, {
  addressesRoot: string,
  // addressesUrl: string,
  addresses: string[]
}>("/api/scan/credential/:id");

export const GetCredentialAddresses = get<
  { root: string }, string[]
>("/aws/addressRoots/:root.json")

export const PushCommitment = put<SignInfo,
  {
    commitmentMapperPubKey: string[],
    commitmentReceipt: string[]
  }>("/api/scan/commitment");

export const GetEddsaAccountPubKey = get<{},
  string[]
>("/api/scan/pubKey");

export const GetRegistryRoot = get<{},
  string
>("/api/scan/registryRoot");

export const MintSBT = authPost<
  SignInfo & { snarkProofs: SnarkProof[] },
  {
    address: string,
    tokenId: string,
    txHashes: string[]
  }>("/api/scan/mint");

const EmptyAddressRoot = "0x2134e76ac5d21aab186c2be1dd8f84ee880a1e46eaf712f9d371b6df22191f3e"
const AddressRootMap: Record<string, string[]> = {
  [EmptyAddressRoot]: []
}

const FetchingTasks: string[] = []
const MaxFetchingTasks = 3

async function fetchCredentialAddressRoot(id: string) {
  console.log("Fetching Tasks", FetchingTasks)
  await PromiseUtils.waitFor(() => FetchingTasks.length < MaxFetchingTasks)
  try {
    FetchingTasks.push(id)
    console.log("Add Fetch Task", id, FetchingTasks)
    return (await GetCredential({ id })).addressesRoot
  } catch (e) {
    console.error("Fetch Task Error", e)
    throw e
  } finally {
    FetchingTasks.splice(FetchingTasks.indexOf(id), 1)
    console.log("End Fetch Task", id, FetchingTasks)
  }
}

export async function getCredentialAddress(credentialOrId: Credential | string, force = false) {
  if (typeof credentialOrId == "string") {
    // return await GetCredential({ id: credentialOrId })
    const addressesRoot = !force ? EmptyAddressRoot :
      await fetchCredentialAddressRoot(credentialOrId)
    // TODO: 定时任务更新地址Root
    // const {addressesRoot} =
    const addresses = AddressRootMap[addressesRoot] ||=
      await GetCredentialAddresses({ root: addressesRoot })
    return { addressesRoot, addresses }
  }

  if (!force && credentialOrId.addresses && credentialOrId.addressesRoot)
    return credentialOrId;

  if (!force && credentialOrId.addressesRoot) {
    credentialOrId.addresses = (
      AddressRootMap[credentialOrId.addressesRoot] ||=
      await GetCredentialAddresses({ root: credentialOrId.addressesRoot })
    );
    return credentialOrId;
  }

  const { addresses, addressesRoot } = await getCredentialAddress(credentialOrId.id, force);
  credentialOrId.addresses = addresses;
  credentialOrId.addressesRoot = addressesRoot;

  return credentialOrId;
}

async function getAddressesTree(credential: Credential) {
  const addressesTreeData = {}
  const { addresses } = await getCredentialAddress(credential)
  for (const addr of addresses) addressesTreeData[addr] = 1;

  return new KVMerkleTree(addressesTreeData, await getPoseidon(), AddressTreeHeight);
}
async function getRegistryTree(credentials: Credential[]) {
  const registryData = {}
  for (const c of credentials) {
    const { addressesRoot } = await getCredentialAddress(c);
    registryData[addressesRoot] = 1;
  }

  return new KVMerkleTree(registryData, await getPoseidon(), RegistryTreeHeight);
}


export function useGenerateZKProofs(credentials?: Credential[]) {
  credentials ||= useTag("onboarding").displayTags;
  const { showLoading } = useContext(LoadingBackDropContext)

  const {
    setSnarkProofs, setMintResult, snarkProofs, mintResult,
    userRelation, setUserRelation, addressInUserRelation
  } = useContext(UserContext)

  const { switchAccount } = useSwitchAccount(async address => {
    try {
      const mintAddress = userRelation.user.mintAddress

      if (!mintAddress && addressInUserRelation(address))
        throw new Error("Please switch to another web3 address from your wallet, and import again")

      showLoading(true)

      if (!mintAddress) {
        const res = await IsNewRelationValid({ id: address, type: 0 })
        if (!res) throw new Error("This wallet is not valid. Please switch to another web3 address from your wallet, and import again")
      } else if (!addrEq(mintAddress, address))
        throw new Error(`Please Switch to ${StringUtils.displayAddress(mintAddress)} to start generating ZKP`)

      // update mintAddress of UserRelation
      setUserRelation((pre) => { return { ...pre, user: { ...pre.user, mintAddress: address } } })
      await generateZKProofs(address)
    } catch (error) {
      Toaster("error", error.message)
    } finally {
      showLoading(false)
    }

  })
  const { sign } = useSign();
  const chainId = useChainId();
  const [progress, setProgress] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [tasks, setTasks] = useState<[Credential, SecretInfo][]>([]);

  const generateZKProofs = async (destination) => {
    setSnarkProofs(null);
    setMintResult(null);

    try {
      // 数据准备
      setIsPreparing(true);

      // credentials ||= await GetCredentials();
      // // 确保 addresses 和 addressesRoot 有值
      // credentials = await Promise.all(credentials.map(getCredentialAddress)) as Credential[]

      // 获取需要验证的所有账号的SecretInfo
      const secretInfos = await Promise.all(userRelation.relations
        // 判断并补充Secret数据
        .filter(r => !!(r.secret ||= getSecret(r.id)))
        .map(r => getSecretInfo(r)));
      console.log("secretInfos", { userRelation, secretInfos, credentials });

      // 获取Destination账号的SecretInfo
      const { secret, commitment } = await getCommitment(destination, userRelation.user);

      const zkSignInfo = await sign("zkproof", { commitment });
      const { commitmentMapperPubKey, commitmentReceipt } = await PushCommitment(zkSignInfo);

      const noProxy = chainName() == "zksync-test" || chainName() == "zksync";

      const tokenIdStr = noProxy ?
        await getContract("ZKID").methods
          .getTokenIdByAddress({ owner: destination }).call() :
        await getContract("ZKProfile", "ZKProfileProxy").methods
          .getTokenIdByAddress({ owner: destination }).call();
      const tokenIdHex = BigNumber.from(tokenIdStr).toHexString().slice(2).padStart(20, "0");

      const destSecretInfo: SecretInfo = {
        identifier: destination + tokenIdHex, secret, commitmentReceipt
      };
      console.log("destSecretInfo", destSecretInfo)

      // 获取公共数据
      const pubKey = commitmentMapperPubKey.map(
        pk => BigNumber.from(pk)) as [BigNumber, BigNumber];

      const registryTree = await getRegistryTree(credentials);

      const prover = new HydraS1Prover(registryTree, pubKey);

      // 筛选出符合条件的任务 tasks: [Credential, SecretInfo][]
      const tasks = secretInfos.map(
        s => credentials
          .filter(c => addrInclude(c.addresses, s.identifier))
          // c.addresses
          //   .map(a => a.toLowerCase())
          //   .includes(s.identifier.toLowerCase()))
          .map(c => [c, s] as [Credential, SecretInfo])
      ).flat();
      console.log("tasks", tasks);
      setTasks(tasks);

      setIsPreparing(false);

      // 开始生成ZKP
      setIsGenerating(true);

      // 并行执行，但是progress不好设置
      // const snarkProofs = await Promise.all(tasks.map(async ([c, s]) =>
      //   await generateZKProof(s, destSecretInfo, c, chainId, registryTree, prover)
      // ))

      // 顺序执行
      const snarkProofs: SnarkProof[] = []
      for (let i = 0; i < tasks.length; i++) {
        const [c, s] = tasks[i];

        console.log("generateZKProof inputs:", { s, destSecretInfo, c, chainId, registryTree, prover })
        const proof = await generateZKProof(s, destSecretInfo, c, chainId, registryTree, prover);
        console.log("generateZKProof proof:", proof)
        snarkProofs.push(proof);

        setProgress((i + 1) / tasks.length)
      }
      setSnarkProofs(snarkProofs);

    } finally {
      // setProgress(0);
      setIsPreparing(false)
      setIsGenerating(false)
    }
  }

  const mint = async () => {
    setMintResult(null);

    try {
      setIsMinting(true);

      const mintSignInfo = await sign("mint");

      setMintResult(await MintSBT({ ...mintSignInfo, snarkProofs }));

      const { userCredentials, zkProofs } = await GetUserCredentials();
      userRelation.user.mintAddress = mintSignInfo.address;
      userRelation.userCredentials = userCredentials;
      userRelation.zkProofs = zkProofs;

      setUserRelation(userRelation);
    } finally {
      setIsMinting(false)
    }
  }

  return {
    generate: switchAccount, // 生成ZKP
    mint, // ZKP生成出来后（snarkProofs有值）调用此函数进行Mint操作
    isPreparing, isGenerating, isMinting, // 状态
    progress, // 进度 0 ~ 1
    tasks, // 生成ZKP任务列表
    snarkProofs, // 生成出来的ZKP列表
    mintResult // Mint的结果
  }
}

type SecretInfo = {
  identifier: string, secret: string, commitmentReceipt: string[]
}

async function getSecretInfo(relation: Relation) {
  return {
    identifier: relation.id,
    secret: relation.secret,
    commitmentReceipt: relation.commitmentReceipt
  } as SecretInfo
}

async function generateZKProof(source: SecretInfo,
  destination: SecretInfo,
  credential: Credential,
  chainId: number,
  registryTree: KVMerkleTree,
  prover: HydraS1Prover) {
  const accountsTree = await getAddressesTree(credential)
  const externalNullifier = BigNumber.from(credential.id);

  const isStrict = Boolean(registryTree
    .getValue(accountsTree.getRoot().toHexString())
    .toNumber());

  const params = {
    source, destination, chainId,
    claimedValue: 1,
    accountsTree, externalNullifier, isStrict
  }

  console.log("generateZKProof params:", params)
  return await prover.generateSnarkProof(params as any);
}
