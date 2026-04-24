'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

hexo.extend.generator.register('friends', function() {
  const friendsPath = path.join(hexo.source_dir, '_data', 'friends.yml');
  if (!fs.existsSync(friendsPath)) {
    return;
  }

  const friends = yaml.load(fs.readFileSync(friendsPath, 'utf8'));
  if (!friends || !Array.isArray(friends) || friends.length === 0) {
    return;
  }

  const cards = friends.filter(f => f.name && f.url).map(f => {
    const avatar = f.avatar || '';
    const avatarHtml = avatar
      ? `<img src="${avatar}" alt="${f.name}">`
      : `<div class="forest-friend-avatar-placeholder">${f.name[0]}</div>`;
    return `
    <a href="${f.url}" class="forest-friend-card" target="_blank" rel="noopener">
      <div class="forest-friend-avatar">
        ${avatarHtml}
      </div>
      <span class="forest-friend-name">${f.name}</span>
    </a>`;
  }).join('\n');

  return {
    path: 'friends/index.html',
    data: {
      title: '🌳 友情之林',
      content: `<div class="forest-friends-page">
        <p class="forest-friends-subtitle">我的朋友们，感谢一路相伴</p>
        <div class="forest-friends-grid">${cards}</div>
      </div>`
    },
    layout: 'page'
  };
});
