const fs = require('fs');
const file = 'c:/Users/17549/.gemini/antigravity/brain/2893e64f-7ec4-417a-932c-e8ec6aadb366/task.md';
let lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
let newLines = [];
for (let i = 0; i < lines.length; i++) {
    newLines.push(lines[i]);
    if (lines[i].startsWith('## ') && i + 1 < lines.length && lines[i + 1].startsWith('-')) {
        newLines.push('');
    }
}
fs.writeFileSync(file, newLines.join('\n'));
console.log("Lint fixed proper.");
