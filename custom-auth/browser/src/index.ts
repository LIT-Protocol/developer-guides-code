import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { logStep, getOutputData } from "./utils/state-manager";
import { ethers } from "ethers";
import { LIT_CHAIN_RPC_URL } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { AuthMethodScope } from "@lit-protocol/constants";
import { LitPKPResource, LitActionResource } from "@lit-protocol/auth-helpers";
import { LitAbility } from "@lit-protocol/types";
import { ipfsHelpers } from "ipfs-helpers";

export const EOA_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

export const connectLitNodeClientToCayenne = async (step: number) => {
  const config = {
    litNetwork: LitNetwork.Cayenne,
    debug: true,
  };

  logStep({
    step,
    input: JSON.stringify(config, null, 2),
    inputType: "code",
    output: "Loading...",
  });

  const client = new LitNodeClient(config);
  await client.connect();

  logStep({
    step,
    output: "✅ litNodeClient is connected to Cayenne network.",
    outputData: { litNodeClient: client },
  });

  return client;
};

export const connectLitContractsToCayenne = async (step: number) => {
  logStep({
    step,
    input: `Configuring the signer using a EOA private key, connecting it to the provider at ${LIT_CHAIN_RPC_URL}, and setting the network to ${LitNetwork.Cayenne}.`,
    output: "Loading...",
  });

  const litContracts = new LitContracts({
    signer: new ethers.Wallet(
      EOA_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_CHAIN_RPC_URL)
    ),
    debug: false,
    network: LitNetwork.Cayenne,
  });

  await litContracts.connect();

  logStep({
    step,
    output:
      "✅ litContracts is connected to Cayenne network. All contracts are loaded.",
    outputData: { litContracts },
  });

  console.log("Step 2 outputData:", litContracts);
};

export const mintPkpWithLitContracts = async (step: number) => {
  const {
    litContracts,
  }: {
    litContracts: LitContracts;
  } = getOutputData({ step: 2 });

  logStep({
    step,
    input: "n/a",
    output: "Minting PKP...",
  });

  const eoaWalletOwnedPkp = (
    await litContracts.pkpNftContractUtils.write.mint()
  ).pkp;

  logStep({
    step,
    output: `${JSON.stringify(eoaWalletOwnedPkp, null, 2)}`,
    outputDataType: "code",
    outputData: { pkp: eoaWalletOwnedPkp },
  });
};

export const createCustomAuthMethod = async (step: number) => {
  const customAuthMethod = {
    authMethodType: 89989,
    authMethodId: "app-id-xxx:user-id-yyy",
  };

  logStep({
    step,
    output: JSON.stringify(customAuthMethod, null, 2),
    outputDataType: "code",
    outputData: { customAuthMethod },
  });
};

export const addPermittedAuthMethodToPkp = async (step: number) => {
  const {
    litContracts,
  }: {
    litContracts: LitContracts;
  } = getOutputData({ step: 2 });

  const {
    pkp,
  }: {
    pkp: {
      tokenId: string;
      publicKey: string;
      ethAddress: string;
    };
  } = getOutputData({ step: 3 });
  if (!pkp) {
    throw new Error("Please mint PKP first.");
  }

  const {
    customAuthMethod,
  }: {
    customAuthMethod: {
      authMethodType: number;
      authMethodId: string;
    };
  } = getOutputData({ step: 4 });

  logStep({
    step,
    input: JSON.stringify(
      {
        pkpTokenId: pkp.tokenId,
        authMethodType: customAuthMethod.authMethodType,
        authMethodId: customAuthMethod.authMethodId,
      },
      null,
      2
    ),
    inputType: "code",
    output: "Adding permitted auth method to PKP...",
  });

  try {
    const receipt = await litContracts.addPermittedAuthMethod({
      pkpTokenId: pkp.tokenId,
      authMethodType: customAuthMethod.authMethodType,
      authMethodId: customAuthMethod.authMethodId,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });

    logStep({
      step: 5,
      output: `✅ Permitted auth method added to PKP. Transaction hash: ${receipt.transactionHash}`,
    });
  } catch (e) {
    logStep({
      step: 5,
      output: `❌ Error adding permitted auth method to PKP: ${e.message}`,
    });
  }
};

export const createLitActionCode = async (step: number) => {
  const litActionCode = `(async () => {
  const tokenId = await Lit.Actions.pubkeyToTokenId({ publicKey: pkpPublicKey });
  const permittedAuthMethods = await Lit.Actions.getPermittedAuthMethods({ tokenId });
  const isPermitted = permittedAuthMethods.some((permittedAuthMethod) => {
    if (permittedAuthMethod["auth_method_type"] === "0x15f85" && 
        permittedAuthMethod["id"] === customAuthMethod.authMethodId) {
      return true;
    }
    return false;
  });
  LitActions.setResponse({ response: isPermitted ? "true" : "false" });
})();`;

  logStep({
    step,
    output: litActionCode,
    outputData: { litActionCode },
    outputDataType: "code",
  });
};

