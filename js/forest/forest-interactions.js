/**
 * 森林交互反馈系统
 * 提供鼠标交互效果、阅读引导和探索彩蛋功能
 */

const ForestInteractions = {
  // 配置
  config: {
    // 涟漪效果 - 禁用以避免黄色特效
    ripple: {
      enabled: false,
      color: 'rgba(62, 106, 35, 0.2)', // 使用森林绿色替代琥珀色
      duration: 800, // 毫秒
      maxRipples: 3 // 同时显示的涟漪数量
    },
    
    // 轨迹粒子 - 禁用以避免黄色特效
    trail: {
      enabled: false,
      color: 'rgba(87, 140, 49, 0.3)', // 使用清新绿色替代阳光色
      size: 4,
      count: 8,
      lifetime: 1000 // 毫秒
    },
    
    // 悬停生长 - 启用但使用温和效果
    hoverGrow: {
      enabled: true,
      scale: 1.03, // 更温和的缩放
      duration: 200 // 毫秒
    },
    
    // 阅读引导 - 启用，使用森林绿色
    readingGuide: {
      enabled: true,
      highlightColor: 'rgba(62, 106, 35, 0.2)', // 森林绿色
      treeGrowthSpeed: 0.5 // 进度条生长速度
    },
    
    // 书签系统 - 已禁用
    bookmarks: {
      enabled: false,
      maxBookmarks: 20,
      icon: '📖' // 使用书签图标替代叶子，更明确
    },
    
    // 隐藏的森林生物 - 启用作为小彩蛋
    hiddenAnimals: {
      enabled: true,
      count: 3, // 每篇文章隐藏的动物数量
      animals: ['squirrel', 'owl', 'deer'], // 动物类型
      showOnHover: true // 悬停显示
    },
    
    // 阅读成就系统 - 禁用（后续逐步添加）
    achievements: {
      enabled: false,
      plantsToCollect: 12, // 可收集的植物总数
      discoveryThreshold: 1000 // 阅读字数达到此值可发现植物
    }
  },
  
  // 状态
  ripples: [],
  trailParticles: [],
  hoverElements: new Set(),
  bookmarks: new Map(),
  discoveredPlants: new Set(),
  hiddenAnimalElements: [],
  readingProgress: 0,
  isInitialized: false,
  
  // 初始化交互系统
  init() {
    if (this.isInitialized) {
      console.log('🖱️ 交互系统已初始化');
      return;
    }
    
    // 加载用户数据
    this.loadUserData();
    
    // 设置鼠标交互
    if (this.config.ripple.enabled) {
      this.setupRippleEffect();
    }
    
    if (this.config.trail.enabled) {
      this.setupTrailEffect();
    }
    
    if (this.config.hoverGrow.enabled) {
      this.setupHoverGrow();
    }
    
    // 设置阅读引导
    if (this.config.readingGuide.enabled) {
      this.setupReadingGuide();
    }
    
    // 设置书签系统
    if (this.config.bookmarks.enabled) {
      this.setupBookmarkSystem();
    }
    
    // 设置隐藏动物彩蛋
    if (this.config.hiddenAnimals.enabled) {
      this.setupHiddenAnimals();
    }
    
    // 设置阅读成就
    if (this.config.achievements.enabled) {
      this.setupAchievementSystem();
    }
    
    this.isInitialized = true;
    console.log('🖱️ 森林交互系统已初始化');
  },
  
  // 加载用户数据
  loadUserData() {
    // 加载书签
    const savedBookmarks = localStorage.getItem('forest-library-bookmarks');
    if (savedBookmarks) {
      try {
        this.bookmarks = new Map(JSON.parse(savedBookmarks));
      } catch (e) {
        console.warn('🖱️ 无法加载书签数据', e);
      }
    }
    
    // 加载发现的植物
    const savedPlants = localStorage.getItem('forest-library-discovered-plants');
    if (savedPlants) {
      try {
        this.discoveredPlants = new Set(JSON.parse(savedPlants));
      } catch (e) {
        console.warn('🖱️ 无法加载植物数据', e);
      }
    }
  },
  
  // 保存用户数据
  saveUserData() {
    // 保存书签
    const bookmarksArray = Array.from(this.bookmarks.entries());
    localStorage.setItem('forest-library-bookmarks', JSON.stringify(bookmarksArray));
    
    // 保存发现的植物
    const plantsArray = Array.from(this.discoveredPlants);
    localStorage.setItem('forest-library-discovered-plants', JSON.stringify(plantsArray));
  },
  
  // ============================================================================
  // 鼠标交互系统
  // ============================================================================
  
  // 设置涟漪效果
  setupRippleEffect() {
    document.addEventListener('click', (e) => {
      this.createRipple(e.clientX, e.clientY);
    });
    
    // 定期清理过期的涟漪
    setInterval(() => {
      this.cleanupRipples();
    }, 100);
  },
  
  // 创建涟漪
  createRipple(x, y) {
    // 限制同时显示的涟漪数量
    if (this.ripples.length >= this.config.ripple.maxRipples) {
      this.ripples.shift()?.remove();
    }
    
    const ripple = document.createElement('div');
    ripple.className = 'forest-ripple';
    
    // 设置位置
    ripple.style.left = (x - 20) + 'px';
    ripple.style.top = (y - 20) + 'px';
    
    // 添加到页面
    document.body.appendChild(ripple);
    this.ripples.push(ripple);
    
    // 动画结束后移除
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
      this.ripples = this.ripples.filter(r => r !== ripple);
    }, this.config.ripple.duration);
  },
  
  // 清理过期的涟漪
  cleanupRipples() {
    const now = Date.now();
    this.ripples = this.ripples.filter(ripple => {
      if (!ripple.parentNode) {
        return false;
      }
      return true;
    });
  },
  
  // 设置轨迹粒子效果
  setupTrailEffect() {
    let lastMouseTime = Date.now();
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      const timeDiff = now - lastMouseTime;
      
      // 限制粒子生成频率
      if (timeDiff < 50) {
        return;
      }
      
      // 计算鼠标速度
      const distance = Math.sqrt(
        Math.pow(e.clientX - lastMouseX, 2) + 
        Math.pow(e.clientY - lastMouseY, 2)
      );
      const speed = distance / timeDiff;
      
      // 只在鼠标移动较快时生成粒子
      if (speed > 0.5) {
        this.createTrailParticle(e.clientX, e.clientY);
      }
      
      lastMouseTime = now;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    });
    
    // 定期清理粒子
    setInterval(() => {
      this.cleanupTrailParticles();
    }, 100);
  },
  
  // 创建轨迹粒子
  createTrailParticle(x, y) {
    if (this.trailParticles.length >= this.config.trail.count) {
      const oldest = this.trailParticles.shift();
      if (oldest && oldest.parentNode) {
        oldest.parentNode.removeChild(oldest);
      }
    }
    
    const particle = document.createElement('div');
    particle.className = 'forest-trail-particle';
    
    // 设置位置和大小
    particle.style.left = (x - this.config.trail.size / 2) + 'px';
    particle.style.top = (y - this.config.trail.size / 2) + 'px';
    particle.style.width = this.config.trail.size + 'px';
    particle.style.height = this.config.trail.size + 'px';
    particle.style.backgroundColor = this.config.trail.color;
    
    // 添加随机偏移
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;
    particle.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    // 添加到页面
    document.body.appendChild(particle);
    this.trailParticles.push(particle);
    
    // 粒子淡出并移除
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
      this.trailParticles = this.trailParticles.filter(p => p !== particle);
    }, this.config.trail.lifetime);
  },
  
  // 清理轨迹粒子
  cleanupTrailParticles() {
    this.trailParticles = this.trailParticles.filter(particle => {
      if (!particle.parentNode) {
        return false;
      }
      return true;
    });
  },
  
  // 设置悬停生长效果
  setupHoverGrow() {
    // 为链接和按钮添加悬停效果
    document.addEventListener('mouseover', (e) => {
      const target = e.target;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || 
          target.classList.contains('btn') || target.classList.contains('button')) {
        this.applyHoverGrow(target);
        this.hoverElements.add(target);
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      const target = e.target;
      if (this.hoverElements.has(target)) {
        this.removeHoverGrow(target);
        this.hoverElements.delete(target);
      }
    });
  },
  
  // 应用悬停生长
  applyHoverGrow(element) {
    element.style.transition = `transform ${this.config.hoverGrow.duration}ms ease`;
    element.style.transform = `scale(${this.config.hoverGrow.scale})`;
  },
  
  // 移除悬停生长
  removeHoverGrow(element) {
    element.style.transform = 'scale(1)';
  },
  
  // ============================================================================
  // 阅读引导系统
  // ============================================================================
  
  // 设置阅读引导
  setupReadingGuide() {
    // 监听滚动事件
    window.addEventListener('scroll', () => {
      this.updateReadingProgress();
      this.highlightVisibleSections();
    });
    
    // 初始更新
    setTimeout(() => {
      this.updateReadingProgress();
      this.highlightVisibleSections();
    }, 100);
    
    // 创建进度指示器
    this.createProgressIndicator();
  },
  
  // 更新阅读进度
  updateReadingProgress() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    if (scrollHeight > 0) {
      this.readingProgress = Math.min(scrollTop / scrollHeight, 1);
      this.updateProgressIndicator();
    }
  },
  
  // 高亮可见章节
  highlightVisibleSections() {
    // 移除之前的高亮
    document.querySelectorAll('.forest-section-highlight').forEach(el => {
      el.classList.remove('forest-section-highlight');
    });
    
    // 找到当前可见的章节
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const viewportHeight = window.innerHeight;
    
    headings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= viewportHeight * 0.7) {
        // 高亮当前章节
        let section = heading;
        // 向上找到包含的章节元素
        while (section && !section.classList.contains('post-body') && section.parentElement) {
          section = section.parentElement;
        }
        
        if (section) {
          section.classList.add('forest-section-highlight');
        }
      }
    });
  },
  
  // 创建进度指示器
  createProgressIndicator() {
    // 检查是否已存在
    if (document.getElementById('forest-reading-progress')) {
      return;
    }
    
    const progressContainer = document.createElement('div');
    progressContainer.id = 'forest-reading-progress';
    progressContainer.className = 'forest-reading-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'forest-reading-progress-bar';
    
    const progressTree = document.createElement('div');
    progressTree.className = 'forest-reading-progress-tree';
    progressTree.textContent = '🌲';
    
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressTree);
    
    // 添加到页面
    document.body.appendChild(progressContainer);
  },
  
  // 更新进度指示器
  updateProgressIndicator() {
    const progressBar = document.querySelector('.forest-reading-progress-bar');
    const progressTree = document.querySelector('.forest-reading-progress-tree');
    
    if (progressBar) {
      progressBar.style.height = (this.readingProgress * 100) + '%';
    }
    
    if (progressTree) {
      const container = document.getElementById('forest-reading-progress');
      if (container) {
        const containerHeight = container.offsetHeight;
        const treeTop = this.readingProgress * (containerHeight - 30); // 30px是树图标的高度
        progressTree.style.top = treeTop + 'px';
      }
    }
  },
  
  // ============================================================================
  // 书签系统
  // ============================================================================
  
  // 设置书签系统
  setupBookmarkSystem() {
    // 监听选择文本事件
    document.addEventListener('mouseup', (e) => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText.length > 10 && selectedText.length < 500) {
        // 显示书签添加提示
        this.showBookmarkPrompt(selection, selectedText);
      }
    });
    
    // 创建书签侧边栏
    this.createBookmarkSidebar();
  },
  
  // 显示书签提示
  showBookmarkPrompt(selection, text) {
    // 移除现有提示
    const existingPrompt = document.getElementById('forest-bookmark-prompt');
    if (existingPrompt) {
      existingPrompt.remove();
    }
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    const prompt = document.createElement('div');
    prompt.id = 'forest-bookmark-prompt';
    prompt.className = 'forest-bookmark-prompt';
    prompt.innerHTML = `
      <button class="forest-bookmark-add-btn">${this.config.bookmarks.icon} 添加书签</button>
      <button class="forest-bookmark-cancel-btn">取消</button>
    `;
    
    // 设置位置
    prompt.style.position = 'fixed';
    prompt.style.left = (rect.left + window.scrollX) + 'px';
    prompt.style.top = (rect.bottom + window.scrollY + 5) + 'px';
    
    document.body.appendChild(prompt);
    
    // 添加事件监听
    prompt.querySelector('.forest-bookmark-add-btn').addEventListener('click', () => {
      this.addBookmark(text, range);
      prompt.remove();
    });
    
    prompt.querySelector('.forest-bookmark-cancel-btn').addEventListener('click', () => {
      prompt.remove();
    });
    
    // 3秒后自动消失
    setTimeout(() => {
      if (prompt.parentNode) {
        prompt.remove();
      }
    }, 3000);
  },
  
  // 添加书签
  addBookmark(text, range) {
    if (this.bookmarks.size >= this.config.bookmarks.maxBookmarks) {
      alert('书签数量已达上限，请先删除一些旧书签。');
      return;
    }
    
    const bookmarkId = 'bookmark-' + Date.now();
    const bookmark = {
      id: bookmarkId,
      text: text,
      url: window.location.href,
      timestamp: Date.now(),
      position: this.getRangePosition(range)
    };
    
    this.bookmarks.set(bookmarkId, bookmark);
    this.saveUserData();
    this.updateBookmarkSidebar();
    
    // 显示确认消息
    this.showNotification('书签已添加！');
  },
  
  // 获取范围位置
  getRangePosition(range) {
    const startContainer = range.startContainer;
    const startOffset = range.startOffset;
    
    // 简化实现：使用XPath或CSS选择器
    try {
      const xpath = this.getXPath(startContainer);
      return { xpath, offset: startOffset };
    } catch (e) {
      return { fallback: 'position-not-available' };
    }
  },
  
  // 获取XPath
  getXPath(element) {
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }
    
    const parts = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling = element.previousSibling;
      
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      
      const tagName = element.nodeName.toLowerCase();
      const part = index ? `${tagName}[${index + 1}]` : tagName;
      parts.unshift(part);
      
      element = element.parentNode;
    }
    
    return parts.length ? '/' + parts.join('/') : null;
  },
  
  // 创建书签侧边栏
  createBookmarkSidebar() {
    // 检查是否已存在
    if (document.getElementById('forest-bookmark-sidebar')) {
      return;
    }
    
    const sidebar = document.createElement('div');
    sidebar.id = 'forest-bookmark-sidebar';
    sidebar.className = 'forest-bookmark-sidebar';
    
    const header = document.createElement('div');
    header.className = 'forest-bookmark-header';
    header.innerHTML = `
      <h3>${this.config.bookmarks.icon} 我的书签</h3>
      <button class="forest-bookmark-close-btn">×</button>
    `;
    
    const list = document.createElement('div');
    list.id = 'forest-bookmark-list';
    list.className = 'forest-bookmark-list';
    
    sidebar.appendChild(header);
    sidebar.appendChild(list);
    
    // 添加到页面
    document.body.appendChild(sidebar);
    
    // 更新书签列表
    this.updateBookmarkSidebar();
    
    // 添加事件监听
    header.querySelector('.forest-bookmark-close-btn').addEventListener('click', () => {
      sidebar.style.display = 'none';
    });
    
    // 创建书签切换按钮
    this.createBookmarkToggleButton();
  },
  
  // 创建书签切换按钮
  createBookmarkToggleButton() {
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'forest-bookmark-toggle';
    toggleBtn.className = 'forest-bookmark-toggle';
    toggleBtn.textContent = this.config.bookmarks.icon;
    toggleBtn.setAttribute('aria-label', '显示/隐藏书签');
    
    toggleBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('forest-bookmark-sidebar');
      if (sidebar) {
        sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
      }
    });
    
    // 添加到页面
    const audioControls = document.getElementById('forest-audio-controls');
    if (audioControls) {
      audioControls.appendChild(toggleBtn);
    } else {
      document.body.appendChild(toggleBtn);
    }
  },
  
  // 更新书签侧边栏
  updateBookmarkSidebar() {
    const list = document.getElementById('forest-bookmark-list');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (this.bookmarks.size === 0) {
      list.innerHTML = '<p class="forest-bookmark-empty">暂无书签</p>';
      return;
    }
    
    Array.from(this.bookmarks.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach(bookmark => {
        const item = document.createElement('div');
        item.className = 'forest-bookmark-item';
        item.innerHTML = `
          <div class="forest-bookmark-text">${bookmark.text.substring(0, 100)}${bookmark.text.length > 100 ? '...' : ''}</div>
          <div class="forest-bookmark-actions">
            <button class="forest-bookmark-jump-btn" data-id="${bookmark.id}">跳转</button>
            <button class="forest-bookmark-delete-btn" data-id="${bookmark.id}">删除</button>
          </div>
        `;
        
        list.appendChild(item);
      });
    
    // 添加事件监听
    list.querySelectorAll('.forest-bookmark-jump-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bookmarkId = e.target.dataset.id;
        this.jumpToBookmark(bookmarkId);
      });
    });
    
    list.querySelectorAll('.forest-bookmark-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bookmarkId = e.target.dataset.id;
        this.deleteBookmark(bookmarkId);
      });
    });
  },
  
  // 跳转到书签
  jumpToBookmark(bookmarkId) {
    const bookmark = this.bookmarks.get(bookmarkId);
    if (!bookmark) return;
    
    // 如果书签在当前页面，尝试滚动到位置
    if (bookmark.url === window.location.href && bookmark.position) {
      try {
        // 简化实现：滚动到页面顶部，实际项目中需要更精确的定位
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        console.warn('无法跳转到书签位置', e);
      }
    } else {
      // 跳转到书签所在页面
      window.location.href = bookmark.url;
    }
  },
  
  // 删除书签
  deleteBookmark(bookmarkId) {
    if (confirm('确定要删除这个书签吗？')) {
      this.bookmarks.delete(bookmarkId);
      this.saveUserData();
      this.updateBookmarkSidebar();
      this.showNotification('书签已删除');
    }
  },
  
  // ============================================================================
  // 隐藏的森林生物彩蛋
  // ============================================================================
  
  // 设置隐藏动物
  setupHiddenAnimals() {
    // 在文章内容中随机添加隐藏动物
    const articleContent = document.querySelector('.post-body');
    if (!articleContent) return;
    
    // 获取所有段落
    const paragraphs = articleContent.querySelectorAll('p');
    if (paragraphs.length < 3) return;
    
    // 随机选择几个段落添加动物
    const animalCount = Math.min(this.config.hiddenAnimals.count, paragraphs.length);
    const selectedIndices = new Set();
    
    while (selectedIndices.size < animalCount) {
      selectedIndices.add(Math.floor(Math.random() * paragraphs.length));
    }
    
    Array.from(selectedIndices).forEach((index, i) => {
      const paragraph = paragraphs[index];
      const animalType = this.config.hiddenAnimals.animals[i % this.config.hiddenAnimals.animals.length];
      
      this.addHiddenAnimal(paragraph, animalType);
    });
  },
  
  // 添加隐藏动物
  addHiddenAnimal(paragraph, animalType) {
    const animal = document.createElement('div');
    animal.className = `forest-hidden-animal forest-animal-${animalType}`;
    animal.dataset.animalType = animalType;
    
    // 设置动物图标（使用文本图标作为占位符）
    const animalIcons = {
      squirrel: '🐿️',
      owl: '🦉',
      deer: '🦌'
    };
    
    animal.textContent = animalIcons[animalType] || '🐾';
    animal.style.fontSize = '24px';
    animal.style.opacity = '0.3';
    animal.style.cursor = 'pointer';
    animal.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // 随机位置
    const paragraphRect = paragraph.getBoundingClientRect();
    const offsetX = Math.random() * 20 - 10;
    const offsetY = Math.random() * 20 - 10;
    
    animal.style.position = 'absolute';
    animal.style.left = `calc(50% + ${offsetX}px)`;
    animal.style.top = `calc(50% + ${offsetY}px)`;
    animal.style.transform = 'translate(-50%, -50%)';
    
    // 悬停效果
    if (this.config.hiddenAnimals.showOnHover) {
      animal.addEventListener('mouseenter', () => {
        animal.style.opacity = '1';
        animal.style.transform = 'translate(-50%, -50%) scale(1.2)';
      });
      
      animal.addEventListener('mouseleave', () => {
        animal.style.opacity = '0.3';
        animal.style.transform = 'translate(-50%, -50%) scale(1)';
      });
    }
    
    // 点击效果
    animal.addEventListener('click', () => {
      this.onAnimalClick(animalType);
    });
    
    // 添加到段落
    paragraph.style.position = 'relative';
    paragraph.appendChild(animal);
    this.hiddenAnimalElements.push(animal);
  },
  
  // 动物点击处理
  onAnimalClick(animalType) {
    const messages = {
      squirrel: '🐿️ 松鼠跳走了！',
      owl: '🦉 猫头鹰眨了眨眼睛！',
      deer: '🦌 鹿悄悄地走开了！'
    };
    
    this.showNotification(messages[animalType] || '发现了一只森林动物！');
    
    // 触发动物发现事件
    const event = new CustomEvent('forest-animal-discovered', {
      detail: { animalType, timestamp: new Date().toISOString() }
    });
    document.dispatchEvent(event);
    
    // 播放点击音效（如果音频系统可用）
    if (window.ForestAudio && typeof window.ForestAudio.playClickFeedback === 'function') {
      window.ForestAudio.playClickFeedback();
    }
  },
  
  // ============================================================================
  // 阅读成就系统（转发到新系统）
  // ============================================================================
  
  // 设置成就系统（转发到新系统）
  setupAchievementSystem() {
    // 此函数已由新成就系统处理，这里只保留兼容性事件转发
    
    // 监听滚动事件并转发
    window.addEventListener('scroll', () => {
      // 转发阅读进度事件（简化）
      const event = new CustomEvent('forest-reading-progress', {
        detail: {
          scrollTop: window.pageYOffset || document.documentElement.scrollTop,
          scrollHeight: document.documentElement.scrollHeight
        }
      });
      document.dispatchEvent(event);
    });
    
    console.log('🖱️ 成就系统事件转发已设置');
  },
  
  // 检查是否发现新植物
  checkForPlantDiscovery(totalScrolled, wordCount) {
    if (wordCount === 0) return;
    
    const readPercentage = totalScrolled / (document.documentElement.scrollHeight - window.innerHeight);
    const effectiveReading = wordCount * Math.min(readPercentage, 1);
    
    if (effectiveReading >= this.config.achievements.discoveryThreshold) {
      this.discoverNewPlant();
    }
  },
  
  // 发现新植物
  discoverNewPlant() {
    // 防止重复发现
    if (this.discoveredPlants.size >= this.config.achievements.plantsToCollect) {
      return;
    }
    
    // 随机选择一个未发现的植物
    const availablePlants = Array.from({length: this.config.achievements.plantsToCollect}, (_, i) => i + 1)
      .filter(plantId => !this.discoveredPlants.has(plantId));
    
    if (availablePlants.length === 0) return;
    
    const newPlantId = availablePlants[Math.floor(Math.random() * availablePlants.length)];
    this.discoveredPlants.add(newPlantId);
    this.saveUserData();
    
    // 显示发现通知
    this.showPlantDiscoveryNotification(newPlantId);
  },
  
  // 显示植物发现通知
  showPlantDiscoveryNotification(plantId) {
    const plantNames = [
      '神秘蘑菇', '发光苔藓', '古老橡树', '智慧蕨类', '月光花朵',
      '星光草', '翡翠藤蔓', '水晶果实', '彩虹叶片', '梦境树枝',
      '时光种子', '记忆根须'
    ];
    
    const plantName = plantNames[plantId - 1] || `森林植物 #${plantId}`;
    const plantEmoji = '🌿';
    
    this.showNotification(`${plantEmoji} 发现了新的植物：${plantName}！`);
    
    // 更新植物图鉴
    this.updatePlantHerbarium();
  },
  
  // 创建植物图鉴按钮
  createPlantHerbariumButton() {
    const herbariumBtn = document.createElement('button');
    herbariumBtn.id = 'forest-herbarium-toggle';
    herbariumBtn.className = 'forest-herbarium-toggle';
    herbariumBtn.textContent = '🌿';
    herbariumBtn.setAttribute('aria-label', '植物图鉴');
    
    herbariumBtn.addEventListener('click', () => {
      this.showPlantHerbarium();
    });
    
    // 添加到页面
    const audioControls = document.getElementById('forest-audio-controls');
    if (audioControls) {
      audioControls.appendChild(herbariumBtn);
    } else {
      document.body.appendChild(herbariumBtn);
    }
  },
  
  // 显示植物图鉴
  showPlantHerbarium() {
    // 创建或显示图鉴模态框
    let herbarium = document.getElementById('forest-herbarium');
    
    if (!herbarium) {
      herbarium = document.createElement('div');
      herbarium.id = 'forest-herbarium';
      herbarium.className = 'forest-herbarium';
      
      const header = document.createElement('div');
      header.className = 'forest-herbarium-header';
      header.innerHTML = `
        <h3>🌿 森林植物图鉴</h3>
        <button class="forest-herbarium-close-btn">×</button>
      `;
      
      const grid = document.createElement('div');
      grid.id = 'forest-herbarium-grid';
      grid.className = 'forest-herbarium-grid';
      
      herbarium.appendChild(header);
      herbarium.appendChild(grid);
      document.body.appendChild(herbarium);
      
      // 添加事件监听
      header.querySelector('.forest-herbarium-close-btn').addEventListener('click', () => {
        herbarium.style.display = 'none';
      });
      
      // 点击外部关闭
      herbarium.addEventListener('click', (e) => {
        if (e.target === herbarium) {
          herbarium.style.display = 'none';
        }
      });
    }
    
    // 更新图鉴内容
    this.updatePlantHerbarium();
    
    // 显示模态框
    herbarium.style.display = 'flex';
  },
  
  // 更新植物图鉴
  updatePlantHerbarium() {
    const grid = document.getElementById('forest-herbarium-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const plantNames = [
      '神秘蘑菇', '发光苔藓', '古老橡树', '智慧蕨类', '月光花朵',
      '星光草', '翡翠藤蔓', '水晶果实', '彩虹叶片', '梦境树枝',
      '时光种子', '记忆根须'
    ];
    
    const plantEmojis = ['🍄', '🌱', '🌳', '🌿', '🌸', '☘️', '🌿', '🍇', '🍂', '🌴', '🌰', '🌾'];
    
    for (let i = 1; i <= this.config.achievements.plantsToCollect; i++) {
      const plantCard = document.createElement('div');
      plantCard.className = 'forest-plant-card';
      
      const isDiscovered = this.discoveredPlants.has(i);
      
      if (isDiscovered) {
        plantCard.classList.add('discovered');
        plantCard.innerHTML = `
          <div class="forest-plant-emoji">${plantEmojis[i - 1] || '🌿'}</div>
          <div class="forest-plant-name">${plantNames[i - 1] || `植物 #${i}`}</div>
          <div class="forest-plant-status">已发现</div>
        `;
      } else {
        plantCard.classList.add('undiscovered');
        plantCard.innerHTML = `
          <div class="forest-plant-emoji">❓</div>
          <div class="forest-plant-name">未知植物</div>
          <div class="forest-plant-status">尚未发现</div>
        `;
      }
      
      grid.appendChild(plantCard);
    }
  },
  
  // ============================================================================
  // 通用工具函数
  // ============================================================================
  
  // 显示通知
  showNotification(message) {
    // 移除现有通知
    const existingNotification = document.getElementById('forest-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.id = 'forest-notification';
    notification.className = 'forest-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 自动消失
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  },
  
  // 销毁交互系统
  destroy() {
    // 移除所有事件监听器（简化处理，实际项目中需要更精确的清理）
    document.removeEventListener('click', this.createRipple);
    document.removeEventListener('mousemove', this.createTrailParticle);
    document.removeEventListener('mouseover', this.applyHoverGrow);
    document.removeEventListener('mouseout', this.removeHoverGrow);
    window.removeEventListener('scroll', this.updateReadingProgress);
    window.removeEventListener('scroll', this.highlightVisibleSections);
    document.removeEventListener('mouseup', this.showBookmarkPrompt);
    
    // 移除所有创建的DOM元素
    this.ripples.forEach(ripple => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    });
    
    this.trailParticles.forEach(particle => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
    
    this.hiddenAnimalElements.forEach(animal => {
      if (animal.parentNode) {
        animal.parentNode.removeChild(animal);
      }
    });
    
    // 移除UI元素
    ['forest-reading-progress', 'forest-bookmark-sidebar', 'forest-bookmark-toggle',
     'forest-herbarium-toggle', 'forest-herbarium', 'forest-notification'].forEach(id => {
      const element = document.getElementById(id);
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    });
    
    this.isInitialized = false;
    console.log('🖱️ 森林交互系统已销毁');
  },
  
  // 获取系统状态
  getStatus() {
    return {
      initialized: this.isInitialized,
      bookmarksCount: this.bookmarks.size,
      discoveredPlantsCount: this.discoveredPlants.size,
      readingProgress: this.readingProgress,
      hiddenAnimalsCount: this.hiddenAnimalElements.length
    };
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.ForestInteractions = ForestInteractions;

  // 自动初始化（仅在功能开启时）
  document.addEventListener('DOMContentLoaded', () => {
    const featureEnabled = window.FOREST_THEME_FEATURES && window.FOREST_THEME_FEATURES.hidden_animals;
    if (!featureEnabled) {
      console.log('🖱️ 交互功能未开启，跳过初始化');
      return;
    }

    // 等待主题系统初始化
    const initInteractions = () => {
      if (typeof window.ForestTheme !== 'undefined' && 
          typeof window.ForestTheme.getCurrentTheme === 'function') {
        ForestInteractions.init();
      } else {
        setTimeout(initInteractions, 100);
      }
    };
    setTimeout(initInteractions, 100);
  });
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForestInteractions;
}