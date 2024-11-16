import { Buffer } from "buffer";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";

(async () => {
  try {
    const apiKey = await Lit.Actions.decryptAndCombine({
      accessControlConditions: accessControlConditions,
      ciphertext: apiKeyCipherText,
      dataToEncryptHash: apiKeyDataToEncryptHash,
      authSig: null,
      chain: "ethereum",
    });

    const decryptedPrivateKey = await Lit.Actions.decryptAndCombine({
      accessControlConditions: accessControlConditions,
      ciphertext: solanaCipherText,
      dataToEncryptHash: solanaDataToEncryptHash,
      chain: "ethereum",
      authSig: null,
    });

    const LIT_PREFIX = "lit_";
    if (!decryptedPrivateKey.startsWith(LIT_PREFIX)) {
      throw new Error(
        `PKey was not encrypted with salt; all wrapped keys must be prefixed with '${LIT_PREFIX}'`
      );
    }

    const noSaltPrivateKey = decryptedPrivateKey.slice(LIT_PREFIX.length);

    const toSign = await LitActions.runOnce(
      { waitForResponse: true, name: "Lit Actions Test" },
      async () => {
        const messages = [
          {
            role: "system",
            content:
              "You are an AI assistant that helps people make informed blockchain trading decisions. Only answer with a single sentence.",
          },
          {
            role: "user",
            content: `${prompt}`,
          },
        ];

        const responseInf = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: messages,
            }),
          }
        );

        const resultInf = await responseInf.json();
        const answer = resultInf.choices[0].message.content;

        const toSign = answer.replace(/\n/g, " ").replace(/\*\*/g, "").trim();
        return toSign;
      }
    );
    console.log("OpenAI Response:", toSign);

    const solanaKeyPair = Keypair.fromSecretKey(
      Buffer.from(noSaltPrivateKey, "hex")
    );

    const signature = nacl.sign.detached(
      new TextEncoder().encode(toSign),
      solanaKeyPair.secretKey
    );

    console.log("Solana Signature:", signature);

    const isValid = nacl.sign.detached.verify(
      Buffer.from(toSign),
      signature,
      solanaKeyPair.publicKey.toBuffer()
    );

    if (!isValid) {
      console.log("Signature is not valid");
      LitActions.setResponse({ response: "false" });
    }

    LitActions.setResponse({
      response: `Signed message. Is signature valid: ${isValid}`,
    });
  } catch (e) {
    LitActions.setResponse({ response: e.message });
  }
})();
