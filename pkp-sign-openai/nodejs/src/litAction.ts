// @ts-nocheck
const _litActionCode = async () => {
  try {
    const toSign = await LitActions.runOnce({ waitForResponse: true, name: "Lit Actions Test" }, async () => {
      const messages = [{role: "system", content: "You are an AI assistant. Only answer with a single sentence."}, {role: "user", content: "Is Lit Protocol good?"}];
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST", 
        headers: {"Content-Type": "application/json", Authorization: `Bearer ${apiKey}`},
        body: JSON.stringify({model: "gpt-4", messages})
      });
      return (await response.json()).choices[0].message.content.replace(/\n/g, " ").replace(/\*\*/g, "").trim();
    });

    const signature = await Lit.Actions.signEcdsa({
      toSign: ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(toSign))),
      publicKey,
      sigName: "OpenAI"
    });

    LitActions.setResponse({ response: "true" });
  } catch (e) {
    LitActions.setResponse({ response: e.message });
  }
};

export const litActionCode = `(${_litActionCode.toString()})();`;