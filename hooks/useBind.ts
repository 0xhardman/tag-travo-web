import { authDel, authPut } from "@/utils/AuthUtils";
import { Relation, RelationBindParams, RelationType } from "@/utils/interfaces";
import { useSign } from "@/hooks/useSign";
import { getCommitment } from "@/hooks/useLogin";
import { useContext, useState } from "react";
import { UserContext } from "@/components/contexts/UserContext";
import { useSwitchAccount } from "@/hooks/useSwitchAccount";
import Toaster from "@/components/MyToaster";
import {TagContext} from "@/components/contexts/TagContext";
import {addrEq} from "@/utils/AddressUtils";

/**
 * 绑定关系
 */
export const BindRelation = authPut<{
  type: RelationType, // 关系类型
  params: RelationBindParams[RelationType] // 绑定所需参数
  // updateCommitment?: boolean
}, {
  relation: Relation // 绑定后的关系数据
}>("/api/user/relation");

/**
 * 解绑关系
 */
export const UnbindRelation = authDel<{
  type: RelationType, // 关系类型
  id?: string // 关系ID（地址、TwitterId，GitHubId之类）
}>("/api/user/relation");

export function useBind() {
  const { userRelation, setUserRelation } = useContext(UserContext)
  const { resetAutoUpdateCount } = useContext(TagContext)
  const [isLoading, setIsLoading] = useState(false);

  const bind = async <T extends RelationType = RelationType>(
    type: T, params: RelationBindParams[T], onBound?: (r: Relation<T>) => any) => {
    if (!userRelation) return;
    try {
      setIsLoading(true);

      const { relation } = await BindRelation({ type, params });
      await onBound?.(relation as Relation<T>);

      const relations = [...userRelation.relations, relation]
      setUserRelation({ ...userRelation, relations });
      resetAutoUpdateCount();
    } finally {
      setIsLoading(false);
    }
  }
  const unbind = async <T extends RelationType = RelationType>(type: T, id: string) => {
    if (!userRelation) return;
    try {
      setIsLoading(true);
      const idx = userRelation.relations.findIndex(r => r.type == type && r.id == id);

      await UnbindRelation({ type, id });

      const relations = [
        ...userRelation.relations.slice(0, idx),
        ...userRelation.relations.slice(idx + 1)
      ]
      setUserRelation({ ...userRelation, relations });
      resetAutoUpdateCount();
    } finally {
      setIsLoading(false);
    }
  }

  return { bind, unbind, isLoading }
}

export function useBindAddress() {
  const { sign } = useSign();
  const { bind, isLoading } = useBind();
  const { userRelation } = useContext(UserContext)
  const { switchAccount, isSwitching } = useSwitchAccount(async address => {
    // 如果是已有账号，跳过
    if (userRelation?.relations.find(r => r.type == 0 && addrEq(r.id, address)))
      return Toaster("warning", "Please switch to another web3 address from your wallet, and import again")
    // if (userRelation.relations.find(r => r.id == address)) return

    try {
      const { secret, commitment } = await getCommitment(address, userRelation.user, userRelation.relations.length)
      const signInfo = await sign("bind", { commitment })

      await bind(RelationType.Address, signInfo, r => r.secret = secret);
      Toaster("success", 'Address bound successfully')
    } catch (error) {
      Toaster("error", error.message)
    }
  })

  return { bind: switchAccount, isSwitching, isLoading }
}
