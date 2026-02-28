import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types ───

export interface UserBalance {
    wallet_address: string;
    minute_balance: number;
    updated_at: string;
}

export interface TransactionRecord {
    id?: string;
    wallet_address: string;
    type: "purchase" | "watch";
    content_id: string | null;
    content_title: string;
    minutes_amount: number;
    cost_mon: number | null;
    tx_hash: string | null;
    explorer_url: string | null;
    monoracle_contract: string | null;
    seconds_watched: number;
    remaining_balance: number;
    status: "completed" | "pending" | "failed";
    created_at?: string;
}

// ─── Balance Functions ───

/**
 * Get minute balance for a wallet from Supabase.
 * Falls back to 0 if not found.
 */
export async function getMinuteBalance(walletAddress: string): Promise<number> {
    const addr = walletAddress.toLowerCase();

    const { data, error } = await supabase
        .from("user_balances")
        .select("minute_balance")
        .eq("wallet_address", addr)
        .single();

    if (error || !data) return 0;
    return data.minute_balance;
}

/**
 * Set (upsert) minute balance for a wallet.
 */
export async function setMinuteBalance(
    walletAddress: string,
    minutes: number
): Promise<void> {
    const addr = walletAddress.toLowerCase();

    await supabase.from("user_balances").upsert(
        {
            wallet_address: addr,
            minute_balance: parseFloat(minutes.toFixed(4)),
            updated_at: new Date().toISOString(),
        },
        { onConflict: "wallet_address" }
    );
}

/**
 * Add minutes to existing balance (atomic increment via RPC or read-then-write).
 */
export async function addMinutesToBalance(
    walletAddress: string,
    minutesToAdd: number
): Promise<number> {
    const addr = walletAddress.toLowerCase();

    // First try to get current balance
    const current = await getMinuteBalance(addr);
    const newBalance = parseFloat((current + minutesToAdd).toFixed(4));

    await setMinuteBalance(addr, newBalance);
    return newBalance;
}

/**
 * Deduct minutes from balance.
 */
export async function deductMinutesFromBalance(
    walletAddress: string,
    minutesToDeduct: number
): Promise<number> {
    const addr = walletAddress.toLowerCase();

    const current = await getMinuteBalance(addr);
    const newBalance = Math.max(parseFloat((current - minutesToDeduct).toFixed(4)), 0);

    await setMinuteBalance(addr, newBalance);
    return newBalance;
}

// ─── Transaction Functions ───

/**
 * Record a transaction (purchase or watch session).
 */
export async function recordTransaction(
    tx: Omit<TransactionRecord, "id" | "created_at">
): Promise<TransactionRecord | null> {
    const { data, error } = await supabase
        .from("transactions")
        .insert({
            ...tx,
            wallet_address: tx.wallet_address.toLowerCase(),
        })
        .select()
        .single();

    if (error) {
        console.error("Supabase recordTransaction error:", error);
        return null;
    }
    return data;
}

/**
 * Get all transactions for a wallet, ordered by newest first.
 */
export async function getTransactions(
    walletAddress: string,
    limit: number = 50
): Promise<TransactionRecord[]> {
    const addr = walletAddress.toLowerCase();

    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("wallet_address", addr)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Supabase getTransactions error:", error);
        return [];
    }
    return data || [];
}
