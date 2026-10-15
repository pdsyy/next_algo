CREATE TABLE IF NOT EXISTS aw_tribute_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    account text NOT NULL,
    checkout_reference text NOT NULL,
    order_code text NOT NULL,
    email text NOT NULL,
    product_id bigint NOT NULL,
    amount_cents bigint NOT NULL CHECK (amount_cents > 0),
    currency text NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
    test_mode boolean NOT NULL DEFAULT true,
    telegram_id bigint,
    bound_at timestamptz,
    state text NOT NULL DEFAULT 'created' CHECK (state IN ('created','bound','processing','paid','test_paid','manual_review')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(account, checkout_reference),
    UNIQUE(account, order_code)
);
-- Keep ambiguous/unresolved bindings locked: a later purchase must not pay a different order.
CREATE UNIQUE INDEX IF NOT EXISTS aw_tribute_one_open_order ON aw_tribute_sessions(account, telegram_id, product_id)
    WHERE telegram_id IS NOT NULL AND state IN ('bound','processing','manual_review');
CREATE TABLE IF NOT EXISTS aw_tribute_purchases (
    account text NOT NULL,
    purchase_id bigint NOT NULL,
    transaction_id bigint NOT NULL,
    product_id bigint NOT NULL,
    telegram_id bigint NOT NULL,
    amount_cents bigint NOT NULL CHECK (amount_cents > 0),
    currency text NOT NULL,
    purchased_at timestamptz NOT NULL,
    session_id uuid REFERENCES aw_tribute_sessions(id),
    state text NOT NULL DEFAULT 'received' CHECK (state IN ('received','processing','paid','test_paid','manual_review','refunded')),
    note text,
    received_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY(account, purchase_id),
    UNIQUE(account, transaction_id),
    UNIQUE(session_id)
);
CREATE TABLE IF NOT EXISTS aw_tribute_refunds (
    account text NOT NULL,
    purchase_id bigint NOT NULL,
    received_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY(account, purchase_id)
);
