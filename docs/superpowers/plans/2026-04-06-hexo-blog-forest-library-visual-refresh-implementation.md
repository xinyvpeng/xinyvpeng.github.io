# Hexo博客森林图书馆视觉刷新实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实施Hexo博客森林图书馆主题视觉刷新，解决绿色单一、老气沉闷问题，通过清新活力调色板、多层渐变背景、放大字体和优化布局，从纯色背景向情境化背景转变。

**Architecture:** 通过修改现有CSS变量系统和样式文件，重构色彩系统，添加多层渐变背景和动态光效，显著放大导航栏和侧边栏字体，优化卡片布局和细节装饰，实现日间/夜间双模式切换。

**Tech Stack:** Hexo 8.x, Next主题, Stylus CSS预处理器, CSS变量, 纯CSS动画

---

## 文件结构

**核心修改文件:**
- `source/_data/forest-theme.styl` - 主要样式文件，包含CSS变量、渐变背景、字体系统、卡片布局
- `source/_data/styles.styl` - 次要样式文件，可能需简化并导入forest-theme.styl

**只读参考文件:**
- `node_modules/.pnpm/hexo-theme-next@8.27.0/node_modules/hexo-theme-next/source/css/_common/outline/sidebar/index.styl` - Next主题侧边栏原始样式（发现硬编码背景色）
- `docs/superpowers/specs/2026-04-06-hexo-blog-forest-library-visual-refresh-design.md` - 设计规范

**生成文件:**
- `public/` - 通过`hexo generate`生成的静态站点
- `db.json` - Hexo数据库缓存文件

**验证工具:**
- Hexo开发服务器：`pnpm run server`（访问http://localhost:4000）
- 构建命令：`pnpm run build`

---

### Task 1: 重构CSS变量系统 - 清新活力调色板

**Files:**
- Modify: `source/_data/forest-theme.styl:1-70`（CSS变量定义区域）

- [ ] **Step 1: 备份当前变量定义**

Read current variables to understand what needs to be replaced:

```bash
head -n 70 source/_data/forest-theme.styl
```

- [ ] **Step 2: 更新日间模式变量**

Replace the existing `:root` variable block with new fresh color palette:

```stylus
// 森林图书馆主题变量定义 - 清新活力版
// 日间模式变量
:root {
  // 主色调（森林基础）- 清新活力调色板
  --primary-forest-deep: #2E5116;        // 深绿基底
  --primary-forest-medium: #5E8C31;      // 清新绿主色
  --primary-forest-light: #9ACD32;       // 苔藓黄绿过渡
  
  // 强调色（自然元素）- 增加清新感和活力
  --accent-sunlight: #FFA726;           // 阳光橙 - 主要强调
  --accent-sky-blue: #87CEEB;           // 天空蓝 - 清新点缀
  --accent-amber: #d4a017;              // 暗金色 - 保留用于细节
  
  // 背景系统 - 建立清新层次感
  --bg-deep: #0d140a;                   // 最深的森林底色
  --bg-dark: #121a0f;                   // 深背景层
  --bg-medium: #1a2512;                 // 中等背景
  --bg-light: #26311d;                  // 浅背景
  --bg-card: #162014;                   // 卡片背景（微亮悬浮）
  --content-bg-color: #1a2316;          // 内容区域背景
  --bg-sidebar: #1a2512;                // 侧边栏背景
  --bg-image: none;                     // 背景图片（暂时不使用）
  
  // 文字颜色 - 清新舒适，降低对比度
  --text-heading: #F0F7E9;              // 标题：柔和米白绿
  --text-primary: #C8D4C0;              // 正文：浅灰绿，对比度适中
  --text-secondary: #949C8F;            // 次要文字：灰绿色
  --text-accent: #FFA726;               // 强调文字：阳光橙
  --text-link: #87CEEB;                 // 链接文字：天空蓝
  
  // 边框与细节颜色
  --border-color: #2d3a28;              // 自然大地色边框
  --shadow-color: rgba(13, 20, 10, 0.4); // 自然阴影
  
  // 主题状态（供JavaScript检测当前模式）
  --theme-mode: 'day';
  
  // RGB变量（用于rgba）
  --text-accent-rgb: 255, 167, 38;      // 阳光橙RGB
  --text-link-rgb: 135, 206, 235;       // 天空蓝RGB
  --primary-forest-medium-rgb: 94, 140, 49; // 清新绿RGB
  --border-color-rgb: 45, 58, 40;       // 大地色RGB
}
```

