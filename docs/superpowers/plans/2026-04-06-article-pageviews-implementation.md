# 文章浏览量统计功能实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为Hexo博客（森林图书馆主题）添加基于Busuanzi的文章浏览量统计功能，在每篇文章末尾显示浏览量数字。

**Architecture:** 使用NexT主题原生的Busuanzi支持，通过修改配置文件启用统计服务，在文章模板的footer区域添加浏览量显示组件。

**Tech Stack:** Hexo, NexT主题v8.x, Busuanzi统计服务, Nunjucks模板

---

## 文件结构

**修改文件:**
1. `/_config.next.yml` - 添加Busuanzi配置段
2. `/themes/next/layout/_macro/post.njk` - 在文章标签后添加浏览量显示代码

**测试文件:**
1. 本地生成测试 - 验证Hexo构建无错误
2. 本地服务器测试 - 验证页面显示和功能正常
3. 部署验证 - 验证生产环境功能正常

---

## 任务分解

### Task 1: 添加Busuanzi配置

**文件:**
- Modify: `/_config.next.yml`

- [ ] **Step 1: 读取当前配置文件**

```bash
cat /home/raniy/myblog/_config.next.yml | tail -20
```

检查文件末尾内容，确定添加配置的位置。

- [ ] **Step 2: 添加Busuanzi配置段**

在配置文件末尾（最后一个配置段之后）添加以下内容：

```yaml
# ---------------------------------------------------------------
# Busuanzi Statistics Settings
# ---------------------------------------------------------------

# Show Views / Visitors of the website / page with busuanzi.
# For more information: http://ibruce.info/2015/04/04/busuanzi/
busuanzi_count:
  enable: true
  total_visitors: true
  total_visitors_icon: fa fa-user
  total_views: true
  total_views_icon: fa fa-eye
  post_views: true
  post_views_icon: far fa-eye
```

- [ ] **Step 3: 验证配置文件语法**

```bash
cd /home/raniy/myblog && yamllint _config.next.yml --no-warnings
```

预期输出：无错误（或仅有无关警告）

- [ ] **Step 4: 提交配置更改**

```bash
cd /home/raniy/myblog && git add _config.next.yml && git commit -m "feat: 启用Busuanzi浏览量统计功能"
```

### Task 2: 修改文章模板添加浏览量显示

**文件:**
- Modify: `/themes/next/layout/_macro/post.njk:120-130`

- [ ] **Step 1: 查看当前模板结构**

```bash
cd /home/raniy/myblog && sed -n '115,135p' themes/next/layout/_macro/post.njk
```

确认当前模板中标签和分享按钮的代码位置。

- [ ] **Step 2: 在标签后添加浏览量显示代码**

找到以下代码段（大约第120-130行）：
```njk
{%- if post.tags and post.tags.length %}
  {%- set tag_indicate = '<i class="fa fa-tag"></i>' if theme.tag_icon else '#' %}
  <div class="post-tags">
    {%- for tag in post.tags.toArray() %}
      <a href="{{ url_for(tag.path) }}" rel="tag">{{ tag_indicate }} {{ tag.name }}</a>
    {%- endfor %}
  </div>
{%- endif %}

{{ partial('_partials/post/post-share.njk', {}, {cache: theme.cache.enable}) }}
```

在标签代码块和分享按钮代码之间添加浏览量显示：

```njk
{%- if post.tags and post.tags.length %}
  {%- set tag_indicate = '<i class="fa fa-tag"></i>' if theme.tag_icon else '#' %}
  <div class="post-tags">
    {%- for tag in post.tags.toArray() %}
      <a href="{{ url_for(tag.path) }}" rel="tag">{{ tag_indicate }} {{ tag.name }}</a>
    {%- endfor %}
  </div>
{%- endif %}

{# 文章浏览量显示 - 放在标签之后、分享按钮之前 #}
{%- if not is_index and theme.busuanzi_count.enable and theme.busuanzi_count.post_views %}
  <span class="post-meta-item" title="{{ __('post.views') }}" id="busuanzi_container_page_pv">
    <span class="post-meta-item-icon">
      <i class="{{ theme.busuanzi_count.post_views_icon }}"></i>
    </span>
    <span class="post-meta-item-text">{{ __('post.views') + __('symbol.colon') }}</span>
    <span id="busuanzi_value_page_pv"></span>
  </span>
{%- endif %}

{{ partial('_partials/post/post-share.njk', {}, {cache: theme.cache.enable}) }}
```

- [ ] **Step 3: 验证模板语法**

```bash
cd /home/raniy/myblog && npx nunjucks-precompile themes/next/layout/_macro/post.njk 2>&1 | head -20
```

预期输出：无严重错误（可能只有缺少变量的警告）

- [ ] **Step 4: 提交模板更改**

```bash
cd /home/raniy/myblog && git add themes/next/layout/_macro/post.njk && git commit -m "feat: 在文章末尾添加浏览量显示组件"
```

