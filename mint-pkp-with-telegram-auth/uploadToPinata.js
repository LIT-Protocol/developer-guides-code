import { createReadStream, existsSync } from "fs";
import { basename } from "path";
import pinataSDK from "@pinata/sdk";

const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
});

const uploadToPinata = async (filePath) => {
  try {
    const readableStreamForFile = createReadStream(filePath);
    const options = {
      pinataMetadata: {
        name: basename(filePath),
      },
    };

    const result = await pinata.pinFileToIPFS(readableStreamForFile, options);
    console.log(`File uploaded successfully!`);
    console.log(`IPFS Hash: ${result.IpfsHash}`);
    console.log(
      `Pinata URL: https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    );
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

const printUsage = () => {
  console.log("Usage: node script.js upload <filePath>");
  console.log("  upload <filePath>  Upload a file to IPFS via Pinata");
};

const main = () => {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error("Not enough arguments provided.");
    printUsage();
    process.exit(1);
  }

  const command = args[0];
  const filePath = args[1];

  if (command === "upload") {
    if (!existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }
    uploadToPinata(filePath);
  } else {
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }
};

main();
