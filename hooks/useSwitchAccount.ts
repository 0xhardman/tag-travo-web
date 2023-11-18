import { useAccount, useDisconnect } from "wagmi";
import {useCallback, useContext, useEffect, useState} from "react";
import { UserContext } from "@/components/contexts/UserContext";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export function useSwitchAccount(
  onSwitch: (address: string, oldAddress: string) => void) {
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect();
  const { openConnectModal, connectModalOpen } = useConnectModal();
  // const [isSwitching, setIsSwitching] = useState(false);
  const [oldAddress, setOldAddress] = useState("");

  const { isSwitching, setIsSwitching } = useContext(UserContext)

  useEffect(() => {
    console.log("Switching Update", {isSwitching, connectModalOpen})
    if (isSwitching && !connectModalOpen) setIsSwitching(false)
  }, [connectModalOpen])

  useEffect(() => {
    if (!isSwitching) setOldAddress(address)
    else if (address) {
      setIsSwitching(false);
      onSwitch(address, oldAddress);
    }
  }, [address])

  useEffect(() => {
    console.log("isConnected changed", {isConnected, isSwitching})
    if (!isConnected && isSwitching)
      openConnectModal?.()
  }, [isConnected, isSwitching])

  const switchAccount = () => {
    console.log("switchAccount", {isSwitching, connectModalOpen})
    if (isSwitching) return;
    setIsSwitching(true);
    disconnect();
  }

  return { switchAccount, isSwitching }
}
