import { useAccount } from "wagmi";
import { getLocalStorage, getOrSetLocalStorage } from "@/utils/StorageUtils";
import {authGet, authPost, authPut, clearToken, getToken} from "@/utils/AuthUtils";
import {Relation, RelationType, User, UserCredential, UserRelation, ZKProof} from "@/utils/interfaces";
import { useSign } from "@/hooks/useSign";
import { useContext, useEffect } from "react";
import { UserContext } from "@/components/contexts/UserContext";
import { useRouter } from "next/navigation";
import { MathUtils } from "@/utils/MathUtils";
import { poseidon } from "@/utils/PoseidonUtils";
import { BindRelation } from "@/hooks/useBind";
import { TagContext } from "@/components/contexts/TagContext";

/**
 登陆
 **/
export const Login = authPost<{}, UserRelation>("/api/user/login");

export const LoginPushCommitment = authPut<{
  relationType?: RelationType,
  relationId: string,
  commitment: string
}, {
  relation: Relation // 绑定后的关系数据
}>("/api/user/commitment");

export const GetUserCredentials = authGet<{}, {
  userCredentials: UserCredential[],
  zkProofs: ZKProof[]
}>("/api/scan/user/credentials");

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

// export function useLogin(autoLogin = false) {
//   const router = useRouter()
//   const { userRelation, login, isSwitching, setUserRelation } = useContext(UserContext);
//   const { address } = useAccount();

//   useEffect(() => {
//     if (!autoLogin || isSwitching) return;
//     console.log("useLogin auto login", userRelation, getToken(), address)
//     if (!getToken()) {
//       router.push('/')
//     }
//     if (!address) {
//       clearToken()
//       setUserRelation(null)
//       router.push('/')
//     }
//     else if (!userRelation && address) login().then()
//   }, [userRelation, address, isSwitching])

//   return { login }
// }