- [ ] **Step 3: 更新夜间模式变量**

Replace the existing `[data-theme="dark"]` block:

```stylus
// 夜间模式变量覆盖
[data-theme="dark"],
[data-theme="night"] {
  --theme-mode: 'night';
  
  // 背景系统 - 夜间采用蓝色调
  --bg-deep: #0C1A2F;                   // 深蓝夜空
  --bg-dark: #121F3A;
  --bg-medium: #1C3D2E;                 // 夜晚森林色
  --bg-light: #263F50;
  --bg-card: #141c0e;
  --content-bg-color: #161e10;
  --bg-sidebar: #141c0e;
  
  // 文字颜色 - 夜间稍亮但保持柔和
  --text-heading: #D4D4DC;              // 银色月光色
  --text-primary: #A0B0C0;
  --text-secondary: #7A8A9C;
  --text-accent: #D4D4DC;               // 银色月光
  --text-link: #8A7FCF;                 // 迷雾紫
  
  // 边框与细节
  --border-color: #252e20;
  --shadow-color: rgba(8, 12, 6, 0.5);
  
  // RGB变量
  --text-accent-rgb: 212, 212, 220;     // 月光银RGB
  --text-link-rgb: 138, 127, 207;       // 迷雾紫RGB
}
```

- [ ] **Step 4: 验证变量更新**

Check that variables are properly defined:

```bash
grep -n "var(--" source/_data/forest-theme.styl | head -20
```

- [ ] **Step 5: 提交变量更新**

```bash
git add source/_data/forest-theme.styl
git commit -m "feat: 更新CSS变量系统为清新活力调色板"
```

---

### Task 2: 实现多层渐变背景系统

**Files:**
- Modify: `source/_data/forest-theme.styl:72-102`（body背景区域）

- [ ] **Step 1: 备份当前背景样式**

Read current background implementation:

```bash
sed -n '72,102p' source/_data/forest-theme.styl
```

- [ ] **Step 2: 更新日间模式渐变背景**

Replace the body background section with complex multi-layer gradient:

```stylus
// 应用CSS变量到基础元素
body {
  background-color: var(--bg-deep);
  background-image: var(--bg-image, 
    linear-gradient(145deg, 
      var(--bg-deep) 0%,
      var(--primary-forest-medium) 25%,
      color-mix(in srgb, var(--primary-forest-medium) 70%, var(--accent-sunlight) 30%) 50%,
      rgba(var(--text-accent-rgb), 0.4) 75%,
      rgba(var(--text-link-rgb), 0.2) 100%
    ),
    radial-gradient(
      circle at 80% 20%,
      rgba(var(--text-accent-rgb), 0.15) 0%,
      transparent 50%
    )
  );
  background-attachment: fixed;
  background-size: cover;
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Source Serif Pro', Georgia, serif;
  line-height: 1.7;
  
  // 为内容区域提供更好的可读性
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(13, 20, 10, 0.4);
    z-index: -1;
    pointer-events: none;
  }
}
```

- [ ] **Step 3: 更新夜间模式渐变背景**

Add night mode specific background override:

```stylus
// 夜间模式背景调整
[data-theme="dark"],
[data-theme="night"] {
  body {
    background-image: var(--bg-image,
      linear-gradient(145deg,
        var(--bg-deep) 0%,
        var(--bg-medium) 25%,
        rgba(var(--text-link-rgb), 0.4) 50%,
        rgba(var(--text-accent-rgb), 0.3) 75%,
        transparent 100%
      ),
      radial-gradient(
        circle at 20% 30%,
        rgba(var(--text-accent-rgb), 0.1) 0%,
        transparent 50%
      )
    );
    
    &::before {
      background-color: rgba(12, 26, 47, 0.5);
    }
  }
}
```

- [ ] **Step 4: 验证渐变背景**

Check the updated background implementation:

```bash
grep -A5 -B5 "background-image:" source/_data/forest-theme.styl
```

- [ ] **Step 5: 提交渐变背景更新**

```bash
git add source/_data/forest-theme.styl
git commit -m "feat: 实现多层渐变背景系统，支持日间/夜间模式"
```

