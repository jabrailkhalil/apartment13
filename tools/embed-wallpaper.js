// Optional asset-authoring helper; playing the game needs no Node.js or build.
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const image = fs.readFileSync(path.join(root, 'assets/wallpaper-seamless.jpg'));
const header = '// Seamless wallpaper, generated from the original floral reference with imagegen.\n' +
    '// Embedded for offline file:// play. Source: assets/wallpaper-seamless.jpg.\n';
fs.writeFileSync(path.join(root, 'wallpaper-asset.js'), header + 'var WALLPAPER_TILE_B64 = ' +
    JSON.stringify('data:image/jpeg;base64,' + image.toString('base64')) + ';\n');
