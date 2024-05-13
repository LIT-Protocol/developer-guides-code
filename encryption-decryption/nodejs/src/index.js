import { LitNodeClientNodeJs } from "@lit-protocol/lit-node-client-nodejs";
import { LitNetwork } from "@lit-protocol/constants";
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitAccessControlConditionResource,
  LitActionResource,
  LitPKPResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import {
  providers as ethersProviders,
  utils as ethersUtils,
  Wallet,
} from "ethers";

(async () => {
  let litNodeClient;

  try {
    const ethersWallet = new Wallet(
      process.env.PRIVATE_KEY,
      new ethersProviders.JsonRpcProvider(
        "https://chain-rpc.litprotocol.com/http"
      )
    );

    litNodeClient = new LitNodeClientNodeJs({
      litNetwork: LitNetwork.Cayenne,
    });
    await litNodeClient.connect();

    // const sessionSigs = await litNodeClient.getSessionSigs({
    //   chain: "ethereum",
    //   expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    //   resourceAbilityRequests: [
    //     {
    //       resource: new LitPKPResource("*"),
    //       ability: LitAbility.PKPSigning,
    //     },
    //     {
    //       resource: new LitActionResource("*"),
    //       ability: LitAbility.LitActionExecution,
    //     },
    //   ],
    //   authNeededCallback: async ({
    //     resourceAbilityRequests,
    //     expiration,
    //     uri,
    //   }) => {
    //     const toSign = await createSiweMessageWithRecaps({
    //       // @ts-ignore
    //       uri,
    //       // @ts-ignore
    //       expiration,
    //       // @ts-ignore
    //       resources: resourceAbilityRequests,
    //       walletAddress: await ethersWallet.getAddress(),
    //       nonce: await litNodeClient.getLatestBlockhash(),
    //       litNodeClient,
    //     });
    //     return await generateAuthSig({
    //       signer: ethersWallet,
    //       toSign,
    //     });
    //   },
    // });

    const encoder = new TextEncoder();
    const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt(
      {
        accessControlConditions: [],
        dataToEncrypt: encoder.encode("foo"),
      },
      litNodeClient
    );
    console.log(
      "ciphertext",
      ciphertext,
      "dataToEncryptHash",
      dataToEncryptHash
    );
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient.disconnect();
  }
})();
