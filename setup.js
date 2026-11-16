// Run from inside your rti-ai-portal folder:
//   node setup.js                    (uses rti-bundle.txt)
//   node setup.js rti-upgrade.txt    (uses the given bundle)
const fs = require('fs');
const path = require('path');

const name = process.argv[2] || 'rti-bundle.txt';
const bundle = path.join(__dirname, name);
if (!fs.existsSync(bundle)) {
  console.error(`${name} not found. Put it in the same folder as setup.js.`);
  process.exit(1);
}

const text = fs.readFileSync(bundle, 'utf8').replace(/\r/g, '');
const blocks = text.split(/^@@@FILE /m).slice(1);

blocks.forEach((b) => {
  const i = b.indexOf('\n');
  const file = b.slice(0, i).trim();
  const content = b.slice(i + 1).replace(/\n+$/, '') + '\n';
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  console.log('created', file);
});

['app/page.module.css'].forEach((f) => { if (fs.existsSync(f)) fs.unlinkSync(f); });
fs.mkdirSync('data', { recursive: true });

console.log(`\nDone: ${blocks.length} files written. Now run: npm run dev`);
