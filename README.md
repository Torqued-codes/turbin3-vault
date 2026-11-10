
# 📦 Solana Week 2: Vault & Escrow Smart Contracts

A complete overview of the Anchor smart contracts developed for Week 2, covering a **Vault Program** with native CPI SOL transfers and a **Timed Escrow Program** for SPL token swaps.

## 🛠️ Project Overview

This repository contains two distinct Anchor programs built on Solana:

1. **`anchor_vault`**: A smart contract acting as a personal vault where users can deposit SOL, withdraw back to their wallet, or close the vault account.
2. **`anchor_escrow`**: A decentralized token exchange program enabling a **Maker** to lock Token A in exchange for Token B from a **Taker**, with support for updates, refunds, and an automatic timed lockup period.

## 🏛️ Program Architecture & Logic

### 1. Anchor Vault (`anchor_vault`)

- **State**: Uses a `VaultState` account to track program parameters and vault bumps.
- **Vault Account**: A Program Derived Address (PDA) that safely holds locked SOL.
- **Instructions**:
  - `deposit(amount)`: Transfers SOL from the user's wallet into the Vault PDA via System Program CPI.
  - `withdraw(amount)`: Transfers SOL from the Vault PDA back to the user's wallet using PDA signing seeds.
  - `close()`: Drains all remaining SOL from the vault back to the user and closes the state account.

### 2. Timed Escrow (`anchor_escrow`)

- **State**: Stores `seed`, `maker`, `mint_a`, `mint_b`, `receive_amount`, `bump`, and `expiry_timestamp`.
- **Instructions**:
  - `make(seed, deposit_amount, receive_amount)`: Locks Maker's Token A into the Escrow Vault ATA and records the expected Token B amount.
  - `update(new_receive_amount)`: Allows the Maker to modify the requested amount of Token B before execution.
  - `take()`: Allows a Taker to send Token B to the Maker and claim Token A from the vault, closing the escrow.
  - `refund()`: Allows the Maker to reclaim their locked Token A and close the vault if the offer is cancelled.
  - ⏰ **Timed Extension**: Uses Solana's `Clock` sysvar (`Clock::get()?`) to enforce expiration windows so Maker funds cannot be locked indefinitely.

## 📂 Repository Directory Layout

Each project maintains a self-contained Anchor workspace structure:

```text
anchor_vault_starter_q3_26/
├── anchor_vault/
│   ├── programs/
│   │   └── q3_26_vault/
│   │       ├── src/
│   │       │   ├── instructions/
│   │       │   │   ├── deposit.rs
│   │       │   │   ├── withdraw.rs
│   │       │   │   └── close.rs
│   │       │   ├── state/
│   │       │   └── lib.rs
│   │       └── Cargo.toml
│   ├── tests/
│   │   └── anchor_vault.ts
│   └── Anchor.toml
│
└── anchor_escrow/
    ├── programs/
    │   └── anchor-escrow-q2-2026/
    │       ├── src/
    │       │   ├── instructions/
    │       │   │   ├── make.rs
    │       │   │   ├── update.rs
    │       │   │   ├── take.rs
    │       │   │   └── refund.rs
    │       │   ├── state/
    │       │   └── lib.rs
    │       └── Cargo.toml
    ├── tests/
    │   └── anchor_escrow.ts
    └── Anchor.toml
```

## 🧪 Automated Testing

Both programs include comprehensive end-to-end integration tests written in TypeScript using `@coral-xyz/anchor` and `@solana/spl-token`.

### Test Coverage

#### `anchor_vault.ts`

- ✅ Airdrop SOL to test wallet.
- ✅ Deposit SOL into Vault PDA and verify balance.
- ✅ Withdraw partial SOL balance.
- ✅ Close vault and refund remaining lamports.

#### `anchor_escrow.ts`

- ✅ Mint test SPL Tokens (Token A and Token B).
- ✅ Execute `make` instruction to transfer Token A to vault.
- ✅ Execute `update` instruction to change expected Token B amount.
- ✅ Execute `take` instruction to settle token swap between Maker and Taker.
- ✅ Execute `refund` path to handle cancellations.

## 🚀 How to Build and Run Tests

### Prerequisites

- Rust & Cargo (`solana-cli` / `cargo-build-sbf`)
- Node.js & Yarn
- Anchor CLI v0.30.1

### Execution

```bash
# 1. Build and test Vault Program
cd anchor_vault
anchor keys sync
anchor build
anchor test

# 2. Build and test Escrow Program
cd ../anchor_escrow
anchor keys sync
anchor build
anchor test
```
