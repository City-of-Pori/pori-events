const { exec } = require('child_process');

const assetManifest = require('../build/asset-manifest.json');
const jsFiles = assetManifest.entrypoints.filter((path) => path.endsWith('js')).map((path) => `build/${path}`).join(' ');
console.log(`Joining JS: ${jsFiles}`);
const cssFiles = assetManifest.entrypoints.filter((path) => path.endsWith('css')).map((path) => `build/${path}`).join(' ');
console.log(`Joining CSS: ${cssFiles}`);

// Just shorthand for joining with a newline between the files
exec(`awk 1 ${jsFiles} > build/static/js/bundle.min.js`);
exec(`awk 1 ${cssFiles} > build/static/css/bundle.min.css`);