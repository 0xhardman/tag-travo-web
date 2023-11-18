import {addContract} from "@/utils/web3/ContractFactory";

const Name = "Pairing";
const ABIData = [] as const;

declare module "@/utils/web3/ContractFactory" {
    interface Contracts {
        [Name]: typeof ABIData
    }
}

addContract(Name, ABIData);
