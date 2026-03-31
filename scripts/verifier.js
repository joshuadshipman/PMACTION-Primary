const fs = require('fs');
const path = require('path');

/**
 * PMAction Platform - Global Verifier
 * This script ensures that no "Raw Hex Codes" (hardcoded colors) are used 
 * in the project. It forces the use of official Brand Tokens from theme.json.
 */

const THEME_PATH = path.join(__dirname, '../theme.json');
const AUDIT_PATHS = ['app', 'pages', 'components', 'styles'].map(p => path.join(__dirname, '..', p));
const ALLOWED_EXTENSIONS = ['.css', '.tsx', '.ts', '.html'];

// Load tokens from theme.json
let officialTokens = [];
try {
  const themeData = JSON.parse(fs.readFileSync(THEME_PATH, 'utf8'));
  
  // Recursively extract all hex values from tokens
  const extractHex = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string' && /^#([A-Fa-f0-9]{3}){1,2}$/.test(obj[key])) {
        officialTokens.push(obj[key].toLowerCase());
      } else if (typeof obj[key] === 'object') {
        extractHex(obj[key]);
      }
    }
  };
  extractHex(themeData.tokens.colors);
  console.log(`✅ Loaded ${officialTokens.length} official brand tokens.`);
} catch (err) {
  console.error(`❌ Error loading theme.json: ${err.message}`);
  process.exit(1);
}

// Audit files
const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g;
let violations = [];

const walk = (dir) => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') walk(filePath);
    } else if (ALLOWED_EXTENSIONS.includes(path.extname(file))) {
      const content = fs.readFileSync(filePath, 'utf8');
      let match;
      while ((match = hexRegex.exec(content)) !== null) {
        const hex = match[0].toLowerCase();
        // Skip if hex is one of our official tokens
        if (!officialTokens.includes(hex)) {
          const lineNum = content.substring(0, match.index).split('\n').length;
          violations.push({
            file: path.relative(path.join(__dirname, '..'), filePath),
            hex: match[0],
            line: lineNum
          });
        }
      }
    }
  });
};

console.log(`🔍 Auditing PMAction folders for rogue hex codes...`);
AUDIT_PATHS.forEach(p => walk(p));

if (violations.length > 0) {
  console.error(`\n❌ Design Token Violations Found (Mistakes Detected):`);
  violations.forEach(v => {
    console.error(`  - ${v.file}:${v.line} -> Found raw color "${v.hex}". Please move this to theme.json.`);
  });
  console.log(`\nFound ${violations.length} violations in total. Fix them to ensure brand consistency.`);
  process.exit(1);
} else {
  console.log(`\n✨ Perfect! All PMAction colors are verified against theme.json.`);
  process.exit(0);
}
