#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));

/**
 * Processes a single file, replacing relative imports with absolute imports.
 *
 * @param {string} filePath - The path to the file to process.
 * @param {string} rootDir - The root directory for the project.
 * @returns {Promise<boolean>} - Returns true if the file was changed, otherwise false.
 */
async function processFile(filePath, rootDir) {
  const data = await fs.promises.readFile(filePath, 'utf8');
  const lines = data.split('\n');
  const updatedLines = lines.map((line) => {
    const importRegex = /^(import|export) (.*? from ['"])(\..*?|\/.*?)(['"];)$/;
    if (importRegex.test(line)) {
      const newLine = line.replace(importRegex, (match, p1, p2, p3, p4) => {
        const absolutePath = path.resolve(path.dirname(filePath), p3);
        const relativePath = path.relative(rootDir, absolutePath);
        return `${p1} ${p2}${relativePath}${p4}`;
      });
      return newLine;
    }
    return line;
  });

  const updatedData = updatedLines.join('\n');
  if (data !== updatedData) {
    await fs.promises.writeFile(filePath, updatedData, 'utf8');
    return true;
  }
  return false;
}

/**
 * Processes multiple files, replacing relative imports with absolute imports.
 *
 * @param {string[]} files - The list of files to process.
 * @param {string} rootDir - The root directory for the project.
 * @returns {Promise<string[]>} - Returns a list of changed files.
 */
async function processFiles(files, rootDir) {
  let changedFiles = [];
  for (const file of files) {
    const stats = await fs.promises.stat(file);
    if (stats.isDirectory()) {
      console.log(`Skipping directory: ${file}`);
      continue;
    }
    const changed = await processFile(file, rootDir);
    if (changed) {
      changedFiles.push(file);
    }
    console.log(`Processed: ${file}`);
  }
  return changedFiles;
}


/**
 * Main function to execute the script.
 * Parses arguments, processes files, and logs the results.
 */
async function main() {
  const args = process.argv.slice(2);
  const rootDirIndex = args.findIndex(arg => arg === '--root-dir');
  if (rootDirIndex === -1 || !args[rootDirIndex + 1]) {
    console.error('Root directory must be specified with --root-dir <path>');
    process.exit(1);
  }
  const rootDir = path.resolve(args[rootDirIndex + 1]);

  const patterns = args.slice(rootDirIndex + 2);
  let files = [];

  for (const pattern of patterns) {
    const matchedFiles = await glob(pattern, { cwd: rootDir, absolute: true });
    files = files.concat(matchedFiles);
  }

  if (!files.length) {
    console.error('No files specified.');
    process.exit(1);
  }

  const changedFiles = await processFiles(files, rootDir);

  if (changedFiles.length) {
    console.log('Files changed:');
    changedFiles.forEach((file) => console.log(file));
  } else {
    console.log('No files were changed.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});