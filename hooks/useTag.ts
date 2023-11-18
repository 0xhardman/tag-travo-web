import { authPost } from "@/utils/AuthUtils";
import { post } from "@/utils/APIUtils";
import { Credential, RelationType, User, UserCredential, UserCredentialState, UserRelation } from "@/utils/interfaces";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/components/contexts/UserContext";
import { TagContext } from "@/components/contexts/TagContext";
import { removeDuplicates } from "@/utils/ArrayUtils";
import { LoadingBackDropContext } from "@/components/contexts/LoadingContext";
import Toaster from "@/components/MyToaster";
import { deepCopy } from "@/utils/ObjectUtils";
import { addrEq, addrInclude } from "@/utils/AddressUtils";
import {PromiseUtils} from "@/utils/PromiseUtils";

/**
 * 解绑关系
 */
export const ModifyCredential = authPost<{
  id: string // Credential ID
  state: UserCredentialState, // 状态
}, {
  userCredentials: UserCredential[]
}>("/api/scan/user/credential/:id");

export const ModifyCredentials = authPost<{
  ids: string[] // Credential ID
  states: UserCredentialState[], // 状态
}, {
  userCredentials: UserCredential[]
}>("/api/scan/user/credentials");

export type ScanTagType =
  "setting" | // Setting页
  "onboarding" // Onboarding页

export function getTagDataFromUserRelation(
  userRelation: UserRelation, credentials: Credential[], type: ScanTagType) {

  if (!userRelation) return {
    allTags: [], displayTags: [], hiddenTags: [], unreadTagIds: [], dataPower: 0
  };

  const relations = userRelation?.relations;
  const addedCredentialIds = userRelation?.userCredentials
    .filter(uc => uc.isMinted).map(uc => uc.credentialId)
  const hiddenCredentialIds = userRelation?.userCredentials
    .filter(uc => uc.state == UserCredentialState.Hidden)
    .map(uc => uc.credentialId)

  // 所有满足条件的Tag
  const allTags = removeDuplicates(relations
    .map(r => credentials.filter(c => c.addresses
      ?.map(a => a.toLowerCase())?.includes(r.id.toLowerCase())))
    .flat())

  const unreadTags = allTags
    .filter(c => !userRelation?.userCredentials.find(uc => uc.credentialId == c.id));
  const unreadTagIds = unreadTags.map(c => c.id);
  // const readTags = allTags.filter(c => userRelation?.userCredentials.find(uc => uc.credentialId == c.id));

  let displayTags: Credential[], hiddenTags: Credential[];
  switch (type) {
    case "setting":
      displayTags = allTags
        .filter(c => addedCredentialIds.includes(c.id) && !hiddenCredentialIds.includes(c.id));
      hiddenTags = removeDuplicates(allTags
        .filter(c => !addedCredentialIds.includes(c.id) || hiddenCredentialIds.includes(c.id))
        .concat(unreadTags));
      break;
    case "onboarding":
      displayTags = allTags
        .filter(c => !addedCredentialIds.includes(c.id) && !hiddenCredentialIds.includes(c.id));
      hiddenTags = allTags
        .filter(c => !addedCredentialIds.includes(c.id) && hiddenCredentialIds.includes(c.id));
      break;
  }

  const dataPower = displayTags.reduce((res, t) => res + t.dataPower, 0);

  return { allTags, displayTags, hiddenTags, unreadTagIds, dataPower }
}

