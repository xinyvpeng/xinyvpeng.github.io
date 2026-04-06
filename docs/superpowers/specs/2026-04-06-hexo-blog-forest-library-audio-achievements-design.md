# Hexo博客森林图书馆音频与成就系统设计规范

## 项目概述

### 设计背景
基于已完成的森林图书馆主题视觉刷新，进一步深化用户体验，增加沉浸式环境音效和游戏化成就系统。通过纯自然环境音效提升阅读氛围，通过三类成就系统（阅读、探索、互动）激励用户深入探索博客内容。

### 现有基础分析
1. **音频系统基础**：`forest-audio.js`已实现Web Audio API基础框架，定义了6种环境音效，但缺少用户界面和控制功能
2. **成就系统基础**：`forest-interactions.js`已实现植物收集成就框架（12种植物）和简单检测逻辑，但成就类型单一
3. **用户界面空白**：缺少音频控制面板和完整的成就展示界面
4. **集成需求**：需要将音频、成就与现有隐藏动物、书签系统有机整合

### 设计目标
1. **沉浸式音频体验**：提供纯自然环境音效（鸟鸣、风声、溪流等），默认静音，用户手动控制
2. **完整成就体系**：建立三类12项成就系统，覆盖阅读、探索、互动行为
3. **优雅用户界面**：右下角浮动音频按钮、温和成就通知、集成图鉴界面
4. **森林绿色主题**：所有视觉元素使用森林绿色调色板，完全避免黄色特效
5. **数据持久化**：使用localStorage保存用户进度和偏好设置

## 设计解决方案

### 1. 音频系统详细设计

#### 系统架构
- **模块位置**：`source/js/forest/forest-audio.js`（扩展现有文件）
- **依赖关系**：独立模块，与森林交互系统通过事件通信
- **初始化**：Hexo页面加载后自动初始化，但保持静音状态

#### 音效定义（基于现有6种音效）
| 音效ID | 名称 | 路径 | 默认音量 | 描述 |
|--------|------|------|----------|------|
| `birds` | 鸟鸣 | `/audio/birds.mp3` | 40% | 清晨森林鸟鸣声 |
| `wind` | 风声 | `/audio/wind.mp3` | 30% | 轻柔的森林微风 |
| `leaves` | 树叶声 | `/audio/leaves.mp3` | 20% | 树叶沙沙声 |
| `rain` | 雨声 | `/audio/rain.mp3` | 60% | 舒缓的雨声 |
| `stream` | 溪流声 | `/audio/stream.mp3` | 50% | 山间溪流声 |
| `click` | 点击反馈 | `/audio/click.mp3` | 10% | 点击交互音效 |

#### 用户界面设计

##### 浮动控制按钮
```
位置：页面右下角，fixed定位，z-index: 9999
尺寸：48px × 48px，圆形按钮
状态：
  - 静音态：🎵 音符图标（灰色，#949C8F）
  - 播放态：🎶 音符图标（森林绿色，#5E8C31 + 呼吸动画）
  - 悬停态：放大到1.1倍，柔和阴影
交互：点击展开控制面板，再次点击收起
```

##### 展开控制面板
```
布局：从按钮向上展开，宽度280px，最大高度400px
内容结构：
  1. 标题栏：森林音效 🎧
  2. 主音量控制：滑块（0-100%），森林绿色滑块
  3. 音效列表（6项，每项包含）：
     - 复选框（启用/禁用）
     - 音效名称和图标
     - 独立音量滑块（仅当启用时显示）
  4. 预设按钮区域：
     - "晨林"：鸟鸣+风声（主音量50%）
     - "雨林"：雨声+树叶声（主音量60%）
     - "溪畔"：溪流+风声（主音量40%）
  5. 关闭按钮：×
```

#### 播放策略与数据持久化
```javascript
// 播放策略
1. 用户驱动：首次必须手动点击播放按钮
2. 跨页保持：页面跳转时保持播放状态（localStorage）
3. 智能淡入：播放时音效从0渐增至设定音量（1.5秒）
4. 节能模式：页面隐藏时自动暂停，显示时恢复

// 数据持久化结构
localStorage.setItem('forest-audio-settings', JSON.stringify({
  enabled: true,           // 是否启用音频
  masterVolume: 0.5,       // 主音量
  enabledSounds: {         // 启用的音效
    birds: true,
    wind: true,
    stream: false,
    leaves: false,
    rain: false,
    click: true
  },
  soundVolumes: {          // 各音效独立音量
    birds: 0.4,
    wind: 0.3,
    stream: 0.5,
    leaves: 0.2,
    rain: 0.6,
    click: 0.1
  },
  lastState: 'playing'     // 最后状态（playing/paused）
}));
```

### 2. 成就系统详细设计

