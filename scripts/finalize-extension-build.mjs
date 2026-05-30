import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = new URL('../dist/', import.meta.url);
const assetsDir = new URL('assets/', distDir);
const manifestUrl = new URL('manifest.json', distDir);

const backgroundAsset = await findBackgroundAsset();
await writeFile(
  new URL('service-worker-loader.js', distDir),
  `import './${join('assets', backgroundAsset).replaceAll('\\', '/')}';\n`,
);

const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
ensureMainWorldContentScript(manifest);
manifest.web_accessible_resources = [];
await writeFile(manifestUrl, `${JSON.stringify(manifest, null, 2)}\n`);

async function findBackgroundAsset() {
  const assetNames = await readdir(assetsDir);
  const jsAssetNames = assetNames.filter((name) => name.endsWith('.js'));

  for (const name of jsAssetNames) {
    const source = await readFile(new URL(name, assetsDir), 'utf8');
    if (source.includes('chrome.sidePanel.setPanelBehavior')) {
      return name;
    }
  }

  throw new Error('Could not find the compiled background service worker bundle.');
}

function ensureMainWorldContentScript(manifest) {
  const contentScripts = manifest.content_scripts;
  if (!Array.isArray(contentScripts)) {
    manifest.content_scripts = [];
  }

  const hasMainWorldScript = manifest.content_scripts.some((script) => {
    return Array.isArray(script.js) && script.js.includes('injected.js');
  });

  if (!hasMainWorldScript) {
    manifest.content_scripts.push({
      matches: ['<all_urls>'],
      js: ['injected.js'],
      run_at: 'document_start',
      all_frames: false,
      world: 'MAIN',
    });
  }
}
