import { LitNodeClient, encryptString } from "@lit-protocol/lit-node-client";
import { genWallet } from "./wallet";
import { genSession } from "./session";
import { genActionSource} from "./contstants";
import { LitAbility, LitAccessControlConditionResource, LitActionResource } from "@lit-protocol/auth-helpers";

const url = `<your http endpoint for api-key usage>`;
const key = '<your api key>';

let client = new LitNodeClient({
    litNetwork: 'cayenne'
});
await client.connect();

const wallet = genWallet();



const chain = 'ethereum';
// lit action will allow anyone to decrypt this api key with a valid authSig
const accessControlConditions = [
    {
        contractAddress: '',
        standardContractType: '',
        chain,
        returnValueTest: {
            comparator: '>=',
            value: '0',
        },
    },
];

await client.connect();
const session = await genSession(wallet, client, []);

/*
Here we are encypting our key for secure use within an action
this code should be run once and the ciphertext and dataToEncryptHash stored for later sending
to the Lit Action in 'jsParams'
*/
const { ciphertext, dataToEncryptHash } = await encryptString(
    {
        accessControlConditions,
        sessionSigs: session,
        chain,
        dataToEncrypt: key,
    },
    client
);

console.log("cipher text:", ciphertext, "hash:", dataToEncryptHash);
const accsResourceString = 
    await LitAccessControlConditionResource.generateResourceString(accessControlConditions, dataToEncryptHash);
const sessionForDecryption = genSession(wallet, client, [
    {
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
    },
    {
        resource: new LitAccessControlConditionResource(accsResourceString),
        ability: LitAbility.AccessControlConditionDecryption,
    }
]);

/*
Here we use the encrypted key by sending the
ciphertext and dataTiEncryptHash to the action
*/ 
const res = await client.executeJs({
    sessionSigs: sessionForDecryption,
    code: genActionSource(url),
    jsParams: {
        ciphertext,
        dataToEncryptHash
    }
});

console.log("result from action execution:", res);