import { authPost } from "@/utils/AuthUtils";
import { post } from "@/utils/APIUtils";
import {
  Credential,
  Relation,
  RelationType,
  UserCredential,
  UserCredentialState,
  UserRelation
} from "@/utils/interfaces";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/components/contexts/UserContext";
import { TagContext } from "@/components/contexts/TagContext";
import { removeDuplicates } from "@/utils/ArrayUtils";
import { LoadingBackDropContext } from "@/components/contexts/LoadingContext";
import Toaster from "@/components/MyToaster";
import { deepCopy } from "@/utils/ObjectUtils";
import {useSearchParams} from "next/navigation";
import {StringUtils} from "@/utils/StringUtils";
import {getLocalStorage, removeLocalStorage} from "@/utils/StorageUtils";
import {OAuthJumpKey, OAuthTestMode} from "@/hooks/useOAuth";

export enum CollaborationType {
  QuestN = "QuestN"
}

/**
 * 解绑关系
 */
export const AddCollab = authPost<{
  from: CollaborationType,
}>("/api/collab/add/:from");

export function useCollab() {
  const params = useSearchParams();
  const { userRelation } = useContext(UserContext)

  const autoAdd = async () => {
    if (!userRelation || !params?.get("from")) return;

    const from = params.get("from") as CollaborationType;
    await AddCollab({ from })
  }
  useEffect(() => { autoAdd().then() }, [!!userRelation]);
}
