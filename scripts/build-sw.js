import fs from 'fs';
import path from 'path';

const DIST_DIR = path.join(process.cwd(), 'dist');
const SW_FILE = path.join(DIST_DIR, 'sw.js');

function getFilesRecursively(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath, baseDir));
    } else {
      const relativePath = '/' + path.relative(baseDir, filePath).replace(/\\/g, '/');
      results.push(relativePath);
    }
  }
  return results;
}

try {
  console.log('[Post-Build SW] Starting Service Worker optimization...');
  if (!fs.existsSync(SW_FILE)) {
    const publicSw = path.join(process.cwd(), 'public', 'sw.js');
    if (fs.existsSync(publicSw)) {
      fs.copyFileSync(publicSw, SW_FILE);
    } else {
      console.error('[Post-Build SW] sw.js not found in public/ or dist/');
      process.exit(1);
    }
  }

  const allFiles = getFilesRecursively(DIST_DIR);
  
  const precacheUrls = allFiles.filter(file => {
    if (file === '/sw.js' || file.startsWith('/server') || file.endsWith('.map') || file.includes('server.cjs')) {
      return false;
    }
    return file === '/index.html' || file.startsWith('/assets/') || file.endsWith('.png') || file.endsWith('.svg') || file.endsWith('.ico');
  });

  if (!precacheUrls.includes('/')) {
    precacheUrls.unshift('/');
  }

  let swContent = fs.readFileSync(SW_FILE, 'utf8');

  const replacement = `const PRECACHE_URLS = ${JSON.stringify(precacheUrls, null, 2)};`;
  swContent = swContent.replace(/const PRECACHE_URLS\s*=\s*\[[^\]]*\];/, replacement);

  fs.writeFileSync(SW_FILE, swContent, 'utf8');
  console.log(`[Post-Build SW] Optimized sw.js successfully with ${precacheUrls.length} assets precached!`);
} catch (error) {
  console.error('[Post-Build SW] Error optimizing Service Worker:', error);
}
