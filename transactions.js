import {
    Account,
    Ed25519PrivateKey,
    Aptos,
    AptosConfig,
    Network,
    PrivateKey
} from "@aptos-labs/ts-sdk";
import { private_key } from "./config.js";
import { logger } from "./utils/logger.js";

// Setup Aptos 
const config = new AptosConfig({ network: Network.MAINNET });
const aptos = new Aptos(config);


const formattedPrivateKey = PrivateKey.formatPrivateKey(private_key, 'ed25519');
const privateKey = new Ed25519PrivateKey(formattedPrivateKey);
const alice = Account.fromPrivateKey({ privateKey });

export const balance = async (APTOS_COIN) => {
    const COIN_STORE = `0x1::coin::CoinStore<${APTOS_COIN}>`;
    let balance = await aptos.getAccountResource({ accountAddress: alice.accountAddress, resourceType: COIN_STORE });
    let amount = Number(balance.coin.value);
    return amount;
};

export async function sendTransaction(transactionData) {

    logger(`Build the transaction's using address: ${alice.accountAddress}`);
    const transaction = await aptos.transaction.build.simple({
        sender: alice.accountAddress,
        data: {
            function: transactionData.function,
            typeArguments: transactionData.type_arguments,
            functionArguments: transactionData.arguments
        },
    });

    const senderAuthenticator = aptos.transaction.sign({
        signer: alice,
        transaction,
    });

    const submittedTransaction = await aptos.transaction.submit.simple({
        transaction,
        senderAuthenticator,
    });

    logger(`Submitted transaction hash: ${submittedTransaction.hash}`);

    // Wait for the transaction result
    await aptos.waitForTransaction({ transactionHash: submittedTransaction.hash });

}