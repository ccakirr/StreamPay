import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { recordMinutePurchase, recordWatchSession } from "./monoracle";
import {
    getMinuteBalance,
    setMinuteBalance,
    addMinutesToBalance,
    recordTransaction,
    getTransactions,
    checkUserExists,
    getUserDisplayName,
    registerUser,
    type TransactionRecord,
} from "./supabase";

// ─── Monad Testnet Configuration ───
export const MONAD_TESTNET = {
    chainId: "0x279F", // 10143 in hex
    chainIdDecimal: 10143,
    chainName: "Monad Testnet",
    rpcUrls: ["https://testnet-rpc.monad.xyz"],
    nativeCurrency: {
        name: "MON",
        symbol: "MON",
        decimals: 18,
    },
    blockExplorerUrls: ["https://testnet.monadexplorer.com"],
};

// ─── StreamPay Contract ───
export const CONTRACT_ADDRESS = "0xbAB6645D0843ddB00Aa1CCfdf369F48F8b620B97";

export const CONTRACT_ABI = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "timestamp",
                type: "uint256",
            },
        ],
        name: "MicroPayment",
        type: "event",
    },
    {
        inputs: [],
        name: "pay",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
];

// ─── Types ───
export interface WatchSession {
    contentId: string;
    contentTitle: string;
    startTime: number;
    endTime?: number;
    totalSeconds: number;
    minutesUsed: number;
    txHash: string;
    status: "active" | "completed" | "pending" | "failed";
    explorerUrl?: string;
    monoracleContract?: string;
    type: "purchase" | "watch";
}

export interface WalletState {
    address: string | null;
    balance: number;
    connected: boolean;
    chainId: number | null;
}

// ─── Ethereum Window Type ───
declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            on: (event: string, callback: (...args: unknown[]) => void) => void;
            removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
            isMetaMask?: boolean;
        };
    }
}

// ─── Minute Balance (Supabase) ───

/**
 * Get minute balance from Supabase.
 * Falls back to localStorage if Supabase fails.
 */
export async function getStoredMinuteBalance(walletAddress: string): Promise<number> {
    try {
        const balance = await getMinuteBalance(walletAddress);
        return balance;
    } catch (err) {
        console.error("Supabase getMinuteBalance failed, falling back to localStorage:", err);
        if (typeof window === "undefined") return 0;
        const key = `streampay_minute_balance_${walletAddress.toLowerCase()}`;
        const stored = localStorage.getItem(key);
        return stored ? parseFloat(stored) : 0;
    }
}

/**
 * Set minute balance in Supabase (+ localStorage as cache).
 */
export async function setStoredMinuteBalance(walletAddress: string, minutes: number): Promise<void> {
    // Always update localStorage as cache
    if (typeof window !== "undefined") {
        const key = `streampay_minute_balance_${walletAddress.toLowerCase()}`;
        localStorage.setItem(key, minutes.toFixed(4));
    }
    try {
        await setMinuteBalance(walletAddress, minutes);
    } catch (err) {
        console.error("Supabase setMinuteBalance failed:", err);
    }
}

/**
 * Load past transactions from Supabase.
 */
export async function loadTransactionsFromDB(walletAddress: string): Promise<WatchSession[]> {
    try {
        const rows = await getTransactions(walletAddress);
        return rows.map(txToSession);
    } catch (err) {
        console.error("Supabase loadTransactions failed:", err);
        return [];
    }
}

/** Convert a Supabase TransactionRecord to a WatchSession */
function txToSession(tx: TransactionRecord): WatchSession {
    return {
        contentId: tx.content_id || "",
        contentTitle: tx.content_title,
        startTime: new Date(tx.created_at || Date.now()).getTime(),
        endTime: tx.type === "watch"
            ? new Date(tx.created_at || Date.now()).getTime() + tx.seconds_watched * 1000
            : undefined,
        totalSeconds: tx.seconds_watched,
        minutesUsed: Number(tx.minutes_amount),
        txHash: tx.tx_hash || "",
        status: tx.status as WatchSession["status"],
        explorerUrl: tx.explorer_url || undefined,
        monoracleContract: tx.monoracle_contract || undefined,
        type: tx.type as "purchase" | "watch",
    };
}

