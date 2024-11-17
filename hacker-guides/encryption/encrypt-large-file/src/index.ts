import { type LitNodeClient } from "@lit-protocol/lit-node-client";
import {
  createSiweMessage,
  generateAuthSig,
  LitAbility,
  LitAccessControlConditionResource,
} from "@lit-protocol/auth-helpers";
import { AccessControlConditions } from "@lit-protocol/types";
import { promises as fs } from "fs";
import { join } from "path";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

import { getEnv, getEthersSigner, getLitNodeClient } from "./utils";

const ETHEREUM_PRIVATE_KEY = getEnv("ETHEREUM_PRIVATE_KEY");
const ENCRYPTION_ALGORITHM = "aes-256-cbc";

async function encryptFile(
  inputPath: string,
  key: Buffer,
  initializationVector: Buffer
): Promise<string> {
  const outputPath = `${inputPath}.encrypted`;
  const readStream = await fs.open(inputPath, "r");
  const writeStream = await fs.open(outputPath, "w");

  const cipher = createCipheriv(
    ENCRYPTION_ALGORITHM,
    key,
    initializationVector
  );

  const chunkSize = 64 * 1024; // 64KB chunks
  const buffer = Buffer.alloc(chunkSize);

  let bytesRead;
  while (
    (bytesRead = (await readStream.read(buffer, 0, chunkSize)).bytesRead) > 0
  ) {
    const chunk = buffer.subarray(0, bytesRead);
    const encryptedChunk = cipher.update(chunk);
    await writeStream.write(encryptedChunk);
  }

  const final = cipher.final();
  await writeStream.write(final);

  await readStream.close();
  await writeStream.close();

  return outputPath;
}

async function decryptFile(
  inputPath: string,
  key: Buffer,
  initializationVector: Buffer
): Promise<string> {
  const outputPath = join(process.cwd(), "src", "loremIpsum-decrypted.txt");
  const readStream = await fs.open(inputPath, "r");
  const writeStream = await fs.open(outputPath, "w");

  const decipher = createDecipheriv(
    ENCRYPTION_ALGORITHM,
    key,
    initializationVector
  );

  const chunkSize = 64 * 1024; // 64KB chunks
  const buffer = Buffer.alloc(chunkSize);

  let bytesRead;
  while (
    (bytesRead = (await readStream.read(buffer, 0, chunkSize)).bytesRead) > 0
  ) {
    const chunk = buffer.subarray(0, bytesRead);
    const decryptedChunk = decipher.update(chunk);
    await writeStream.write(decryptedChunk);
  }

  const final = decipher.final();
  await writeStream.write(final);

  await readStream.close();
  await writeStream.close();

  return outputPath;
}

export const runExample = async () => {
  let litNodeClient: LitNodeClient;

  try {
    // Generate a random symmetric key and initialization vector
    const symmetricKey = randomBytes(32); // 256 bits for AES-256
    const initializationVector = randomBytes(16); // 16 bytes for AES

    // Encrypt the file with the symmetric key
    const filePath = join(process.cwd(), "src", "loremIpsum.txt");
    const encryptedFilePath = await encryptFile(
      filePath,
      symmetricKey,
      initializationVector
    );

    // Now encrypt the symmetric key using Lit
    const ethersSigner = getEthersSigner(ETHEREUM_PRIVATE_KEY);
    litNodeClient = await getLitNodeClient();

    const accessControlConditions: AccessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: "=",
          value: await ethersSigner.getAddress(),
        },
      },
    ];

    // Combine key and initializationVector for Lit encryption
    const keyData = Buffer.concat([symmetricKey, initializationVector]);

    const { ciphertext, dataToEncryptHash } = await litNodeClient.encrypt({
      dataToEncrypt: keyData,
      accessControlConditions,
    });

    console.log(`ℹ️  ciphertext: ${ciphertext}`);
    console.log(`ℹ️  dataToEncryptHash: ${dataToEncryptHash}`);

    // Get session signatures for decryption
    const sessionSignatures = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource("*"),
          ability: LitAbility.AccessControlConditionDecryption,
        },
      ],
      authNeededCallback: async ({
        uri,
        expiration,
        resourceAbilityRequests,
      }) => {
        const toSign = await createSiweMessage({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: await ethersSigner.getAddress(),
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
    });

    // Decrypt the symmetric key using Lit
    const decryptionResponse = await litNodeClient.decrypt({
      chain: "ethereum",
      sessionSigs: sessionSignatures,
      ciphertext,
      dataToEncryptHash,
      accessControlConditions,
    });

    // Split the decrypted data back into key and initializationVector
    const decryptedKeyData = Buffer.from(decryptionResponse.decryptedData);
    const decryptedKey = decryptedKeyData.subarray(0, 32);
    const decryptedIv = decryptedKeyData.subarray(32);

    // Decrypt the file using the decrypted symmetric key
    const decryptedFilePath = await decryptFile(
      encryptedFilePath,
      decryptedKey,
      decryptedIv
    );
    console.log(`ℹ️  Decrypted content saved to: ${decryptedFilePath}`);
  } catch (error) {
    console.error(error);
  } finally {
    litNodeClient!.disconnect();
  }
};