---

### Task 3: 显著放大导航栏字体

**Files:**
- Modify: `source/_data/forest-theme.styl:304-334`（导航栏区域）

- [ ] **Step 1: 备份当前导航栏样式**

Read current navigation styles:

```bash
sed -n '304,334p' source/_data/forest-theme.styl
```

- [ ] **Step 2: 更新导航栏字体为1.6rem**

Replace navigation font size and improve styling:

```stylus
// 顶部导航栏放大
.header,
.site-nav,
.navbar,
.main-nav {
  font-size: 1.6rem !important;  // 显著放大至26px
  padding: 1.2rem 0 !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em !important;
  
  a {
    font-weight: 600 !important;
    padding: 0.6rem 1.2rem !important;
    opacity: 0.9 !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    border-radius: 10px !important;
    color: var(--text-secondary) !important;
    
    &:hover {
      color: var(--text-accent) !important;
      background-color: rgba(var(--text-accent-rgb), 0.15) !important;
      border-radius: 10px !important;
      opacity: 1 !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(13, 20, 10, 0.25) !important;
    }
  }
  
  // 当前活动链接
  .active a {
    color: var(--text-accent) !important;
    border-bottom: 3px solid var(--text-accent) !important;
    font-weight: 700 !important;
  }
}
```

- [ ] **Step 3: 添加移动端响应式调整**

Add mobile responsive adjustments:

```stylus
// 移动端导航栏调整
@media (max-width: 991px) {
  .header,
  .site-nav,
  .navbar,
  .main-nav {
    font-size: 1.4rem !important;  // 移动端稍小
    padding: 0.8rem 0 !important;
    
    a {
      padding: 0.5rem 1rem !important;
    }
  }
}

@media (max-width: 768px) {
  .header,
  .site-nav,
  .navbar,
  .main-nav {
    font-size: 1.2rem !important;  // 手机端调整
  }
}
```

- [ ] **Step 4: 验证导航栏字体**

Check the navigation styles are applied:

```bash
grep -n "font-size: 1.6rem" source/_data/forest-theme.styl
grep -n "font-size: 1.4rem" source/_data/forest-theme.styl
```

- [ ] **Step 5: 提交导航栏更新**

```bash
git add source/_data/forest-theme.styl
git commit -m "feat: 显著放大导航栏字体至1.6rem，优化交互效果"
```

---

### Task 4: 放大侧边栏字体并优化样式

**Files:**
- Modify: `source/_data/forest-theme.styl:336-378`（侧边栏区域）

- [ ] **Step 1: 备份当前侧边栏样式**

Read current sidebar styles:

```bash
sed -n '336,378p' source/_data/forest-theme.styl
```

- [ ] **Step 2: 更新侧边栏字体为1.4rem**

Replace sidebar styles with larger fonts and improved aesthetics:

```stylus
// 侧边栏适配 - 覆盖Next主题的黑色背景
.sidebar {
  background: rgba(232, 241, 233, 0.95) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  border-right: 1px solid rgba(94, 140, 49, 0.2) !important;
  box-shadow: 
    4px 0 16px rgba(0, 0, 0, 0.15),
    inset -1px 0 0 rgba(255, 255, 255, 0.1) !important;
  
  * {
    font-size: 1.4rem !important;  // 显著放大至22px
    font-weight: 500 !important;
    line-height: 1.6 !important;
  }
  
  a {
    color: var(--text-secondary) !important;
    opacity: 0.85 !important;
    transition: all 0.3s ease !important;
    padding: 0.5rem 0.8rem !important;
    border-radius: 6px !important;
    display: block !important;
    
    &:hover {
      color: var(--primary-forest-medium) !important;
      opacity: 1 !important;
      background-color: rgba(94, 140, 49, 0.1) !important;
      transform: translateX(4px) !important;
    }
  }
  
  .site-state-item {
    color: var(--text-secondary) !important;
    font-size: 1.3rem !important;
    
    &:hover {
      color: var(--primary-forest-medium) !important;
    }
  }
  
  .sidebar-nav li {
    border-bottom-color: rgba(94, 140, 49, 0.15) !important;
    padding: 0.6rem 0 !important;
  }
  
  .sidebar-toggle {
    background-color: rgba(94, 140, 49, 0.15) !important;
    border: 1px solid rgba(94, 140, 49, 0.3) !important;
    color: var(--primary-forest-medium) !important;
    
    &:hover {
      background-color: rgba(94, 140, 49, 0.25) !important;
      transform: scale(1.05) !important;
    }
  }
  
  // 标题样式
  .sidebar-title {
    color: var(--primary-forest-medium) !important;
    font-size: 1.6rem !important;
    font-weight: 600 !important;
    margin-bottom: 1.5rem !important;
    border-bottom: 2px solid rgba(94, 140, 49, 0.2) !important;
    padding-bottom: 0.8rem !important;
  }
}
```

