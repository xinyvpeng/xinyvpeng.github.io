/**
 * 森林成就系统
 * 提供12项成就分三类：阅读、探索、互动
 * 通过事件系统与现有功能集成，使用森林绿色调色板避免黄色特效
 */

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

  // 状态
  state: {
    initialized: false,
    isInitialized: false,
    achievementsData: {},
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
    if (this.state.isInitialized) {
      console.log('🏆 成就系统已初始化');
      return;
    }

    // 读取全局配置
    if (window.FOREST_ACHIEVEMENTS_CONFIG) {
      Object.assign(this.config, window.FOREST_ACHIEVEMENTS_CONFIG);
      console.log('🏆 使用配置中的成就设置');
    }

    // 加载用户数据
    this.loadAchievements();

    // 设置事件监听
    this.setupEventListeners();

    this.state.isInitialized = true;
    console.log('🏆 成就系统初始化完成');
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

    console.log('🏆 成就事件监听器已设置');
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
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'forest-achievement-notification';
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
      </div>
      <div class="notification-footer">
        <span class="achievement-date">刚刚</span>
        <button class="close-notification">✕</button>
      </div>
    `;

    // 添加到页面
    document.body.appendChild(notification);

    // 绑定关闭按钮
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
      notification.classList.add('hiding');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    });

    // 自动关闭
    setTimeout(() => {
      if (notification.parentNode && !notification.classList.contains('hiding')) {
        notification.classList.add('hiding');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 500);
      }
    }, 5000);
  },

  // 播放成就音效
  playAchievementSound() {
    // 使用音频系统的成就音效
    if (typeof window.ForestAudio !== 'undefined') {
      window.ForestAudio.playSound('achievement');
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
  }
};

// 导出到全局
if (typeof window !== 'undefined') {
  window.ForestAchievements = ForestAchievements;
}

export default ForestAchievements;