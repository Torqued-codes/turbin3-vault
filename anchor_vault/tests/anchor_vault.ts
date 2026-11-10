import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Q326Vault } from "../target/types/q3_26_vault";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";

describe("q3_26_vault", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Q326Vault as Program<Q326Vault>;
  const user = provider.wallet;

  // Derive PDAs matching Rust seeds:
  // state_pda = [b"state", user.key()]
  // vault_pda = [b"vault", state_pda.key()]
  const [vaultStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("state"), user.publicKey.toBuffer()],
    program.programId
  );

  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), vaultStatePda.toBuffer()],
    program.programId
  );

  it("Initializes the Vault State", async () => {
    const tx = await program.methods
      .initialize()
      .accountsPartial({
        user: user.publicKey,
        vaultState: vaultStatePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Initialize Signature:", tx);

    const vaultStateAccount = await program.account.vaultState.fetch(vaultStatePda);
    assert.isNotNull(vaultStateAccount.vaultBump);
    assert.isNotNull(vaultStateAccount.stateBump);
  });

  it("Deposits 1 SOL into the Vault", async () => {
    const depositAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);
    const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);

    const tx = await program.methods
      .deposit(depositAmount)
      .accountsPartial({
        user: user.publicKey,
        vaultState: vaultStatePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Deposit Signature:", tx);

    const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);
    assert.equal(vaultBalanceAfter - vaultBalanceBefore, 1 * LAMPORTS_PER_SOL);
  });

  it("Withdraws 0.5 SOL from the Vault", async () => {
    const withdrawAmount = new anchor.BN(0.5 * LAMPORTS_PER_SOL);
    const vaultBalanceBefore = await provider.connection.getBalance(vaultPda);

    const tx = await program.methods
      .withdraw(withdrawAmount)
      .accountsPartial({
        user: user.publicKey,
        vaultState: vaultStatePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Withdraw Signature:", tx);

    const vaultBalanceAfter = await provider.connection.getBalance(vaultPda);
    assert.equal(vaultBalanceBefore - vaultBalanceAfter, 0.5 * LAMPORTS_PER_SOL);
  });

  it("Closes Vault State and Drains Remaining SOL back to User", async () => {
    const tx = await program.methods
      .close()
      .accountsPartial({
        user: user.publicKey,
        vaultState: vaultStatePda,
        vault: vaultPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Close Signature:", tx);

    // Verify vault PDA lamports are zero
    const vaultBalance = await provider.connection.getBalance(vaultPda);
    assert.equal(vaultBalance, 0);

    // Verify vaultState account has been closed and zeroed
    const accountInfo = await provider.connection.getAccountInfo(vaultStatePda);
    assert.isNull(accountInfo);
  });
});