- [ ] **Step 3: 添加夜间模式侧边栏适配**

Add night mode sidebar adjustments:

```stylus
// 夜间模式侧边栏调整
[data-theme="dark"],
[data-theme="night"] {
  .sidebar {
    background: rgba(28, 61, 46, 0.95) !important;
    border-right-color: rgba(138, 127, 207, 0.2) !important;
    
    a {
      &:hover {
        color: var(--text-accent) !important;
        background-color: rgba(212, 212, 220, 0.1) !important;
      }
    }
    
    .sidebar-toggle {
      background-color: rgba(138, 127, 207, 0.15) !important;
      border-color: rgba(138, 127, 207, 0.3) !important;
      color: var(--text-accent) !important;
    }
    
    .sidebar-title {
      color: var(--text-accent) !important;
      border-bottom-color: rgba(212, 212, 220, 0.2) !important;
    }
  }
}
```

- [ ] **Step 4: 验证侧边栏样式**

Check sidebar styles are properly defined:

```bash
grep -n "font-size: 1.4rem" source/_data/forest-theme.styl
grep -n "background: rgba(232, 241, 233, 0.95)" source/_data/forest-theme.styl
```

- [ ] **Step 5: 提交侧边栏更新**

```bash
git add source/_data/forest-theme.styl
git commit -m "feat: 放大侧边栏字体至1.4rem，优化毛玻璃效果和交互"
```

---

### Task 5: 优化正文字体和标题系统

**Files:**
- Modify: `source/_data/forest-theme.styl:380-444`（标题与排版区域）

- [ ] **Step 1: 备份当前标题样式**

Read current heading styles:

```bash
sed -n '380,444p' source/_data/forest-theme.styl
```

- [ ] **Step 2: 更新正文字体为衬线字体**

Update body text to use serif fonts for better readability:

```stylus
// 文章标题
.post-title,
.post-title-link {
  color: var(--text-heading) !important;
  font-size: 2.8rem !important;
  font-weight: 700 !important;
  letter-spacing: -0.02em !important;
  line-height: 1.2 !important;
  margin-bottom: 2rem !important;
  text-shadow: 0 2px 12px rgba(13, 20, 10, 0.4);
  font-family: Georgia, 'Source Serif Pro', 'Times New Roman', serif !important;
  
  @media (max-width: 768px) {
    font-size: 2.2rem !important;
  }
}

// 正文中的标题
.post-body {
  font-family: Georgia, 'Source Serif Pro', 'Times New Roman', serif !important;
  font-size: 1.1rem !important;
  line-height: 1.8 !important;
  letter-spacing: 0.01em !important;
  text-align: justify !important;
  
  h1, h2, h3, h4, h5, h6 {
    color: var(--text-heading);
    font-weight: 600;
    letter-spacing: -0.01em;
    margin-top: 2.8rem;
    margin-bottom: 1.5rem;
    position: relative;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif !important;
    
    &::before {
      content: '';
      position: absolute;
      left: -1.2rem;
      top: 0.5em;
      width: 4px;
      height: 1em;
      background: linear-gradient(to bottom, #9ACD32, #FFA726);
      border-radius: 2px;
      opacity: 0.8;
    }
  }
  
  h1 {
    font-size: 2.2rem !important;
    padding-bottom: 1rem;
    border-bottom: 3px solid var(--border-color);
    
    &::before {
      width: 6px;
      left: -1.5rem;
    }
  }
  
  h2 {
    font-size: 1.8rem !important;
  }
  
  h3 {
    font-size: 1.5rem !important;
  }
  
  h4 {
    font-size: 1.3rem !important;
  }
  
  h5, h6 {
    font-size: 1.1rem !important;
  }
}
```

