import "jsr:/@kitsonk/xhr";
import * as StellarSdk from "https://cdnjs.cloudflare.com/ajax/libs/stellar-sdk/12.0.0-rc.2/stellar-sdk.js";

const ALLOW_LIST_CONTRACT_ADDRESS =
  "CAZEGBTBD7ZAL62YHHLS3W5EC2ZNVV2T32YGCQ6WRYAUF7O3EICW7UFF";
const STELLAR_TESTNET_RPC_URL = "https://soroban-testnet.stellar.org";

class BufferShim extends Uint8Array {
  toJSON() {
    // Return an object similar to Node.js Buffer's .toJSON output
    return {
      type: "Buffer",
      data: Array.from(this),
    };
  }
}

(async () => {
  const stellarKeyPair = StellarSdk.Keypair.fromPublicKey(stellarPublicKey);
  const signatureVerified = stellarKeyPair.verify(
    new BufferShim(stellarAuthTxHash),
    new BufferShim(stellarAuthTxSignature)
  );
  if (!signatureVerified) {
    LitActions.setResponse({
      response:
        "provided signature does not verify with provided stellarPublicKey and stellarAuthTxHash",
    });
    return;
  }

  const stellarSenderAccount = new StellarSdk.Account(
    stellarPublicKey,
    stellarAccountSequenceNumber
  );
  const builtTransaction = new StellarSdk.TransactionBuilder(
    stellarSenderAccount,
    {
      fee: "100",
      networkPassphrase: StellarSdk.Networks.TESTNET,
    }
  )
    .addOperation(
      new StellarSdk.Contract(ALLOW_LIST_CONTRACT_ADDRESS).call(
        "is_allowed",
        StellarSdk.nativeToScVal(stellarPublicKey, {
          type: "address",
        })
      )
    )
    .setTimeout(90)
    .build();

  const requestBody = {
    jsonrpc: "2.0",
    id: 42,
    method: "simulateTransaction",
    params: {
      transaction: builtTransaction.toXDR(),
      resourceConfig: {
        instructionLeeway: 3000000,
      },
    },
  };
  const result = await fetch(STELLAR_TESTNET_RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const xdrObject = StellarSdk.xdr.ScVal.fromXDR(
    (await result.json()).result.results[0].xdr,
    "base64"
  );
  const isAllowed = xdrObject.value();
  if (!isAllowed) {
    LitActions.setResponse({
      response: "provided Stellar address is not authorized",
    });
    return;
  }

  // sigShare is a special variable that's automatically returned by the Lit Action
  const sigShare = await LitActions.signEcdsa({
    toSign: ethers.utils.arrayify(
      ethers.utils.keccak256(
        new TextEncoder().encode(`${stellarPublicKey} is authorized`)
      )
    ),
    publicKey: litPkpPublicKey,
    sigName: "authorizationSignature",
  });

  LitActions.setResponse({
    response: "provided Stellar address is authorized",
  });
})();
