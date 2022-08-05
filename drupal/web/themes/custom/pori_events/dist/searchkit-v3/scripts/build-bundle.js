const { exec } = require('child_process');

const assetManifest = require('../build/asset-manifest.json');
const files = assetManifest.entrypoints.filter((path) => path.endsWith('js')).map((path) => `build/${path}`).join(' ');
console.log(`Joining ${files}`);

// Just shorthand for joining with a newline between the files
exec(`awk 1 ${files} > build/static/js/bundle.min.js`);