const fs = require('fs');
const path = require('path');

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.spec.ts')) results.push(file);
        }
    });
    return results;
};

const srcPath = path.join(__dirname, 'src');
const files = walk(srcPath);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('}).compile();')) {
     content = content.replace('}).compile();', '}).useMocker(() => ({})).compile();');
     fs.writeFileSync(file, content);
     console.log('Fixed', file);
  }
}
