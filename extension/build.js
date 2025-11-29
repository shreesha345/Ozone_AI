const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const output = fs.createWriteStream(path.join(__dirname, '..', 'frontend', 'public', 'ozoneai-extension.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 }
});

output.on('close', () => {
  console.log(`Extension packaged: ${archive.pointer()} total bytes`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add all extension files except build scripts
archive.file('manifest.json', { name: 'manifest.json' });
archive.file('content.js', { name: 'content.js' });
archive.file('content.css', { name: 'content.css' });
archive.file('background.js', { name: 'background.js' });
archive.file('popup.html', { name: 'popup.html' });
archive.file('popup.js', { name: 'popup.js' });
archive.file('README.md', { name: 'README.md' });
archive.directory('icons/', 'icons');

archive.finalize();
