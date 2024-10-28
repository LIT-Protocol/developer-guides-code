import { existsSync } from "fs";

import { migratePkps } from "./migratePkps";

const PKPS_TO_MIGRATE: string[] = [
  "049e33d210d800b80eb8117bdde0bd307036379753b52bc8eefe0d1e305ece011d16c4ba561013c47c0269c5eff572cdcc87872852620315442dfb5455135057d6",
];
const NEW_PKPS_FILE_PATH = "./newPkps_actual.json";

(async () => {
  if (existsSync(NEW_PKPS_FILE_PATH)) {
    console.log(
      `❌ New PKPs metadata file: ${NEW_PKPS_FILE_PATH} already exists! Aborting...`
    );
    return;
  }

  await migratePkps(PKPS_TO_MIGRATE, NEW_PKPS_FILE_PATH);
})();