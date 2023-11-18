import { SignType } from "@/type";
import { get, post } from "./APIUtils";
import { authPut } from "./AuthUtils";
import { SignInfo } from "@/hooks/useSign";

// export const SendEmailCode = post<{
//     email: string,
//     type: 'bind'
// }>("/api/user/email/send");

// export const BindEmail = authPut<{
//     email: string,
//     code: string
// }>("/api/user/email/bind");

// export const IsNewEmailValid = get<{
//     email: string,
// }, boolean>("/api/user/email/valid");

// export const IsNewRelationValid = get<{
//     id: string, type?: number
// }, boolean>("/api/user/relation/valid");


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