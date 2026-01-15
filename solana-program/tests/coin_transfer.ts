import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CoinTransfer } from "../target/types/coin_transfer";
import { expect } from "chai";
import { 
  Keypair, 
  LAMPORTS_PER_SOL, 
  SystemProgram,
  PublicKey 
} from "@solana/web3.js";

describe("coin_transfer", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CoinTransfer as Program<CoinTransfer>;
  
  // Test accounts
  let sender: Keypair;
  let recipient: Keypair;
  let statePda: PublicKey;
  let stateBump: number;

  before(async () => {
    // Create test accounts
    sender = Keypair.generate();
    recipient = Keypair.generate();

    // Find PDA for program state
    [statePda, stateBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("program_state")],
      program.programId
    );

    // Airdrop SOL to sender for testing
    const airdropSignature = await provider.connection.requestAirdrop(
      sender.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);

    console.log("=== Test Setup ===");
    console.log("Sender:", sender.publicKey.toBase58());
    console.log("Recipient:", recipient.publicKey.toBase58());
    console.log("State PDA:", statePda.toBase58());
  });

  describe("initialize", () => {
    it("initializes the program state", async () => {
      const tx = await program.methods
        .initialize()
        .accounts({
          state: statePda,
          authority: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Initialize tx:", tx);

      // Verify state was created
      const state = await program.account.programState.fetch(statePda);
      expect(state.authority.toBase58()).to.equal(provider.wallet.publicKey.toBase58());
      expect(state.totalTransfers.toNumber()).to.equal(0);
      expect(state.version).to.equal(1);
    });
  });

  describe("transfer_sol", () => {
    it("transfers SOL from sender to recipient", async () => {
      const transferAmount = 0.5 * LAMPORTS_PER_SOL;

      // Get initial balances
      const senderBalanceBefore = await provider.connection.getBalance(sender.publicKey);
      const recipientBalanceBefore = await provider.connection.getBalance(recipient.publicKey);

      console.log("\n=== Transfer Test ===");
      console.log("Sender balance before:", senderBalanceBefore / LAMPORTS_PER_SOL, "SOL");
      console.log("Recipient balance before:", recipientBalanceBefore / LAMPORTS_PER_SOL, "SOL");
      console.log("Transfer amount:", transferAmount / LAMPORTS_PER_SOL, "SOL");

      // Execute transfer
      const tx = await program.methods
        .transferSol(new anchor.BN(transferAmount))
        .accounts({
          sender: sender.publicKey,
          recipient: recipient.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([sender])
        .rpc();

      console.log("Transfer tx:", tx);

      // Get final balances
      const senderBalanceAfter = await provider.connection.getBalance(sender.publicKey);
      const recipientBalanceAfter = await provider.connection.getBalance(recipient.publicKey);

      console.log("Sender balance after:", senderBalanceAfter / LAMPORTS_PER_SOL, "SOL");
      console.log("Recipient balance after:", recipientBalanceAfter / LAMPORTS_PER_SOL, "SOL");

      // Verify recipient received exact amount
      expect(recipientBalanceAfter).to.equal(recipientBalanceBefore + transferAmount);
      
      // Verify sender paid amount + fees
      expect(senderBalanceAfter).to.be.lessThan(senderBalanceBefore - transferAmount);
    });

    it("fails when transfer amount is zero", async () => {
      try {
        await program.methods
          .transferSol(new anchor.BN(0))
          .accounts({
            sender: sender.publicKey,
            recipient: recipient.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([sender])
          .rpc();
        
        expect.fail("Should have thrown InvalidAmount error");
      } catch (error: any) {
        expect(error.message).to.include("InvalidAmount");
        console.log("✓ Correctly rejected zero amount transfer");
      }
    });

    it("fails when sender has insufficient funds", async () => {
      const poorSender = Keypair.generate();
      
      // Airdrop minimal SOL (not enough for 1 SOL transfer)
      const airdropSig = await provider.connection.requestAirdrop(
        poorSender.publicKey,
        0.001 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig);

      try {
        await program.methods
          .transferSol(new anchor.BN(1 * LAMPORTS_PER_SOL))
          .accounts({
            sender: poorSender.publicKey,
            recipient: recipient.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([poorSender])
          .rpc();
        
        expect.fail("Should have thrown InsufficientFunds error");
      } catch (error: any) {
        expect(error.message).to.include("InsufficientFunds");
        console.log("✓ Correctly rejected insufficient funds transfer");
      }
    });
  });

  describe("get_balance", () => {
    it("returns the correct balance", async () => {
      const balance = await program.methods
        .getBalance()
        .accounts({
          account: sender.publicKey,
        })
        .view();

      const expectedBalance = await provider.connection.getBalance(sender.publicKey);
      
      expect(balance.toNumber()).to.equal(expectedBalance);
      console.log("Balance check passed:", balance.toNumber() / LAMPORTS_PER_SOL, "SOL");
    });
  });
});
