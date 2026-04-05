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