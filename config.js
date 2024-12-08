const APTOS = "0x1::aptos_coin::AptosCoin";

// list token that can use in tokenToSwap.
const ZUSDC = "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC"
const ZUSDT = '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT'
const THL = '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL'
const DooDoo = '0x73eb84966be67e4697fc5ae75173ca6c35089e802650f75422ab49a8729704ec::coin::DooDoo'
const sthAPT = "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6::staking::StakedThalaAPT"

// edit this config to yours
const private_key = "YOUR_APTOS_PRIVATE_KEY"; // private keys aptos wallet
const address = "YOUR_APTOS_ADDRESS"; // your aptos wallet address
const amountToSwap = 1; // APTOS AMOUNT TO SWAP, THIS EXAMPLE FOR SWAPING 1 APTOS
const tokenToSwap = ZUSDC; // token to swap, in this example we are swapping TO USDC, you can choose token that listed in the above
const SLIPPAGE = 0.5; // slipage to perform swap

export { private_key, APTOS, address, amountToSwap, tokenToSwap, SLIPPAGE }
