import "dotenv/config";

import type {
  EncryptStringRequest,
  DecryptRequest,
  EncryptResponse,
  UnifiedAccessControlConditions,
  LitNodeClientConfig,
  AuthCallbackParams,
  LitResourceAbilityRequest,
  AuthSig,
} from "@lit-protocol/types";
import * as LitSDK from "@lit-protocol/lit-node-client";
import {
  createSiweMessageWithRecaps,
  LitAccessControlConditionResource,
  LitAbility,
  LitActionResource,
  LitPKPResource,
  LitRLIResource,
  generateAuthSig,
} from "@lit-protocol/auth-helpers";
import { LitNetwork } from "@lit-protocol/constants";
import * as ethers from "ethers";

const APP_CHAIN = "baseSepolia";
const LIT_CHAIN_NAME = "baseSepolia";

const CLIENT_OPTIONS: LitNodeClientConfig = {
  alertWhenUnauthorized: false,
  litNetwork: LitNetwork.DatilTest,
  debug: true,
};

export const accessControlConditions = {
  public: [
    {
      conditionType: "evmBasic",
      contractAddress: "",
      standardContractType: "",
      chain: LIT_CHAIN_NAME,
      method: "eth_getBalance",
      parameters: [":userAddress", "latest"],
      returnValueTest: {
        comparator: ">=",
        value: "0",
      },
    },
  ],
};

export class LitWeb {
  client: LitSDK.LitNodeClientNodeJs | LitSDK.LitNodeClient | undefined =
    undefined;

  async connect() {
    if (this.client) {
      return this.client;
    }

    try {
      const client = new LitSDK.LitNodeClient(CLIENT_OPTIONS);
      await client.connect();
      this.client = client;
      return this.client;
    } catch (e) {
      console.error("Unable to initialize Lit client", e);
      throw new Error("Unable to initialize Lit client");
    }
  }

  async createAuthSig(
    params: AuthCallbackParams,
    account: ethers.Wallet
  ): Promise<AuthSig> {
    await this.connect();

    if (!this.client) {
      throw new Error("Unable to initialize Lit client");
    }
    try {
      const address = account.address;
      const preparedMessage = await createSiweMessageWithRecaps({
        uri: String(params.uri),
        expiration: String(params.expiration),
        resources: params.resourceAbilityRequests!,
        walletAddress: address as `0x${string}`,
        nonce: params.nonce,
        litNodeClient: this.client,
        statement: params.statement,
        chainId: 84532,
      });

      return generateAuthSig({signer: account, toSign: preparedMessage, address});
    } catch (e) {
      console.error(e);
      return Promise.reject("Error signing message");
    }
  }
}

export class LitServer extends LitWeb {
  async connect() {
    if (this.client) {
      return this.client;
    }

    try {
      const client = new LitSDK.LitNodeClientNodeJs(CLIENT_OPTIONS);
      await client.connect();
      this.client = client;
      return this.client;
    } catch (e) {
      console.error("Unable to initialize Lit client", e);
      throw new Error("Unable to initialize Lit client");
    }
  }

  async generateSessionSigs(
    account: ethers.Wallet,
    capacityDelegationAuthSig?: AuthSig
  ) {
    await this.connect();

    if (!this.client) {
      throw new Error("Unable to initialize Lit client");
    }

    try {
      return await this.client.getSessionSigs({
        chain: LIT_CHAIN_NAME,
        resourceAbilityRequests: [
          {
            resource: new LitActionResource("*"),
            ability: LitAbility.LitActionExecution,
          },
          {
            resource: new LitPKPResource("*"),
            ability: LitAbility.PKPSigning,
          },
        ],
        capabilityAuthSigs: capacityDelegationAuthSig ? [capacityDelegationAuthSig] : undefined,
        authNeededCallback: async (params) => {
          return await this.createAuthSig(params, account);
        },
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async createDelegateAuthSig(address: string, expiration?: string) {
    await this.connect();

    if (!this.client) {
      return Promise.reject("Unable to initialize Lit client");
    }

    const walletWithCapacityNFT = new ethers.Wallet(
      String('3faafe8744f6f69d571001d8b52149448020a95752798191fe2adc28988803d8')
    );

    try {
      const { capacityDelegationAuthSig } =
        await this.client.createCapacityDelegationAuthSig({
          dAppOwnerWallet: walletWithCapacityNFT,
          delegateeAddresses: [address],
          statement: "Delegate Lit capacity to user",
          capacityTokenId: '671',
          expiration,
        });

      return capacityDelegationAuthSig;
    } catch (e) {
      console.error("Error creating delegate auth sig", e);
      return Promise.reject(e);
    }
  }
}