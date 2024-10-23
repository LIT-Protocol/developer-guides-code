#!/usr/bin/env node
// WHAT IS THIS?
// The script will output the updated list of workspaces and write them directly to the `package.json` file.
import fs from "fs/promises";
import path from "path";

const PROJECTS_DIR =
  process.argv.find((arg) => arg.startsWith("--projectsDir"))?.split("=")[1] ||
  ".";
const MAX_DEPTH = 3;

/**
 * Finds all workspaces in the monorepo
 * @param {string} dir - The directory to search in
 * @param {number} depth - Current depth of recursion
 * @returns {Promise<string[]>} - An array of workspace paths
 */
async function findWorkspaces(dir, depth = 0) {
  if (depth >= MAX_DEPTH) return [];

  const workspaces = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== "node_modules") {
      const fullPath = path.join(dir, entry.name);
      try {
        const packageJson = JSON.parse(
          await fs.readFile(path.join(fullPath, "package.json"), "utf-8")
        );
        if (packageJson.name) {
          workspaces.push(path.relative(PROJECTS_DIR, fullPath));
        }
      } catch (error) {
        // If there's no package.json or it can't be parsed, skip this directory
      }

      // Recursively search subdirectories
      workspaces.push(...(await findWorkspaces(fullPath, depth + 1)));
    }
  }

  return workspaces;
}

async function updatePackageJson(workspaces) {
  const packageJsonPath = path.join(PROJECTS_DIR, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
  packageJson.workspaces = workspaces;
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

  // Rename package names in each workspace's package.json
  for (const workspace of workspaces) {
    const workspacePath = path.join(PROJECTS_DIR, workspace, "package.json");
    const newPackageName = workspace.replace(/\//g, "-"); // Replace '/' with '-'

    const workspacePackageJson = JSON.parse(
      await fs.readFile(workspacePath, "utf-8")
    );
    workspacePackageJson.name = newPackageName; // Update the package name

    await fs.writeFile(
      workspacePath,
      JSON.stringify(workspacePackageJson, null, 2)
    );
  }
}

async function main() {
  try {
    const workspaces = await findWorkspaces(PROJECTS_DIR);
    await updatePackageJson(workspaces);
    console.log("Updated package.json with the following workspaces:");
    console.log(JSON.stringify(workspaces, null, 2));
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