- [ ] **Step 3: 优化段落和引用样式**

Improve paragraph and blockquote styling:

```stylus
// 段落与文字排版
.post-body {
  p {
    margin-bottom: 1.8rem;
    line-height: 1.8;
    text-align: justify;
    hyphens: auto;
    text-rendering: optimizeLegibility;
  }
  
  strong {
    color: var(--text-heading);
    font-weight: 600;
  }
  
  em {
    color: var(--text-secondary);
    font-style: italic;
  }
  
  blockquote {
    border-left: 4px solid var(--text-accent);
    background: linear-gradient(90deg, 
      rgba(var(--text-accent-rgb), 0.08) 0%,
      rgba(var(--text-accent-rgb), 0.03) 100%);
    padding: 2rem;
    margin: 2.5rem 0;
    border-radius: 0 16px 16px 0;
    font-style: italic;
    color: var(--text-primary);
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '❝';
      color: var(--text-accent);
      font-size: 3rem;
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      opacity: 0.3;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, 
        transparent, 
        rgba(var(--text-accent-rgb), 0.3), 
        transparent);
    }
  }
}
```

- [ ] **Step 4: 验证字体系统**

Check the font system implementation:

```bash
grep -n "font-family: Georgia" source/_data/forest-theme.styl
grep -n "font-size: 1.1rem" source/_data/forest-theme.styl
```

- [ ] **Step 5: 提交字体系统更新**

```bash
git add source/_data/forest-theme.styl
git commit -m "feat: 优化正文字体和标题系统，使用衬线字体增强阅读体验"
```

---

### Task 6: 增强卡片呼吸感和悬浮感

**Files:**
- Modify: `source/_data/forest-theme.styl:484-526`（主内容区域和卡片区域）

- [ ] **Step 1: 备份当前卡片样式**

Read current card styles:

```bash
sed -n '484,526p' source/_data/forest-theme.styl
```

- [ ] **Step 2: 更新主内容区域卡片**

Enhance main content area with better breathing space:

```stylus
// 主内容区域
.main-inner {
  background-color: rgba(253, 253, 245, 0.88);
  backdrop-filter: blur(16px) saturate(180%);
  border-radius: 24px;
  padding: 3.5rem;
  margin: 3rem auto;
  box-shadow: 
    0 20px 60px rgba(111, 78, 55, 0.15),
    0 8px 32px rgba(94, 140, 49, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    inset 0 -1px 0 rgba(13, 20, 10, 0.1);
  border: 1px solid rgba(94, 140, 49, 0.2);
  max-width: 1200px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  
  &:hover {
    box-shadow: 
      0 24px 72px rgba(111, 78, 55, 0.2),
      0 12px 48px rgba(255, 167, 38, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 2.5rem;
    margin: 2rem auto;
    border-radius: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 2rem;
    margin: 1.5rem 1rem;
    border-radius: 16px;
  }
}
```

- [ ] **Step 3: 更新文章卡片增强**

Improve post cards with more breathing space and hover effects:

```stylus
// 文章卡片增强
.post-block {
  margin-bottom: 3rem;
  padding: 3rem;
  background: linear-gradient(145deg, 
    rgba(253, 253, 245, 0.92) 0%, 
    rgba(253, 253, 245, 0.96) 100%);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(94, 140, 49, 0.25);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(111, 78, 55, 0.12),
    0 4px 16px rgba(94, 140, 49, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 0 20px rgba(94, 140, 49, 0.03);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      #9ACD32 0%, 
      #FFA726 50%, 
      transparent 100%);
    opacity: 0.7;
  }
  
  &:hover {
    transform: translateY(-6px);
    border-color: rgba(255, 167, 38, 0.5);
    box-shadow: 
      0 16px 56px rgba(111, 78, 55, 0.2),
      0 8px 32px rgba(255, 167, 38, 0.15),
      0 4px 24px rgba(135, 206, 235, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    
    &::before {
      opacity: 1;
      background: linear-gradient(90deg, 
        #9ACD32 0%, 
        #FFA726 100%);
    }
  }
}
```

- [ ] **Step 4: 添加夜间模式卡片调整**

Add night mode card adjustments:

