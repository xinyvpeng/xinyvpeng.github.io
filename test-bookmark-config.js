const fs = require('fs');
const content = fs.readFileSync('source/js/forest/forest-interactions.js', 'utf8');
const configMatch = content.match(/bookmarks:\s*{[\s\S]*?enabled:\s*(true|false)/);
if (configMatch && configMatch[1] === 'true') {
  console.log('✅ 书签配置已启用');
  process.exit(0);
} else {
  console.error('❌ 书签配置未启用');
  process.exit(1);
}
