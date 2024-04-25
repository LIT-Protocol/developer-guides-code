import "jsr:/@kitsonk/xhr";
import * as StellarSdk from "https://cdnjs.cloudflare.com/ajax/libs/stellar-sdk/11.3.0/stellar-sdk.js";

const go = async (number) => {
  try {
    const sourceKeypair = StellarSdk.Keypair.fromSecret(
      "SCQN3XGRO65BHNSWLSHYIR4B65AHLDUQ7YLHGIWQ4677AZFRS77TCZRB"
    );

    const server = new StellarSdk.SorobanRpc.Server(
      "https://soroban-testnet.stellar.org:443"
    );

    const contractAddress =
      "CCIRVLI5WAHVPOU5FXHWPKVTMBCADQFXGJS4ACSUBKT55GCOPTGN5KPQ";
    const contract = new StellarSdk.Contract(contractAddress);

    const sourceAccount = await server.getAccount(sourceKeypair.publicKey());
    let builtTransaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          "is_magic_number",
          StellarSdk.nativeToScVal(parseInt(number), { type: "u32" })
        )
      )
      .setTimeout(90)
      .build();

    let preparedTransaction = await server.prepareTransaction(builtTransaction);
    preparedTransaction.sign(sourceKeypair);

    let simulatedResponse = await server.simulateTransaction(
      preparedTransaction
    );

    const parsedReturnVal = StellarSdk.scValToNative(
      simulatedResponse.result.retval
    );

    console.log("Result", parsedReturnVal);
    return parsedReturnVal;
  } catch (e) {
    console.log(e);
    Lit.Actions.setResponse({ response: JSON.stringify(e) });
  }
  return false;
};

go();