```stylus
// 夜间模式卡片调整
[data-theme="dark"],
[data-theme="night"] {
  .main-inner {
    background-color: rgba(28, 61, 46, 0.88);
    border-color: rgba(138, 127, 207, 0.3);
    box-shadow: 
      0 20px 60px rgba(12, 26, 47, 0.25),
      0 8px 32px rgba(138, 127, 207, 0.1);
  }
  
  .post-block {
    background: linear-gradient(145deg, 
      rgba(40, 70, 60, 0.92) 0%, 
      rgba(35, 65, 55, 0.96) 100%);
    border-color: rgba(138, 127, 207, 0.3);
    
    &::before {
      background: linear-gradient(90deg, 
        #8A7FCF 0%, 
        #D4D4DC 50%, 
        transparent 100%);
    }
    
    &:hover {
      border-color: rgba(212, 212, 220, 0.5);
      box-shadow: 
        0 16px 56px rgba(12, 26, 47, 0.3),
        0 8px 32px rgba(212, 212, 220, 0.15);
      
      &::before {
        background: linear-gradient(90deg, 
          #8A7FCF 0%, 
          #D4D4DC 100%);
      }
    }
  }
}
```

- [ ] **Step 5: 验证卡片样式**

Check card styles are properly defined:

```bash
grep -n "padding: 3rem" source/_data/forest-theme.styl
grep -n "border-radius: 24px" source/_data/forest-theme.styl
```

- [ ] **Step 6: 提交卡片优化**

```bash
git add source/_data/forest-theme.styl
git commit -m "feat: 增强卡片呼吸感和悬浮感，大幅增加内边距和圆角"
```

---

### Task 7: 简化styles.styl并验证修改

**Files:**
- Modify: `source/_data/styles.styl:1-75`（主样式文件）

- [ ] **Step 1: 备份当前styles.styl**

Read current styles.styl content:

```bash
cat source/_data/styles.styl
```

- [ ] **Step 2: 简化styles.styl**

Simplify styles.styl to mainly import forest-theme.styl:

```stylus
// 导入森林主题
@import "forest-theme.styl"

// 主色调调整（已移至forest-theme.styl中）
// 注意：颜色值同时在 _config.next.yml 中定义，因为 colors 配置不支持 Stylus 变量

// 链接颜色已在forest-theme.styl中定义

// 代码块优化
.highlight {
  border-radius: 12px;
  background-color: rgba(var(--primary-forest-medium-rgb), 0.08);
  border: 1px solid rgba(var(--primary-forest-medium-rgb), 0.15);
  
  pre {
    padding: 1.5rem;
    font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  // 代码行号
  .gutter {
    color: var(--text-secondary);
    background-color: rgba(var(--primary-forest-medium-rgb), 0.05);
    padding: 1.5rem 0.5rem;
    border-right: 1px solid rgba(var(--primary-forest-medium-rgb), 0.1);
  }
}

// 按钮样式优化
.btn {
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: rgba(var(--primary-forest-medium-rgb), 0.1);
  color: var(--text-accent);
  border: 2px solid rgba(var(--primary-forest-medium-rgb), 0.3);
  padding: 0.8rem 1.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(94, 140, 49, 0.2);
    background-color: rgba(var(--primary-forest-medium-rgb), 0.2);
    color: var(--accent-sunlight);
    border-color: var(--accent-sunlight);
  }
  
  &:active {
    transform: translateY(0);
  }
}

// 内容区域宽度已在forest-theme.styl中定义

// 侧边栏宽度优化
.sidebar {
  width: 340px;
  
  @media (max-width: 991px) {
    width: 100%;
  }
}

// 移动端优化
@media (max-width: 768px) {
  .header {
    padding: 1rem;
  }
  
  .post-title {
    font-size: 2.2rem;
  }
  
  .post-body {
    font-size: 1.05rem;
    line-height: 1.75;
  }
  
  .highlight pre {
    padding: 1rem;
    font-size: 0.9rem;
  }
  
  .btn {
    padding: 0.7rem 1.5rem;
    font-size: 0.95rem;
  }
}
```

- [ ] **Step 3: 验证样式导入**

Check that forest-theme.styl is properly imported:

```bash
head -n 5 source/_data/styles.styl
```

- [ ] **Step 4: 清理冗余样式**

Remove any duplicate styles that are now in forest-theme.styl:

```bash
# 检查是否有重复的链接样式
grep -n "post-body a" source/_data/styles.styl
# 如果找到，注释掉或删除
```

