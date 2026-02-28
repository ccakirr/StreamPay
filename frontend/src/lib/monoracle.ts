// ─── Monoracle API Client ───
// Calls our Next.js API route which proxies to Monoracle

const API_ROUTE = "/api/monoracle";

export interface MonoracleWriteResult {
    success: boolean;
    contractAddress?: string;
    network?: string;
    transactionHash?: string;
    error?: string;
}

export interface MonoracleReadResult {
    success: boolean;
    data?: Record<string, unknown>;
    contractAddress?: string;
    error?: string;
}

/**
 * Write data to Monad blockchain via Monoracle API.
 * Used for recording minute purchases and watch sessions on-chain.
 */
export async function writeToMonoracle(
    data: Record<string, unknown>
): Promise<MonoracleWriteResult> {
    try {
        const response = await fetch(API_ROUTE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "write", data }),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Monoracle write error:", error);
        return { success: false, error: "Failed to write to Monoracle" };
    }
}

/**
 * Read data from a deployed Monoracle contract.
 */
export async function readFromMonoracle(
    contractAddress: string
): Promise<MonoracleReadResult> {
    try {
        const response = await fetch(
            `${API_ROUTE}?contractAddress=${contractAddress}`,
            { method: "GET" }
        );

        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Monoracle read error:", error);
        return { success: false, error: "Failed to read from Monoracle" };
    }
}

/**
 * Record a minute purchase on-chain via Monoracle.
 */
export async function recordMinutePurchase(params: {
    walletAddress: string;
    minutes: number;
    costMON: number;
    paymentTxHash: string;
}): Promise<MonoracleWriteResult> {
    return writeToMonoracle({
        type: "minute_purchase",
        platform: "StreamPay",
        wallet: params.walletAddress,
        minutes: params.minutes,
        costMON: params.costMON,
        paymentTxHash: params.paymentTxHash,
        timestamp: Math.floor(Date.now() / 1000),
    });
}

/**
 * Record a watch session on-chain via Monoracle.
 */
export async function recordWatchSession(params: {
    walletAddress: string;
    contentId: string;
    contentTitle: string;
    minutesUsed: number;
    secondsWatched: number;
    remainingBalance: number;
}): Promise<MonoracleWriteResult> {
    return writeToMonoracle({
        type: "watch_session",
        platform: "StreamPay",
        wallet: params.walletAddress,
        contentId: params.contentId,
        contentTitle: params.contentTitle,
        minutesUsed: parseFloat(params.minutesUsed.toFixed(2)),
        secondsWatched: params.secondsWatched,
        remainingBalance: parseFloat(params.remainingBalance.toFixed(2)),
        timestamp: Math.floor(Date.now() / 1000),
    });
}
