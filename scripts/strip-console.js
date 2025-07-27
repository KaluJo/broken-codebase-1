const fs = require('fs');
const path = require('path');

// Function to recursively find all .js files in build directory
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findJSFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to strip console logs from JavaScript content
function stripConsoleLogs(content) {
  // More comprehensive console removal patterns
  return content
    // Remove all console methods with any parameters (including multiline)
    .replace(/console\s*\.\s*(log|warn|error|info|debug|trace|time|timeEnd|group|groupCollapsed|groupEnd|clear|count|countReset|table|dir|dirxml|assert|profile|profileEnd)\s*\([^)]*\)\s*;?/gm, '')
    // Remove console calls without semicolons
    .replace(/console\s*\.\s*(log|warn|error|info|debug|trace|time|timeEnd|group|groupCollapsed|groupEnd|clear|count|countReset|table|dir|dirxml|assert|profile|profileEnd)\s*\([^)]*\)/gm, '')
    // Remove window.console calls
    .replace(/window\s*\.\s*console\s*\.\s*(log|warn|error|info|debug|trace|time|timeEnd|group|groupCollapsed|groupEnd|clear|count|countReset|table|dir|dirxml|assert|profile|profileEnd)\s*\([^)]*\)\s*;?/gm, '')
    // Remove any remaining console references
    .replace(/\s*console\s*\.\s*\w+\s*\([^)]*\)\s*;?/gm, '')
    // Remove console variable assignments like: var log = console.log
    .replace(/\w+\s*=\s*console\s*\.\s*\w+\s*;?/gm, '')
    // Remove empty lines left by removed console statements
    .replace(/^\s*[\r\n]/gm, '')
    // Remove multiple consecutive empty lines
    .replace(/\n\s*\n\s*\n/g, '\n\n');
}

// Main function
function stripConsoleFromBuild() {
  const buildDir = path.join(__dirname, '..', 'build');
  
  if (!fs.existsSync(buildDir)) {
    // Silently return if build directory doesn't exist
    return;
  }
  
  const jsFiles = findJSFiles(buildDir);
  let totalRemoved = 0;
  
  jsFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;
    const strippedContent = stripConsoleLogs(content);
    const newLength = strippedContent.length;
    
    if (originalLength !== newLength) {
      fs.writeFileSync(filePath, strippedContent);
      const removed = originalLength - newLength;
      totalRemoved += removed;
      // Only log if console methods are available (they should be blocked in production)
      if (typeof console !== 'undefined' && console.log) {
        console.log(`Stripped console logs from ${path.relative(buildDir, filePath)} (removed ${removed} characters)`);
      }
    }
  });
  
  // Only log if console methods are available
  if (typeof console !== 'undefined' && console.log) {
    console.log(`✅ Console log stripping complete. Total characters removed: ${totalRemoved}`);
  }
}

stripConsoleFromBuild(); 