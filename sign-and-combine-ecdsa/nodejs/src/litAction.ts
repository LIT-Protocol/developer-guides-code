export const litActionCode = `
(async () => {
    const signature = await Lit.Actions.signAndCombineEcdsa({
        toSign,
        publicKey,
        sigName,
    });

    try {
        const rpcUrl = await Lit.Actions.getRpcUrl({ chain });
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
        const transactionResponse = await provider.sendTransaction(signedTx);
        const receipt = await transactionResponse.wait();

        Lit.Actions.setResponse({ response: transactionResponse.hash });
    } catch (error) {
        const errorMessage = 'Error when sending transaction: ' + error.message;
        Lit.Actions.setResponse({ response: errorMessage });
    }
})();
`;