// ─── Wallet Functions ───

export function isMetaMaskInstalled(): boolean {
    return typeof window !== "undefined" && !!window.ethereum?.isMetaMask;
}

export async function connectWallet(): Promise<WalletState> {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to use StreamPay.");
    }

    const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
    })) as string[];

    if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.");
    }

    await switchToMonadTestnet();

    const balance = await getWalletBalance(accounts[0]);

    return {
        address: accounts[0],
        balance,
        connected: true,
        chainId: MONAD_TESTNET.chainIdDecimal,
    };
}

export async function switchToMonadTestnet(): Promise<void> {
    if (!window.ethereum) return;

    try {
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: MONAD_TESTNET.chainId }],
        });
    } catch (switchError: unknown) {
        if ((switchError as { code: number }).code === 4902) {
            await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                    {
                        chainId: MONAD_TESTNET.chainId,
                        chainName: MONAD_TESTNET.chainName,
                        rpcUrls: MONAD_TESTNET.rpcUrls,
                        nativeCurrency: MONAD_TESTNET.nativeCurrency,
                        blockExplorerUrls: MONAD_TESTNET.blockExplorerUrls,
                    },
                ],
            });
        } else {
            throw switchError;
        }
    }
}

export async function getWalletBalance(address: string): Promise<number> {
    if (!window.ethereum) return 0;

    const provider = new BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    return parseFloat(formatEther(balance));
}

export async function disconnectWallet(): Promise<void> {
    // MetaMask doesn't have a programmatic disconnect
}

// ─── Buy Minutes (Contract Payment) ───

/**
 * Buy minutes by sending MON to the StreamPay contract.
 * Returns the tx hash and explorer URL.
 */
