export function addrEq(addr1: string, addr2: string) {
  return addr1?.toLowerCase() === addr2?.toLowerCase();
}
export function addrInclude(addrList: string[], addr: string) {
  return addrList?.some(a => addrEq(a, addr));
}