export const convertLitActionCodeToIpfsCid = async (step: number) => {
  const { litActionCode } = getOutputData({ step: 6 });

  logStep({
    step,
    input: litActionCode,
    inputType: "code",
  });

  const ipfsHash = await ipfsHelpers.stringToCidV0(litActionCode);

  logStep({
    step,
    output: `✅ ${ipfsHash}`,
    outputData: { ipfsHash },
  });
};

export const permitLitActionToUsePkp = async (step: number) => {
  const { litContracts }: { litContracts: LitContracts } = getOutputData({
    step: 2,
  });

  const { pkp }: { pkp: { tokenId: string } } = getOutputData({ step: 3 });

  const { ipfsHash }: { ipfsHash: string } = getOutputData({ step: 7 });

  logStep({
    step,
    input: JSON.stringify(
      {
        ipfsId: ipfsHash,
        pkpTokenId: pkp.tokenId,
        authMethodScopes: [AuthMethodScope.SignAnything],
      },
      null,
      2
    ),
    inputType: "code",
    output: "Permitting Lit Action to use PKP...",
  });

  try {
    const receipt = await litContracts.addPermittedAction({
      ipfsId: ipfsHash,
      pkpTokenId: pkp.tokenId,
      authMethodScopes: [AuthMethodScope.SignAnything],
    });

    logStep({
      step,
      output: `✅ Permitted action added to PKP. Transaction hash: ${receipt.transactionHash}`,
    });
  } catch (e) {
    logStep({
      step,
      output: `❌ Error adding permitted action to PKP: ${e.message}`,
    });
  }
};

export const getSessionSigsUsingPkpPubKeyAndCustomAuth = async (
  step: number
) => {
  const { litNodeClient }: { litNodeClient: LitNodeClient } = getOutputData({
    step: 1,
  });

  const { pkp }: { pkp: { publicKey: string } } = getOutputData({ step: 3 });

  const { customAuthMethod }: { customAuthMethod: any } = getOutputData({
    step: 4,
  });

  const { litActionCode }: { litActionCode: string } = getOutputData({
    step: 6,
  });

  logStep({
    step,
    input: JSON.stringify(
      {
        pkpPublicKey: pkp.publicKey,
        customAuthMethod,
        litActionCode,
      },
      null,
      2
    ),
    inputType: "code",
  });

  const litActionSessionSigs = await litNodeClient!.getLitActionSessionSigs({
    pkpPublicKey: pkp.publicKey,
    resourceAbilityRequests: [
      { resource: new LitPKPResource("*"), ability: LitAbility.PKPSigning },
      {
        resource: new LitActionResource("*"),
        ability: LitAbility.LitActionExecution,
      },
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
  });

  logStep({
    step,
    output: JSON.stringify(litActionSessionSigs, null, 2),
    outputDataType: "code",
    outputData: { litActionSessionSigs },
  });
};

export const pkpSignWithLitActionSessionSigs = async (step: number) => {
  const { litNodeClient }: { litNodeClient: LitNodeClient } = getOutputData({
    step: 1,
  });

  const { pkp }: { pkp: { publicKey: string } } = getOutputData({ step: 3 });

  const { litActionSessionSigs }: { litActionSessionSigs: any } = getOutputData(
    {
      step: 9,
    }
  );

  logStep({
    step,
    input: JSON.stringify(
      {
        pkpPublicKey: pkp.publicKey,
        litActionSessionSigs,
        toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
      },
      null,
      2
    ),
    inputType: "code",
  });
  try {
    const res = await litNodeClient.pkpSign({
      pubKey: pkp.publicKey,
      sessionSigs: litActionSessionSigs,
      toSign: ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5])),
    });
    logStep({
      step,
      output: JSON.stringify(res, null, 2),
      outputDataType: "code",
    });
  } catch (e) {
    logStep({
      step,
      output: `❌ Error signing with PKP: ${e.message}`,
    });
  }
};

