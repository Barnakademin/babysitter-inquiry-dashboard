import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, 'dist');
const targetDir = join(__dirname, '..', 'deploy', 'client');

console.log(`Source directory: ${distDir}`);
console.log(`Target directory: ${targetDir}`);

// Создаем целевую папку, если её нет
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
  console.log(`Created target directory: ${targetDir}`);
}

// Получаем список файлов в dist
const files = readdirSync(distDir);

// Копируем файлы с именами index.js и index.css
const filesToCopy = files.filter(file => file === 'index.js' || file === 'index.css');

filesToCopy.forEach(file => {
  const sourcePath = join(distDir, file);
  const targetPath = join(targetDir, file);
  
  if (existsSync(sourcePath)) {
    copyFileSync(sourcePath, targetPath);
    console.log(`✓ Copied ${file} to ${targetPath}`);
  } else {
    console.warn(`⚠ File ${file} not found in ${sourcePath}`);
  }
});
