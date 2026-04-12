const fs = require('fs');
const path = require('path');

function stripMarkdown(content) {
  return content
    .replace(/^```(?:md|markdown|yaml)?\s*\n?/gm, '')
    .replace(/\n```\s*$/gm, '')
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/^#{1,6}\s+(.+)$/gm, "$1")
    .replace(/^>\s?/gm, '')
    .replace(/^[-*_]{3,}\s*$/gm, '')
    .replace(/`(.+?)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[\s]*[-*+]\s+/gm, '')
    .replace(/^[\s]*\d+\.\s+/gm, '')
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/\n{3,}/g, "\n\n");
}

function cleanTitle(title) {
  return title
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/^#{1,6}\s+/, '');
}

const chaptersDir = 'books/苟到天荒地老/chapters';
const files = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.md')).sort();

files.forEach(file => {
  const filepath = path.join(chaptersDir, file);
  let content = fs.readFileSync(filepath, 'utf8');

  // Split: first line = title, second = blank, rest = body
  const lines = content.split('\n');
  let title = lines[0] || '';
  const body = lines.slice(2).join('\n'); // skip title + blank line

  const cleanT = cleanTitle(title);
  const cleanB = stripMarkdown(body);
  const newContent = cleanT + '\n\n' + cleanB;

  if (newContent !== content) {
    fs.writeFileSync(filepath, newContent);
    console.log('Fixed:', file, '|', cleanT.substring(0, 40));
  } else {
    console.log('OK:', file);
  }
});
console.log('Done, processed:', files.length, 'files');
