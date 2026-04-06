# Hexo博客森林图书馆主题改造实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为Hexo博客实现"森林图书馆"主题，融合自然和谐色彩、动态粒子效果、个性化交互功能，创造深度沉浸式阅读体验。

**Architecture:** 分层前端实现：CSS变量主题系统定义色彩；Canvas实现动态粒子效果；Web Audio API处理环境音效；模块化JavaScript管理交互功能；与现有Hexo/Next主题集成。

**Tech Stack:** Hexo 8.x, Next主题 8.27.0, Stylus CSS, Vanilla JavaScript, Canvas API, Web Audio API, localStorage

---

## 文件结构规划

### 新增文件
```
source/_data/
├── forest-theme.styl          # 森林主题专用CSS变量和样式
├── forest-animations.styl     # 动画关键帧定义
└── existing: styles.styl, fonts.styl (更新)

source/js/forest/
├── forest-theme.js           # 主题切换和色彩管理
├── forest-particles.js       # 粒子效果和动画控制
├── forest-audio.js           # 音效管理和播放控制
└── forest-interactions.js    # 交互反馈和彩蛋系统

source/images/forest/
├── leaves/
│   ├── oak-leaf.svg          # 橡树叶SVG
│   ├── maple-leaf.svg        # 枫叶SVG
│   └── ginkgo-leaf.svg       # 银杏叶SVG
├── animals/
│   ├── owl.svg               # 猫头鹰
│   ├── squirrel.svg          # 松鼠
│   └── deer.svg              # 鹿
└── plants/
    ├── fern.svg              # 蕨类植物
    ├── moss.svg              # 苔藓
    └── flower.svg            # 花朵
```

### 修改文件
- `_config.next.yml` - 添加主题CSS/JS引用
- `source/_data/styles.styl` - 集成森林主题样式
- 现有模板文件 - 添加新资源引用

---

## 第一阶段：基础主题实现

### Task 1: 创建森林主题CSS变量系统

**Files:**
- Create: `source/_data/forest-theme.styl`
- Modify: `_config.next.yml:12-20`

- [ ] **Step 1: 创建森林主题样式文件**

```stylus
// 森林图书馆主题变量定义
// 日间模式变量
:root {
  // 主色调（森林基础）
  --primary-forest-deep: #2d5016;
  --primary-forest-medium: #3e6a23;
  --primary-forest-light: #5a8c3a;
  
  // 强调色（自然元素）
  --accent-amber: #c77d1f;
  --accent-gold: #daa520;
  --accent-sunlight: #f4d35e;
  
  // 背景系统
  --bg-dark: #121a0f;
  --bg-medium: #1c2516;
  --bg-light: #26311d;
  
  // 文字颜色
  --text-primary: #e8f1e1;
  --text-secondary: #b8c9ab;
  --text-accent: #f4d35e;
  
  // 主题状态
  --theme-mode: 'day';
}

// 夜间模式变量覆盖
[data-theme="night"] {
  --theme-mode: 'night';
  --bg-dark: #0c1208;
  --bg-medium: #141c0e;
  --bg-light: #1c2516;
  --text-primary: #d8e1d0;
  --text-accent: #ffd166;
}
```

- [ ] **Step 2: 创建CSS变量应用到基础元素的样式**

```stylus
// 应用CSS变量到基础元素
body {
  background-color: var(--bg-dark);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

// 链接样式
a {
  color: var(--text-accent);
  text-decoration: none;
  border-bottom: 1px solid rgba(var(--text-accent-rgb), 0.3);
  
  &:hover {
    color: var(--accent-amber);
    border-bottom-color: var(--accent-amber);
  }
}

// 按钮样式
.btn {
  background-color: rgba(var(--primary-forest-medium-rgb), 0.1);
  color: var(--text-accent);
  border: 1px solid var(--primary-forest-medium);
  
  &:hover {
    background-color: rgba(var(--primary-forest-medium-rgb), 0.2);
    color: var(--accent-amber);
  }
}
```

- [ ] **Step 3: 更新Next主题配置引用新样式**

```bash
# 在_config.next.yml中添加
sed -i '/custom_file_path:/a\  style: source/_data/styles.styl, source/_data/forest-theme.styl' /home/raniy/myblog/_config.next.yml
```

