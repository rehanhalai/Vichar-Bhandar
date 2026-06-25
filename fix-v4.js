const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace class-(--var-name) with class-[var(--var-name)]
    let newContent = content.replace(/([a-z0-9-]+)-\(--([a-zA-Z0-9-]+)\)/g, '$1-[var(--$2)]');
    
    // Fix important modifiers: p-1.5! -> !p-1.5
    newContent = newContent.replace(/(?<=[\s"'\`])([a-z0-9.-]+)!/g, '!$1');

    // Handle nested vars like rounded-r-(--cell-radius)
    newContent = newContent.replace(/([a-z0-9-]+)-([a-z0-9-]+)-\(--([a-zA-Z0-9-]+)\)/g, '$1-$2-[var(--$3)]');
    
    if (content !== newContent) {
      console.log('Fixed', filePath);
      fs.writeFileSync(filePath, newContent, 'utf-8');
    }
  }
});
