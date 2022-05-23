import { BigNumber } from "ethers";

export const ZERO_ADDRESS : string = "0x0000000000000000000000000000000000000000";
export const ZERO_BYTES32 : string = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const MAX_UINT256 : BigNumber = BigNumber.from('2').pow(BigNumber.from('256')).sub(BigNumber.from('1'));
export const MAX_INT256 : BigNumber = BigNumber.from('2').pow(BigNumber.from('255')).sub(BigNumber.from('1'));
export const MIN_INT256 : BigNumber = BigNumber.from('2').pow(BigNumber.from('255')).mul(BigNumber.from('-1'));