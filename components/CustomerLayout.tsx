import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "./Layout";
import clsx from "clsx";
import { LayoutNavigator } from "@/type";

export default function CustomerLayout({ children, current, total, hideConnectWallet = false }: { children: React.ReactNode, current?: string, total?: LayoutNavigator[], hideConnectWallet?: boolean }) {
    return <Layout current={current} total={total} hideConnectWallet={hideConnectWallet}>
        {children}
    </Layout>
}