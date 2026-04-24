'use strict';

hexo.extend.filter.register('before_post_render', data => {
  if (!data.mathjax) return;

  const codeCache = new Map();
  const mathCache = new Map();

  let content = data.content;

  // temporarily extract fenced code blocks and inline code
  // so that $$ inside them is not protected (it belongs to code/ASCII art, not LaTeX)
  content = content.replace(/```[\s\S]*?```|`[^`]*`/g, match => {
    const key = `\x00CODE${codeCache.size}\x00`;
    codeCache.set(key, match);
    return key;
  });

  content = content.replace(/\$\$([\s\S]*?)\$\$/g, match => {
    const key = `\x00MATH_D_${mathCache.size}\x00`;
    mathCache.set(key, match);
    return key;
  });

  for (const [key, original] of codeCache) {
    content = content.replace(key, () => original);
  }

  data.content = content;
  data._mathDisp = mathCache;
}, 0);

hexo.extend.filter.register('after_post_render', data => {
  const mathCache = data._mathDisp;
  if (!mathCache) return;

  for (const [key, original] of mathCache) {
    data.content = data.content.replace(key, () => original);
  }

  delete data._mathDisp;
}, 0);