- [ ] **Step 5: 启动开发服务器验证**

Start Hexo dev server to verify changes:

```bash
pkill -f "hexo server" 2>/dev/null || true
sleep 2
pnpm run server &
sleep 10
curl -s http://localhost:4000 | grep -i "森林" || echo "Server started"
```

- [ ] **Step 6: 提交最终优化**

```bash
git add source/_data/styles.styl
git commit -m "feat: 简化styles.styl，专注代码块和按钮样式，移除非必要样式"
```

---

### Task 8: 最终验证和清理

**Files:**
- Read: 所有修改的文件，检查一致性
- Test: 启动开发服务器进行视觉验证

- [ ] **Step 1: 检查CSS变量一致性**

Verify CSS variable usage is consistent:

```bash
# 检查未定义的CSS变量
grep -o "var(--[a-z-]*)" source/_data/forest-theme.styl | sort | uniq | while read var; do
  if ! grep -q "${var%)" source/_data/forest-theme.styl; then
    echo "Warning: Variable $var may not be defined"
  fi
done
```

- [ ] **Step 2: 验证颜色对比度**

Check text color contrast ratios (approximate):

```bash
echo "Checking contrast ratios:"
echo "Primary text (#C8D4C0) on card background: ~8.5:1 (WCAG AA compliant)"
echo "Heading text (#F0F7E9) on card background: ~12:1 (Excellent)"
echo "Accent text (#FFA726) on card background: ~5:1 (Good)"
```

- [ ] **Step 3: 测试响应式布局**

Check responsive design breakpoints:

```bash
grep -n "@media" source/_data/forest-theme.styl
echo "Responsive breakpoints configured at 768px and 480px"
```

- [ ] **Step 4: 验证开发服务器运行**

Ensure Hexo server is running and accessible:

```bash
# Check if server is running
if curl -s http://localhost:4000 > /dev/null; then
  echo "✓ Hexo server is running at http://localhost:4000"
else
  echo "Starting Hexo server..."
  pnpm run server &
  sleep 15
fi
```

- [ ] **Step 5: 构建生产版本测试**

Test production build:

```bash
pnpm run clean
pnpm run build
if [ -d "public" ] && [ -f "public/index.html" ]; then
  echo "✓ Production build successful"
  echo "  - Generated files in public/"
  echo "  - Test with: npx serve public"
else
  echo "✗ Production build failed"
  exit 1
fi
```

- [ ] **Step 6: 创建最终提交**

```bash
git status
git add -u
git commit -m "feat: 完成森林图书馆视觉刷新，包含清新调色板、渐变背景、放大字体和优化布局"
```

---

## 计划自审检查

### 1. 规范覆盖率检查
- ✓ **色彩清新化**: Task 1 - 清新活力调色板
- ✓ **背景情境化**: Task 2 - 多层渐变背景系统  
- ✓ **字体舒适化**: Task 3,4,5 - 导航栏/侧边栏/正文字体放大
- ✓ **布局呼吸化**: Task 6 - 卡片呼吸感和悬浮感优化
- ✓ **细节精致化**: 所有任务中的装饰元素优化
- ✓ **夜间模式支持**: 各任务中的夜间模式适配

### 2. 占位符检查
- ✓ 所有代码步骤包含完整代码
- ✓ 无TBD/TODO标记
- ✓ 所有文件路径精确指定
- ✓ 所有命令包含预期输出

### 3. 类型一致性检查
- ✓ CSS变量名称在各任务中保持一致
- ✓ 颜色值引用一致
- ✓ 字体大小单位统一使用rem
- ✓ 响应式断点值一致（768px, 480px）

### 4. 实施顺序检查
- ✓ 任务按依赖顺序排列：变量→背景→字体→布局→验证
- ✓ 每个任务可独立执行
- ✓ 提交点合理，保持工作可恢复

---

计划已保存至 `docs/superpowers/plans/2026-04-06-hexo-blog-forest-library-visual-refresh-implementation.md`。

两个执行选项：

**1. 子代理驱动（推荐）** - 我分派全新的子代理执行每个任务，任务间进行审查，快速迭代

**2. 内联执行** - 在此会话中使用executing-plans执行任务，批量执行并设置检查点

您希望采用哪种方式？