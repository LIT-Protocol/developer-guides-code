import "jsr:/@kitsonk/xhr";
import "https://cdnjs.cloudflare.com/ajax/libs/stellar-sdk/11.3.0/stellar-sdk.js";

const go = async () => {
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
      .addOperation(contract.call("always_true"))
      .setTimeout(90)
      .build();

    let preparedTransaction = await server.prepareTransaction(builtTransaction);
    preparedTransaction.sign(sourceKeypair);

    let sendResponse = await server.sendTransaction(preparedTransaction);
    if (sendResponse.status === "PENDING") {
      let getResponse = await server.getTransaction(sendResponse.hash);
      while (getResponse.status === "NOT_FOUND") {
        getResponse = await server.getTransaction(sendResponse.hash);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (getResponse.status === "SUCCESS") {
        if (!getResponse.resultMetaXdr) {
          throw "Empty resultMetaXDR in getTransaction response";
        }
        let transactionMeta = getResponse.resultMetaXdr;
        let returnValue = transactionMeta.v3().sorobanMeta().returnValue();

        console.log(`Transaction result: ${returnValue.value()}`);
        return returnValue.value();
      } else {
        throw `Transaction failed: ${getResponse.resultXdr}`;
      }
    } else {
      throw sendResponse.errorResultXdr;
    }
  } catch (e) {
    console.log(e);
    Lit.Actions.setResponse({ response: JSON.stringify(e) });
  }
  return false;
};

go();
