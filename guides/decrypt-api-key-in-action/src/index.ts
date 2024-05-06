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

const session = await genSession(wallet, client, []);

const chain = 'ethereum';
// lit action will allow anyone to decrypt this api key with a valid authSig
const accessControlConditions = [
    {
        contractAddress: '',
        standardContractType: '',
        chain,
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
            comparator: '>=',
            value: '0',
        },
    },
];

await client.connect();
const { ciphertext, dataToEncryptHash } = await encryptString(
    {
        accessControlConditions,
        sessionSigs: session,
        chain,
        dataToEncrypt: url,
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

const res = await client.executeJs({
    sessionSigs: session,
    code: genActionSource(url),
    jsParams: {
        ciphertext,
        dataToEncryptHash
    }
});

console.log("result from action execution:", res);