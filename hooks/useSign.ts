import { useAccount, useSignMessage } from "wagmi";
import { get, post } from "@/utils/APIUtils";
import { StringUtils } from "@/utils/StringUtils";
import { signMessage } from 'wagmi/actions'
import { DefaultTokenType, clearToken, getToken, setupToken } from "@/utils/AuthUtils";

import { useEffect } from "react";

export type SignType = typeof DefaultTokenType | "bind" | "scan" | "zkproof" | "mint"
export type SignInfo<T extends SignType = SignType, P = any> = {
  address: string,
  type: T,
  params: { timestamp: string } & P,
  signature: string
};

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

export function useSign() {
  const { address } = useAccount();

  const getData2Sign = async (address: string, type: SignType) => {
    // try {
    const { data } = await GetDataToSign({ address, type });
    return data;
    // } catch (error) {
    //   console.log(error)
    //   // Toaster("error", error.message)
    // }
  }
  const verifySign = async ({ address, params, type, signature }: SignInfo) => {
    return await VerifySign({ address, params, type, signature });
  }
  const doSign = async <T extends SignType = SignType, P = any>(
    type: T, params: P & { timestamp: string } = {} as P & { timestamp: string },
    verify = true) => {

    let data = await getData2Sign(address as any, type);
    params.timestamp = Date.now().toString();
    data = StringUtils.fillData2Str(data, params, false);

    console.error("request sign", { address, data });
    const signature = await signMessage({ message: data });
    console.log("signMessage", { data, signature });
    const signInfo: SignInfo<T, P> = { address: address as any, params, type, signature };
    if (!verify) return signInfo;

    const { key } = await verifySign(signInfo);
    console.log("sign", { key })

    setupToken(key, type, type == DefaultTokenType)

    return { signature, key, signInfo }
  }

  const signAndVerify = async <T extends SignType = SignType, P = any>(type: T, params?: P) =>
    await doSign(type, params as any) as { signInfo: SignInfo<T, P>, signature: string, key: string };
  const sign = async <T extends SignType = SignType, P = any>(type: T, params?: P) =>
    await doSign(type, params as any, false) as SignInfo<T, P>;

  return { signAndVerify, sign }
}