#### 系统架构
- **模块位置**：新创建 `source/js/forest/forest-achievements.js`
- **继承关系**：替代 `forest-interactions.js` 中的成就框架，保持向后兼容
- **检测引擎**：三类检测器（阅读、探索、互动）独立工作，共享数据存储

#### 成就分类与详细列表

##### A. 阅读成就（基于阅读行为和字数统计）

| 成就ID | 名称 | 图标 | 触发条件 | 解锁奖励 | 关联植物 |
|--------|------|------|----------|----------|----------|
| `reading-seedling` | 阅读幼苗 | 🌱 | 阅读第一篇文章（任意长度） | 基础阅读者徽章 | 神秘蘑菇 (#1) |
| `knowledge-explorer` | 知识探索者 | 📚 | 累计阅读10,000字 | 中等阅读者徽章 | 古老橡树 (#3) |
| `forest-scholar` | 森林学者 | 🎓 | 累计阅读50,000字 | 高级阅读者徽章 | 翡翠藤蔓 (#6) |
| `immersive-reader` | 沉浸阅读者 | 🌲 | 单篇文章阅读时长超过10分钟 | 专注阅读徽章 | 时光种子 (#9) |

**检测机制**：
1. 文章字数：通过 `document.querySelector('.post-body')` 估算
2. 阅读时长：基于页面焦点和滚动行为计算有效阅读时间
3. 累计统计：跨会话存储，通过 `localStorage` 持久化

##### B. 探索成就（与隐藏动物和彩蛋系统集成）

| 成就ID | 名称 | 图标 | 触发条件 | 解锁奖励 | 关联植物 |
|--------|------|------|----------|----------|----------|
| `animal-observer` | 动物观察者 | 🐿️ | 发现第一个隐藏动物（松鼠） | 动物爱好者徽章 | 发光苔藓 (#2) |
| `forest-detective` | 森林侦探 | 🦉 | 发现所有3种隐藏动物（松鼠、猫头鹰、鹿） | 探险家徽章 | 月光花朵 (#5) |
| `easter-egg-hunter` | 彩蛋猎人 | 🥚 | 发现页面中的特殊彩蛋（后续添加） | 探索者徽章 | 彩虹叶片 (#8) |

**检测机制**：
1. 动物发现：监听 `forest-animal-discovered` 事件
2. 彩蛋发现：通过特殊DOM元素点击或URL参数检测
3. 进度跟踪：记录已发现的动物和彩蛋类型

##### C. 互动成就（与书签、分享、评论系统集成）

| 成就ID | 名称 | 图标 | 触发条件 | 解锁奖励 | 关联植物 |
|--------|------|------|----------|----------|----------|
| `bookmark-collector` | 书签收藏家 | 📖 | 添加第一个书签 | 书签新手徽章 | 智慧蕨类 (#4) |
| `share-promoter` | 分享传播者 | 📣 | 首次分享文章（点击分享按钮） | 社交分享徽章 | 水晶果实 (#7) |
| `comment-contributor` | 评论贡献者 | 💬 | 首次发表评论（如果启用评论系统） | 社区贡献者徽章 | 梦境树枝 (#10) |
| `interaction-master` | 互动大师 | ✨ | 完成所有互动成就（书签+分享+评论） | 森林互动大师徽章 | 记忆根须 (#12) |

**检测机制**：
1. 书签添加：监听 `forest-bookmark-added` 事件
2. 分享行为：监听分享按钮点击或社交媒体API回调
3. 评论提交：通过评论系统回调或DOM变化检测

#### 成就检测系统架构

```javascript
const AchievementDetector = {
  // 阅读检测器
  reading: {
    totalWords: 0,           // 累计阅读字数
    currentArticleWords: 0,  // 当前文章字数
    readingStartTime: null,  // 当前阅读开始时间
    articlesRead: 0,         // 已阅读文章数
    checkReadingProgress() {
      // 基于滚动和焦点计算有效阅读
    }
  },
  
  // 探索检测器  
  exploration: {
    discoveredAnimals: new Set(['squirrel', 'owl', 'deer']), // 已发现的动物
    foundEasterEggs: new Set(),    // 已发现的彩蛋
    specialPagesVisited: new Set(), // 访问的特殊页面
    checkAnimalDiscovery(animalType) {
      this.discoveredAnimals.add(animalType);
      this.checkAchievements();
    }
  },
  
  // 互动检测器
  interaction: {
    bookmarksAdded: 0,       // 添加的书签数量
    articlesShared: 0,       // 分享的文章数量
    commentsPosted: 0,       // 发表的评论数量
    checkBookmarkAdded() {
      this.bookmarksAdded++;
      this.checkAchievements();
    }
  },
  
  // 成就状态管理
  unlockedAchievements: new Set(),  // 已解锁成就ID
  pendingNotifications: [],         // 待显示的通知
  
  // 主检测函数
  checkAchievements() {
    // 检查所有成就条件，触发解锁事件
  }
};
```

#### 通知系统设计

##### 位置与样式
```
位置：页面右下角，音频按钮左侧，间距10px
尺寸：最大宽度300px，自动高度，内边距12px
样式：
  - 背景：森林绿色 (#5E8C31) 透明度0.9
  - 文字：白色 (#FFFFFF)，14px，1.5行高
  - 边框：1px solid #9ACD32，圆角8px
  - 阴影：0 4px 12px rgba(0, 0, 0, 0.15)
动画：
  - 入场：从下方滑入 translateY(20px)，透明度0→1，时长0.3s
  - 停留：显示3秒
  - 退场：淡出透明度1→0，时长0.5s
层级：z-index: 9998（音频按钮为9999）
```

##### 通知内容模板
```
[成就图标] [成就名称] 解锁！
────────────────────
[成就描述]
奖励：发现了新的植物：[植物名称] 🌿
当前进度：[进度数字]/[总进度]
```

##### 庆祝动画设计（完全避免黄色）
1. **粒子效果**：
   - 颜色：森林绿色 (#9ACD32) 和苔藓绿 (#87CEEB)
   - 数量：8-12个粒子
   - 运动：从成就位置向上随机飘散
   - 时长：2秒后淡出

2. **发光效果**：
   - 颜色：天蓝色 (#87CEEB) 透明度0.3
   - 尺寸：从成就位置向外扩散
   - 时长：1.5秒脉冲效果

3. **图标动画**：
   - 缩放：轻微放大再恢复 (scale: 1 → 1.2 → 1)
   - 旋转：轻微旋转 (-5deg → 5deg → 0deg)
   - 时长：0.6秒完成

#### 图鉴界面设计

##### 扩展现有植物图鉴
```
布局结构：
  ┌─────────────────────────────────┐
  │ 森林成就图鉴                    │
  │ [植物] [阅读] [探索] [互动]      │ ← 选项卡
  ├─────────────────────────────────┤
  │                                 │
  │ 成就网格展示（3×4布局）          │
  │                                 │
  │  ┌───┐ ┌───┐ ┌───┐             │
  │  │   │ │   │ │   │             │
  │  └───┘ └───┘ └───┘             │
  │                                 │
  │ 进度统计：                      │
  │ • 阅读：12,345/50,000字        │
  │ • 探索：2/3动物，0/1彩蛋       │
  │ • 互动：3书签，1分享，0评论     │
  └─────────────────────────────────┘
```

##### 成就卡片设计
```
已解锁卡片：
  - 背景：森林绿色 (#5E8C31) 渐变
  - 图标：彩色成就图标
  - 名称：成就名称（白色文字）
  - 状态："已解锁"徽章
  - 描述：成就触发条件描述
  - 奖励：关联植物图标和名称

未解锁卡片：
  - 背景：灰度背景 (#3A3A3A)
  - 图标：问号"？"图标
  - 名称："未知成就"
  - 状态："待解锁"
  - 描述：显示解锁条件（如"阅读50,000字"）
  - 奖励：隐藏的植物图标
```

#### 数据持久化结构

```javascript
// 扩展的成就存储结构
localStorage.setItem('forest-achievements', JSON.stringify({
  // 阅读数据
  totalWordsRead: 12345,
  articlesRead: 5,
  longestSession: 650, // 秒
  readingSessions: [    // 阅读会话记录
    { date: '2026-04-06', duration: 300, words: 2500 }
  ],
  
  // 探索数据
  discoveredAnimals: ['squirrel', 'owl'],
  foundEasterEggs: [],
  specialPagesVisited: ['about', 'archives'],
  
  // 互动数据
  bookmarksAdded: 3,
  articlesShared: 1,
  commentsPosted: 0,
  lastInteractionDate: '2026-04-06',
  
  // 成就状态
  unlockedAchievements: ['reading-seedling', 'animal-observer'],
  collectedPlants: [1, 2, 3, 4], // 植物ID列表
  
  // 统计信息
  firstVisitDate: '2026-04-06',
  lastAchievementDate: '2026-04-06T14:30:00Z',
  totalAchievementPoints: 150,
  
  // 用户偏好
  showNotifications: true,
  showCelebrationAnimations: true,
  achievementSoundEnabled: true
}));
```

### 3. 系统集成与配置

#### 模块初始化流程
```javascript
// 在 _config.next.yml 中配置
forest_theme:
  features:
    audio: true                    # 启用音频系统
    achievements: true             # 启用成就系统
    hidden_animals: true           # 启用隐藏动物
    bookmarks: false               # 书签系统暂不启用
    
  audio:
    enabled: false                 # 默认静音
    default_preset: 'morning'      # 默认预设
    
  achievements:
    enabled: true
    show_notifications: true
    show_progress_indicator: true
    max_plants: 12                 # 植物总数
    achievement_sound: true        # 成就解锁音效
```

#### 事件通信系统
```javascript
// 成就解锁事件
document.addEventListener('forest-achievement-unlocked', (e) => {
  const { id, type, reward } = e.detail;
  
  // 1. 显示通知
  if (ForestAchievements.config.showNotifications) {
    ForestAchievements.showAchievementNotification(id, reward);
  }
  
  // 2. 播放庆祝音效
  if (window.ForestAudio && ForestAudio.config.enabled) {
    ForestAudio.playAchievementSound();
  }
  
  // 3. 更新图鉴
  ForestAchievements.updateHerbarium();
  
  // 4. 保存进度
  ForestAchievements.saveProgress();
});

// 动物发现事件（与现有系统集成）
document.addEventListener('forest-animal-discovered', (e) => {
  const { animalType } = e.detail;
  
  // 通知成就系统
  if (window.ForestAchievements) {
    ForestAchievements.exploration.checkAnimalDiscovery(animalType);
  }
});

// 书签添加事件
document.addEventListener('forest-bookmark-added', (e) => {
  if (window.ForestAchievements) {
    ForestAchievements.interaction.checkBookmarkAdded();
  }
});
```

#### 错误处理与兼容性
1. **音频API兼容性**：
   ```javascript
   if (!window.AudioContext && !window.webkitAudioContext) {
     console.warn('浏览器不支持Web Audio API，音频功能不可用');
     ForestAudio.config.enabled = false;
     ForestAudio.hideControls(); // 隐藏音频控制按钮
   }
   ```

2. **本地存储回退**：
   ```javascript
   try {
     localStorage.setItem('test', 'test');
     localStorage.removeItem('test');
   } catch (e) {
     console.warn('localStorage不可用，使用内存存储');
     ForestAchievements.useMemoryStorage = true;
   }
   ```

3. **CSS特性检测**：
   ```javascript
   // 检测CSS Grid支持
   const cssGridSupported = CSS.supports('display', 'grid');
   if (!cssGridSupported) {
     // 使用flexbox回退布局
   }
   ```

### 4. 实施计划概要

#### 第一阶段：音频系统完善（预计1-2天）
1. 完善 `forest-audio.js` 的用户界面部分
2. 实现浮动控制按钮和展开面板
3. 添加预设音效组合功能
4. 测试跨页面状态保持

#### 第二阶段：成就系统开发（预计2-3天）
1. 创建 `forest-achievements.js` 新模块
2. 实现三类成就检测器
3. 开发通知系统和庆祝动画
4. 创建扩展的图鉴界面

#### 第三阶段：系统集成与测试（预计1天）
1. 配置模块间事件通信
2. 测试与现有系统（隐藏动物、书签）的集成
3. 进行兼容性测试
4. 用户验收测试

#### 第四阶段：优化与部署（预计0.5天）
1. 性能优化（懒加载、资源压缩）
2. 添加配置选项
3. 更新文档和使用说明
4. 部署到生产环境

### 5. 成功标准与验收指标

#### 功能验收标准
1. **音频系统**：
   - ✅ 浮动按钮正常显示和交互
   - ✅ 6种音效可独立控制开关和音量
   - ✅ 预设组合一键应用
   - ✅ 跨页面状态保持
   - ✅ 节能模式工作正常

2. **成就系统**：
   - ✅ 12项成就可正常解锁
   - ✅ 三类检测器准确识别用户行为
   - ✅ 通知系统及时显示成就解锁
   - ✅ 图鉴界面完整展示进度
   - ✅ 数据持久化跨会话有效

3. **系统集成**：
   - ✅ 与隐藏动物系统无缝集成
   - ✅ 事件通信机制工作正常
   - ✅ 日夜模式切换不影响功能
   - ✅ 移动端适配良好

#### 性能指标
1. 页面加载时间增加 < 500ms
2. 内存使用增加 < 10MB
3. 音频CPU占用 < 5%
4. 动画帧率稳定在60fps

#### 用户体验指标
1. 音频控制按钮点击率 > 30%
2. 成就解锁率（首日）> 20%
3. 用户平均成就解锁数 > 3
4. 负面反馈率 < 5%

---

## 文档版本历史
| 版本 | 日期 | 修改内容 | 修改人 |
|------|------|----------|--------|
| 1.0 | 2026-04-06 | 初始版本，包含音频和成就系统完整设计 | 系统设计 |
| 1.1 | 2026-04-06 | 添加12项成就详细列表和触发条件 | 需求细化 |

---
*设计遵循森林绿色调色板原则，所有视觉元素避免使用黄色，确保与现有森林图书馆主题视觉风格一致。*