预期修改后的`_config.next.yml`第12-15行：
```yaml
custom_file_path:
  style: source/_data/styles.styl, source/_data/forest-theme.styl
  font: source/_data/fonts.styl
```

- [ ] **Step 4: 验证样式加载**

运行：`cd /home/raniy/myblog && pnpm run build 2>&1 | grep -A2 -B2 "forest-theme"`

预期：构建过程中无错误，生成CSS文件包含森林主题样式

- [ ] **Step 5: 提交基础样式**

```bash
git add source/_data/forest-theme.styl _config.next.yml
git commit -m "feat: 添加森林主题CSS变量系统"
```

---

### Task 2: 创建动画关键帧定义

**Files:**
- Create: `source/_data/forest-animations.styl`
- Modify: `source/_data/forest-theme.styl` (添加引用)

- [ ] **Step 1: 创建动画关键帧文件**

```stylus
// 树叶飘落动画
@keyframes leaf-fall {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(calc(100vh + 100px)) rotate(360deg);
    opacity: 0;
  }
}

// 阳光光斑动画
@keyframes sunlight-glow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.05);
  }
}

// 涟漪扩散动画
@keyframes ripple-effect {
  0% {
    transform: scale(0);
    opacity: 0.7;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

// 悬停生长动画
@keyframes gentle-grow {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.05);
  }
}

// 页面过渡动画
@keyframes page-transition {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 2: 创建动画应用类**

```stylus
// 动画应用类
.leaf-fall {
  animation: leaf-fall 15s linear infinite;
  animation-play-state: running;
}

.sunlight-glow {
  animation: sunlight-glow 4s ease-in-out infinite;
}

.ripple {
  animation: ripple-effect 0.6s ease-out;
}

.gentle-grow {
  animation: gentle-grow 0.2s ease-out;
  animation-fill-mode: forwards;
}

.page-transition {
  animation: page-transition 0.4s ease-out;
}
```

- [ ] **Step 3: 在森林主题中引用动画文件**

```bash
# 在forest-theme.styl末尾添加引用
echo '@import "forest-animations";' >> /home/raniy/myblog/source/_data/forest-theme.styl
```

- [ ] **Step 4: 测试动画样式**

创建测试HTML文件：
```bash
cat > /home/raniy/myblog/test-animations.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <style>
    @keyframes leaf-fall { 0% { opacity: 0; } 100% { opacity: 1; } }
    .leaf-fall { animation: leaf-fall 1s infinite; }
  </style>
</head>
<body>
  <div class="leaf-fall" style="width: 50px; height: 50px; background: green;">Test</div>
</body>
</html>
EOF
```

在浏览器中打开验证动画工作

- [ ] **Step 5: 提交动画定义**

```bash
git add source/_data/forest-animations.styl source/_data/forest-theme.styl
git commit -m "feat: 添加森林主题动画关键帧定义"
```

---

### Task 3: 创建JavaScript目录结构和基础模块

**Files:**
- Create: `source/js/forest/`
- Create: `source/js/forest/forest-theme.js`
- Modify: `_config.next.yml` (添加JS引用)

- [ ] **Step 1: 创建JavaScript目录**

```bash
mkdir -p /home/raniy/myblog/source/js/forest
mkdir -p /home/raniy/myblog/source/images/forest/{leaves,animals,plants}
```

- [ ] **Step 2: 创建主题管理模块**

```javascript
// source/js/forest/forest-theme.js
/**
 * 森林图书馆主题管理器
 * 负责主题切换、色彩管理、本地存储集成
 */

