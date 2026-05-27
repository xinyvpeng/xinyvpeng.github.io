'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isSafeHttpUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** 站点内资源路径，如 /images/friends/foo.png */
function isSafeLocalPath(url) {
  return typeof url === 'string' && /^\/[a-zA-Z0-9/_.-]+$/.test(url);
}

function resolveAvatarSrc(avatar) {
  if (!avatar) return '';
  if (isSafeLocalPath(avatar)) return escapeHtml(avatar);
  if (isSafeHttpUrl(avatar)) return escapeHtml(avatar);
  return '';
}

function buildAvatarHtml(name, avatarSrc) {
  const initial = escapeHtml(name[0] || '?');
  if (!avatarSrc) {
    return `<div class="forest-friend-avatar-placeholder">${initial}</div>`;
  }
  return `<img src="${avatarSrc}" alt="${name}" loading="lazy" decoding="async" onerror="this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex';"><div class="forest-friend-avatar-placeholder forest-friend-avatar-fallback" style="display:none">${initial}</div>`;
}

hexo.extend.generator.register('friends', function() {
  const friendsPath = path.join(hexo.source_dir, '_data', 'friends.yml');
  if (!fs.existsSync(friendsPath)) {
    return;
  }

  const friends = yaml.load(fs.readFileSync(friendsPath, 'utf8'));
  if (!friends || !Array.isArray(friends) || friends.length === 0) {
    return;
  }

  const cards = friends
    .filter(f => f.name && f.url && isSafeHttpUrl(f.url))
    .map(f => {
      const name = escapeHtml(f.name);
      const url = escapeHtml(f.url);
      const avatarSrc = resolveAvatarSrc(f.avatar);
      const avatarHtml = buildAvatarHtml(name, avatarSrc);
      return `
    <a href="${url}" class="forest-friend-card" target="_blank" rel="noopener noreferrer">
      <div class="forest-friend-avatar">
        ${avatarHtml}
      </div>
      <span class="forest-friend-name">${name}</span>
    </a>`;
    })
    .join('\n');

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
