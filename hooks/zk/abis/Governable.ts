import {addContract} from "@/utils/web3/ContractFactory";

const Name = "Governable";
const ABIData = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "gov",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_gov",
        "type": "address"
      }
    ],
    "name": "setGov",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

declare module "@/utils/web3/ContractFactory" {
    interface Contracts {
        [Name]: typeof ABIData
    }
}

addContract(Name, ABIData);
