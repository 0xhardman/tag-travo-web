import {Credential, Relation, RelationType, User} from "@/utils/interfaces";
import { KVMerkleTree } from "@sismo-core/kv-merkle-tree";
import { get, put } from "@/utils/APIUtils";
import { SignInfo, useSign } from "@/hooks/useSign";
import {getPoseidon, poseidon} from "@/utils/PoseidonUtils";
import { SnarkProof } from "@/hooks/zk/core/snark-proof";
import { AddressTreeHeight, HydraS1Prover, RegistryTreeHeight } from "@/hooks/zk/core/hydra-s1-prover";
import {authPost, authPut} from "@/utils/AuthUtils";
import {addrEq, addrInclude} from "@/utils/AddressUtils";
import { getContract } from "@/utils/web3/ContractFactory";

import "./abis/ZKProfile"
import {GetGetScanResultRes, GetScanResult, GetTags, Tag} from "@/utils/APIs";
import {useState} from "react";
import {useChainId} from "wagmi";
import {MathUtils} from "@/utils/MathUtils";
import {getLocalStorage, getOrSetLocalStorage} from "@/utils/StorageUtils";
import {BigNumber, ethers} from "ethers";
import {removeDuplicates} from "@/utils/ArrayUtils";

export const PushCommitment = authPut<{
  relationType: RelationType,
  relationId: string,
  commitment: string
}, {
  commitmentMapperPubKey: string[],
  commitmentReceipt: string[]
}>("/api/user/commitment");

export const PushCommitments = authPut<{
  relations: {id: string, type: RelationType}[],
  commitments: string[]
}, {
  relations: Relation[]
}>("/api/user/commitments");

export const PushMintCommitment = authPut<{
  signInfo: SignInfo<"zkproof">,
  commitment: string
}, {
  commitmentMapperPubKey: string[],
  commitmentReceipt: string[]
}>("/api/user/mint/commitment");

export const GetEddsaAccountPubKey = get<{},
  string[]
>("/api/tag/pubKey");

export const GetRegistryRoot = get<{},
  string
>("/api/tag/registryRoot");

export const MintSBT = authPost<{
  signInfo: SignInfo
  snarkProofs: SnarkProof[]
  // tagIds: string[]
}, {
  tokenId: string
  txHash: string
}>("/api/tag/mint");

const tagState = {
  tags: [], scanResult: {} as GetGetScanResultRes
}

export async function getTagRids(tag: Tag) {
  return {
    rids: tagState.scanResult[tag.addressesRoot],
    addressesRoot: tag.addressesRoot
  }
}
async function getRidsTree(tag: Tag) {
  let { rids } = await getTagRids(tag)
  rids = rids.map(rid => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(rid)));

  const ridsTreeData = {}
  for (const rid of rids) ridsTreeData[rid] = 1;

  return new KVMerkleTree(ridsTreeData, await getPoseidon(), AddressTreeHeight);
}
async function getRegistryTree(tags: Tag[]) {
  const registryData = {}
  for (const t of tags) {
    const { addressesRoot } = await getTagRids(t);
    registryData[addressesRoot] = 1;
  }

  return new KVMerkleTree(registryData, await getPoseidon(), RegistryTreeHeight);
}

const SecretKey = "secret";

export function getSecret(relationId: string, user?: User, index?: number) {
  // 没有user，只获取，不重新生成
  if (!user) return getLocalStorage(`${SecretKey}-${relationId}`);

  return getOrSetLocalStorage(`${SecretKey}-${relationId}`,
    `0x${user.id}${
      index == undefined ? "" : index.toString(16).padStart(4, "0")
    }${
      MathUtils.randomString(8, "0123456789ABCDEF")
    }`)
}

export async function getCommitment(relationId: string, user?: User, index?: number) {
  const secret = getSecret(relationId, user, index)
  const commitmentBN = secret ? await poseidon([secret]) : null;
  return {
    secret, commitmentBN,
    commitment: commitmentBN?.toString()
  };
}
export function getCommitmentSync(poseidon, relationId: string, user?: User, index?: number) {
  const secret = getSecret(relationId, user, index)
  const commitmentBN = secret ? poseidon([secret]) : null;
  return {
    secret, commitmentBN,
    commitment: commitmentBN?.toString()
  };
}

export function calcTags(relations: Relation[], tags: Tag[], scanResult: GetGetScanResultRes) {
  const rids = relations.map(r => `${r.type}:${r.id}`);
  const rootResults = scanResult.rootResults

  const tagsGroup = rids.map(rid => tags.filter(
    t => addrInclude(rootResults[t?.addressesRoot] || [], rid)
  ))
  const relationTags = tagsGroup.map((ts, i) => [relations[i], ts] as [Relation, Tag[]])
  const scannedTags = removeDuplicates(tagsGroup.flat())

  return {relationTags, scannedTags}
}

// export function useTagResult(relations) {
//   const [tags, setTags] = useState<Tag[]>(null);
//   const [scanResult, setScanResult] = useState<GetGetScanResultRes>(null);
//
//   const fetchTags = async () => {
//     setTags(await GetTags())
//     setScanResult(await GetScanResult())
//   }
//
//   const { ridTags, scannedTags } = calcTags(relations, tags, scanResult)
//
//   return { fetchTags,  }
// }

