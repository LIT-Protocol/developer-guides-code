import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitNetwork, AuthMethodScope } from "@lit-protocol/constants";
import { ethers } from "ethers";
import bs58 from "bs58";
import { LitAbility } from "@lit-protocol/types";
import {
    LitActionResource,
    createSiweMessageWithRecaps,
    generateAuthSig,
    LitPKPResource,
    LitResourceAbilityRequest,
} from "@lit-protocol/auth-helpers";
import { AuthCallbackParams } from "@lit-protocol/types";

const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilDev,
    debug: true,
});

// variables -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

const privateKey1 = process.env.NEXT_PUBLIC_PRIVATE_KEY_1;

const LitActionCode = `
const go = async () => {
    let toSign = new TextEncoder().encode('Hello World');
    toSign = ethers.utils.arrayify(ethers.utils.keccak256(toSign));

    const signature = await Lit.Actions.signEcdsa({
        toSign,
        publicKey,
        sigName: "signature",
    });

    Lit.Actions.setResponse({ response: true });
};
go()
`;

let mintedPKP = {
    tokenId:
        "0x48add65b3c82bb5e19a318a27b28205e8d6ab0b6c29b6adb9382077eb656e696",
    publicKey:
        "0417ee6f0e3eb8f6b459b0d29c3845d286ae6150e21ab0e991c796c21485decc5a1952bea7fb6499839ddf3e6a9e745042ccfec6c3e986aa4408a0008bcf416415",
    ethAddress: "0x66225c8Ceda52cf1c739E19816f2e35d2F6558f8",
};

let action_ipfs = "QmdYHJb6GpjcQvFVJRArYs4VMvmqMFukfEk1HwwV6q43Du";

// main functions -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export async function mintGrantBurnPKP() {
    console.log("minting started..");
    const signerA = await getWalletA();

    const litContracts = new LitContracts({
        signer: signerA,
        network: LitNetwork.DatilDev,
        debug: false,
    });
    await litContracts.connect();

    const mintPkp = await litContracts.pkpNftContractUtils.write.mint();
    const pkp = mintPkp.pkp;
    console.log("PKP: ", pkp);

    console.log("adding permitted action..");

    await litContracts.addPermittedAction({
        pkpTokenId: pkp.tokenId,
        ipfsId: action_ipfs,
        authMethodScopes: [AuthMethodScope.SignAnything],
    });

    console.log("transfer started..");

    const transferPkpOwnershipReceipt =
        await litContracts.pkpNftContract.write.transferFrom(
            signerA.address,
            pkp.ethAddress,
            pkp.tokenId,
            {
                gasLimit: 125_000,
            }
        );

    await transferPkpOwnershipReceipt.wait();

    console.log(
        "Transferred PKP ownership to itself: ",
        transferPkpOwnershipReceipt
    );
}

export async function checkPermits() {
    console.log("checking perms..");

    const litContracts = new LitContracts({
        network: LitNetwork.DatilDev,
        debug: false,
    });
    await litContracts.connect();

    let permittedActions =
        await litContracts.pkpPermissionsContract.read.getPermittedActions(
            mintedPKP.tokenId
        );

    let checkGeneratedAction = await stringToBytes(action_ipfs);

    let permittedAuthMethods =
        await litContracts.pkpPermissionsContract.read.getPermittedAuthMethods(
            mintedPKP.tokenId
        );
    let permittedAddresses =
        await litContracts.pkpPermissionsContract.read.getPermittedAddresses(
            mintedPKP.tokenId
        );

    console.log("ipfs ", action_ipfs);
    console.log("ipfs hex ", checkGeneratedAction);
    console.log("Actions Permissions ", permittedActions, checkGeneratedAction);
    console.log("Auth methods Permissions ", permittedAuthMethods);
    console.log("Addresses Permissions ", permittedAddresses);
}

export async function executeTestAction() {
    console.log("executing action started..");
    const sessionSigs = await sessionSigUser();

    await litNodeClient.connect();

    const results = await litNodeClient.executeJs({
        ipfsId: action_ipfs,
        sessionSigs: sessionSigs,
        jsParams: {
            publicKey: mintedPKP.publicKey,
        },
    });

    console.log("logs: ", results.logs);
    console.log("results: ", results);
    console.log("signatures: ", results.signatures);
    return results.signatures;
}

// helper functions ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function stringToBytes(_string : any) {
    const LIT_ACTION_IPFS_CID_BYTES = `0x${Buffer.from(
        bs58.decode(_string)
    ).toString("hex")}`;

    return LIT_ACTION_IPFS_CID_BYTES;
}

export function BytesToString(_bytesString: any) {
    const decoded = bs58.encode(_bytesString);
    return decoded;
}

export async function sessionSigUser() {
    console.log("creating session sigs..");
    const ethersSigner = await getWalletA();

    await litNodeClient.connect();

    const sessionSigs = await litNodeClient.getSessionSigs({
        pkpPublicKey: mintedPKP.publicKey,
        chain: "ethereum",
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
        authNeededCallback: async (params: AuthCallbackParams) => {
            if (!params.uri){
              throw new Error("Params uri is required");
            }

            if (!params.resourceAbilityRequests){
              throw new Error("Params uri is required");
            }

            const toSign = await createSiweMessageWithRecaps({
                uri: params.uri,
                expiration: new Date(
                    Date.now() + 1000 * 60 * 60 * 24
                ).toISOString(), // 24 hours,
                resources: params.resourceAbilityRequests,
                walletAddress: await ethersSigner.getAddress(),
                nonce: await litNodeClient.getLatestBlockhash(),
                litNodeClient,
                domain: "localhost:3000"
            });

            return await generateAuthSig({
                signer: ethersSigner,
                toSign,
            });
        },
    });

    console.log("sessionSigs: ", sessionSigs);
    return sessionSigs;
}

async function getWalletA() {
    const provider = new ethers.providers.JsonRpcProvider(
        `https://yellowstone-rpc.litprotocol.com/`
    );
    const wallet = new ethers.Wallet(privateKey1!, provider);
    return wallet;
}