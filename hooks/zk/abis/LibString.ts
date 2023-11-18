import {addContract} from "@/utils/web3/ContractFactory";

const Name = "LibString";
const ABIData = [
  {
    "inputs": [],
    "name": "HexLengthInsufficient",
    "type": "error"
  }
] as const;

declare module "@/utils/web3/ContractFactory" {
    interface Contracts {
        [Name]: typeof ABIData
    }
}

addContract(Name, ABIData);
