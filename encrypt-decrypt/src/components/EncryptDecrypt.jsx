import * as LitJsSdk from "@lit-protocol/lit-node-client";
import {ethers} from "ethers";
import {SiweMessage} from "siwe";
import {
  LitAccessControlConditionResource,
  LitAbility,
  createSiweMessageWithRecaps,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { LitNetwork } from "@lit-protocol/constants";

export function EncryptDecrypt() {
  class Lit {
    litNodeClient;

    constructor(client, chain, accessControlConditions){
        this.litNodeClient = client;
        this.chain = chain;
        this.accessControlConditions = accessControlConditions;
    }

    async connect() {
      LitJsSdk.disconnectWeb3();
      await this.litNodeClient.connect()
    }

    async getSessionSigsBrowser(){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const walletAddress = await signer.getAddress();
      console.log("Connected account:", walletAddress);

      const latestBlockhash = await this.litNodeClient.getLatestBlockhash();

      const authNeededCallback = async(params) => {
        if (!params.uri) {
          throw new Error("uri is required");
        }
        if (!params.expiration) {
          throw new Error("expiration is required");
        }

        if (!params.resourceAbilityRequests) {
          throw new Error("resourceAbilityRequests is required");
        }

        const toSign = await createSiweMessageWithRecaps({
          uri: params.uri,
          expiration: params.expiration,
          resources: params.resourceAbilityRequests,
          walletAddress: walletAddress,
          nonce: latestBlockhash,
          litNodeClient: this.litNodeClient,
        });

        const authSig = await generateAuthSig({
          signer: signer,
          toSign,
        });

        return authSig;
      }

      const litResource = new LitAccessControlConditionResource('*');
      const sessionSigs = await this.litNodeClient.getSessionSigs({
          chain: this.chain,
          resourceAbilityRequests: [
              {
                  resource: litResource,
                  ability: LitAbility.AccessControlConditionDecryption,
              },
          ],
          authNeededCallback,
      });
      return sessionSigs
    }

    async getSessionSigsServer(){
      const walletWithCapacityCredit = new ethers.Wallet(
          process.env.REACT_APP_PRIVATE_KEY
      );
      const latestBlockhash = await this.litNodeClient.getLatestBlockhash();

      // // To mint a capacity delegation auth sig and use it in getSessionSigs to delegate it to pkp or some other wallet
      // const { capacityDelegationAuthSig } =
      // await client.createCapacityDelegationAuthSig({
      //   uses: '1',
      //   dAppOwnerWallet: walletWithCapacityCredit,
      //   capacityTokenId: '12342452454',
      //   delegateeAddresses: [],
      // });
      // console.log(capacityDelegationAuthSig)

      const authNeededCallback = async(params) => {
        if (!params.uri) {
          throw new Error("uri is required");
        }
        if (!params.expiration) {
          throw new Error("expiration is required");
        }

        if (!params.resourceAbilityRequests) {
          throw new Error("resourceAbilityRequests is required");
        }

        const toSign = await createSiweMessageWithRecaps({
          uri: params.uri,
          expiration: params.expiration,
          resources: params.resourceAbilityRequests,
          walletAddress: walletWithCapacityCredit.address,
          nonce: latestBlockhash,
          litNodeClient: this.litNodeClient,
        });

        const authSig = await generateAuthSig({
          signer: walletWithCapacityCredit,
          toSign,
        });

        return authSig;
      }

      const litResource = new LitAccessControlConditionResource('*');

      const sessionSigs = await this.litNodeClient.getSessionSigs({
          chain: this.chain,
          resourceAbilityRequests: [
              {
                  resource: litResource,
                  ability: LitAbility.AccessControlConditionDecryption,
              },
          ],
          authNeededCallback,
      });
      return sessionSigs
    }

    async encrypt(message, mode) {
      const sessionSigs = (mode==="browser" ? await this.getSessionSigsBrowser() : await this.getSessionSigsServer());
      const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
        {
          accessControlConditions: this.accessControlConditions,
          chain: this.chain,
          dataToEncrypt: message,
          sessionSigs,
        },
        this.litNodeClient,
      );
      return {
        ciphertext,
        dataToEncryptHash,
      };
    }
  
    async decrypt(ciphertext, dataToEncryptHash, mode) {
      const sessionSigs = (mode==="browser" ? await this.getSessionSigsBrowser() : await this.getSessionSigsServer());
      const decryptedString = await LitJsSdk.decryptToString(
        {
          accessControlConditions: this.accessControlConditions,
          chain: this.chain,
          ciphertext,
          dataToEncryptHash,
          sessionSigs,
        },
        this.litNodeClient,
      );
      return { decryptedString }
    }
  }

  const runBrowserMode = async () => {
    const client = new LitJsSdk.LitNodeClient({
        litNetwork: LitNetwork.Cayenne,
    });
    
    const chain = "ethereum";
    
    const accessControlConditions = [
        {
          contractAddress: "",
          standardContractType: "",
          chain,
          method: "eth_getBalance",
          parameters: [":userAddress", "latest"],
          returnValueTest: {
            comparator: ">=",
            value: "000000000000", // 0.000001 ETH
          },
        },
    ];

    const message = "this is a secret message";

    let myLit = new Lit(client, chain, accessControlConditions);
    await myLit.connect();

    const { ciphertext, dataToEncryptHash } = await myLit.encrypt(message, "browser");
    console.log("ciphertext: ", ciphertext);
    console.log("dataToEncryptHash: ", dataToEncryptHash);
    
    const data = await myLit.decrypt(ciphertext, dataToEncryptHash, "browser");
    console.log("decrypted data: ",data);
  }

  const runServerMode = async () => {
    const client = new LitJsSdk.LitNodeClient({
        litNetwork: LitNetwork.Cayenne,
    });
    
    const chain = "ethereum";
    
    const accessControlConditions = [
        {
          contractAddress: "",
          standardContractType: "",
          chain,
          method: "eth_getBalance",
          parameters: [":userAddress", "latest"],
          returnValueTest: {
            comparator: ">=",
            value: "000000000000", // 0.000001 ETH
          },
        },
    ];

    const message = "this is a secret message";

    let myLit = new Lit(client, chain, accessControlConditions);
    await myLit.connect();

    const { ciphertext, dataToEncryptHash } = await myLit.encrypt(message, "server");
    console.log("ciphertext: ", ciphertext);
    console.log("dataToEncryptHash: ", dataToEncryptHash);
    
    const data = await myLit.decrypt(ciphertext, dataToEncryptHash, "server");
    console.log("decrypted data: ",data);
  }

  return (
    <div>
      <button onClick={runBrowserMode}>Encrypt/Decrypt in browser-side Mode</button>
      <button onClick={runServerMode}>Encrypt/Decrypt in server-side Mode</button>
    </div>
  );
}