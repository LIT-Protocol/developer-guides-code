import { LitNodeClient, encryptString } from "@lit-protocol/lit-node-client";
import { genWallet } from "./wallet";
import { genSession } from "./session";
import { genActionSource} from "./contstants";

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

const res = await client.executeJs({
    sessionSigs: session,
    code: genActionSource(url),
    jsParams: {
        ciphertext,
        dataToEncryptHash
    }
});