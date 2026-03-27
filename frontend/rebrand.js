const fs = require('fs');
const path = require('path');

const STRINGS_TO_REPLACE = [
  'IVERAS — Hospital OS',
  'IVERAS — Admin Control',
  'IVERAS User Dashboard',
  'IVERAS Patient Portal',
  'IVERAS Hardware Serial Number',
  'IVERAS device',
  'IVERAS account',
  'IVERAS ✦ EMERGENCY',
  'ABOUT IVERAS',
  'Why IVERAS',
  'IVERAS is',
  'IVERAS was',
  'IVERAS identifies',
  'IVERAS connects',
  'Ask IVERAS',
  'Powered by IVERAS',
  'POWERED BY IVERAS',
  'ACCESS IVERAS',
  'about IVERAS',
  'Join IVERAS',
  'New to IVERAS',
  'IVERAS team',
  'Get IVERAS',
];

const processFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Only safely replace specific context casing to avoid renaming `IVERAS_DATA` constants
  // Standard UI IVERAS replacement (with spaces or punctuation around it)
  // Not matching [A-Z_] to avoid constants
  content = content.replace(/IVERAS(?!_|[A-Z])/g, 'NexVitals');

  // Let's also replace any missed hardcoded text ones in the exact strings
  STRINGS_TO_REPLACE.forEach(s => {
     const replacement = s.replace(/IVERAS/g, 'NexVitals');
     content = content.split(s).join(replacement);
  });

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('[MODIFIED]', filePath);
  }
};

const walk = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.html')) {
       // do not tamper with regex or scripts that aren't React
       if (file !== 'rebrand.js') {
           processFile(fullPath);
       }
    }
  }
};

walk(__dirname);
// Also update index.html specifically
try {
  let idx = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  let idxOrig = idx;
  idx = idx.replace(/<title>.*?<\/title>/g, '<title>NexVitals</title>');
  if (idx !== idxOrig) {
    fs.writeFileSync(path.join(__dirname, 'index.html'), idx, 'utf8');
    console.log('[MODIFIED]', path.join(__dirname, 'index.html'));
  }
} catch(e) {}
