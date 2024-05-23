import { promises as fs } from "fs";
import glob from "glob";

const versionCache = {};

async function findPackageJsonFiles(dir) {
  return new Promise((resolve, reject) => {
    glob(`${dir}/**/package.json`, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

async function getLatestVersion(dep, tag) {
  if (versionCache[dep]) {
    return versionCache[dep];
  }

  const response = await fetch(`https://registry.npmjs.org/${dep}/${tag}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch version for ${dep} with tag ${tag}`);
  }
  const data = await response.json();
  const latestVersion = data.version;

  versionCache[dep] = latestVersion;
  return latestVersion;
}

async function getLitProtocolDeps(packageJsonPath, tag) {
  const data = await fs.readFile(packageJsonPath, "utf8");
  const json = JSON.parse(data);
  const litDeps = {};

  // Check dependencies and devDependencies for @lit-protocol packages
  for (const depType of ["dependencies", "devDependencies"]) {
    if (json[depType]) {
      for (const [dep, version] of Object.entries(json[depType])) {
        if (dep.startsWith("@lit-protocol")) {
          litDeps[dep] = {
            currentVersion: version,
            latestVersion: await getLatestVersion(dep, tag),
          };
        }
      }
    }
  }

  return { name: json.name, dependencies: litDeps };
}

async function reportLitProtocolDeps(dir, tag) {
  try {
    // Find all package.json files in the given directory
    const packageJsonFiles = await findPackageJsonFiles(dir);
    const results = [];

    // Iterate over each package.json file found
    for (const file of packageJsonFiles) {
      // Get the @lit-protocol dependencies for the current file
      const deps = await getLitProtocolDeps(file, tag);
      // Store the results
      results.push(deps);
    }

    // Table headers
    const headers = [
      "📦 Package",
      "Dependency",
      "Current Version",
      "Latest Version",
    ];
    // Collect all rows to find the maximum width for each column
    const rows = results.flatMap((result) =>
      Object.entries(result.dependencies).map(
        ([dep, { currentVersion, latestVersion }]) => [
          result.name,
          dep,
          currentVersion,
          latestVersion,
        ]
      )
    );

    // calculate the maximum width of each column
    const calculateColumnWidths = (headers, rows) => {
      const widths = headers.map((header) => header.length);
      rows.forEach((row) => {
        row.forEach((cell, i) => {
          if (cell.length > widths[i]) {
            widths[i] = cell.length;
          }
        });
      });
      return widths;
    };

    const columnWidths = calculateColumnWidths(headers, rows);

    // pad a string to a given length
    const padString = (str, length) => {
      return str + " ".repeat(Math.max(0, length - str.length));
    };

    // color text
    const colorText = (text, color) => {
      const colors = {
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        reset: "\x1b[0m",
      };
      return colors[color] + text + colors.reset;
    };

    // Print the table header
    console.log(
      headers.map((header, i) => padString(header, columnWidths[i])).join(" | ")
    );
    console.log("-".repeat(columnWidths.reduce((a, b) => a + b + 3, -3)));

    // Print each row of the table
    rows.forEach((row) => {
      const [pkg, dep, currentVersion, latestVersion] = row;
      // Remove the caret (^) from the current version for comparison
      const cleanedCurrentVersion = currentVersion.trim().replace(/^\^/, "");
      const color =
        cleanedCurrentVersion === latestVersion.trim() ? "green" : "yellow"; // Trim to avoid whitespace issues
      const coloredLatestVersion = colorText(latestVersion, color);
      console.log(
        [
          padString(pkg, columnWidths[0]),
          padString(dep, columnWidths[1]),
          padString(currentVersion, columnWidths[2]),
          padString(coloredLatestVersion, columnWidths[3]),
        ].join(" | ") + "\x1b[0m" // Ensure reset color at the end of the line
      );
    });
  } catch (error) {
    // Log any errors that occur
    console.error("Error:", error);
  }
}

function parseArguments() {
  const args = process.argv.slice(2);
  const options = {
    tag: "latest", // Default tag
    dir: "./", // Default directory
  };

  args.forEach((arg) => {
    if (arg.startsWith("--tag=")) {
      options.tag = arg.split("=")[1];
    } else {
      options.dir = arg;
    }
  });

  return options;
}

const options = parseArguments();

reportLitProtocolDeps(options.dir, options.tag);
