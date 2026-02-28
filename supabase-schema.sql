-- StreamPay Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. User Balances Table
CREATE TABLE IF NOT EXISTS user_balances (
    wallet_address TEXT PRIMARY KEY,
    display_name TEXT,
    minute_balance NUMERIC(12, 4) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add display_name column if table already exists
ALTER TABLE user_balances ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 2. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'watch')),
    content_id TEXT,
    content_title TEXT NOT NULL,
    minutes_amount NUMERIC(12, 4) NOT NULL DEFAULT 0,
    cost_mon NUMERIC(18, 6),
    tx_hash TEXT,
    explorer_url TEXT,
    monoracle_contract TEXT,
    seconds_watched INTEGER NOT NULL DEFAULT 0,
    remaining_balance NUMERIC(12, 4) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions (wallet_address);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);

-- 4. Row Level Security (RLS)
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (since we auth by wallet address, not Supabase Auth)
-- In production, you'd use Supabase Auth + RLS policies
CREATE POLICY "Allow all operations on user_balances"
    ON user_balances FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations on transactions"
    ON transactions FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Verify
SELECT 'Tables created successfully!' as status;
