const fs = require('fs');

const files = [
  'src/app/forum/page.tsx',
  'src/app/notes/page.tsx',
  'src/components/FocusTimer.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/text-white/g, 'text-slate-900');
    content = content.replace(/text-gray-400/g, 'text-slate-600');
    content = content.replace(/text-gray-500/g, 'text-slate-500');
    content = content.replace(/text-gray-300/g, 'text-slate-700');
    content = content.replace(/bg-white\/10/g, 'bg-slate-900/10');
    content = content.replace(/bg-white\/5/g, 'bg-slate-900/5');
    content = content.replace(/border-white\/10/g, 'border-slate-900/10');
    content = content.replace(/border-white\/5/g, 'border-slate-900/5');
    fs.writeFileSync(f, content);
    console.log(`Updated colors for ${f}`);
  }
});
