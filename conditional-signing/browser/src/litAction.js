export const litActionCode = `
(async () => {
  const toSign = new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode("Hello world")
    )
  );
  const sigShare = await LitActions.signEcdsa({
    toSign,
    publicKey:
      "0x04f444e7d05b5a7c0eeec713eb66018837e7ea3913da3fc1f1203142a4b67ad48b8adb5ce66045a400f2fc5d6fde6cff1719568dbeeb6466d6782ded45e5fd810a",
    sigName: "sig",
  });
})();
`;
