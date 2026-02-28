import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { COST_PER_SECOND } from "./mockData";

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
    totalCost: number;
    txHash: string;
    status: "active" | "completed" | "pending" | "failed";
    explorerUrl?: string;
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

// ─── Wallet Functions ───

export function isMetaMaskInstalled(): boolean {
    return typeof window !== "undefined" && !!window.ethereum?.isMetaMask;
}

export async function connectWallet(): Promise<WalletState> {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to use StreamPay.");
    }

    // Request account access
    const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
    })) as string[];

    if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.");
    }

    // Switch to Monad Testnet
    await switchToMonadTestnet();

    // Get balance
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
        // Chain not added yet, add it
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
    // We just clear local state
}

// ─── Contract Interaction ───

/**
 * Call pay() on the StreamPay contract with the accumulated session cost.
 * This sends real MON on Monad Testnet.
 */
export async function sendSessionPayment(
    amountMON: number
): Promise<{ txHash: string; explorerUrl: string }> {
    if (!window.ethereum) {
        throw new Error("MetaMask not found");
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Convert MON amount to wei
    const amountWei = parseEther(amountMON.toFixed(18));

    // Call pay() with the MON value
    const tx = await contract.pay({ value: amountWei });

    // Wait for confirmation
    const receipt = await tx.wait();

    const txHash = receipt.hash;
    const explorerUrl = `${MONAD_TESTNET.blockExplorerUrls[0]}/tx/${txHash}`;

    return { txHash, explorerUrl };
}

// ─── Session Management ───

/**
 * End a watching session and send the on-chain payment.
 * Returns a WatchSession with real tx hash.
 */
export async function endWatchSession(
    contentId: string,
    contentTitle: string,
    totalSeconds: number,
    totalCost: number
): Promise<WatchSession> {
    const session: WatchSession = {
        contentId,
        contentTitle,
        startTime: Date.now() - totalSeconds * 1000,
        endTime: Date.now(),
        totalSeconds,
        totalCost,
        txHash: "",
        status: "pending",
    };

    try {
        // Send the real on-chain payment
        const { txHash, explorerUrl } = await sendSessionPayment(totalCost);
        session.txHash = txHash;
        session.explorerUrl = explorerUrl;
        session.status = "completed";
    } catch (error) {
        console.error("Payment failed:", error);
        session.status = "failed";
        session.txHash = "FAILED";
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

export { COST_PER_SECOND };

