const fs = require('fs');
const file = 'c:/Users/17549/.gemini/antigravity/brain/2893e64f-7ec4-417a-932c-e8ec6aadb366/task.md';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/## Phase [1-6][^\n\r]*(\r?\n)-/g, (match, p1) => {
    return match.replace(p1 + '-', p1 + p1 + '-');
});

fs.writeFileSync(file, c);
console.log("Lint fixes applied to task.md.");
