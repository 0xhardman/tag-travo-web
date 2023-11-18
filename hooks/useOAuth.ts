import { useSearchParams, useRouter } from "next/navigation";
import { Relation, RelationType } from "@/utils/interfaces";
import { useContext, useEffect } from "react";
import { UserContext } from "@/components/contexts/UserContext";
import { StringUtils } from "@/utils/StringUtils";
import { useBind } from "@/hooks/useBind";
import { getLocalStorage, removeLocalStorage, setLocalStorage } from "@/utils/StorageUtils";
// import { useLogin } from "@/hooks/useLogin";

export const OAuthTestMode = false
export const OAuthJumpKey = "oauth-jump";

export function useOAuth(type: RelationType, url: string | (() => Promise<string>)) {
  const jump = async () => {
    setLocalStorage(OAuthJumpKey, location.pathname)

    if (OAuthTestMode) url = `http://${location.host}/oauth/?action=${RelationType[type].toLowerCase()}&code=test`;
    open(url instanceof Function ? await url() : url, "_self")
  }

  return { jump }
}

export function useAutoBindOAuth() {
  const params = useSearchParams();
  const { bind } = useBind();
  const { userRelation, setUserRelation } = useContext(UserContext)
  const router = useRouter();

  // useLogin(true);

  const autoBind = async () => {
    if (!userRelation || !params?.get("action")) return;

    const keys: string[] = Array.from(params.keys());

    const oauthParams = keys.reduce((res, key) => ({
      ...res, [key]: params?.get(key)
    }), {} as { action: string, code: string } & {})

    const typeName = StringUtils.capitalize(oauthParams.action);
    const type = RelationType[typeName]

    if (OAuthTestMode && oauthParams.code == "test") {
      const relation: Relation = {
        type, id: "test", name: `Test ${typeName}`
      }
      const relations = [...userRelation.relations, relation]
      setUserRelation({ ...userRelation, relations });
    } else await bind(type, oauthParams);

    const page = getLocalStorage(OAuthJumpKey) ||
      (userRelation.user?.sbtId ? "/setting/tags" : "/onboarding/tags");
    removeLocalStorage(OAuthJumpKey);

    await router.push(page);
  }
  useEffect(() => { autoBind().then() }, [!!userRelation]);
}
