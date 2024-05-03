import * as LitJsSdk from "@lit-protocol/lit-node-client";
import {ethers} from "ethers";
import {SiweMessage} from "siwe";
import {
  LitAccessControlConditionResource,
  LitAbility,
} from "@lit-protocol/auth-helpers";

export function EncryptDecrypt() {

  class Lit {
    litNodeClient;

    constructor(client, chain, accessControlConditions){
        this.litNodeClient = client;
        this.chain = chain;
        this.accessControlConditions = accessControlConditions;
    }

    async connect() {
      await this.litNodeClient.connect()
    }

    async getSessionSigsBrowser(){
      // Create an access control condition resource
      const litResource = new LitAccessControlConditionResource(
          '*'
      );

      const sessionSigs = await this.litNodeClient.getSessionSigs({
          chain: this.chain,
          resourceAbilityRequests: [
              {
                  resource: litResource,
                  ability: LitAbility.AccessControlConditionDecryption,
              },
          ],
      });
      return sessionSigs
    }

    async getSessionSigsServer(){
      const walletWithCapacityCredit = new ethers.Wallet(
          process.env.REACT_APP_PRIVATE_KEY
      );

      // const { capacityDelegationAuthSig } =
      // await client.createCapacityDelegationAuthSig({
      //   uses: '1',
      //   dAppOwnerWallet: walletWithCapacityCredit,
      //   capacityTokenId: '12342452454',
      //   delegateeAddresses: [],
      // });
      // console.log(capacityDelegationAuthSig)

      // /**
      //  * When the getSessionSigs function is called, it will generate a session key
      //  * and sign it using a callback function. The authNeededCallback parameter
      //  * in this function is optional. If you don't pass this callback,
      //  * then the user will be prompted to authenticate with their wallet.
      //  */
      const authNeededCallback = async ({
          chain,
          resources,
          expiration,
          uri,
      }) => {
          const domain = "localhost:3000";
          const message = new SiweMessage({
              domain,
              address: walletWithCapacityCredit.address,
              statement: "Sign a session key to use with Lit Protocol",
              uri,
              version: "1",
              chainId: "1",
              expirationTime: expiration,
              resources,
          });
          const toSign = message.prepareMessage();
          const signature = await walletWithCapacityCredit.signMessage(toSign);

          const authSig = {
              sig: signature,
              derivedVia: "web3.eth.personal.sign",
              signedMessage: toSign,
              address: walletWithCapacityCredit.address,
          };
          return authSig;
      };

      // Create an access control condition resource
      const litResource = new LitAccessControlConditionResource(
          '*'
      );

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
      // const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
      const sessionSigs = (mode==="browser" ? await this.getSessionSigsBrowser() : await this.getSessionSigsServer());

      if (!this.litNodeClient) {
        await this.connect()
      }

      const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
        {
          accessControlConditions: this.accessControlConditions,
          chain: this.chain,
          dataToEncrypt: message,
          // authSig,
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
      // const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
      const sessionSigs = (mode==="browser" ? await this.getSessionSigsBrowser() : await this.getSessionSigsServer());

      if (!this.litNodeClient) {
        await this.connect()
      }

      // const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
      const decryptedString = await LitJsSdk.decryptToString(
        {
          accessControlConditions: this.accessControlConditions,
          chain: this.chain,
          ciphertext,
          dataToEncryptHash,
          // authSig,
          sessionSigs,
        },
        this.litNodeClient,
      );
      return { decryptedString }
    }
  }

  const runBrowserMode = async () => {
      LitJsSdk.disconnectWeb3();

      const client = new LitJsSdk.LitNodeClient({
          litNetwork: "cayenne", 
          debug: true,
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
      
      const data = await myLit.decrypt(ciphertext, dataToEncryptHash, accessControlConditions, "browser");
      console.log("decrypted data: ",data);
  }

  const runServerMode = async () => {
    LitJsSdk.disconnectWeb3();

    const client = new LitJsSdk.LitNodeClient({
        litNetwork: "cayenne", 
        debug: true,
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
    
    const data = await myLit.decrypt(ciphertext, dataToEncryptHash, accessControlConditions, "server");
    console.log("decrypted data: ",data);
  }

  return (
    <div>
      <button onClick={runBrowserMode}>Encrypt/Decrypt in browser-side Mode</button>
      <button onClick={runServerMode}>Encrypt/Decrypt in server-side Mode</button>
    </div>
  );
}