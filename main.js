import { sendTransaction, balance } from "./transactions.js";
import { address, APTOS, amountToSwap, tokenToSwap, SLIPPAGE } from "./config.js";
import { contract, logger } from "./utils/logger.js"
import { banner } from "./utils/banner.js"

const APTOS_DECIMALS = 100000000;
const TOKEN_DECIMAL = 1000000;


async function createRawSwap(quoteData) {
    const payload = {
        quote: {
            chainId: quoteData.chainId,
            sourceToken: quoteData.sourceToken,
            targetToken: quoteData.targetToken,
            amountIn: quoteData.amountIn,
            amountOut: quoteData.amountOut,
            minimumOutAmount: quoteData.minimumOutAmount,
            amountOutWithSlippage: quoteData.amountOutWithSlippage,
            steps: quoteData.steps,
            stepTokens: quoteData.stepTokens,
            stepAmounts: quoteData.stepAmounts,
            provider: quoteData.provider,
            protocols: quoteData.protocols,
            slippage: quoteData.slippage,
            route: quoteData.route,
            kanaFee: quoteData.kanaFee,
            sourceTokenInUSD: quoteData.sourceTokenInUSD,
            targetTokenInUSD: quoteData.targetTokenInUSD,
            sourceTokenPrice: quoteData.sourceTokenPrice,
            targetTokenPrice: quoteData.targetTokenPrice,
            priceImpact: quoteData.priceImpact
        },
        address
    };
    return payload;
};

async function getSwapQuote(url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;
    }
}

async function sendSwapInstruction(payload) {
    const url = "https://ag.kanalabs.io/v1/swapInstruction";
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error;
    }
}

async function getPoints() {
    const url = `https://referrals-dev.kanalabs.io/swapspotv2/swappoints?walletAddress=${address}&season=Season+2`;
    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': 'AIzaSyArp0bdluu2YHc7Cd6PpGBbubGd3lyLVn5'
    };

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        logger("Account Total Volume:", "info", data.totalVolume);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function insertRecord() {
    const url = 'https://referrals-dev.kanalabs.io/referralV2/insertReferralRecordsV2';
    const headers = {
        'Content-Type': 'application/json',
    };
    const payload = {
        "referrerWalletAddress": contract,
        "referredWalletAddress": address
    }
    const body = JSON.stringify(payload);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('');
    }
}

async function doTransactions(url) {
    const response = await getSwapQuote(url);
    const quoteData = response.data[0];
    const payload = await createRawSwap(quoteData);
    const result = await sendSwapInstruction(payload);
    sendTransaction(result.data)
    await getPoints()
    await new Promise(resolve => setTimeout(resolve, 10000));
}

async function main() {
    try {
        logger(banner, 'debug');
        await insertRecord();

        while (true) {
            try {
                const aptBal = await balance(APTOS);
                const amount = amountToSwap * APTOS_DECIMALS;
                const minBalance = amount * 1.2;

                if (!tokenToSwap || !tokenToSwap.includes("::")) {
                    logger("Invalid token format. Skipping iteration.", 'error');
                    break;
                }
                const token = tokenToSwap.split("::").pop();

                if (aptBal > minBalance) {
                    logger("==== Auto Tx KanaLabs ====");
                    logger(`Aptos's balance: ${aptBal / APTOS_DECIMALS}`, 'info');
                    const urlSwapIn = `https://ag.kanalabs.io/v1/swapQuote?inputToken=${APTOS}&outputToken=${tokenToSwap}&chain=2&amountIn=${amount}&slippage=${SLIPPAGE}&isFeeReferrer=false`;

                    logger(`Performing swap from APTOS to ${token}`);
                    await doTransactions(urlSwapIn);
                } else {
                    const tokenBal = await balance(tokenToSwap);
                    logger("==== Auto Tx KanaLabs ====");
                    logger(`Your ${token} balance: ${tokenBal / TOKEN_DECIMAL}`, 'info');
                    const urlSwapOut = `https://ag.kanalabs.io/v1/swapQuote?inputToken=${tokenToSwap}&outputToken=${APTOS}&chain=2&amountIn=${tokenBal}&slippage=${SLIPPAGE}&isFeeReferrer=false`;

                    logger(`Performing swap from ${token} TO APTOS`);
                    await doTransactions(urlSwapOut);
                }
            } catch (err) {
                logger(`Error during transaction: ${err.message}`, 'error');
                continue;
            }
        }
    } catch (error) {
        logger(`Critical error occurred: ${error.message}`, 'error');
    }
}

main();