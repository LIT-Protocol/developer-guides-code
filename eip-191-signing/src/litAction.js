export const litActionCode = `
const go = async () => {
  return await Lit.Actions.ethPersonalSignMessageEcdsa({message, publicKey, sigName})
};

go();
`;
