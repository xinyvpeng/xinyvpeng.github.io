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
    console.log('🌲 开始初始化森林主题系统...');
    this.loadUserPreference();
    console.log('🌲 当前主题偏好:', this.currentTheme);
    this.setupThemeToggle();
    this.applyTheme(this.currentTheme);
    console.log('🌲 森林主题系统已初始化，当前主题:', this.currentTheme);
    
    // 立即检查按钮状态
    this.checkToggleButton();
    
    // 延迟再次检查，确保按钮可见
    setTimeout(() => {
      this.checkToggleButton();
    }, 500);
  },
  
  // 检查并修复切换按钮
  checkToggleButton() {
    const toggleBtn = document.getElementById('forest-theme-toggle');
    console.log('🌲 检查主题切换按钮:', toggleBtn ? '已找到' : '未找到');
    
    if (!toggleBtn) {
      console.warn('🌲 主题切换按钮未找到，尝试重新创建...');
      this.setupThemeToggle();
      return;
    }
    
    // 检查按钮是否可见
    const rect = toggleBtn.getBoundingClientRect();
    const style = window.getComputedStyle(toggleBtn);
    console.log('🌲 按钮位置:', rect);
    console.log('🌲 按钮样式:', {
      display: style.display,
      visibility: style.visibility,
      opacity: style.opacity,
      zIndex: style.zIndex,
      position: style.position
    });
    
    // 如果按钮不可见，尝试修复
    if (rect.width === 0 || rect.height === 0 || style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      console.warn('🌲 按钮不可见，尝试修复...');
      toggleBtn.style.display = 'flex';
      toggleBtn.style.visibility = 'visible';
      toggleBtn.style.opacity = '1';
      toggleBtn.style.zIndex = '9999';
      toggleBtn.style.position = 'fixed';
      toggleBtn.style.top = '20px';
      toggleBtn.style.right = '20px';
    }
    
    // 确保按钮在视图中
    if (rect.top < 0 || rect.left < 0 || rect.bottom > window.innerHeight || rect.right > window.innerWidth) {
      console.warn('🌲 按钮在视图外，调整位置...');
      toggleBtn.style.top = '20px';
      toggleBtn.style.right = '20px';
    }
  },

  // 加载用户偏好
  loadUserPreference() {
    // 优先使用HTML中已设置的主题（支持服务器端渲染）
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    if (htmlTheme === 'dark' || htmlTheme === 'night') {
      this.currentTheme = 'night';
      return;
    }
    
    const savedTheme = localStorage.getItem('forest-library-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.currentTheme = savedTheme || (prefersDark ? 'night' : 'day');
  },

  // 应用主题到页面
  applyTheme(theme) {
    console.log('🌲 应用主题:', theme);
    const root = document.documentElement;
    
    // 移除旧主题属性，添加新主题属性
    // 支持多种主题属性格式，确保与NexT主题兼容
    root.removeAttribute('data-theme');
    root.classList.remove('theme-dark', 'theme-night');
    
    if (theme === 'night') {
      root.setAttribute('data-theme', 'night');
      root.setAttribute('data-mode', 'dark'); // 兼容NexT主题
      root.classList.add('theme-dark', 'theme-night');
      
      // 尝试禁用NexT的自动暗色模式检测
      try {
        if (window.NexT && window.NexT.utils) {
          // NexT主题的暗色模式API
          window.NexT.utils.setTheme('dark');
        }
      } catch (e) {
        console.log('🌲 NexT主题集成:', e.message);
      }
    } else {
      // 日间模式
      root.setAttribute('data-theme', 'day');
      root.setAttribute('data-mode', 'light'); // 兼容NexT主题
      root.classList.add('theme-day');
      
      try {
        if (window.NexT && window.NexT.utils) {
          window.NexT.utils.setTheme('light');
        }
      } catch (e) {
        console.log('🌲 NexT主题集成:', e.message);
      }
    }
    
    // 更新CSS变量
    this.updateThemeVariables(theme);
    
    // 保存偏好
    this.currentTheme = theme;
    localStorage.setItem('forest-library-theme', theme);
    
    // 调试：显示应用后的属性
    console.log('🌲 主题应用完成:', {
      'data-theme': root.getAttribute('data-theme'),
      'data-mode': root.getAttribute('data-mode'),
      'classList': Array.from(root.classList),
      'currentTheme': this.currentTheme
    });
    
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
      toggleBtn.setAttribute('tabindex', '0'); // 确保可通过键盘访问
      
      // 强制应用关键样式，防止CSS加载延迟
      toggleBtn.style.display = 'flex';
      toggleBtn.style.alignItems = 'center';
      toggleBtn.style.justifyContent = 'center';
      toggleBtn.style.position = 'fixed';
      toggleBtn.style.top = '20px';
      toggleBtn.style.right = '20px';
      toggleBtn.style.zIndex = '9999';
      toggleBtn.style.cursor = 'pointer';
      
      // 添加到文档末尾，确保在DOM最上层
      document.body.appendChild(toggleBtn);
      
      console.log('🌲 主题切换按钮已创建并添加到页面');
    }
    
    // 更新按钮状态
    this.updateToggleButton();
    
    // 添加点击事件
    toggleBtn.addEventListener('click', () => {
      const newTheme = this.currentTheme === 'day' ? 'night' : 'day';
      console.log('🌲 切换主题:', this.currentTheme, '->', newTheme);
      this.applyTheme(newTheme);
      this.updateToggleButton();
    });
    
    // 添加键盘支持（Enter键和空格键）
    toggleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const newTheme = this.currentTheme === 'day' ? 'night' : 'day';
        console.log('🌲 键盘切换主题:', this.currentTheme, '->', newTheme);
        this.applyTheme(newTheme);
        this.updateToggleButton();
      }
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

// 全局导出
if (typeof window !== 'undefined') {
  window.ForestTheme = ForestTheme;
  
  // 自动初始化
  document.addEventListener('DOMContentLoaded', () => {
    ForestTheme.init();
  });
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForestTheme;
}