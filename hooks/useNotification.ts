'use client'
import { useContext, useEffect, useState } from "react";
import { get, put } from "@/utils/APIUtils";
import { authDel, authGet, authPut } from "@/utils/AuthUtils";
import { UserContext } from "@/components/contexts/UserContext";
import Toaster from "@/components/MyToaster";

const RegisterUrl = "/sw.js"

const GetVAPIDPubKey = get<{}, string>("/api/webPush/pubKey");
const PushSubscription = authPut<{ subscription: PushSubscription }>("/api/webPush/subscription");
const CancelSubscription = authDel("/api/webPush/subscription");
const GetSubscription = authGet<{}, PushSubscription>("/api/webPush/subscription");

let _pubKey;
async function pubKey() {
  return _pubKey ||= await GetVAPIDPubKey();
}

export function useNotification() {
  const { userRelation } = useContext(UserContext)

  const [isEnabled, setIsEnabled] = useState(false);
  useEffect(() => setIsEnabled("navigator" in window && "PushManager" in window), [])

  const [subscription, setSubscription] = useState<PushSubscription>();
  const [reg, setReg] = useState<ServiceWorkerRegistration>();

  const getRegistration = async () => {
    if (!isEnabled) return;

    const reg = await navigator.serviceWorker.getRegistration(RegisterUrl) ||
      await navigator.serviceWorker.register(RegisterUrl);
    setReg(reg)
  }
  useEffect(() => { !reg && getRegistration().then() }, [isEnabled])

  const subscribe = async () => {
    if (!reg || !isEnabled) return;

    try {
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: await pubKey()
      })
      await PushSubscription({ subscription });
      setSubscription(subscription)
    } catch (error) {
      if (error instanceof DOMException) {
        throw new Error("Please reset notifications and allow notification")
      }
      else {
        throw error
      }
    }


  }
  const unsubscribe = async () => CancelSubscription();

  const fetchSubscription = async () => setSubscription(await GetSubscription())
  useEffect(() => { userRelation && fetchSubscription().then() }, [userRelation]);

  return {
    isEnabled, // 该浏览器是否支持通知功能
    reg, // 不用管
    subscription, // 用户订阅信息，为空表示还没订阅过
    subscribe, // 订阅函数
    unsubscribe // 取消订阅
  }
}