const stepsConfig: {
  step: number;
  buttonId: string;
  buttonText: string;
  description: string;
  action: () => any;
  referenceLink?: string;
  referenceText?: string;
}[] = [
  {
    step: 1,
    buttonId: "connect-lit-node-client",
    buttonText: "Connect LitNodeClient",
    description:
      "Establishes a connection with the LitNodeClient to interact with Lit Protocol nodes.",
    action: () => {
      connectLitNodeClientToCayenne(1);
    },
  },
  {
    step: 2,
    buttonId: "connect-contracts-sdk",
    buttonText: "Connect LitContracts",
    description:
      "Sets up the LitContracts SDK to interact with Lit Protocol smart contracts.",
    action: () => {
      connectLitContractsToCayenne(2);
    },
  },
  {
    step: 3,
    buttonId: "mint-pkp",
    buttonText: "Mint a PKP",
    referenceLink:
      "https://github.com/LIT-Protocol/developer-guides-code/blob/cdd0efe7c503d438691157dfb7c754ada095bb89/custom-auth/browser/src/index.ts#L81-L83",

    description: "Alice mints a PKP using the LitContracts SDK.",
    action: () => {
      mintPkpWithLitContracts(3);
    },
  },
  {
    step: 4,
    buttonId: "create-custom-auth-method",
    buttonText: "Create a custom auth method",
    description:
      "Defines a custom authentication method, integrating it with custom validation logic in the Lit Action.",
    action: () => {
      createCustomAuthMethod(4);
    },
  },
  {
    step: 5,
    buttonId: "add-permitted-auth-method-to-pkp",
    buttonText: "Add Permitted Auth Method",
    referenceLink:
      "https://github.com/LIT-Protocol/developer-guides-code/blob/cdd0efe7c503d438691157dfb7c754ada095bb89/custom-auth/browser/src/index.ts#L152-L157",

    description:
      "Associates the custom auth method with Alice's PKP, enabling verification of permissions via Lit Action.",
    action: () => {
      addPermittedAuthMethodToPkp(5);
    },
  },
  {
    step: 6,
    buttonId: "create-lit-action-code",
    buttonText: "Create a Lit Action code",
    referenceLink:
      "https://github.com/LIT-Protocol/developer-guides-code/blob/cdd0efe7c503d438691157dfb7c754ada095bb89/custom-auth/browser/src/index.ts#L171-L183",

    description:
      "Creates the custom Lit Action code that will be used to handle custom validation logic.",
    action: () => {
      createLitActionCode(6);
    },
  },
  {
    step: 7,
    buttonId: "convert-lit-action-code-to-ipfs-cid",
    buttonText: "Convert Lit Action to IPFS CID",
    description:
      "Converts the Lit Action code into an IPFS CID, preparing it for smart contract interactions.",
    action: () => {
      convertLitActionCodeToIpfsCid(7);
    },
  },
  {
    step: 8,
    buttonId: "permit-lit-action-to-use-pkp",
    buttonText: "Permit Lit Action",
    referenceLink:
      "https://github.com/LIT-Protocol/developer-guides-code/blob/cdd0efe7c503d438691157dfb7c754ada095bb89/custom-auth/browser/src/index.ts#L236-L240",

    description:
      "Authorizes the Lit Action code to use the PKP for signing operations.",
    action: () => {
      permitLitActionToUsePkp(8);
    },
  },
  {
    step: 9,
    buttonId: "get-session-sigs-using-pkp-pub-key-and-custom-auth",
    buttonText: "Get Session Sigs",
    referenceLink:
      "https://github.com/LIT-Protocol/developer-guides-code/blob/cdd0efe7c503d438691157dfb7c754ada095bb89/custom-auth/browser/src/index.ts#L285-L305",

    description:
      "Retrieves session signatures using the PKP's public key combined with the custom auth method, which will be validated by the custom Lit Action code that handles the validation logic.",
    action: () => {
      getSessionSigsUsingPkpPubKeyAndCustomAuth(9);
    },
  },
  {
    step: 10,
    buttonId: "pkp-sign-with-lit-action-session-sigs",
    buttonText: "PKP Sign",
    referenceLink:
      "https://github.com/LIT-Protocol/developer-guides-code/blob/cdd0efe7c503d438691157dfb7c754ada095bb89/custom-auth/browser/src/index.ts#L342-L346",

    description:
      "Utilizes the session signatures to sign with the PKP, demonstrating the successful execution of the custom Lit Action code, which validates the permissions and authorizes the signing operation.",
    action: () => {
      pkpSignWithLitActionSessionSigs(10);
    },
  },
];

// Initialize the table and add event listeners
document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("table tbody");

  stepsConfig.forEach(
    ({
      step,
      buttonId,
      buttonText,
      description,
      action,
      referenceLink,
      referenceText,
    }) => {
      const row = document.createElement("tr");
      row.innerHTML = `
  <td>${step}</td>
  <td><button id="${buttonId}">${buttonText}</button></td>
  <td>${description}</td>
  <td></td>
  <td></td>
`;

      if (referenceLink) {
        // Create a new paragraph element
        const referenceParagraph = document.createElement("p");

        // Create an <a> tag with target="_blank" to open in a new tab
        referenceParagraph.innerHTML = `<a href="${referenceLink}" target="_blank">${
          referenceText || "See reference code..."
        }</a>`;

        // Append the new paragraph underneath the description
        row.cells[2].appendChild(referenceParagraph);
      }

      tbody.appendChild(row);

      document.getElementById(buttonId).addEventListener("click", async () => {
        await action();
      });
    }
  );
});
