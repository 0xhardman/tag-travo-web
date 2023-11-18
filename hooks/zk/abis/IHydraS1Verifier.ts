import {addContract} from "@/utils/web3/ContractFactory";

const Name = "IHydraS1Verifier";
const ABIData = [
  {
    "inputs": [
      {
        "internalType": "uint256[2]",
        "name": "a",
        "type": "uint256[2]"
      },
      {
        "internalType": "uint256[2][2]",
        "name": "b",
        "type": "uint256[2][2]"
      },
      {
        "internalType": "uint256[2]",
        "name": "c",
        "type": "uint256[2]"
      },
      {
        "internalType": "uint256[5]",
        "name": "input",
        "type": "uint256[5]"
      }
    ],
    "name": "verifyProof",
    "outputs": [
      {
        "internalType": "bool",
        "name": "r",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

declare module "@/utils/web3/ContractFactory" {
    interface Contracts {
        [Name]: typeof ABIData
    }
}

addContract(Name, ABIData);
