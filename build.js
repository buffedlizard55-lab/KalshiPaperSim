import fs from 'node:fs';
import path from 'node:path';

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Building docs/ distribution for GitHub Pages...');

// Ensure docs directory exists
fs.mkdirSync('docs', { recursive: true });

// Copy index.html
fs.copyFileSync('index.html', 'docs/index.html');

// Copy src directory into docs/src
copyDirSync('src', 'docs/src');

console.log('Build completed: docs/ ready for GitHub Pages hosting.');
