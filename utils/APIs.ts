import { SignType } from "@/type";
import { get, post } from "./APIUtils";
import { authPost, authPut } from "./AuthUtils";
import { SignInfo } from "@/hooks/useSign";
import { User, UserRelation } from "./interfaces";

/**
 根据传入的type获取要签名的数据
 **/
export const GetDataToSign = get<{ // 请求方式：GET
    address: string, // 要签名的地址
    type: SignType // 签名类型
}, {
    data: string // 要签名的数据
}>("/api/sign"); // 定义路由

/**
 根据传入的签名信息验证签名
 **/
export const VerifySign = post<SignInfo, // 签名信息
    {
        key: string // 验证签名后返回的密钥
    }>("/api/sign/verify");

export interface BindAddressResponse {
    relation: Relation;
    web3BioRelations: Relation[];
    workId: string;
}

/**
 * Relation
 */
export interface Relation {
    commitment: string;
    commitmentReceipt: string[];
    id: string;
    name: string;
    state: number;
    type: number;
    userId: string;
    platform?: string;
}

export interface NewUserRelation {
    user: User,
    relations: Relation[],
    web3BioRelations: Relation[]
    // zkProofs: ZKProof[]
}

export const BindAddress = authPut<{ signInfo: SignInfo }, // 签名信息
    BindAddressResponse>("/api/user/address");


export const Login = authPost<{}, NewUserRelation>("/api/user/login");

export const GetTags = get<{}, Tag[]>("/api/tag/tags"); // 定义路由

/**
 * Request
 */


/**
 * Tag
 */
export interface Tag {
    addressesRoot: string;
    curator: string;
    dataPower: number;
    description: string;
    id: string;
    name: string;
    rules: Rule;
    /**
     * "Active" | "Hidden"
     */
    state: string;
    zkEnable: boolean;
}

/**
 * Rule
 */
export interface Rule {
    /**
     * "eq" | "ne" | "lt" | "lte" | "gt" | "gte" | "in" | "notin"
     */
    compare: string;
    groupName: string;
    value: number[] | number;
}


export const GetScanResult = get<{}, GetGetScanResultRes>("/api/tag/scanResult"); // 定义路由

export interface GetGetScanResultRes {
    /**
     * {[K: string]: string[]}
     */
    rootResults: { [key: string]: any };
}