const ForestTheme = {
  // 主题状态
  currentTheme: 'day',
  themes: {
    day: {
      name: 'day',
      icon: '☀️',
      label: '日间模式'
    },
    night: {
      name: 'night', 
      icon: '🌙',
      label: '夜间模式'
    }
  },

  // 初始化主题系统
  init() {
    this.loadUserPreference();
    this.setupThemeToggle();
    this.applyTheme(this.currentTheme);
    console.log('🌲 森林主题系统已初始化');
  },

  // 加载用户偏好
  loadUserPreference() {
    const savedTheme = localStorage.getItem('forest-library-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.currentTheme = savedTheme || (prefersDark ? 'night' : 'day');
  },

  // 应用主题到页面
  applyTheme(theme) {
    const root = document.documentElement;
    
    // 移除旧主题属性，添加新主题属性
    root.removeAttribute('data-theme');
    if (theme === 'night') {
      root.setAttribute('data-theme', 'night');
    }
    
    // 更新CSS变量
    this.updateThemeVariables(theme);
    
    // 保存偏好
    this.currentTheme = theme;
    localStorage.setItem('forest-library-theme', theme);
    
    // 触发主题变化事件
    this.dispatchThemeChange(theme);
  },

  // 更新CSS变量（如果需要动态调整）
  updateThemeVariables(theme) {
    // 基础变量已在CSS中定义，这里处理可能需要JS计算的变量
    const root = document.documentElement;
    
    if (theme === 'night') {
      // 夜间模式可能需要的额外调整
      root.style.setProperty('--particle-opacity', '0.3');
    } else {
      // 日间模式调整
      root.style.setProperty('--particle-opacity', '0.6');
    }
  },

  // 设置主题切换UI
  setupThemeToggle() {
    // 创建或查找切换按钮
    let toggleBtn = document.getElementById('forest-theme-toggle');
    
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.id = 'forest-theme-toggle';
      toggleBtn.className = 'forest-theme-toggle';
      toggleBtn.setAttribute('aria-label', '切换主题');
      
      // 添加到页面
      const header = document.querySelector('.header') || document.body;
      header.appendChild(toggleBtn);
    }
    
    // 更新按钮状态
    this.updateToggleButton();
    
    // 添加点击事件
    toggleBtn.addEventListener('click', () => {
      const newTheme = this.currentTheme === 'day' ? 'night' : 'day';
      this.applyTheme(newTheme);
      this.updateToggleButton();
    });
  },

  // 更新切换按钮
  updateToggleButton() {
    const toggleBtn = document.getElementById('forest-theme-toggle');
    if (!toggleBtn) return;
    
    const theme = this.themes[this.currentTheme];
    toggleBtn.textContent = theme.icon;
    toggleBtn.title = `切换到${theme.label}`;
    
    // 添加悬停提示
    toggleBtn.setAttribute('aria-label', `当前为${theme.label}，点击切换`);
  },

  // 触发主题变化事件
  dispatchThemeChange(theme) {
    const event = new CustomEvent('forest-theme-change', {
      detail: { theme, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  },

  // 获取当前主题
  getCurrentTheme() {
    return this.currentTheme;
  },

  // 检查是否支持减少动画
  supportsReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
};

// 自动初始化
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    ForestTheme.init();
  });
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForestTheme;
}
```

- [ ] **Step 3: 添加主题切换按钮样式**

```bash
# 在forest-theme.styl中添加按钮样式
cat >> /home/raniy/myblog/source/_data/forest-theme.styl << 'EOF'

// 主题切换按钮样式
.forest-theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(var(--primary-forest-medium-rgb), 0.2);
  border: 1px solid var(--primary-forest-medium);
  color: var(--text-accent);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(var(--primary-forest-medium-rgb), 0.3);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

