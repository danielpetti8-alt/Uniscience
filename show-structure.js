const fs = require('fs');
const path = require('path');

const ignore = ['node_modules', '.next', '.git'];

function printTree(dir, prefix = '', isLast = true) {
  const files = fs.readdirSync(dir).filter(f => !ignore.includes(f));
  files.forEach((file, index) => {
    const fullPath = path.join(dir, file);
    const isLastFile = index === files.length - 1;
    const stat = fs.statSync(fullPath);
    const icon = stat.isDirectory() ? '📁' : '📄';
    const branch = isLast ? '└── ' : '├── ';
    const nextPrefix = prefix + (isLast ? '    ' : '│   ');
    
    if (dir === '.' || dir.startsWith('app') || dir.startsWith('prisma') || dir.startsWith('lib') || dir.startsWith('public')) {
      console.log(prefix + branch + icon + ' ' + file + (stat.isDirectory() ? '/' : ''));
    }
    
    if (stat.isDirectory() && !file.startsWith('.')) {
      if (dir === '.' || dir.startsWith('app') || dir.startsWith('prisma') || dir.startsWith('lib')) {
        printTree(fullPath, nextPrefix, isLastFile);
      } else if (dir === 'D:\\uniscience' || dir === '.') {
        // Faqat kerakli papkalarni ko'rsat
        if (['app', 'prisma', 'lib', 'public'].includes(file)) {
          printTree(fullPath, nextPrefix, isLastFile);
        }
      }
    }
  });
}

console.log('=== UNISCIENCE PAPKALAR TUZILISHI ===\n');
console.log('📁 D:/uniscience/');
printTree('D:/uniscience');
console.log('\n=== TEKSHIRISH ===');
console.log('Agar app/api/upload/route.ts yo\'q bo\'lsa - UPLOAD ISHLAMAYDI!');
console.log('Agar app/upload ichida route.ts bo\'lsa - CONFLICT bo\'ladi!');