#!/usr/bin/env node
// Resolves $include directives in .src.json files and outputs _blockname.json
// for merge-json-cli consumption. Run before `npm run build:json`.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function resolveIncludes(fields, srcFile) {
  const resolved = [];
  for (const field of fields) {
    if (field.$include) {
      const includePath = path.resolve(ROOT, field.$include);
      if (!fs.existsSync(includePath)) {
        console.error(`ERROR in ${srcFile}: Include not found: ${field.$include}`);
        process.exit(1);
      }
      const included = JSON.parse(fs.readFileSync(includePath, 'utf8'));
      if (Array.isArray(included)) {
        resolved.push(...included);
      } else {
        resolved.push(included);
      }
    } else if (field.fields) {
      resolved.push({ ...field, fields: resolveIncludes(field.fields, srcFile) });
    } else {
      resolved.push(field);
    }
  }
  return resolved;
}

function processSourceFile(srcFile) {
  const data = JSON.parse(fs.readFileSync(srcFile, 'utf8'));

  if (data.models && Array.isArray(data.models)) {
    for (const model of data.models) {
      if (model.fields) {
        model.fields = resolveIncludes(model.fields, srcFile);
      }
    }
  }

  // Output to same directory, replacing .src.json with .json
  const outFile = srcFile.replace('.src.json', '.json');
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2) + '\n');
  const rel = path.relative(ROOT, srcFile);
  const relOut = path.relative(ROOT, outFile);
  console.log(`  ${rel} -> ${relOut}`);
}

function findSourceFiles() {
  const files = [];

  // models/*.src.json
  const modelsDir = path.join(ROOT, 'models');
  if (fs.existsSync(modelsDir)) {
    fs.readdirSync(modelsDir)
      .filter((f) => f.endsWith('.src.json'))
      .forEach((f) => files.push(path.join(modelsDir, f)));
  }

  // blocks/*/*.src.json
  const blocksDir = path.join(ROOT, 'blocks');
  if (fs.existsSync(blocksDir)) {
    fs.readdirSync(blocksDir).forEach((block) => {
      const blockDir = path.join(blocksDir, block);
      if (fs.statSync(blockDir).isDirectory()) {
        fs.readdirSync(blockDir)
          .filter((f) => f.endsWith('.src.json'))
          .forEach((f) => files.push(path.join(blockDir, f)));
      }
    });
  }

  return files;
}

const files = findSourceFiles();

if (files.length === 0) {
  console.log('No .src.json files found. Nothing to resolve.');
  process.exit(0);
}

console.log(`Resolving $include in ${files.length} source file(s):`);
files.forEach(processSourceFile);
console.log('Done.');
