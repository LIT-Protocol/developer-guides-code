import { LitNodeClient, disconnectWeb3 } from "@lit-protocol/lit-node-client";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitNetwork, AuthMethodScope } from "@lit-protocol/constants";
import { LitPKPResource, LitActionResource } from "@lit-protocol/auth-helpers";
import { LitAbility } from "@lit-protocol/types";
import { ipfsHelpers } from "ipfs-helpers";
import * as ethers from "ethers";

import { litActionCode } from "./litAction";

export const litCustomAuth = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const ethersSigner = provider.getSigner();

    console.log("🔄 Connecting to the Lit network...");
    const litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilDev,
      debug: false,
    });
    await litNodeClient.connect();
    console.log("✅ Connected to the Lit network");

    console.log("🔄 Initializing LitContracts...");
    const litContracts = new LitContracts({
      signer: ethersSigner,
      debug: false,
      network: LitNetwork.DatilDev,
    })
    await litContracts.connect();
    console.log("✅ Initialized LitContracts");

    console.log("🔄 Minting a PKP...");
    const pkp = (await litContracts.pkpNftContractUtils.write.mint()).pkp;
    console.log("✅ Minted a PKP");

    const customAuthMethod = {
      authMethodType: 321123,
      authMethodId: "appName-userID"
    }

    console.log("🔄 Adding custom AuthMethod schema to PKP...");
    await litContracts.addPermittedAuthMethod({
      pkpTokenId: pkp.tokenId,
      authMethodType: customAuthMethod.authMethodType,
      authMethodId: customAuthMethod.authMethodId,
      authMethodScopes: [AuthMethodScope.SignAnything],
    })
    console.log("✅ Added custom AuthMethod schema to PKP");

    const permittedAuthMethods = await litContracts.pkpPermissionsContract.read.getPermittedAuthMethods(pkp.tokenId);
    console.log("✅ Retrieved permitted AuthMethods for PKP", permittedAuthMethods);

    const isPermittedAuthMethod = await litContracts.pkpPermissionsContract.read.isPermittedAuthMethod(
      pkp.tokenId,
      customAuthMethod.authMethodType,
      ethers.utils.toUtf8Bytes(customAuthMethod.authMethodId)
    );
    console.log("✅ Checked if custom AuthMethod is permitted for PKP", isPermittedAuthMethod);

    console.log("🔄 Adding permitted action to PKP...");
    const ipfsHash = await ipfsHelpers.stringToCidV0(litActionCode);
    await litContracts.addPermittedAction({
      ipfsId: ipfsHash,
      pkpTokenId: pkp.tokenId,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });
    console.log("✅ Added permitted action to PKP");

    console.log("🔄 Getting Session Signatures...");
    const sessionSigs = await litNodeClient.getLitActionSessionSigs({
      pkpPublicKey: pkp.publicKey,
      resourceAbilityRequests: [
        {
          resource: new LitPKPResource("*"), 
          ability: LitAbility.PKPSigning
        },
        {
          resource: new LitActionResource("*"),
          ability: LitAbility.LitActionExecution
        }
      ],
      litActionCode: Buffer.from(litActionCode).toString("base64"),
      jsParams: {
        pkpPublicKey: pkp.publicKey,
        customAuthMethod: {
          authMethodType: `0x${customAuthMethod.authMethodType.toString(16)}`,
          authMethodId: `0x${Buffer.from(
            new TextEncoder().encode(customAuthMethod.authMethodId)
          ).toString("hex")}`,
        },
        sigName: "custom-auth-sig",
      },
    })
    console.log("✅ Got Session Signatures");

    console.log("🔄 Signing message with PKP...");
    const signingResponse = await litNodeClient.pkpSign({
      sessionSigs: sessionSigs,
      pubKey: pkp.publicKey,
      toSign: ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Hello, world!")))
    })
    console.log("✅ Signed message with PKP", signingResponse);

  } catch (error) {
    console.error("Failed to connect to Lit Network:", error);
  } finally {
    disconnectWeb3();
  }
};
