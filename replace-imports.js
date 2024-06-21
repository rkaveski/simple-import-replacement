#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));

const FILE_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'css', 'scss', 'less', 'sass'];
const DEFAULT_PATTERN = `**/*.{${FILE_EXTENSIONS.join(',')}}`;

const JS_IMPORT_REGEX = /^(import|export) (.*? from ['"])(\..*?|\/.*?)(['"];)$/;
const CSS_IMPORT_REGEX = /^(@import ['"])(\..*?|\/.*?)(['"];)$/;

function replaceImportPath(match, prefix, importPath, suffix, filePath, rootDir) {
  const absolutePath = path.resolve(path.dirname(filePath), importPath);
  const relativePath = path.relative(rootDir, absolutePath);
  return `${prefix}${relativePath}${suffix}`;
}

async function processLine(line, filePath, rootDir) {
  if (JS_IMPORT_REGEX.test(line)) {
    return line.replace(JS_IMPORT_REGEX, (...args) => 
      replaceImportPath(...args, filePath, rootDir));
  } else if (CSS_IMPORT_REGEX.test(line)) {
    return line.replace(CSS_IMPORT_REGEX, (...args) => 
      replaceImportPath(...args, filePath, rootDir));
  }
  return line;
}

async function processFile(filePath, rootDir) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const lines = data.split('\n');
    const updatedLines = await Promise.all(lines.map(line => processLine(line, filePath, rootDir)));
    const updatedData = updatedLines.join('\n');
    
    if (data !== updatedData) {
      await fs.writeFile(filePath, updatedData, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return false;
  }
}

async function processFiles(files, rootDir) {
  const results = await Promise.all(files.map(async file => {
    try {
      const stats = await fs.stat(file);
      if (stats.isDirectory()) {
        console.log(`Skipping directory: ${file}`);
        return null;
      }
      const changed = await processFile(file, rootDir);
      console.log(`Processed: ${file}`);
      return changed ? file : null;
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      return null;
    }
  }));
  return results.filter(Boolean);
}

function parseArguments(args) {
  let rootDir = process.cwd();
  let patterns = [];

  if (args.length > 0) {
    const rootDirArg = args.find(arg => arg.startsWith('--root-dir='));
    if (rootDirArg) {
      rootDir = path.resolve(rootDirArg.split('=')[1]);
      patterns = args.filter(arg => !arg.startsWith('--root-dir='));
    } else {
      rootDir = path.resolve(args[0]);
      patterns = args.slice(1);
    }
  }

  if (patterns.length === 0) {
    patterns = [DEFAULT_PATTERN];
  }

  return { rootDir, patterns };
}

async function main(args) {
  const { rootDir, patterns } = parseArguments(args);

  let files = [];
  for (const pattern of patterns) {
    const matchedFiles = await glob(pattern, { cwd: rootDir, absolute: true });
    files = files.concat(matchedFiles);
  }

  if (files.length === 0) {
    console.error('No files found matching the specified patterns.');
    return;
  }

  const changedFiles = await processFiles(files, rootDir);

  if (changedFiles.length) {
    console.log('Files changed:');
    changedFiles.forEach((file) => console.log(file));
  } else {
    console.log('No files were changed.');
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main, processFile, processLine }; // Exporting for potential testing