// 移动端调整
@media (max-width: 768px) {
  .forest-theme-toggle {
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}
EOF
```

- [ ] **Step 4: 更新Next配置添加JS引用**

```bash
# 在_config.next.yml中添加JS配置
cat >> /home/raniy/myblog/_config.next.yml << 'EOF'

# Forest Library Theme JavaScript
forest_theme:
  enable: true
  scripts:
    - /js/forest/forest-theme.js
    - /js/forest/forest-particles.js
    - /js/forest/forest-audio.js
    - /js/forest/forest-interactions.js
EOF
```

- [ ] **Step 5: 测试主题模块**

创建测试页面：
```bash
cat > /home/raniy/myblog/test-theme.html << 'EOF'
<!DOCTYPE html>
<html data-theme="day">
<head>
  <style>
    :root { --bg-dark: #121a0f; --text-primary: #e8f1e1; }
    [data-theme="night"] { --bg-dark: #0c1208; --text-primary: #d8e1d0; }
    body { background: var(--bg-dark); color: var(--text-primary); padding: 20px; }
  </style>
</head>
<body>
  <h1>森林主题测试</h1>
  <button id="test-toggle">切换主题</button>
  <script>
    const theme = { current: 'day' };
    document.getElementById('test-toggle').onclick = () => {
      theme.current = theme.current === 'day' ? 'night' : 'day';
      document.documentElement.setAttribute('data-theme', theme.current);
    };
  </script>
</body>
</html>
EOF
```

- [ ] **Step 6: 提交基础模块**

```bash
git add source/js/forest/forest-theme.js source/_data/forest-theme.styl _config.next.yml
git commit -m "feat: 创建森林主题JavaScript管理模块"
```

---

## 第二阶段：动态效果集成

### Task 4: 创建粒子系统模块

**Files:**
- Create: `source/js/forest/forest-particles.js`
- Create: `source/images/forest/leaves/oak-leaf.svg`
- Create: `source/images/forest/leaves/maple-leaf.svg`
- Create: `source/images/forest/leaves/ginkgo-leaf.svg`

- [ ] **Step 1: 创建树叶SVG资源**

```svg
<!-- source/images/forest/leaves/oak-leaf.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <path d="M50,10 C60,5 75,15 80,30 C85,45 75,65 60,75 C45,85 30,80 20,65 C10,50 15,30 30,20 C40,15 45,12 50,10 Z" 
        fill="#3e6a23" stroke="#2d5016" stroke-width="2"/>
  <path d="M50,10 L50,25 M60,15 L65,30 M40,15 L35,30" 
        stroke="#1c2516" stroke-width="1.5"/>
</svg>
```

```svg
<!-- source/images/forest/leaves/maple-leaf.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <path d="M50,10 C55,5 65,10 70,20 C80,35 75,55 65,70 C55,85 40,85 30,70 C20,55 15,35 25,20 C30,10 40,5 50,10 Z" 
        fill="#5a8c3a" stroke="#3e6a23" stroke-width="2"/>
  <path d="M50,10 L50,40 M58,15 L65,35 M42,15 L35,35" 
        stroke="#26311d" stroke-width="1.5"/>
</svg>
```

```svg
<!-- source/images/forest/leaves/ginkgo-leaf.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <path d="M50,10 C55,5 70,20 75,40 C80,60 70,80 50,90 C30,80 20,60 25,40 C30,20 45,5 50,10 Z" 
        fill="#c77d1f" stroke="#8b5a2b" stroke-width="2"/>
  <path d="M50,10 L50,50 M55,20 L65,45 M45,20 L35,45" 
        stroke="#8b5a2b" stroke-width="1.5"/>
</svg>
```

- [ ] **Step 2: 创建粒子系统模块**

```javascript
// source/js/forest/forest-particles.js
/**
 * 森林粒子系统
 * 负责落叶粒子效果、性能优化、交互反馈
 */

const ForestParticles = {
  // 配置
  config: {
    maxParticles: 50,
    leafTypes: ['oak', 'maple', 'ginkgo'],
    fallSpeed: 0.5,
    swayAmount: 0.5,
    autoStart: true,
    mobileOptimized: true
  },

  // 状态
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,
  isRunning: false,
  lastTime: 0,

  // 粒子类
  Particle: class {
    constructor(type, x, y) {
      this.type = type;
      this.x = x;
      this.y = y;
      this.size = Math.random() * 20 + 10; // 10-30px
      this.speed = Math.random() * 0.3 + 0.2;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 0.5 - 0.25;
      this.sway = Math.random() * 0.02 - 0.01;
      this.swayPhase = Math.random() * Math.PI * 2;
      this.opacity = Math.random() * 0.5 + 0.3;
      this.wind = 0;
      this.createdAt = Date.now();
      this.lifetime = 15000; // 15秒
    }

    update(deltaTime, wind) {
      this.y += this.speed * deltaTime;
      this.x += (this.sway * Math.sin(this.swayPhase + this.y * 0.01) + wind) * deltaTime;
      this.rotation += this.rotationSpeed * deltaTime;
      this.swayPhase += 0.01;
      
      const age = Date.now() - this.createdAt;
      if (age > this.lifetime * 0.8) {
        this.opacity = 1 - ((age - this.lifetime * 0.8) / (this.lifetime * 0.2));
      }
      
      return age < this.lifetime;
    }
  },

  // 初始化粒子系统
  init() {
    if (this.supportsReducedMotion()) {
      console.log('🌲 用户偏好减少动画，粒子系统禁用');
      return;
    }

    this.createCanvas();
    this.loadLeafImages().then(() => {
      if (this.config.autoStart) {
        this.start();
      }
      console.log('🍃 森林粒子系统已初始化');
    }).catch(err => {
      console.warn('🍃 粒子图片加载失败:', err);
    });
  },

  // 创建Canvas元素
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'forest-particles-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '0';
    
    document.body.appendChild(this.canvas);
    this.resizeCanvas();
    
    this.ctx = this.canvas.getContext('2d');
    
    // 窗口大小变化时重置Canvas
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  },

  // 调整Canvas大小
  resizeCanvas() {
    if (!this.canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  },

  // 加载树叶图片
  async loadLeafImages() {
    this.leafImages = {};
    
    for (const type of this.config.leafTypes) {
      const img = new Image();
      img.src = `/images/forest/leaves/${type}-leaf.svg`;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      this.leafImages[type] = img;
    }
  },

  // 启动粒子系统
  start() {
    if (this.isRunning || this.supportsReducedMotion()) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
    
    // 初始创建一些粒子
    for (let i = 0; i < this.config.maxParticles / 2; i++) {
      this.createParticle();
    }
  },

  // 停止粒子系统
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  },

  // 暂停（保留粒子状态）
  pause() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  },

  // 恢复
  resume() {
    if (!this.isRunning && !this.supportsReducedMotion()) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.animate();
    }
  },

  // 动画循环
  animate() {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.updateParticles(deltaTime);
    this.renderParticles();
    
    // 偶尔创建新粒子
    if (this.particles.length < this.config.maxParticles && Math.random() < 0.05) {
      this.createParticle();
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
  },

  // 更新所有粒子
  updateParticles(deltaTime) {
    // 简单风力模拟（随时间变化）
    const wind = Math.sin(Date.now() * 0.0001) * 0.1;
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      const isAlive = particle.update(deltaTime, wind);
      
      if (!isAlive || particle.y > window.innerHeight + 100) {
        this.particles.splice(i, 1);
      }
    }
  },

  // 渲染粒子
  renderParticles() {
    if (!this.ctx || !this.canvas) return;
    
    // 清除Canvas（使用透明度创建拖尾效果）
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 渲染每个粒子
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate((particle.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = particle.opacity;
      
      const img = this.leafImages[particle.type];
      if (img) {
        this.ctx.drawImage(img, -particle.size / 2, -particle.size / 2, particle.size, particle.size);
      } else {
        // 后备：绘制简单形状
        this.ctx.fillStyle = this.getLeafColor(particle.type);
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, particle.size / 2, particle.size / 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      this.ctx.restore();
    });
  },

  // 获取树叶颜色（后备）
  getLeafColor(type) {
    const colors = {
      oak: '#3e6a23',
      maple: '#5a8c3a',
      ginkgo: '#c77d1f'
    };
    return colors[type] || '#3e6a23';
  },

  // 创建新粒子
  createParticle() {
    if (this.particles.length >= this.config.maxParticles) return;
    
    const type = this.config.leafTypes[Math.floor(Math.random() * this.config.leafTypes.length)];
    const x = Math.random() * window.innerWidth;
    
    const particle = new this.Particle(type, x, -50);
    this.particles.push(particle);
  },

  // 添加交互效果：鼠标悬停扰动粒子
  addInteraction() {
    document.addEventListener('mousemove', (e) => {
      if (!this.isRunning) return;
      
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const radius = 100;
      
      this.particles.forEach(particle => {
        const dx = particle.x - mouseX;
        const dy = particle.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < radius) {
          const force = (radius - distance) / radius * 0.5;
          particle.x += (dx / distance) * force;
          particle.y += (dy / distance) * force;
        }
      });
    });
  },

  // 检查是否支持减少动画
  supportsReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // 移动设备优化
  isMobile() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // 获取状态信息
  getStats() {
    return {
      isRunning: this.isRunning,
      particleCount: this.particles.length,
      maxParticles: this.config.maxParticles,
      canvasSize: this.canvas ? `${this.canvas.width}x${this.canvas.height}` : 'N/A'
    };
  }
};

