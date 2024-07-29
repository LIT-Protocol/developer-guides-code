// @ts-nocheck
import { Connection, clusterApiUrl } from "@solana/web3.js";
import bs58 from "bs58";

(async () => {
  let txSignature = await Lit.Actions.runOnce(
    { waitForResponse: true, name: "sendSignedSolTx" },
    async () => {
      try {
        const solanaConnection = new Connection(
          clusterApiUrl("devnet"),
          "confirmed"
        );

        console.log("Signed transaction:", signedTx);

        const signature = await solanaConnection.sendRawTransaction(
          bs58.decode(signedTx)
        );

        console.log("Transaction sent. Signature:", signature);

        const { blockhash, lastValidBlockHeight } =
          await solanaConnection.getLatestBlockhash();

        const status = await solanaConnection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });

        console.log("Confirmation status:", status);

        if (status.value.err) {
          throw new Error(
            `Transaction failed: ${JSON.stringify(status.value.err)}`
          );
        }

        console.log("Transaction confirmed successfully");

        return signature;
      } catch (error) {
        console.error("Error:", error.message);
      } finally {
        console.log("Lit Action completed");
      }
    }
  );

  return Lit.Actions.setResponse({
    response: JSON.stringify({
      txSignature,
    }),
  });
})();
