import { generateTxHash } from "./mockData";

export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
export const CONTRACT_ABI: unknown[] = [];

let streamInterval: ReturnType<typeof setInterval> | null = null;

export async function startPaymentStream(
    onTx: (hash: string) => void
): Promise<void> {
    if (streamInterval) return;
    streamInterval = setInterval(() => {
        const hash = generateTxHash();
        onTx(hash);
    }, 500);
}

export async function stopPaymentStream(): Promise<void> {
    if (streamInterval) {
        clearInterval(streamInterval);
        streamInterval = null;
    }
}
