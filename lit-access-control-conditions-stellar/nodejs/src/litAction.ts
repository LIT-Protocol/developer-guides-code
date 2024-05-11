import "jsr:/@kitsonk/xhr";
// @ts-expect-error Cannot find module 'https://cdnjs.cloudflare.com/ajax/libs/stellar-sdk/11.3.0/stellar-sdk.js' or its corresponding type declarations.
import * as StellarSdk from "https://cdnjs.cloudflare.com/ajax/libs/stellar-sdk/11.3.0/stellar-sdk.js";

class FakeBuffer extends Uint8Array {
  toJSON() {
    // Return an object similar to Node.js Buffer's .toJSON output
    return {
      type: "Buffer",
      data: Array.from(this),
    };
  }
}

const run = async (
  //  @ts-ignore
  stellarPublicKey,
  //  @ts-ignore
  stellarAuthTxHash,
  //  @ts-ignore
  stellarAuthTxSignature,
  // @ts-ignore
  stellarAccountSequenceNumber
) => {
  // @ts-ignore
  const stellarKeyPair = StellarSdk.Keypair.fromPublicKey(stellarPublicKey);

  const signatureVerified = stellarKeyPair.verify(
    //  @ts-ignore
    new FakeBuffer(stellarAuthTxHash),
    //  @ts-ignore
    new FakeBuffer(stellarAuthTxSignature)
  );

  console.log("signatureVerified:", signatureVerified);

  const stellarAccount = new StellarSdk.Account(
    //  @ts-ignore
    stellarPublicKey,
    //  @ts-ignore
    stellarAccountSequenceNumber
  );

  console.log("stellarAccount:", stellarAccount.accountId());

  const contractAddress =
    "CAZEGBTBD7ZAL62YHHLS3W5EC2ZNVV2T32YGCQ6WRYAUF7O3EICW7UFF";
  const contract = new StellarSdk.Contract(contractAddress);
  const sourceKeypair = StellarSdk.Keypair.fromSecret(
    "SCQN3XGRO65BHNSWLSHYIR4B65AHLDUQ7YLHGIWQ4677AZFRS77TCZRB"
  );
  const server = new StellarSdk.SorobanRpc.Server(
    "https://soroban-testnet.stellar.org:443"
  );
  const sourceAccount = await server.getAccount(sourceKeypair.publicKey());

  const builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: "100",
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      contract.call(
        "is_allowed",
        StellarSdk.nativeToScVal(stellarAccount.accountId(), {
          type: "address",
        })
      )
    )
    .setTimeout(90)
    .build();

  const preparedTransaction = await server.prepareTransaction(builtTransaction);
  preparedTransaction.sign(sourceKeypair);

  const simulatedResponse = await server.simulateTransaction(
    preparedTransaction
  );

  const parsedReturnVal = StellarSdk.scValToNative(
    simulatedResponse.result.retval
  );

  console.log("authorizationResult:", parsedReturnVal);
  return parsedReturnVal;
};

run(
  "GCPQNAWI7DZ2OXVFP5ZWD7224HOOJVL6WRIMMEJ6PGS3ABMHFWC6ER6I",
  new Uint8Array([
    172, 234, 35, 50, 137, 129, 160, 69, 156, 246, 161, 5, 162, 219, 20, 254,
    115, 199, 169, 126, 25, 82, 39, 36, 154, 198, 64, 53, 252, 187, 45, 229,
  ]),
  new Uint8Array([
    120, 116, 206, 150, 157, 103, 244, 49, 168, 132, 56, 148, 135, 250, 245,
    182, 7, 209, 202, 109, 43, 226, 58, 6, 66, 104, 139, 86, 204, 7, 46, 68,
    177, 181, 107, 86, 46, 247, 67, 107, 212, 186, 190, 242, 95, 217, 11, 128,
    139, 203, 143, 143, 10, 180, 216, 48, 24, 34, 43, 31, 15, 36, 18, 10,
  ]),
  "0"
);