// 自动初始化
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    ForestParticles.init();
  });
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForestParticles;
}
```

- [ ] **Step 3: 添加粒子系统CSS样式**

```bash
# 在forest-theme.styl中添加Canvas样式
cat >> /home/raniy/myblog/source/_data/forest-theme.styl << 'EOF'

// 粒子Canvas样式
#forest-particles-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: var(--particle-opacity, 0.6);
  transition: opacity 0.5s ease;
  
  // 夜间模式降低粒子可见度
  [data-theme="night"] & {
    opacity: 0.3;
  }
}

// 减少动画偏好
@media (prefers-reduced-motion: reduce) {
  #forest-particles-canvas {
    display: none;
  }
}

// 移动端优化
@media (max-width: 768px) {
  #forest-particles-canvas {
    // 移动端减少粒子数量通过JS控制
    opacity: 0.4;
  }
}
EOF
```

- [ ] **Step 4: 测试粒子系统**

创建测试页面：
```bash
cat > /home/raniy/myblog/test-particles.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; overflow: hidden; background: #121a0f; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="test-canvas"></canvas>
  <script>
    const canvas = document.getElementById('test-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 简单粒子测试
    const particles = [];
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 10 + 5;
        this.speed = Math.random() * 2 + 1;
      }
      update() {
        this.y += this.speed;
        if (this.y > canvas.height) this.y = 0;
      }
      draw() {
        ctx.fillStyle = '#3e6a23';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    for (let i = 0; i < 20; i++) particles.push(new Particle());
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>
EOF
```

- [ ] **Step 5: 提交粒子系统**

```bash
git add source/js/forest/forest-particles.js \
        source/images/forest/leaves/ \
        source/_data/forest-theme.styl
git commit -m "feat: 创建森林粒子系统（落叶效果）"
```

---

### Task 5: 创建光线效果系统

**Files:**
- Modify: `source/_data/forest-theme.styl` (添加光线样式)
- Modify: `source/js/forest/forest-particles.js` (添加光线效果)

- [ ] **Step 1: 添加CSS光线效果**

```bash
cat >> /home/raniy/myblog/source/_data/forest-theme.styl << 'EOF'

// 光线效果层
.forest-light-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
  
  &::before, &::after {
    content: '';
    position: absolute;
    pointer-events: none;
  }
  
  // 日间阳光光斑
  &::before {
    width: 300px;
    height: 300px;
    top: 20%;
    right: 15%;
    background: radial-gradient(circle, rgba(244, 211, 94, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    animation: sunlight-glow 8s ease-in-out infinite;
    filter: blur(20px);
    
    [data-theme="night"] & {
      opacity: 0;
    }
  }
  
  // 次要光斑
  &::after {
    width: 200px;
    height: 200px;
    bottom: 30%;
    left: 10%;
    background: radial-gradient(circle, rgba(244, 211, 94, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    animation: sunlight-glow 12s ease-in-out infinite reverse;
    filter: blur(15px);
    animation-delay: -4s;
    
    [data-theme="night"] & {
      opacity: 0;
    }
  }
}

// 夜间月光效果
[data-theme="night"] .forest-light-effects {
  &::before {
    content: '';
    width: 250px;
    height: 250px;
    top: 15%;
    left: 20%;
    background: radial-gradient(circle, rgba(173, 216, 230, 0.08) 0%, transparent 70%);
    animation: sunlight-glow 15s ease-in-out infinite;
    filter: blur(30px);
    opacity: 1;
  }
  
  &::after {
    content: '';
    width: 150px;
    height: 150px;
    bottom: 20%;
    right: 25%;
    background: radial-gradient(circle, rgba(135, 206, 250, 0.05) 0%, transparent 70%);
    animation: sunlight-glow 20s ease-in-out infinite reverse;
    filter: blur(20px);
    animation-delay: -7s;
    opacity: 1;
  }
}

// 光线交互效果
.forest-light-interaction {
  position: absolute;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(244, 211, 94, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  transform: scale(0);
  transition: opacity 0.3s, transform 0.3s;
  filter: blur(15px);
  
  &.active {
    opacity: 0.4;
    transform: scale(1);
  }
}
EOF
```

- [ ] **Step 2: 扩展粒子系统添加光线交互**

```bash
# 在forest-particles.js末尾添加光线交互功能
cat >> /home/raniy/myblog/source/js/forest/forest-particles.js << 'EOF'

// 光线交互功能扩展
ForestParticles.lightInteraction = {
  elements: [],
  maxLights: 3,
  
  init() {
    this.createLightLayer();
    this.setupMouseTracking();
  },
  
  createLightLayer() {
    const layer = document.createElement('div');
    layer.className = 'forest-light-effects';
    document.body.appendChild(layer);
    
    for (let i = 0; i < this.maxLights; i++) {
      const light = document.createElement('div');
      light.className = 'forest-light-interaction';
      light.style.display = 'none';
      layer.appendChild(light);
      this.elements.push(light);
    }
  },
  
  setupMouseTracking() {
    let lastX = 0, lastY = 0;
    let lastTime = 0;
    const cooldown = 100; // 毫秒
    
    document.addEventListener('mousemove', (e) => {
      const currentTime = Date.now();
      if (currentTime - lastTime < cooldown) return;
      
      lastTime = currentTime;
      
      // 计算速度
      const speedX = Math.abs(e.clientX - lastX);
      const speedY = Math.abs(e.clientY - lastY);
      const speed = Math.sqrt(speedX * speedX + speedY * speedY);
      
      lastX = e.clientX;
      lastY = e.clientY;
      
      // 速度够快才触发光线
      if (speed > 5) {
        this.createLightAt(e.clientX, e.clientY, speed);
      }
    });
  },
  
  createLightAt(x, y, intensity) {
    // 找到可用的光线元素
    const light = this.elements.find(el => !el.classList.contains('active')) || this.elements[0];
    
    if (!light) return;
    
    // 设置位置和大小
    const size = Math.min(50 + intensity * 2, 150);
    light.style.width = `${size}px`;
    light.style.height = `${size}px`;
    light.style.left = `${x - size/2}px`;
    light.style.top = `${y - size/2}px`;
    
    // 根据主题设置颜色
    const isNight = document.documentElement.getAttribute('data-theme') === 'night';
    light.style.background = isNight
      ? 'radial-gradient(circle, rgba(135, 206, 250, 0.15) 0%, transparent 70%)'
      : 'radial-gradient(circle, rgba(244, 211, 94, 0.2) 0%, transparent 70%)';
    
    // 激活效果
    light.style.display = 'block';
    light.classList.add('active');
    
    // 自动消失
    setTimeout(() => {
      light.classList.remove('active');
      setTimeout(() => {
        light.style.display = 'none';
      }, 300);
    }, 500);
  }
};

// 在初始化时启动光线交互
ForestParticles.init = function() {
  // ... 原有初始化代码 ...
  
  // 添加光线交互初始化
  if (!this.supportsReducedMotion()) {
    this.lightInteraction.init();
  }
  
  console.log('🍃 森林粒子系统已初始化（含光线效果）');
};
EOF
```

- [ ] **Step 3: 更新主题切换时调整光线**

```bash
# 在forest-theme.js的主题切换部分添加光线调整
sed -i '/dispatchThemeChange(theme)/a\
    // 通知粒子系统主题变化\
    if (window.ForestParticles) {\
      window.ForestParticles.pause();\
      setTimeout(() => window.ForestParticles.resume(), 300);\
    }' /home/raniy/myblog/source/js/forest/forest-theme.js
```

- [ ] **Step 4: 创建光线效果测试页面**

```bash
cat > /home/raniy/myblog/test-lights.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #121a0f; height: 100vh; }
    .light { position: absolute; width: 100px; height: 100px; 
             background: radial-gradient(circle, rgba(244,211,94,0.3), transparent);
             border-radius: 50%; filter: blur(20px); }
  </style>
</head>
<body>
  <div class="light" style="top: 100px; left: 100px;"></div>
  <div class="light" style="top: 300px; right: 150px;"></div>
  <script>
    document.addEventListener('mousemove', (e) => {
      const light = document.createElement('div');
      light.className = 'light';
      light.style.left = e.clientX - 50 + 'px';
      light.style.top = e.clientY - 50 + 'px';
      document.body.appendChild(light);
      setTimeout(() => light.remove(), 1000);
    });
  </script>
</body>
</html>
EOF
```

- [ ] **Step 5: 提交光线效果系统**

```bash
git add source/_data/forest-theme.styl \
        source/js/forest/forest-particles.js \
        source/js/forest/forest-theme.js
git commit -m "feat: 添加森林光线效果系统（日间阳光/夜间月光）"
```

---

（由于计划较长，我将分多个部分呈现。这是第一部分，包含基础主题、粒子系统和光线效果。如果您确认这部分计划可行，我将继续呈现音效系统、交互功能和集成测试部分。）