export function useGenerateZKProofs(user: User, relations: Relation[]) {

  const [snarkProofs, setSnarkProofs] = useState<SnarkProof[]>(null);
  const [mintResult, setMintResult] = useState<{
    tokenId: string, txHash: string
  }>(null);

  const chainId = useChainId();
  const [progress, setProgress] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [tasks, setTasks] = useState<[Tag, SecretInfo][]>([]);

  const generateZKProofs = async (
    destination, signInfo: SignInfo<"zkproof">
  ) => {
    setSnarkProofs(null);
    setMintResult(null);

    try {
      // 数据准备
      setIsPreparing(true);

      // 检查Secret情况并生成Secret和Commitment
      const poseidon = await getPoseidon();
      const noCommitmentRelations = relations.filter(r =>
        !(r.secret ||= getSecret(r.id)) || !r.commitment || !r.commitmentReceipt
      );
      const pushingRelations = noCommitmentRelations.map(r => {
        const idx = relations.indexOf(r);
        const { secret, commitment } = getCommitmentSync(poseidon, r.id, user, idx);
        r.secret = secret;
        r.commitment = commitment;

        return r;
      })
      const {relations: committedRelations} = await PushCommitments({
        relations: pushingRelations.map(r => ({id: r.id, type: r.type})),
        commitments: pushingRelations.map(r => r.commitment),
      });
      committedRelations.forEach(cr => {
        const r = relations.find(r2 => addrEq(r2.id, cr.id) && r2.type == cr.type);
        r.commitmentReceipt = cr.commitmentReceipt;
      })
      console.log("generateZKProof", {
        relations, noCommitmentRelations, pushingRelations, committedRelations
      });

      // 获取需要验证的所有账号的SecretInfo
      // const secretInfos = relations.map(r => getSecretInfo(r));
      // console.log("secretInfos", { relations, secretInfos, credentials: tags });

      // 获取Destination账号的SecretInfo
      const { secret, commitment } = await getCommitment(destination, user);

      console.log("getCommitment", {
        secret, commitment, destination, user
      });
      // const zkSignInfo = await sign("zkproof", { commitment });
      const { commitmentMapperPubKey, commitmentReceipt } =
        await PushMintCommitment({ signInfo, commitment });

      const tokenIdStr = await getContract("ZKProfile", "ZKProfileProxy").methods
        .getTokenIdByAddress({ _owner: destination }).call();
      const tokenIdHex = BigNumber.from(tokenIdStr).toHexString().slice(2).padStart(20, "0");

      const destSecretInfo: SecretInfo = {
        identifier: destination + tokenIdHex, secret, commitmentReceipt
      };
      console.log("destSecretInfo", destSecretInfo)

      // 获取公共数据
      const pubKey = commitmentMapperPubKey.map(
        pk => BigNumber.from(pk)) as [BigNumber, BigNumber];

      tagState.tags = await GetTags({})
      tagState.scanResult = await GetScanResult({})

      const registryTree = await getRegistryTree(tagState.tags);

      const prover = new HydraS1Prover(registryTree, pubKey);

      const {relationTags, scannedTags} = calcTags(relations, tagState.tags, tagState.scanResult)

      console.log("calcTags", {
        relations, tagState, relationTags, scannedTags, getSecretInfo
      });

      const tasks = relationTags.map(([r, ts]) =>
        ts.map(t => [t, getSecretInfo(r)] as [Tag, SecretInfo])
      ).flat() as [Tag, SecretInfo][]

      // 筛选出符合条件的任务 tasks: [Credential, SecretInfo][]
      // const tasks = secretInfos.map(
      //   s => tags
      //     .filter(c => addrInclude(c.addresses, s.identifier))
      //     // c.addresses
      //     //   .map(a => a.toLowerCase())
      //     //   .includes(s.identifier.toLowerCase()))
      //     .map(c => [c, s] as [Credential, SecretInfo])
      // ).flat();
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

      await mint(signInfo, snarkProofs);

    } finally {
      // setProgress(0);
      setIsPreparing(false)
      setIsGenerating(false)
    }
  }

  const mint = async (signInfo, snarkProofs) => {
    setMintResult(null);

    try {
      setIsMinting(true);

      setMintResult(await MintSBT({ signInfo, snarkProofs }));

      // const { userCredentials, zkProofs } = await GetUserCredentials();
      // userRelation.user.mintAddress = mintSignInfo.address;
      // userRelation.userCredentials = userCredentials;
      // userRelation.zkProofs = zkProofs;

      // setUserRelation(userRelation);
    } finally {
      setIsMinting(false)
    }
  }

  return {
    generateZKProofs, // 生成ZKP
    // mint, // ZKP生成出来后（snarkProofs有值）调用此函数进行Mint操作
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

function getSecretInfo(relation: Relation) {
  return {
    identifier: relation.id,
    secret: relation.secret,
    commitmentReceipt: relation.commitmentReceipt
  } as SecretInfo
}

async function generateZKProof(source: SecretInfo,
  destination: SecretInfo, tag: Tag,
  chainId: number, registryTree: KVMerkleTree,
  prover: HydraS1Prover) {
  const accountsTree = await getRidsTree(tag)
  const externalNullifier = BigNumber.from(tag.id);

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
