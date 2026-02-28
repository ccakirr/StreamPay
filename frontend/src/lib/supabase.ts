import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// ─── Types ───

export interface UserBalance {
    wallet_address: string;
    minute_balance: number;
    display_name: string | null;
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

// ─── User Profile Functions ───

/**
 * Check if a user exists in Supabase (first-time check).
 */
export async function checkUserExists(walletAddress: string): Promise<boolean> {
    if (!supabase) return false;
    const addr = walletAddress.toLowerCase();

    try {
        const { data, error } = await supabase
            .from("user_balances")
            .select("wallet_address")
            .eq("wallet_address", addr)
            .maybeSingle();

        if (error) {
            console.error("Supabase checkUserExists error:", error);
            return false;
        }
        return !!data;
    } catch (err) {
        console.error("checkUserExists failed:", err);
        return false;
    }
}

/**
 * Get user display name from Supabase.
 */
export async function getUserDisplayName(walletAddress: string): Promise<string | null> {
    if (!supabase) return null;
    const addr = walletAddress.toLowerCase();

    try {
        const { data, error } = await supabase
            .from("user_balances")
            .select("display_name")
            .eq("wallet_address", addr)
            .maybeSingle();

        if (error || !data) return null;
        return data.display_name;
    } catch (err) {
        console.error("getUserDisplayName failed:", err);
        return null;
    }
}

/**
 * Register a new user with display name.
 */
export async function registerUser(
    walletAddress: string,
    displayName: string
): Promise<boolean> {
    if (!supabase) return false;
    const addr = walletAddress.toLowerCase();

    try {
        const { error } = await supabase.from("user_balances").upsert(
            {
                wallet_address: addr,
                display_name: displayName.trim(),
                minute_balance: 0,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "wallet_address" }
        );

        if (error) {
            console.error("Supabase registerUser error:", error);
            return false;
        }
        return true;
    } catch (err) {
        console.error("registerUser failed:", err);
        return false;
    }
}

// ─── Balance Functions ───

/**
 * Get minute balance for a wallet from Supabase.
 * Uses maybeSingle() to avoid 406 error when user doesn't exist yet.
 * Falls back to 0 if not found.
 */
export async function getMinuteBalance(walletAddress: string): Promise<number> {
    if (!supabase) return 0;
    const addr = walletAddress.toLowerCase();

    try {
        const { data, error } = await supabase
            .from("user_balances")
            .select("minute_balance")
            .eq("wallet_address", addr)
            .maybeSingle();

        if (error) {
            console.error("Supabase getMinuteBalance error:", error);
            return 0;
        }
        return data?.minute_balance ?? 0;
    } catch (err) {
        console.error("getMinuteBalance failed:", err);
        return 0;
    }
}

/**
 * Set (upsert) minute balance for a wallet.
 */
export async function setMinuteBalance(
    walletAddress: string,
    minutes: number
): Promise<void> {
    if (!supabase) return;
    const addr = walletAddress.toLowerCase();

    try {
        const { error } = await supabase.from("user_balances").upsert(
            {
                wallet_address: addr,
                minute_balance: parseFloat(minutes.toFixed(4)),
                updated_at: new Date().toISOString(),
            },
            { onConflict: "wallet_address" }
        );

        if (error) {
            console.error("Supabase setMinuteBalance error:", error);
        }
    } catch (err) {
        console.error("setMinuteBalance failed:", err);
    }
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
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from("transactions")
            .insert({
                ...tx,
                wallet_address: tx.wallet_address.toLowerCase(),
            })
            .select()
            .maybeSingle();

        if (error) {
            console.error("Supabase recordTransaction error:", error);
            return null;
        }
        return data;
    } catch (err) {
        console.error("recordTransaction failed:", err);
        return null;
    }
}

/**
 * Get all transactions for a wallet, ordered by newest first.
 */
export async function getTransactions(
    walletAddress: string,
    limit: number = 50
): Promise<TransactionRecord[]> {
    if (!supabase) return [];
    const addr = walletAddress.toLowerCase();

    try {
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
    } catch (err) {
        console.error("getTransactions failed:", err);
        return [];
    }
}
