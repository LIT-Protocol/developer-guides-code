#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";

const PROJECTS_DIR =
  process.argv.find((arg) => arg.startsWith("--projectsDir"))?.split("=")[1] ||
  ".";
const MAX_DEPTH = 3;

/**
 * Finds all workspaces in the monorepo and ensures unique names
 * @param {string} dir - The directory to search in
 * @param {number} depth - Current depth of recursion
 * @returns {Promise<string[]>} - An array of workspace paths
 */
async function findWorkspacesAndEnsureUniqueNames(dir, depth = 0) {
  if (depth >= MAX_DEPTH) return [];

  const workspaces = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== "node_modules") {
      const fullPath = path.join(dir, entry.name);
      try {
        const packageJsonPath = path.join(fullPath, "package.json");
        const packageJson = JSON.parse(
          await fs.readFile(packageJsonPath, "utf-8")
        );
        if (packageJson.name) {
          // Make the package name unique by appending the relative path to the directory
          const relativePath = path
            .relative(PROJECTS_DIR, fullPath)
            .replace(/\//g, "-");
          packageJson.name = `${packageJson.name}-${relativePath}`;

          // Write the updated package.json with the unique name
          await fs.writeFile(
            packageJsonPath,
            JSON.stringify(packageJson, null, 2)
          );

          workspaces.push(path.relative(PROJECTS_DIR, fullPath));
        }
      } catch (error) {
        // If there's no package.json or it can't be parsed, skip this directory
      }

      // Recursively search subdirectories
      workspaces.push(
        ...(await findWorkspacesAndEnsureUniqueNames(fullPath, depth + 1))
      );
    }
  }

  return workspaces;
}

async function updateRootPackageJson(workspaces) {
  const rootPackageJsonPath = path.join(PROJECTS_DIR, "package.json");
  const rootPackageJson = JSON.parse(
    await fs.readFile(rootPackageJsonPath, "utf-8")
  );
  rootPackageJson.workspaces = workspaces;

  await fs.writeFile(
    rootPackageJsonPath,
    JSON.stringify(rootPackageJson, null, 2)
  );
}

async function main() {
  try {
    const workspaces = await findWorkspacesAndEnsureUniqueNames(PROJECTS_DIR);
    await updateRootPackageJson(workspaces);

    // make the name of each workspace the same as the path, but replace / with -
    for (const workspace of workspaces) {
      const workspacePath = path.join(PROJECTS_DIR, workspace);
      const packageJsonPath = path.join(workspacePath, "package.json");
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, "utf-8")
      );
      packageJson.name = workspace.replace(/\//g, "-");
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();

console.log(`
📝 Available commands:
  --projectsDir=<path>  Specify the root directory of your monorepo (default: current directory)

Usage example:
  node update-workspaces.mjs --projectsDir=~/my-monorepo
`);
