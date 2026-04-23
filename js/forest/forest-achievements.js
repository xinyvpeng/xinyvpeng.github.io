/**
 * 森林成就系统
 * 提供12项成就分三类：阅读、探索、互动
 * 通过事件系统与现有功能集成，使用森林绿色调色板避免黄色特效
 */

// ES6+特性兼容性检查
if (typeof Promise === 'undefined') {
  console.error('🏆 浏览器不支持Promise，成就系统无法工作');
  window.ForestAchievements = { init: () => console.warn('成就系统需要Promise支持') };
} else if (typeof Set === 'undefined' || typeof Map === 'undefined') {
  console.warn('🏆 浏览器不支持Set/Map，成就功能受限');
  // 提供简化版本
  window.ForestAchievements = { 
    init: () => console.warn('成就系统需要Set/Map支持'),
    config: { enabled: false }
  };
} else {
  // 正常定义ForestAchievements对象
  const ForestAchievements = {
  // 配置
  config: {
    enabled: true,
    showNotifications: true,
    showProgressIndicator: true,
    maxPlants: 12,
    achievementSound: true,
    localStorageKey: 'forest-achievements-data'
  },

  // 成就定义 - 12项成就分三类
  achievements: {
    // 阅读成就 (4项)
    reading_beginner: {
      id: 'reading_beginner',
      name: '阅读新芽',
      description: '阅读第一篇文章',
      category: 'reading',
      icon: '🌱',
      reward: '解锁阅读统计面板',
      requirement: { type: 'articles_read', target: 1 },
      points: 10,
      unlocked: false,
      progress: 0,
      unlockedAt: null
    },
    reading_learner: {
      id: 'reading_learner',
      name: '阅读幼苗',
      description: '阅读5篇文章',
      category: 'reading',
      icon: '🌿',
      reward: '解锁阅读时间统计',
      requirement: { type: 'articles_read', target: 5 },
      points: 20,
      unlocked: false,
      progress: 0,
      unlockedAt: null
    },
    reading_growing: {
      id: 'reading_growing',
      name: '阅读树苗',
      description: '阅读15篇文章',
      category: 'reading',
      icon: '🌳',
      reward: '解锁阅读进度可视化',
      requirement: { type: 'articles_read', target: 15 },
      points: 30,
      unlocked: false,
      progress: 0,
      unlockedAt: null
    },
    reading_master: {
      id: 'reading_master',
      name: '阅读大树',
      description: '阅读30篇文章',
      category: 'reading',
      icon: '🌲',
      reward: '解锁阅读成就徽章',
      requirement: { type: 'articles_read', target: 30 },
      points: 40,
      unlocked: false,
      progress: 0,
      unlockedAt: null
    },

    // 探索成就 (4项)
    exploration_guide: {
      id: 'exploration_guide',
      name: '森林向导',
      description: '发现第一个隐藏动物',
      category: 'exploration',
      icon: '🦊',
      reward: '解锁动物图鉴',
      requirement: { type: 'animals_discovered', target: 1 },
      points: 15,
      unlocked: false,
      progress: 0,
      unlockedAt: null
    },
    exploration_observer: {
      id: 'exploration_observer',
      name: '自然观察者',
      description: '发现5种隐藏动物',
      category: 'exploration',
      icon: '🦉',
      reward: '解锁动物行为观察',
      requirement: { type: 'animals_discovered', target: 5 },
      points: 25,
      unlocked: false,
      progress: 0,
      unlockedAt: null
    },
    exploration_hunter: {
      id: 'exploration_hunter',
      name: '彩蛋猎人',
      description: '找到所有彩蛋',
      category: 'exploration',
      icon: '🥚',
      reward: '解锁彩蛋收集册',
      requirement: { type: 'easter_eggs_found', target: 3 },
      points: 35,
      unlocked: false,
      progress: 0,
      unlockedAt: null
    },
    exploration_explorer: {
      id: 'exploration_explorer',
      name: '页面探险家',
      description: '访问所有特殊页面',
      category: 'exploration',
      icon: '🧭',
      reward: '解锁隐藏地图',
      requirement: { type: 'special_pages_visited', target: 5 },
      points: 45,
      unlocked: false,
      progress: 0,
      unlockedAt: null
    },

    // 互动成就 (4项)
    interaction_collector: {
      id: 'interaction_collector',
      name: '书签收藏家',
      description: '添加第一个书签',
      category: 'interaction',
      icon: '📑',
      reward: '解锁书签管理功能',
      requirement: { type: 'bookmarks_added', target: 1 },
      points: 12,
      unlocked: false,
      progress: 0,
      unlockedAt: null
    },
    interaction_sharer: {
      id: 'interaction_sharer',
      name: '知识分享者',
      description: '分享3篇文章',
      category: 'interaction',
      icon: '📤',
      reward: '解锁分享统计',
      requirement: { type: 'articles_shared', target: 3 },
      points: 22,
      unlocked: false,
      progress: 0,
      unlockedAt: null
    },
    interaction_gardener: {
      id: 'interaction_gardener',
      name: '评论园丁',
      description: '发表5条评论',
      category: 'interaction',
      icon: '💬',
      reward: '解锁评论高亮',
      requirement: { type: 'comments_posted', target: 5 },
      points: 32,
      unlocked: false,
      progress: 0,
      unlockedAt: null
    },
    interaction_guardian: {
      id: 'interaction_guardian',
      name: '森林守护者',
      description: '完成所有基础成就',
      category: 'interaction',
      icon: '🛡️',
      reward: '解锁守护者徽章',
      requirement: { type: 'achievements_unlocked', target: 11 },
      points: 50,
      unlocked: false,
      progress: 0,
      unlockedAt: null
    }
  },

  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 状态
  state: {
    initialized: false,
    isInitialized: false,
    achievementsData: {},
    pendingNotifications: [],
    stats: {
      articles_read: 0,
      animals_discovered: 0,
      easter_eggs_found: 0,
      special_pages_visited: 0,
      bookmarks_added: 0,
      articles_shared: 0,
      comments_posted: 0,
      achievements_unlocked: 0
    }
  },

  // 初始化
  init() {
    try {
      console.log('🏆 开始初始化成就系统...');
    if (this.state.isInitialized) {
      console.log('🏆 成就系统已初始化');
      return;
    }

    // 读取全局配置
    if (window.FOREST_ACHIEVEMENTS_CONFIG) {
      Object.assign(this.config, window.FOREST_ACHIEVEMENTS_CONFIG);
      console.log('🏆 使用配置中的成就设置');
    }
    
    // 检查是否启用
    if (!this.config.enabled) {
      console.log('🏆 成就系统已禁用，跳过初始化');
      return;
    }
    
    // 应用配置覆盖
    if (this.config.notification_duration) {
      this.notificationDuration = this.config.notification_duration * 1000;
    } else {
      this.notificationDuration = 5000; // 默认5秒
    }
    
    if (this.config.celebration_animations !== undefined) {
      this.enableCelebrationAnimations = this.config.celebration_animations;
    } else {
      this.enableCelebrationAnimations = true; // 默认启用
    }

    // 错误处理：如果localStorage不可用，降级到内存存储
    try {
      // 测试localStorage是否可用
      const testKey = '__forest_achievements_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.storageAvailable = true;
    } catch (error) {
      console.warn('🏆 localStorage不可用，使用内存存储', error);
      this.storageAvailable = false;
      // 初始化内存存储
      this.memoryStorage = {};
    }

    // 加载用户数据
    this.loadAchievements();

    // 设置事件监听
    this.setupEventListeners();

    // 设置阅读检测器（防抖优化）
    this.setupReadingDetector();

    // 创建UI元素
    this.createUIElements();

    this.state.isInitialized = true;
    console.log('🏆 成就系统初始化完成');
  } catch (error) {
    console.error('🏆 成就系统初始化失败:', error);
  }
  },

  // 防抖的滚动检测
  setupReadingDetector() {
    this.currentScrollTotal = 0;
    this.scrollHandler = null;
    this.animalHandler = null;
    this.articleReadFired = false;
    
    // 检查当前页面是否为文章页
    const isArticlePage = !!document.querySelector('.post-block');
    
    const checkReadingDebounced = this.debounce(() => {
      if (isArticlePage) {
        this.checkReadingAchievements();
        // 当滚动超过 80% 且尚未触发时，标记文章已读
        if (!this.articleReadFired && this.currentScrollTotal > 0.8) {
          this.articleReadFired = true;
          this.incrementStat('articles_read', 1);
          const event = new CustomEvent('forest-article-read', {
            detail: { count: 1, scrollDepth: this.currentScrollTotal }
          });
          document.dispatchEvent(event);
        }
      }
    }, 500);
    
    this.scrollHandler = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (scrollHeight > 0) {
        const scrollProgress = scrollTop / scrollHeight;
        this.currentScrollTotal = Math.max(this.currentScrollTotal, scrollProgress);
        checkReadingDebounced();
      }
    };
    
    window.addEventListener('scroll', this.scrollHandler);
    
    this.animalHandler = (e) => {
      const animalType = e.detail?.animalType;
      if (animalType) {
        this.currentScrollTotal += 0.1;
        this.checkReadingAchievements();
      }
    };
    
    document.addEventListener('forest-animal-discovered', this.animalHandler);
    
    console.log('🏆 阅读检测器已设置（防抖优化）');
  },

  // 创建UI元素
  createUIElements() {
    console.log('🏆 创建UI元素...');
    // 创建成就图鉴按钮
    this.createHerbariumButton();
    
    // 创建通知容器
    this.createNotificationContainer();
    
    console.log('🏆 UI元素已创建');
  },
  
  // 创建成就图鉴按钮
  createHerbariumButton() {
    try {
      console.log('🏆 创建成就图鉴按钮...');
      console.log('🏆 document.body:', document.body ? '存在' : '不存在');
      console.log('🏆 页面状态:', document.readyState);
      
      if (document.getElementById('forest-achievements-toggle')) {
        console.log('🏆 成就按钮已存在，跳过创建');
        return;
      }
      
      const toggleBtn = document.createElement('button');
      toggleBtn.id = 'forest-achievements-toggle';
      toggleBtn.className = 'forest-achievements-toggle';
      toggleBtn.setAttribute('aria-label', '成就图鉴');
      toggleBtn.innerHTML = '🏆';
      
      // 添加未读成就徽章
      const badge = document.createElement('span');
      badge.className = 'achievements-badge';
      badge.id = 'forest-achievements-badge';
      badge.style.display = 'none';
      toggleBtn.appendChild(badge);
      
      toggleBtn.addEventListener('click', () => {
        this.showHerbarium();
      });
      
      if (!document.body) {
        console.warn('🏆 document.body不存在，延迟添加按钮');
        setTimeout(() => {
          if (document.body && !document.getElementById('forest-achievements-toggle')) {
            document.body.appendChild(toggleBtn);
            console.log('🏆 成就按钮已延迟添加到页面');
          }
        }, 100);
        return;
      }
      
      document.body.appendChild(toggleBtn);
      console.log('🏆 成就按钮已创建并添加到页面');
      console.log('🏆 按钮位置:', toggleBtn.style.cssText);
    } catch (error) {
      console.error('🏆 创建成就按钮失败:', error);
    }
  },
  
  // 创建通知容器
  createNotificationContainer() {
    // 容器已通过CSS定位，不需要额外创建
  },
  
  // 显示成就图鉴
  showHerbarium() {
    // 如果图鉴已存在，显示它
    let herbarium = document.getElementById('forest-achievements-herbarium');
    
    if (!herbarium) {
      herbarium = document.createElement('div');
      herbarium.id = 'forest-achievements-herbarium';
      herbarium.className = 'forest-achievements-herbarium';
      
      // 构建图鉴内容
      const unlockedCount = this.getUnlockedAchievements().length;
      const totalCount = Object.keys(this.achievements).length;
      
      herbarium.innerHTML = `
        <div class="herbarium-header">
          <h3>🏆 成就图鉴</h3>
          <button class="close-herbarium" aria-label="关闭">✕</button>
        </div>
        <div class="herbarium-progress">
          <div class="progress-text">已收集 ${unlockedCount}/${totalCount} 项成就</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(unlockedCount / totalCount) * 100}%"></div>
          </div>
        </div>
        <div class="herbarium-categories">
          <button class="category-tab active" data-category="all">全部</button>
          <button class="category-tab" data-category="reading">阅读</button>
          <button class="category-tab" data-category="exploration">探索</button>
          <button class="category-tab" data-category="interaction">互动</button>
        </div>
        <div class="herbarium-content">
          <!-- 成就会动态生成 -->
        </div>
        <div class="herbarium-footer">
          <button class="reset-achievements">重置成就数据</button>
        </div>
      `;
      
      document.body.appendChild(herbarium);
      
      // 绑定事件
      herbarium.querySelector('.close-herbarium').addEventListener('click', () => {
        this.hideHerbarium();
      });
      
      herbarium.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
          const category = e.target.dataset.category;
          this.updateHerbariumCategory(category);
          
          // 更新活动标签
          herbarium.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
          e.target.classList.add('active');
        });
      });
      
      herbarium.querySelector('.reset-achievements').addEventListener('click', () => {
        if (confirm('确定要重置所有成就数据吗？此操作不可撤销。')) {
          this.resetAchievements();
          this.hideHerbarium();
          setTimeout(() => this.showHerbarium(), 300);
        }
      });
    }
    
    // 显示图鉴
    herbarium.classList.add('visible');
    this.updateHerbariumContent();
  },
  
  // 更新图鉴内容
  updateHerbariumContent(category = 'all') {
    const herbarium = document.getElementById('forest-achievements-herbarium');
    if (!herbarium) return;
    
    const contentContainer = herbarium.querySelector('.herbarium-content');
    if (!contentContainer) return;
    
    // 筛选成就
    let achievements = Object.values(this.achievements);
    if (category !== 'all') {
      achievements = achievements.filter(a => a.category === category);
    }
    
    // 按解锁状态排序
    achievements.sort((a, b) => {
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      return 0;
    });
    
    // 生成HTML
    const achievementsHtml = achievements.map(achievement => {
      const unlockedClass = achievement.unlocked ? 'unlocked' : 'locked';
      const progress = this.getAchievementProgress(achievement.id);
      
      return `
        <div class="achievement-item ${unlockedClass}" data-id="${achievement.id}">
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-info">
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-description">${achievement.description}</div>
            <div class="achievement-progress">
              ${achievement.unlocked ? 
                `<span class="achievement-date">${new Date(achievement.unlockedAt).toLocaleDateString()}</span>` :
                `<div class="progress-bar">
                  <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
                <span class="progress-text">${progress.progress}/${progress.target}</span>`
              }
            </div>
          </div>
          <div class="achievement-status">
            ${achievement.unlocked ? '✅' : '🔒'}
          </div>
        </div>
      `;
    }).join('');
    
    contentContainer.innerHTML = achievementsHtml || '<div class="no-achievements">暂无成就</div>';
  },
  
  // 更新图鉴分类
  updateHerbariumCategory(category) {
    this.updateHerbariumContent(category);
  },
  
  // 隐藏图鉴
  hideHerbarium() {
    const herbarium = document.getElementById('forest-achievements-herbarium');
    if (herbarium) {
      herbarium.classList.remove('visible');
      setTimeout(() => {
        if (herbarium.parentNode && !herbarium.classList.contains('visible')) {
          herbarium.parentNode.removeChild(herbarium);
        }
      }, 300);
    }
  },

  // 加载成就数据
  loadAchievements() {
    try {
      const savedData = localStorage.getItem(this.config.localStorageKey);
      if (savedData) {
        const data = JSON.parse(savedData);
        
        // 更新成就状态
        Object.keys(data.achievements || {}).forEach(achievementId => {
          if (this.achievements[achievementId]) {
            Object.assign(this.achievements[achievementId], data.achievements[achievementId]);
          }
        });

        // 更新统计
        Object.assign(this.state.stats, data.stats || {});

        console.log('🏆 成就数据已加载');
      } else {
        console.log('🏆 无保存的成就数据，使用默认状态');
      }
    } catch (error) {
      console.warn('🏆 加载成就数据失败，使用默认状态', error);
    }
  },

  // 保存成就数据
  saveAchievements() {
    try {
      const data = {
        achievements: {},
        stats: this.state.stats,
        lastUpdated: new Date().toISOString()
      };

      // 序列化成就可以保存的数据
      Object.keys(this.achievements).forEach(achievementId => {
        const achievement = this.achievements[achievementId];
        data.achievements[achievementId] = {
          unlocked: achievement.unlocked,
          progress: achievement.progress,
          unlockedAt: achievement.unlockedAt
        };
      });

      localStorage.setItem(this.config.localStorageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('🏆 保存成就数据失败', error);
    }
  },

  // 设置事件监听
  setupEventListeners() {
    // 监听成就解锁事件（用于徽章和通知队列）
    document.addEventListener('forest-achievement-unlocked', (e) => {
      const achievement = e.detail?.achievement;
      
      // 添加到待通知队列
      if (achievement && this.state.pendingNotifications) {
        this.state.pendingNotifications.push(achievement);
      }
      
      // 更新徽章
      this.updateAchievementsBadge();
    });
    
    // 监听文章阅读事件
    document.addEventListener('forest-article-read', (e) => {
      this.incrementStat('articles_read', e.detail?.count || 1);
      this.checkReadingAchievements();
    });

    // 监听动物发现事件
    document.addEventListener('forest-animal-discovered', (e) => {
      this.incrementStat('animals_discovered', 1);
      this.checkExplorationAchievements();
    });

    // 监听书签添加事件
    document.addEventListener('forest-bookmark-added', (e) => {
      this.incrementStat('bookmarks_added', 1);
      this.checkInteractionAchievements();
    });

    // 监听文章分享事件
    document.addEventListener('forest-article-shared', (e) => {
      this.incrementStat('articles_shared', 1);
      this.checkInteractionAchievements();
    });

    // 监听评论发布事件
    document.addEventListener('forest-comment-posted', (e) => {
      this.incrementStat('comments_posted', 1);
      this.checkInteractionAchievements();
    });
    
    // 监听文章加载事件
    document.addEventListener('forest-article-loaded', () => {
      // 增加已读文章计数
      this.incrementStat('articles_read', 1);
      this.checkReadingAchievements();
    });
    
    // 监听页面卸载以清理资源
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
    
    // 监听日夜切换事件
    document.addEventListener('forest-theme-change', (e) => {
      const theme = e.detail?.theme;
      if (theme) {
        // 更新图鉴主题样式（如果需要）
        this.updateHerbariumTheme(theme);
      }
    });
    
    // 键盘快捷键（Ctrl+Shift+H 打开成就图鉴）
    if (this.config.enable_keyboard_shortcuts !== false) {
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
          e.preventDefault();
          this.showHerbarium();
        }
      });
    }

    console.log('🏆 成就事件监听器已设置');
  },

  // 更新图鉴主题
  updateHerbariumTheme(theme) {
    const herbarium = document.getElementById('forest-achievements-herbarium');
    if (herbarium) {
      if (theme === 'night') {
        herbarium.style.backgroundColor = 'rgba(10, 15, 20, 0.95)';
      } else {
        herbarium.style.backgroundColor = 'rgba(30, 40, 25, 0.95)';
      }
    }
  },

  // 增加统计值
  incrementStat(statName, amount = 1) {
    if (this.state.stats[statName] !== undefined) {
      this.state.stats[statName] += amount;
      console.log(`🏆 统计更新: ${statName} = ${this.state.stats[statName]}`);
      this.saveAchievements();
    }
  },

  // 检查阅读成就
  checkReadingAchievements() {
    const articlesRead = this.state.stats.articles_read;
    
    this.checkAchievement('reading_beginner', articlesRead >= 1);
    this.checkAchievement('reading_learner', articlesRead >= 5);
    this.checkAchievement('reading_growing', articlesRead >= 15);
    this.checkAchievement('reading_master', articlesRead >= 30);
  },

  // 检查探索成就
  checkExplorationAchievements() {
    const animalsDiscovered = this.state.stats.animals_discovered;
    
    this.checkAchievement('exploration_guide', animalsDiscovered >= 1);
    this.checkAchievement('exploration_observer', animalsDiscovered >= 5);
    // 彩蛋和特殊页面成就需要其他统计
  },

  // 检查互动成就
  checkInteractionAchievements() {
    const bookmarksAdded = this.state.stats.bookmarks_added;
    const articlesShared = this.state.stats.articles_shared;
    const commentsPosted = this.state.stats.comments_posted;
    
    this.checkAchievement('interaction_collector', bookmarksAdded >= 1);
    this.checkAchievement('interaction_sharer', articlesShared >= 3);
    this.checkAchievement('interaction_gardener', commentsPosted >= 5);
  },

  // 检查单个成就
  checkAchievement(achievementId, condition) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return;

    // 更新进度
    if (achievement.requirement.type === 'articles_read') {
      achievement.progress = Math.min(this.state.stats.articles_read, achievement.requirement.target);
    } else if (achievement.requirement.type === 'animals_discovered') {
      achievement.progress = Math.min(this.state.stats.animals_discovered, achievement.requirement.target);
    }
    // 其他类型...

    // 检查是否解锁
    if (condition) {
      this.unlockAchievement(achievementId);
    }
  },

  // 解锁成就
  unlockAchievement(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = new Date().toISOString();
    achievement.progress = achievement.requirement.target;

    // 更新解锁统计
    this.state.stats.achievements_unlocked += 1;

    // 保存
    this.saveAchievements();

    // 显示通知
    if (this.config.showNotifications) {
      this.showAchievementNotification(achievement);
    }

    // 播放音效
    if (this.config.achievementSound) {
      this.playAchievementSound();
    }

    // 触发事件
    this.triggerAchievementUnlockedEvent(achievement);

    console.log(`🏆 成就解锁: ${achievement.name}`);
  },

  // 显示成就通知
  showAchievementNotification(achievement) {
    if (!this.config.showNotifications) return;
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'forest-achievement-notification';
    notification.id = `achievement-notification-${Date.now()}`;
    
    // 计算总进度
    const unlockedCount = this.getUnlockedAchievements().length;
    const totalCount = Object.keys(this.achievements).length;
    const progressPercent = Math.round((unlockedCount / totalCount) * 100);
    
    // 构建通知内容
    notification.innerHTML = `
      <div class="notification-header">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-title">
          <span class="achievement-name">${achievement.name}</span>
          <span class="achievement-status">成就解锁！</span>
        </div>
      </div>
      <div class="notification-body">
        <div class="achievement-description">${achievement.description}</div>
        <div class="achievement-reward">
          <span class="reward-emoji">🎁</span>
          <span class="reward-text">${achievement.reward}</span>
        </div>
        <div class="achievement-progress">
          <div>进度：${unlockedCount}/${totalCount} 项成就</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progressPercent}%"></div>
          </div>
        </div>
      </div>
      <div class="notification-footer">
        <span class="achievement-date">${new Date().toLocaleTimeString()}</span>
        <button class="close-notification" aria-label="关闭">✕</button>
      </div>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 添加关闭事件
    notification.querySelector('.close-notification').addEventListener('click', () => {
      this.hideNotification(notification);
    });
    
    // 自动隐藏（使用配置的持续时间）
    setTimeout(() => {
      this.hideNotification(notification);
    }, this.notificationDuration || 5000);
    
    // 更新徽章
    this.updateAchievementsBadge();
  },
  
  // 隐藏通知
  hideNotification(notification) {
    notification.classList.add('hiding');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  },
  
  // 更新成就徽章
  updateAchievementsBadge() {
    const badge = document.getElementById('forest-achievements-badge');
    if (!badge) return;
    
    // 徽章逻辑可以在这里实现，比如显示未读成就数量
    // 目前只是显示徽章
    badge.style.display = 'inline-block';
  },

  // 播放成就音效
  playAchievementSound() {
    if (!this.config.achievementSound) return;
    
    // 使用音频系统的成就音效
    if (typeof window.ForestAudio !== 'undefined') {
      // 检查音频系统是否初始化
      if (typeof window.ForestAudio.playAchievementSound === 'function') {
        window.ForestAudio.playAchievementSound();
      } else if (typeof window.ForestAudio.playSound === 'function') {
        // 回退到playSound
        window.ForestAudio.playSound('achievement');
      }
    } else {
      // 简单的浏览器音效
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('🏆 音效播放失败', error);
      }
    }
  },

  // 触发成就解锁事件
  triggerAchievementUnlockedEvent(achievement) {
    const event = new CustomEvent('forest-achievement-unlocked', {
      detail: {
        achievement: achievement,
        timestamp: new Date().toISOString()
      }
    });
    document.dispatchEvent(event);
  },

  // 获取成就进度
  getAchievementProgress(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement) return { progress: 0, target: 0, percentage: 0 };

    const target = achievement.requirement.target;
    const progress = achievement.unlocked ? target : achievement.progress;
    const percentage = Math.min(Math.round((progress / target) * 100), 100);

    return { progress, target, percentage };
  },

  // 获取分类成就
  getAchievementsByCategory(category) {
    return Object.values(this.achievements).filter(a => a.category === category);
  },

  // 获取已解锁成就
  getUnlockedAchievements() {
    return Object.values(this.achievements).filter(a => a.unlocked);
  },

  // 获取总进度
  getOverallProgress() {
    const total = Object.keys(this.achievements).length;
    const unlocked = this.getUnlockedAchievements().length;
    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100)
    };
  },

  // 重置成就数据（开发用）
  resetAchievements() {
    if (!confirm('确定要重置所有成就数据吗？此操作不可撤销。')) {
      return;
    }

    Object.keys(this.achievements).forEach(achievementId => {
      const achievement = this.achievements[achievementId];
      achievement.unlocked = false;
      achievement.progress = 0;
      achievement.unlockedAt = null;
    });

    Object.keys(this.state.stats).forEach(stat => {
      this.state.stats[stat] = 0;
    });

    this.saveAchievements();
    console.log('🏆 成就数据已重置');
  },
  
  // 清理函数（页面卸载时调用）
  cleanup() {
    // 移除事件监听器
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
    
    if (this.animalHandler) {
      document.removeEventListener('forest-animal-discovered', this.animalHandler);
    }
    
    // 保存最后状态
    this.saveAchievements();
    
    console.log('🏆 成就系统已清理');
  }
};

  // 导出到全局
  if (typeof window !== 'undefined') {
    window.ForestAchievements = ForestAchievements;

    // 自动初始化（仅在功能开启时）
    document.addEventListener('DOMContentLoaded', () => {
      const featureEnabled = window.FOREST_THEME_FEATURES && window.FOREST_THEME_FEATURES.achievements;
      if (!featureEnabled) {
        console.log('🏆 成就功能未开启，跳过初始化');
        return;
      }

      // 等待主题系统初始化
      const initAchievements = () => {
        if (typeof window.ForestTheme !== 'undefined' && 
            typeof window.ForestTheme.getCurrentTheme === 'function') {
          window.ForestAchievements.init();
        } else {
          setTimeout(initAchievements, 100);
        }
      };
      setTimeout(initAchievements, 100);
    });
  }
}

