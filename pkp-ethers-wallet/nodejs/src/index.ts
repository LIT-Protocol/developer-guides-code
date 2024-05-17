import { LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  LitAbility,
  LitActionResource,
  LitPKPResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import { ethers } from "ethers";

const getEnv = (name: string): string => {
  const env = process.env[name];
  if (env === undefined || env === "")
    throw new Error(
      `${name} ENV is not defined, please define it in the .env file`
    );
  return env;
};

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const PKP_PUBLIC_KEY = getEnv("PKP_PUBLIC_KEY");
const SEPOLIA_RPC_URL = getEnv("SEPOLIA_RPC_URL");

let litNodeClient: LitNodeClient;

try {
  litNodeClient = new LitNodeClient({
    litNetwork: "cayenne",
  });
  await litNodeClient.connect();

  const ethersWallet = new ethers.Wallet(
    ETHEREUM_PRIVATE_KEY,
    new ethers.providers.JsonRpcProvider(
      "https://chain-rpc.litprotocol.com/http"
    )
  );

  const sessionSigs = await litNodeClient.getSessionSigs({
    chain: "ethereum",
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource("*"),
        ability: LitAbility.PKPSigning,
      },
      {
        resource: new LitActionResource("*"),
        ability: LitAbility.LitActionExecution,
      },
    ],
    authNeededCallback: async ({
      resourceAbilityRequests,
      expiration,
      uri,
    }) => {
      const toSign = await createSiweMessageWithRecaps({
        // @ts-ignore
        uri,
        // @ts-ignore
        expiration,
        // @ts-ignore
        resources: resourceAbilityRequests,
        walletAddress: await ethersWallet.getAddress(),
        nonce: await litNodeClient!.getLatestBlockhash(),
        litNodeClient,
      });
      return await generateAuthSig({
        signer: ethersWallet,
        toSign,
      });
    },
  });

  const pkpEthersWallet = new PKPEthersWallet({
    pkpPubKey: PKP_PUBLIC_KEY,
    controllerSessionSigs: sessionSigs,
    // @ts-ignore
    controllerAuthMethods: [],
    debug: false,
    litNetwork: "cayenne",
    rpc: SEPOLIA_RPC_URL,
  });
  await pkpEthersWallet.init();

  const TO_SIGN = ethers.utils.arrayify(
    ethers.utils.keccak256([1, 2, 3, 4, 5])
  );
  const signature = await pkpEthersWallet.signMessage(TO_SIGN);
  console.log("signature", signature);

  //   const tx = await pkpEthersWallet.sendTransaction({
  //     to: "0xC5285D8033cB00229d4b39D6Ed038BbeFF1C0f4c",
  //     value: "0x0",
  //   });
  //   const receipt = await tx.wait();
  //   console.log(receipt);
} catch (error) {
  console.error(error);
} finally {
  litNodeClient!.disconnect();
}
