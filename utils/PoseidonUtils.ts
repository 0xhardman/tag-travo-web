import { buildPoseidon } from "@sismo-core/crypto";
import { BigNumberish } from "ethers";

let _poseidon = null;

export async function getPoseidon() {
  return _poseidon ||= await buildPoseidon()
}

export async function poseidon(data: BigNumberish[]) {
  return (await getPoseidon())(data);
}