export function useTag(type: ScanTagType) {
  const { userRelation, setUserRelation, isLoggingIn, setDisplayTagsLength, displayTagsLength } = useContext(UserContext)
  const { credentials, isScanning, isAutoScanning } = useContext(TagContext)
  const { showLoading } = useContext(LoadingBackDropContext)
  // const [displayTags, setDisplayTags] = useState([] as Credential[])
  // const [hiddenTags, sethiddenTags] = useState([] as Credential[])
  // const [dataPower, setDataPower] = useState(0)

  const { displayTags, hiddenTags, unreadTagIds, dataPower } =
    getTagDataFromUserRelation(userRelation, credentials, type)

  // useEffect(() => {
  //   const { displayTags, hiddenTags, dataPower } =
  //     getTagDataFromUserRelation(userRelation, credentials, type)
  //
  //   setDisplayTags(displayTags);
  //   sethiddenTags(hiddenTags);
  //   setDataPower(dataPower);
  // }, [credentials, userRelation])

  useEffect(() => {
    if (displayTags.length == 0) return
    setDisplayTagsLength(displayTags.length)
  }, [displayTags])

  const calcDeleteLoss = (deletedRelationId: string) => {
    if (!userRelation) return;

    const newUserRelation = deepCopy(userRelation)
    newUserRelation.relations = newUserRelation.relations
      .filter(r => !addrEq(r.id, deletedRelationId));

    console.log("calcDeleteLoss", deletedRelationId, userRelation, newUserRelation)

    const { displayTags: newDisplayTags, dataPower: newDataPower } =
      getTagDataFromUserRelation(newUserRelation, credentials, type);

    return [
      displayTags.length - newDisplayTags.length, dataPower - newDataPower
    ]
  }

  const modifyCredential = async (id: string, state: UserCredentialState) => {
    const oldUserCredentials = userRelation.userCredentials;
    try {
      // 先本地模拟操作成功
      const newUserCredentials = oldUserCredentials.find(uc => uc.credentialId == id) ?
        oldUserCredentials.map(uc => uc.credentialId == id ? { ...uc, state } : uc) :
        [...oldUserCredentials, { credentialId: id, state }] as UserCredential[]
      setUserRelation({ ...userRelation, userCredentials: newUserCredentials })

      // await PromiseUtils.wait(3000);
      // throw new Error("test error")

      // 发请求
      // showLoading(true);
      const { userCredentials } = await ModifyCredential({ id, state });
      setUserRelation({ ...userRelation, userCredentials })
    } catch (error) {
      // 如果失败，恢复到原始状态
      setUserRelation({ ...userRelation, userCredentials: oldUserCredentials })
      Toaster("error", error.message || error)
    } finally {
      // showLoading(false);
    }
  }

  const modifyCredentials = async (ids: string[], states: UserCredentialState[]) => {
    const oldUserCredentials = userRelation.userCredentials;
    try {
      // 先本地模拟操作成功
      const newUserCredentials = ids.reduce((res, id, i) =>
          res.find(uc => uc.credentialId == id) ?
            res.map(uc => uc.credentialId == id ? { ...uc, state: states[i] } : uc) :
            [...res, { credentialId: id, state: states[i] }],
        oldUserCredentials) as UserCredential[]
      setUserRelation({ ...userRelation, userCredentials: newUserCredentials })

      // 发请求
      // showLoading(true);
      const { userCredentials } = await ModifyCredentials({ ids, states });
      setUserRelation({ ...userRelation, userCredentials })
    } catch (error) {
      // 如果失败，恢复到原始状态
      setUserRelation({ ...userRelation, userCredentials: oldUserCredentials })
      Toaster("error", error.message || error)
    } finally {
      // showLoading(false);
    }
  }

  return {
    displayTags, // 显示的标签
    hiddenTags, // 隐藏的标签
    unreadTagIds, // 未读的标签ID列表
    displayTagsLength, // 显示的标签数量
    dataPower, // 累计DataPower
    calcDeleteLoss, // 计算删除损失
    modifyCredential, // 修改单个标签
    modifyCredentials, // 修改多个标签
    isLoading: isScanning || isLoggingIn, // 是否正在扫描标签
    isAutoScanning // 是否处于自动扫描状态
  }
}



// export function useScanTag() {
//   const { userRelation } = useContext(UserContext)
//   const { credentials } = useContext(TagContext)
//
//   const userCredentials = userRelation.userCredentials
//
//   const addedTags = userCredentials.map(uc =>
//     uc.state == UserCredentialState.Normal &&
//     credentials.find(c => c.id == uc.credentialId)
//   )
//
//   const [scannedTags, setScannedTags] = useState([] as Credential[]);
//   const [hiddenTags, sethiddenTags] = useState([] as Credential[]);
//
//   const [lastDataPower, setLastDataPower] = useState(0);
//
//   const { dataPower, calcDeleteLoss, updateCredential } = useTag(scannedTags)
//
//   useEffect(() => {
//     if (!userRelation) return;
//
//     const {scannedTags, hiddenTags} = getTagDataFromUserRelation(userRelation, credentials);
//
//     setLastDataPower(dataPower);
//     setScannedTags(scannedTags);
//     sethiddenTags(hiddenTags);
//   }, [credentials, userRelation])
//
//   return {
//     scannedTags, hiddenTags, dataPower, lastDataPower,
//     updateCredential, calcDeleteLoss
//   }
// }
//
// export function useUserTag() {
//   const { userRelation } = useContext(UserContext)
//   const { credentials } = useContext(TagContext)
//
//   const userCredentials = userRelation.userCredentials
//
//   const scannedTags = userCredentials.map(uc =>
//     uc.state == UserCredentialState.Normal &&
//     credentials.find(c => c.id == uc.credentialId)
//   )
//   const hiddenTags = userCredentials.map(uc =>
//     uc.state == UserCredentialState.Hidden &&
//     credentials.find(c => c.id == uc.credentialId)
//   )
//
//   const { dataPower, calcDeleteLoss, updateCredential } = useTag(scannedTags)
//
//   return {
//     scannedTags, hiddenTags, dataPower, calcDeleteLoss, updateCredential
//   }
//
// }