export async function buyMinutesOnChain(
    costMON: number
): Promise<{ txHash: string; explorerUrl: string }> {
    if (!window.ethereum) {
        throw new Error("MetaMask bulunamadı. Lütfen MetaMask yükleyin.");
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    // Check if wallet address is the same as contract address
    if (signerAddress.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
        throw new Error(
            "Cüzdan adresiniz kontrat adresiyle aynı. Lütfen farklı bir cüzdan kullanın."
        );
    }

    const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    try {
        const amountWei = parseEther(costMON.toFixed(18));
        const tx = await contract.pay({ value: amountWei });
        const receipt = await tx.wait();

        const txHash = receipt.hash;
        const explorerUrl = `${MONAD_TESTNET.blockExplorerUrls[0]}/tx/${txHash}`;

        return { txHash, explorerUrl };
    } catch (error: unknown) {
        // Parse MetaMask / RPC errors for user-friendly messages
        const err = error as { code?: number; message?: string; info?: { error?: { message?: string } } };
        
        if (err.code === 4001 || err.message?.includes("user rejected")) {
            throw new Error("İşlem iptal edildi.");
        }
        if (err.message?.includes("insufficient funds")) {
            throw new Error("Yetersiz MON bakiye. Cüzdanınıza MON yükleyin.");
        }
        if (err.message?.includes("internal accounts")) {
            throw new Error(
                "MetaMask hatası: Bu cüzdan kontrat ile uyumsuz. Farklı bir cüzdan deneyin."
            );
        }
        if (err.info?.error?.message) {
            throw new Error(`İşlem hatası: ${err.info.error.message}`);
        }
        throw error;
    }
}

/**
 * Full buy minutes flow:
 * 1. Send MON payment to contract
 * 2. Record purchase on Monoracle
 * 3. Update local minute balance
 */
export async function buyMinutes(
    walletAddress: string,
    minutes: number,
    costMON: number
): Promise<WatchSession> {
    const session: WatchSession = {
        contentId: "",
        contentTitle: `${minutes} Dakika Yükleme`,
        startTime: Date.now(),
        totalSeconds: 0,
        minutesUsed: minutes,
        txHash: "",
        status: "pending",
        type: "purchase",
    };

    try {
        // 1. Send MON to contract
        const { txHash, explorerUrl } = await buyMinutesOnChain(costMON);
        session.txHash = txHash;
        session.explorerUrl = explorerUrl;

        // 2. Update balance in Supabase
        const newBalance = await addMinutesToBalance(walletAddress, minutes);
        // Also update localStorage cache
        if (typeof window !== "undefined") {
            localStorage.setItem(
                `streampay_minute_balance_${walletAddress.toLowerCase()}`,
                newBalance.toFixed(4)
            );
        }

        // 3. Record transaction in Supabase
        recordTransaction({
            wallet_address: walletAddress,
            type: "purchase",
            content_id: null,
            content_title: `${minutes} Dakika Yükleme`,
            minutes_amount: minutes,
            cost_mon: costMON,
            tx_hash: txHash,
            explorer_url: explorerUrl,
            monoracle_contract: null,
            seconds_watched: 0,
            remaining_balance: newBalance,
            status: "completed",
        }).catch(console.error);

        // 4. Record on Monoracle (fire-and-forget)
        recordMinutePurchase({
            walletAddress,
            minutes,
            costMON,
            paymentTxHash: txHash,
        }).then((result) => {
            if (result.success && result.contractAddress) {
                session.monoracleContract = result.contractAddress;
            }
        }).catch(console.error);

        session.status = "completed";
    } catch (error) {
        console.error("Buy minutes failed:", error);
        session.status = "failed";
        session.txHash = "FAILED";
        // Re-throw so the UI can show the error message
        throw error;
    }

    return session;
}

// ─── Session Management ───

/**
 * End a watching session.
 * Records the session on Monoracle (no additional MON payment - already paid for minutes).
 */
export async function endWatchSession(
    walletAddress: string,
    contentId: string,
    contentTitle: string,
    totalSeconds: number,
    minutesUsed: number,
    remainingBalance: number
): Promise<WatchSession> {
    const session: WatchSession = {
        contentId,
        contentTitle,
        startTime: Date.now() - totalSeconds * 1000,
        endTime: Date.now(),
        totalSeconds,
        minutesUsed: parseFloat(minutesUsed.toFixed(2)),
        txHash: "",
        status: "completed",
        type: "watch",
    };

    // Update stored minute balance (Supabase + localStorage)
    setStoredMinuteBalance(walletAddress, remainingBalance);

    // Record transaction in Supabase
    recordTransaction({
        wallet_address: walletAddress,
        type: "watch",
        content_id: contentId,
        content_title: contentTitle,
        minutes_amount: parseFloat(minutesUsed.toFixed(2)),
        cost_mon: null,
        tx_hash: null,
        explorer_url: null,
        monoracle_contract: null,
        seconds_watched: totalSeconds,
        remaining_balance: remainingBalance,
        status: "completed",
    }).then((record) => {
        if (record) {
            session.txHash = record.id || "RECORDED";
        }
    }).catch(console.error);

    // Record on Monoracle (fire-and-forget)
    try {
        const result = await recordWatchSession({
            walletAddress,
            contentId,
            contentTitle,
            minutesUsed,
            secondsWatched: totalSeconds,
            remainingBalance,
        });

        if (result.success) {
            session.monoracleContract = result.contractAddress;
            session.txHash = result.transactionHash || result.contractAddress || "RECORDED";
        } else {
            session.txHash = "LOCAL_ONLY";
        }
    } catch (error) {
        console.error("Monoracle recording failed:", error);
        session.txHash = "LOCAL_ONLY";
    }

    return session;
}

// ─── Event Listeners ───

export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
    if (!window.ethereum) return () => {};
    const handler = (...args: unknown[]) => callback(args[0] as string[]);
    window.ethereum.on("accountsChanged", handler);
    return () => window.ethereum?.removeListener("accountsChanged", handler);
}

export function onChainChanged(callback: (chainId: string) => void): () => void {
    if (!window.ethereum) return () => {};
    const handler = (...args: unknown[]) => callback(args[0] as string);
    window.ethereum.on("chainChanged", handler);
    return () => window.ethereum?.removeListener("chainChanged", handler);
}

// Re-export user profile functions from supabase
export { checkUserExists, getUserDisplayName, registerUser } from "./supabase";