### Task 3: 本地生成测试

**测试目标:** 验证Hexo构建无错误，配置文件正确加载

- [ ] **Step 1: 清理生成文件**

```bash
cd /home/raniy/myblog && hexo clean
```

预期输出：`INFO  Deleted database.` 和 `INFO  Deleted public folder.`

- [ ] **Step 2: 生成静态文件**

```bash
cd /home/raniy/myblog && hexo generate
```

预期输出：`INFO  Start processing` 最后显示 `INFO  Generated: X files in Y seconds` 无错误

- [ ] **Step 3: 检查生成的文件中是否包含Busuanzi脚本**

```bash
cd /home/raniy/myblog && grep -r "busuanzi" public/ | head -5
```

预期输出：找到包含busuanzi相关脚本的HTML文件

- [ ] **Step 4: 检查文章页面是否包含浏览量容器**

```bash
cd /home/raniy/myblog && find public/ -name "*.html" -type f | head -3 | xargs grep -l "busuanzi_container_page_pv" 2>/dev/null
```

预期输出：至少找到一个HTML文件包含浏览量容器ID

### Task 4: 本地服务器测试

**测试目标:** 验证页面显示和功能正常

- [ ] **Step 1: 启动本地服务器**

```bash
cd /home/raniy/myblog && hexo server &
SERVER_PID=$!
sleep 3
```

- [ ] **Step 2: 访问测试页面**

```bash
curl -s "http://localhost:4000" | grep -o "<title>[^<]*</title>"
```

预期输出：`<title>森林图书馆</title>` 或博客标题

- [ ] **Step 3: 检查文章页面浏览量显示**

找一篇现有的文章页面进行测试：

```bash
cd /home/raniy/myblog && find public/ -name "*.html" -type f | grep -v index | head -1 | while read file; do
  echo "检查文件: $file"
  grep -q "busuanzi_container_page_pv" "$file" && echo "✓ 找到浏览量容器" || echo "✗ 未找到浏览量容器"
  grep -q "busuanzi_value_page_pv" "$file" && echo "✓ 找到浏览量数值容器" || echo "✗ 未找到浏览量数值容器"
done
```

预期输出：两个检查都通过（✓）

- [ ] **Step 4: 停止本地服务器**

```bash
kill $SERVER_PID 2>/dev/null || true
```

### Task 5: 验证现有功能不受影响

**测试目标:** 确保音频系统、主题切换等现有功能正常工作

- [ ] **Step 1: 检查音频系统脚本仍然加载**

```bash
cd /home/raniy/myblog && grep -r "forest-audio.js" themes/next/layout/ | head -3
```

预期输出：找到音频脚本引用

- [ ] **Step 2: 检查主题切换功能仍然存在**

```bash
cd /home/raniy/myblog && grep -r "theme-mode" themes/next/layout/ | head -3
```

预期输出：找到主题模式相关代码

- [ ] **Step 3: 检查个人介绍页面不受影响**

```bash
cd /home/raniy/myblog && ls source/about/index.md 2>/dev/null && echo "✓ 个人介绍页面存在" || echo "✗ 个人介绍页面不存在"
```

预期输出：`✓ 个人介绍页面存在`

- [ ] **Step 4: 提交最终验证**

```bash
cd /home/raniy/myblog && git add -A && git commit -m "test: 验证浏览量功能与现有功能兼容"
```

### Task 6: 部署准备

**目标:** 准备部署到GitHub Pages

- [ ] **Step 1: 检查当前git状态**

```bash
cd /home/raniy/myblog && git status --porcelain
```

预期输出：显示干净的工作区或无关键更改

- [ ] **Step 2: 查看提交历史**

```bash
cd /home/raniy/myblog && git log --oneline -5
```

预期输出：包含浏览量相关的提交

- [ ] **Step 3: 最终生成测试**

```bash
cd /home/raniy/myblog && hexo clean && hexo generate 2>&1 | tail -10
```

预期输出：生成成功无错误

- [ ] **Step 4: 部署指南**

记录部署步骤：
1. 推送更改到GitHub: `git push origin main`
2. GitHub Actions会自动构建并部署到GitHub Pages
3. 访问博客地址验证浏览量功能
4. 首次访问可能显示"0"，后续访问会递增

---

## 成功验证清单

- [ ] Busuanzi配置正确添加到 `_config.next.yml`
- [ ] 浏览量显示代码正确添加到 `post.njk` 模板
- [ ] Hexo本地生成无错误
- [ ] 本地服务器显示浏览量容器
- [ ] 所有现有功能（音频、主题切换、个人介绍）不受影响
- [ ] 文章页面在标签后正确显示浏览量组件

---

**计划版本:** 1.0  
**创建日期:** 2026-04-06  
**最后更新:** 2026-04-06  
**关联规范:** `docs/superpowers/specs/2026-04-06-article-pageviews-design.md`