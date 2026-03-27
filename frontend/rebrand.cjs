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

  // Safe global replacement logic
  // Match "IVERAS" when it's NOT followed by an underscore or a capital letter (to spare constants/vars like IVERAS_DATA)
  // Also checking the character before it. If it's a lowercase or uppercase letter, this might be something else.
  // We want to replace standard text occurrences.
  content = content.replace(/IVERAS(?!_|[A-Z])/g, 'NexVitals');

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
       if (!file.includes('rebrand')) {
           processFile(fullPath);
       }
    }
  }
};

walk(__dirname);

// index.html explicitly
try {
  let idxPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(idxPath)) {
      let idx = fs.readFileSync(idxPath, 'utf8');
      let idxOrig = idx;
      idx = idx.replace(/<title>.*?<\/title>/gi, '<title>NexVitals</title>');
      if (idx !== idxOrig) {
        fs.writeFileSync(idxPath, idx, 'utf8');
        console.log('[MODIFIED]', idxPath);
      }
  }
} catch(e) { console.error(e); }
