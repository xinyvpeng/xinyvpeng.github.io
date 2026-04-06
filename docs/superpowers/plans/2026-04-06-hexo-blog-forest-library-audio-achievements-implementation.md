# Hexo博客森林图书馆音频与成就系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为森林图书馆主题添加沉浸式环境音频系统（6种自然音效，浮动控制面板）和完整成就系统（12项成就分三类：阅读、探索、互动），通过事件系统与现有功能集成，使用森林绿色调色板避免黄色特效。

**Architecture:** 音频系统扩展现有`forest-audio.js`，添加UI控制面板；成就系统新建`forest-achievements.js`，替代interactions中的框架；两者作为独立模块，通过自定义事件通信，共享森林主题样式和本地存储前缀。

**Tech Stack:** Hexo 8.x, Next主题, JavaScript (ES6+), Web Audio API, localStorage, CSS3动画（森林绿色调色板）

---

## 文件结构

### 创建文件
- `source/js/forest/forest-achievements.js` - 新成就系统主模块（~1200行）
- `source/_data/forest-audio-controls.styl` - 音频控制面板样式（新文件，避免污染主样式）
- `source/_data/forest-achievements.styl` - 成就系统样式（新文件）
- `source/images/forest/achievements/` - 成就图标目录（如有需要）

### 修改文件
- `source/js/forest/forest-audio.js:576` - 扩展UI控制功能（当前行数）
- `source/js/forest/forest-interactions.js:56-60, 798-984` - 禁用原成就框架，保留事件触发点
- `source/_data/forest-theme.styl` - 添加音频和成就系统样式导入
- `source/_data/styles.styl` - 确保新样式文件被导入
- `_config.next.yml` - 添加音频和成就系统配置
- `source/_data/body-end.njk` - 更新脚本加载顺序

### 删除/替换
- `forest-interactions.js`中的`setupAchievementSystem()`和相关函数（798-984行）替换为事件转发到新系统

---

## 第一阶段：音频系统完善（预计1-2天）

### Task 1: 音频浮动控制按钮基础样式

**Files:**
- Create: `source/_data/forest-audio-controls.styl`
- Modify: `source/_data/forest-theme.styl`

- [ ] **Step 1: 创建音频控制样式文件**

```stylus
// 森林音频控制面板样式
// 使用森林绿色调色板：#5E8C31（主绿）, #9ACD32（苔藓绿）, #87CEEB（天空蓝）
// 完全避免黄色元素

// 浮动控制按钮
.forest-audio-toggle-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(94, 140, 49, 0.9); // #5E8C31
  border: 2px solid #9ACD32;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    transform: scale(1.1);
    background: rgba(87, 140, 49, 0.95);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: scale(0.95);
  }

  // 静音状态
  &.muted {
    background: rgba(148, 156, 143, 0.7); // #949C8F
    border-color: #949C8F;
    
    &:hover {
      background: rgba(148, 156, 143, 0.8);
    }
  }

  // 播放状态呼吸动画
  &.playing {
    animation: audio-breathing 2s infinite ease-in-out;
  }
}

// 呼吸动画
@keyframes audio-breathing {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(94, 140, 49, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(94, 140, 49, 0.6);
  }
}

// 控制面板容器
.forest-audio-controls-panel {
  position: fixed;
  bottom: 90px; // 按钮上方
  right: 30px;
  width: 280px;
  max-height: 400px;
  background: rgba(30, 40, 25, 0.95);
  border: 1px solid #5E8C31;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 9998;
  overflow: hidden;
  display: none;
  flex-direction: column;
  backdrop-filter: blur(10px);

  &.visible {
    display: flex;
    animation: panel-slide-up 0.3s ease;
  }
}

@keyframes panel-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 面板标题
.forest-audio-panel-header {
  padding: 16px;
  background: rgba(46, 81, 22, 0.8); // #2E5116
  border-bottom: 1px solid #5E8C31;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    color: white;
    font-size: 16px;
    font-weight: 600;
    
    .emoji {
      margin-right: 8px;
    }
  }

  .forest-audio-close-btn {
    background: none;
    border: none;
    color: #9ACD32;
    font-size: 24px;
    cursor: pointer;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    
    &:hover {
      background: rgba(154, 205, 50, 0.2);
    }
  }
}

// 主音量控制
.forest-audio-master-volume {
  padding: 16px;
  border-bottom: 1px solid rgba(94, 140, 49, 0.3);

  .volume-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    color: #C8D4C0;
    font-size: 14px;
  }

  .volume-slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .volume-icon {
    font-size: 18px;
    color: #9ACD32;
    min-width: 24px;
  }

  .volume-slider {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: rgba(154, 205, 50, 0.2);
    border-radius: 3px;
    outline: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #5E8C31;
      cursor: pointer;
      border: 2px solid #9ACD32;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }

    &::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #5E8C31;
      cursor: pointer;
      border: 2px solid #9ACD32;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
  }

  .volume-value {
    color: #87CEEB;
    font-size: 14px;
    min-width: 40px;
    text-align: right;
  }
}

// 音效列表
.forest-audio-sounds-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;
  max-height: 250px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(94, 140, 49, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #5E8C31;
    border-radius: 3px;
  }
}

// 单个音效项
.forest-audio-sound-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(94, 140, 49, 0.2);

  &:last-child {
    border-bottom: none;
  }

  .sound-item-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .sound-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;

    .sound-checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid #9ACD32;
      border-radius: 4px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      &.checked {
        background: #5E8C31;
        
        &::after {
          content: '✓';
          color: white;
          font-size: 14px;
          font-weight: bold;
        }
      }
    }

    .sound-name {
      color: white;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;

      .sound-emoji {
        font-size: 16px;
      }
    }
  }

  .sound-description {
    color: #949C8F;
    font-size: 12px;
    margin-left: 30px;
    margin-bottom: 8px;
  }

  .sound-volume-control {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 30px;

    .sound-volume-slider {
      flex: 1;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(135, 206, 235, 0.2); // #87CEEB
      border-radius: 2px;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #87CEEB;
        cursor: pointer;
        border: 2px solid #5E8C31;
      }

      &::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: #87CEEB;
        cursor: pointer;
        border: 2px solid #5E8C31;
      }
    }

    .sound-volume-value {
      color: #87CEEB;
      font-size: 12px;
      min-width: 35px;
      text-align: right;
    }
  }

  // 禁用状态
  &.disabled {
    .sound-name {
      color: #949C8F;
    }
    
    .sound-description {
      color: #6A7165;
    }
    
    .sound-volume-control {
      opacity: 0.5;
      pointer-events: none;
    }
  }
}

// 预设按钮区域
.forest-audio-presets {
  padding: 16px;
  border-top: 1px solid rgba(94, 140, 49, 0.3);
  background: rgba(30, 40, 25, 0.5);

  h4 {
    margin: 0 0 12px 0;
    color: #C8D4C0;
    font-size: 14px;
    font-weight: 500;
  }

  .preset-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .preset-btn {
    padding: 8px 12px;
    background: rgba(94, 140, 49, 0.3);
    border: 1px solid #5E8C31;
    border-radius: 6px;
    color: #C8D4C0;
    font-size: 13px;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;

    &:hover {
      background: rgba(94, 140, 49, 0.5);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }
  }
}
```

- [ ] **Step 2: 在主样式文件中导入音频控制样式**

修改 `source/_data/forest-theme.styl`，在文件末尾添加：

```stylus
// ============================================================================
// 音频控制系统样式
// ============================================================================

@import 'forest-audio-controls'
```

运行构建验证：`pnpm run build`
预期：成功构建，无CSS错误

- [ ] **Step 3: 提交样式基础**

```bash
git add source/_data/forest-audio-controls.styl source/_data/forest-theme.styl
git commit -m "feat: 添加音频浮动控制按钮基础样式"
```

### Task 2: 音频控制面板DOM创建与基本交互

**Files:**
- Modify: `source/js/forest/forest-audio.js:95-576`（在现有文件末尾添加UI创建函数）

- [ ] **Step 1: 添加UI创建函数到forest-audio.js**

在 `forest-audio.js` 文件的 `init()` 函数后（约95行后），添加以下函数：

```javascript
  // 创建UI控制面板
  createAudioControls() {
    // 检查是否已存在
    if (document.getElementById('forest-audio-toggle')) {
      return;
    }

    // 创建浮动按钮
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'forest-audio-toggle';
    toggleBtn.className = 'forest-audio-toggle-btn';
    toggleBtn.setAttribute('aria-label', '森林音效控制');
    toggleBtn.innerHTML = '🎵';
    
    // 创建控制面板
    const controlsPanel = document.createElement('div');
    controlsPanel.id = 'forest-audio-controls-panel';
    controlsPanel.className = 'forest-audio-controls-panel';
    
    // 面板标题
    const panelHeader = document.createElement('div');
    panelHeader.className = 'forest-audio-panel-header';
    panelHeader.innerHTML = `
      <h3><span class="emoji">🎧</span>森林音效</h3>
      <button class="forest-audio-close-btn" aria-label="关闭">×</button>
    `;
    
    // 主音量控制
    const masterVolume = document.createElement('div');
    masterVolume.className = 'forest-audio-master-volume';
    masterVolume.innerHTML = `
      <div class="volume-label">
        <span>主音量</span>
        <span class="volume-value">50%</span>
      </div>
      <div class="volume-slider-container">
        <span class="volume-icon">🔊</span>
        <input type="range" class="volume-slider" min="0" max="100" value="50" step="1">
      </div>
    `;
    
    // 音效列表容器
    const soundsList = document.createElement('div');
    soundsList.id = 'forest-audio-sounds-list';
    soundsList.className = 'forest-audio-sounds-list';
    
    // 预设按钮区域
    const presetsSection = document.createElement('div');
    presetsSection.className = 'forest-audio-presets';
    presetsSection.innerHTML = `
      <h4>预设组合</h4>
      <div class="preset-buttons">
        <button class="preset-btn" data-preset="morning">晨林</button>
        <button class="preset-btn" data-preset="rainforest">雨林</button>
        <button class="preset-btn" data-preset="stream">溪畔</button>
      </div>
    `;
    
    // 组装面板
    controlsPanel.appendChild(panelHeader);
    controlsPanel.appendChild(masterVolume);
    controlsPanel.appendChild(soundsList);
    controlsPanel.appendChild(presetsSection);
    
    // 添加到页面
    document.body.appendChild(toggleBtn);
    document.body.appendChild(controlsPanel);
    
    // 保存DOM引用
    this.uiElements = {
      toggleBtn,
      controlsPanel,
      masterSlider: controlsPanel.querySelector('.volume-slider'),
      masterValue: controlsPanel.querySelector('.volume-value'),
      soundsList,
      closeBtn: panelHeader.querySelector('.forest-audio-close-btn')
    };
    
    // 初始化音效列表
    this.populateSoundsList();
    
    // 设置事件监听器
    this.setupEventListeners();
    
    console.log('🎧 音频控制UI已创建');
  },
  
  // 填充音效列表
  populateSoundsList() {
    const soundsList = this.uiElements.soundsList;
    soundsList.innerHTML = '';
    
    Object.entries(this.config.sounds).forEach(([soundId, soundConfig]) => {
      const soundItem = document.createElement('div');
      soundItem.className = 'forest-audio-sound-item';
      soundItem.dataset.soundId = soundId;
      
      // 检查音效是否启用（从存储中加载或使用默认）
      const isEnabled = this.getSoundEnabledState(soundId);
      
      soundItem.innerHTML = `
        <div class="sound-item-header">
          <div class="sound-toggle" data-sound-id="${soundId}">
            <div class="sound-checkbox ${isEnabled ? 'checked' : ''}"></div>
            <div class="sound-name">
              <span class="sound-emoji">${this.getSoundEmoji(soundId)}</span>
              <span>${soundConfig.name}</span>
            </div>
          </div>
        </div>
        <div class="sound-description">${soundConfig.description}</div>
        <div class="sound-volume-control" ${!isEnabled ? 'style="display: none;"' : ''}>
          <input type="range" class="sound-volume-slider" min="0" max="100" 
                 value="${Math.round(soundConfig.volume * 100)}" step="1" 
                 data-sound-id="${soundId}">
          <span class="sound-volume-value">${Math.round(soundConfig.volume * 100)}%</span>
        </div>
      `;
      
      soundsList.appendChild(soundItem);
    });
  },
  
  // 获取音效对应的emoji
  getSoundEmoji(soundId) {
    const emojiMap = {
      birds: '🐦',
      wind: '🌬️',
      leaves: '🍃',
      rain: '🌧️',
      stream: '💧',
      click: '🔊'
    };
    return emojiMap[soundId] || '🎵';
  },
  
  // 获取音效启用状态
  getSoundEnabledState(soundId) {
    // 首先检查用户设置
    if (this.userSettings && this.userSettings.enabledSounds) {
      return this.userSettings.enabledSounds[soundId] !== false;
    }
    // 默认所有音效启用（除了click）
    return soundId !== 'click';
  },
  
  // 设置事件监听器
  setupEventListeners() {
    const { toggleBtn, controlsPanel, masterSlider, masterValue, closeBtn } = this.uiElements;
    
    // 切换按钮点击
    toggleBtn.addEventListener('click', () => {
      const isVisible = controlsPanel.classList.contains('visible');
      if (isVisible) {
        this.hideControls();
      } else {
        this.showControls();
      }
    });
    
    // 关闭按钮
    closeBtn.addEventListener('click', () => {
      this.hideControls();
    });
    
    // 主音量滑块
    masterSlider.addEventListener('input', (e) => {
      const value = e.target.value;
      masterValue.textContent = `${value}%`;
      this.setMasterVolume(value / 100);
    });
    
    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (!controlsPanel.contains(e.target) && 
          !toggleBtn.contains(e.target) && 
          controlsPanel.classList.contains('visible')) {
        this.hideControls();
      }
    });
    
    // 预设按钮
    controlsPanel.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.target.dataset.preset;
        this.applyPreset(preset);
      });
    });
    
    // 音效开关
    controlsPanel.addEventListener('click', (e) => {
      const toggle = e.target.closest('.sound-toggle');
      if (toggle) {
        const soundId = toggle.dataset.soundId;
        this.toggleSound(soundId);
      }
    });
    
    // 音效音量滑块
    controlsPanel.addEventListener('input', (e) => {
      if (e.target.classList.contains('sound-volume-slider')) {
        const soundId = e.target.dataset.soundId;
        const value = e.target.value;
        const valueDisplay = e.target.nextElementSibling;
        valueDisplay.textContent = `${value}%`;
        this.setSoundVolume(soundId, value / 100);
      }
    });
  },
  
  // 显示控制面板
  showControls() {
    this.uiElements.controlsPanel.classList.add('visible');
    this.uiElements.toggleBtn.classList.add('active');
  },
  
  // 隐藏控制面板
  hideControls() {
    this.uiElements.controlsPanel.classList.remove('visible');
    this.uiElements.toggleBtn.classList.remove('active');
  },
  
  // 设置主音量
  setMasterVolume(volume) {
    this.config.masterVolume = volume;
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = volume;
    }
    this.saveSettings();
  },
  
  // 切换音效
  toggleSound(soundId) {
    const soundItem = document.querySelector(`[data-sound-id="${soundId}"]`);
    const checkbox = soundItem.querySelector('.sound-checkbox');
    const volumeControl = soundItem.querySelector('.sound-volume-control');
    
    const isEnabled = checkbox.classList.contains('checked');
    
    if (isEnabled) {
      // 禁用音效
      checkbox.classList.remove('checked');
      volumeControl.style.display = 'none';
      this.stopSound(soundId);
      
      // 更新用户设置
      if (this.userSettings.enabledSounds) {
        this.userSettings.enabledSounds[soundId] = false;
      }
    } else {
      // 启用音效
      checkbox.classList.add('checked');
      volumeControl.style.display = 'flex';
      this.playSound(soundId);
      
      // 更新用户设置
      if (this.userSettings.enabledSounds) {
        this.userSettings.enabledSounds[soundId] = true;
      }
    }
    
    this.saveSettings();
  },
  
  // 设置音效音量
  setSoundVolume(soundId, volume) {
    this.config.sounds[soundId].volume = volume;
    
    // 更新正在播放的音效
    if (this.sounds[soundId] && this.sounds[soundId].source) {
      const gainNode = this.gainNodes[soundId];
      if (gainNode) {
        gainNode.gain.value = volume * this.config.masterVolume;
      }
    }
    
    this.saveSettings();
  },
  
  // 应用预设
  applyPreset(presetName) {
    const presets = {
      morning: {
        masterVolume: 0.5,
        enabledSounds: {
          birds: true,
          wind: true,
          leaves: false,
          rain: false,
          stream: false,
          click: true
        },
        soundVolumes: {
          birds: 0.4,
          wind: 0.3,
          click: 0.1
        }
      },
      rainforest: {
        masterVolume: 0.6,
        enabledSounds: {
          birds: false,
          wind: false,
          leaves: true,
          rain: true,
          stream: false,
          click: true
        },
        soundVolumes: {
          leaves: 0.2,
          rain: 0.6,
          click: 0.1
        }
      },
      stream: {
        masterVolume: 0.4,
        enabledSounds: {
          birds: false,
          wind: true,
          leaves: false,
          rain: false,
          stream: true,
          click: true
        },
        soundVolumes: {
          wind: 0.3,
          stream: 0.5,
          click: 0.1
        }
      }
    };
    
    const preset = presets[presetName];
    if (!preset) return;
    
    // 应用预设
    this.config.masterVolume = preset.masterVolume;
    
    // 更新UI
    this.uiElements.masterSlider.value = preset.masterVolume * 100;
    this.uiElements.masterValue.textContent = `${preset.masterVolume * 100}%`;
    
    // 设置主音量
    this.setMasterVolume(preset.masterVolume);
    
    // 更新音效状态
    Object.entries(preset.enabledSounds).forEach(([soundId, enabled]) => {
      const soundItem = document.querySelector(`[data-sound-id="${soundId}"]`);
      if (soundItem) {
        const checkbox = soundItem.querySelector('.sound-checkbox');
        const volumeControl = soundItem.querySelector('.sound-volume-control');
        
        if (enabled) {
          checkbox.classList.add('checked');
          volumeControl.style.display = 'flex';
          
          // 设置音量
          const volume = preset.soundVolumes[soundId] || this.config.sounds[soundId].volume;
          const slider = soundItem.querySelector('.sound-volume-slider');
          const valueDisplay = soundItem.querySelector('.sound-volume-value');
          
          if (slider && valueDisplay) {
            slider.value = volume * 100;
            valueDisplay.textContent = `${volume * 100}%`;
            this.setSoundVolume(soundId, volume);
          }
          
          // 播放音效
          this.playSound(soundId);
        } else {
          checkbox.classList.remove('checked');
          volumeControl.style.display = 'none';
          this.stopSound(soundId);
        }
      }
    });
    
    // 保存设置
    this.saveSettings();
    
    console.log(`🎧 已应用预设：${presetName}`);
  },
```

- [ ] **Step 2: 更新init()函数调用UI创建**

在 `forest-audio.js` 的 `init()` 函数中（约95-99行），在初始化完成后添加UI创建：

```javascript
    this.isInitialized = true;
    console.log('🎧 森林音频系统已初始化');
    
    // 创建UI控制面板
    this.createAudioControls();
    
    // 如果用户启用了音频，则开始播放环境音效
    if (this.config.enabled) {
      this.startAmbientSounds();
    }
```

- [ ] **Step 3: 测试UI创建**

运行：`pnpm run build`
预期：成功构建，无JavaScript错误

启动开发服务器测试：`pnpm run server`（在另一个终端）
访问 `http://localhost:4000`，检查右下角是否出现音频按钮
预期：页面右下角显示🎵按钮，点击可展开控制面板

- [ ] **Step 4: 提交音频UI基础**

```bash
git add source/js/forest/forest-audio.js
git commit -m "feat: 添加音频控制面板DOM创建与基本交互"
```

### Task 3: 音频状态管理与持久化

**Files:**
- Modify: `source/js/forest/forest-audio.js`（添加状态管理函数）

- [ ] **Step 1: 添加用户设置加载和保存函数**

在 `forest-audio.js` 的 `createAudioControls()` 函数前添加：

```javascript
  // 加载用户偏好设置
  loadPreferences() {
    try {
      const savedSettings = localStorage.getItem('forest-audio-settings');
      if (savedSettings) {
        this.userSettings = JSON.parse(savedSettings);
        
        // 应用保存的设置
        if (this.userSettings.enabled !== undefined) {
          this.config.enabled = this.userSettings.enabled;
        }
        
        if (this.userSettings.masterVolume !== undefined) {
          this.config.masterVolume = this.userSettings.masterVolume;
        }
        
        if (this.userSettings.enabledSounds) {
          // 更新音效启用状态
          Object.keys(this.config.sounds).forEach(soundId => {
            if (this.userSettings.enabledSounds[soundId] !== undefined) {
              // 设置已保存在用户设置中
            }
          });
        }
        
        if (this.userSettings.soundVolumes) {
          // 更新音效音量
          Object.entries(this.userSettings.soundVolumes).forEach(([soundId, volume]) => {
            if (this.config.sounds[soundId]) {
              this.config.sounds[soundId].volume = volume;
            }
          });
        }
        
        console.log('🎧 用户音频设置已加载');
      } else {
        this.userSettings = {
          enabled: this.config.enabled,
          masterVolume: this.config.masterVolume,
          enabledSounds: {},
          soundVolumes: {}
        };
      }
    } catch (error) {
      console.warn('🎧 加载音频设置失败，使用默认设置', error);
      this.userSettings = {
        enabled: this.config.enabled,
        masterVolume: this.config.masterVolume,
        enabledSounds: {},
        soundVolumes: {}
      };
    }
  },
  
  // 保存用户设置
  saveSettings() {
    if (!this.userSettings) return;
    
    // 更新当前状态到用户设置
    this.userSettings.enabled = this.config.enabled;
    this.userSettings.masterVolume = this.config.masterVolume;
    
    // 更新音效启用状态
    if (!this.userSettings.enabledSounds) {
      this.userSettings.enabledSounds = {};
    }
    
    Object.keys(this.config.sounds).forEach(soundId => {
      const soundItem = document.querySelector(`[data-sound-id="${soundId}"]`);
      if (soundItem) {
        const isEnabled = soundItem.querySelector('.sound-checkbox').classList.contains('checked');
        this.userSettings.enabledSounds[soundId] = isEnabled;
      }
    });
    
    // 更新音效音量
    if (!this.userSettings.soundVolumes) {
      this.userSettings.soundVolumes = {};
    }
    
    Object.entries(this.config.sounds).forEach(([soundId, soundConfig]) => {
      this.userSettings.soundVolumes[soundId] = soundConfig.volume;
    });
    
    // 保存最后状态
    this.userSettings.lastState = this.isPlaying ? 'playing' : 'paused';
    
    try {
      localStorage.setItem('forest-audio-settings', JSON.stringify(this.userSettings));
    } catch (error) {
      console.warn('🎧 保存音频设置失败', error);
    }
  },
  
  // 加载音效
  loadSound(soundId) {
    return new Promise((resolve, reject) => {
      if (!this.config.sounds[soundId]) {
        reject(new Error(`音效不存在: ${soundId}`));
        return;
      }
      
      // 如果已经加载，直接返回
      if (this.sounds[soundId]) {
        resolve(this.sounds[soundId]);
        return;
      }
      
      const soundConfig = this.config.sounds[soundId];
      const audioPath = soundConfig.path;
      
      // 创建XMLHttpRequest加载音频
      const request = new XMLHttpRequest();
      request.open('GET', audioPath, true);
      request.responseType = 'arraybuffer';
      
      request.onload = () => {
        if (request.status === 200) {
          this.audioContext.decodeAudioData(request.response, (buffer) => {
            this.sounds[soundId] = {
              buffer: buffer,
              config: soundConfig,
              source: null
            };
            console.log(`🎧 音效加载成功: ${soundConfig.name}`);
            resolve(this.sounds[soundId]);
          }, (error) => {
            reject(new Error(`解码音频失败: ${error}`));
          });
        } else {
          reject(new Error(`加载音频失败: ${request.status}`));
        }
      };
      
      request.onerror = () => {
        reject(new Error('网络错误，无法加载音频'));
      };
      
      request.send();
    });
  },
  
  // 播放音效
  playSound(soundId, loop = null) {
    if (!this.audioContext || !this.config.enabled) return;
    
    // 确保音频上下文已恢复（移动端限制）
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    const sound = this.sounds[soundId];
    if (!sound) {
      // 尝试加载
      this.loadSound(soundId)
        .then(() => this.playSound(soundId, loop))
        .catch(error => console.warn(`🎧 播放音效失败: ${error}`));
      return;
    }
    
    // 停止当前播放的相同音效
    if (sound.source) {
      sound.source.stop();
    }
    
    // 创建新的音频源
    const source = this.audioContext.createBufferSource();
    source.buffer = sound.buffer;
    
    // 创建增益节点控制音量
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = sound.config.volume * this.config.masterVolume;
    
    // 连接：source -> gainNode -> destination
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // 设置循环
    source.loop = loop !== null ? loop : sound.config.loop;
    
    // 开始播放
    source.start(0);
    
    // 保存引用
    sound.source = source;
    this.gainNodes[soundId] = gainNode;
    
    // 更新播放状态
    this.isPlaying = true;
    this.updatePlayButtonState();
    
    // 设置结束回调（仅非循环音效）
    if (!source.loop) {
      source.onended = () => {
        sound.source = null;
      };
    }
  },
  
  // 停止音效
  stopSound(soundId) {
    const sound = this.sounds[soundId];
    if (sound && sound.source) {
      sound.source.stop();
      sound.source = null;
    }
  },
  
  // 开始环境音效
  startAmbientSounds() {
    if (!this.audioContext || !this.config.enabled) return;
    
    // 恢复音频上下文（移动端限制）
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // 播放所有启用的音效
    Object.keys(this.config.sounds).forEach(soundId => {
      const soundConfig = this.config.sounds[soundId];
      if (soundConfig.loop && this.getSoundEnabledState(soundId)) {
        this.playSound(soundId, true);
      }
    });
    
    this.isPlaying = true;
    this.config.enabled = true;
    this.updatePlayButtonState();
    console.log('🎧 环境音效已开始播放');
  },
  
  // 停止所有音效
  stopAllSounds() {
    Object.keys(this.sounds).forEach(soundId => {
      this.stopSound(soundId);
    });
    
    this.isPlaying = false;
    this.config.enabled = false;
    this.updatePlayButtonState();
    console.log('🎧 所有音效已停止');
  },
  
  // 更新播放按钮状态
  updatePlayButtonState() {
    const toggleBtn = document.getElementById('forest-audio-toggle');
    if (!toggleBtn) return;
    
    if (this.isPlaying) {
      toggleBtn.classList.remove('muted');
      toggleBtn.classList.add('playing');
      toggleBtn.innerHTML = '🎶';
    } else {
      toggleBtn.classList.add('muted');
      toggleBtn.classList.remove('playing');
      toggleBtn.innerHTML = '🎵';
    }
  },
  
  // 切换播放状态
  togglePlayback() {
    if (this.isPlaying) {
      this.stopAllSounds();
    } else {
      this.startAmbientSounds();
    }
    this.saveSettings();
  },
  
  // 创建主音量控制
  createMasterGain() {
    if (!this.audioContext) return;
    
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.gain.value = this.config.masterVolume;
    this.masterGainNode.connect(this.audioContext.destination);
    
    // 将所有音效连接到主增益节点
    Object.keys(this.gainNodes).forEach(soundId => {
      const gainNode = this.gainNodes[soundId];
      if (gainNode) {
        gainNode.disconnect();
        gainNode.connect(this.masterGainNode);
      }
    });
  },
```

- [ ] **Step 2: 更新初始化流程调用loadPreferences**

修改 `forest-audio.js` 的 `init()` 函数，在创建音频上下文后立即调用 `loadPreferences()`：

```javascript
    // 创建音频上下文
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass();
    
    // 加载用户偏好
    this.loadPreferences();
    
    // 创建主音量控制
    this.createMasterGain();
```

- [ ] **Step 3: 添加页面可见性变化处理**

在 `setupEventListeners()` 函数后添加：

```javascript
    // 页面可见性变化处理（节能模式）
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isPlaying) {
        // 页面隐藏时暂停
        this.wasPlayingBeforeHide = true;
        this.stopAllSounds();
      } else if (!document.hidden && this.wasPlayingBeforeHide) {
        // 页面重新显示时恢复
        this.wasPlayingBeforeHide = false;
        this.startAmbientSounds();
      }
    });
    
    // 添加全局播放/暂停快捷键（Ctrl+Shift+M 或 Cmd+Shift+M）
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        this.togglePlayback();
      }
    });
```

- [ ] **Step 4: 测试音频状态管理**

运行：`pnpm run build`
预期：成功构建

重启开发服务器：`pkill -f "hexo server" && pnpm run server &`
访问页面，测试以下功能：
1. 点击音频按钮展开面板
2. 调整主音量滑块，验证百分比显示更新
3. 切换音效开关，验证复选框状态变化
4. 调整音效音量滑块
5. 点击预设按钮应用预设
6. 刷新页面验证设置是否保存

预期：所有功能正常工作，设置通过localStorage持久化

- [ ] **Step 5: 提交音频状态管理**

```bash
git add source/js/forest/forest-audio.js
git commit -m "feat: 完成音频状态管理与持久化功能"
```

### Task 4: 音频系统配置与集成

**Files:**
- Modify: `_config.next.yml`
- Modify: `source/_data/body-end.njk`

- [ ] **Step 1: 在Hexo配置中启用音频系统**

修改 `_config.next.yml`，在 `forest_theme` 部分添加音频配置：

```yaml
# 森林主题配置
forest_theme:
  # 功能开关
  features:
    audio: true                    # 启用音频系统
    achievements: true             # 启用成就系统
    hidden_animals: true           # 启用隐藏动物
    bookmarks: false               # 书签系统暂不启用
    
  # 音频系统配置
  audio:
    enabled: false                 # 默认静音
    default_preset: 'morning'      # 默认预设：morning/rainforest/stream
    
  # 成就系统配置
  achievements:
    enabled: true
    show_notifications: true
    show_progress_indicator: true
    max_plants: 12                 # 植物总数
    achievement_sound: true        # 成就解锁音效
    
  # 脚本配置
  scripts:
    - /js/forest/forest-theme.js
    - /js/forest/forest-interactions.js
    - /js/forest/forest-audio.js
    - /js/forest/forest-achievements.js  # 新成就系统
```

- [ ] **Step 2: 更新脚本加载模板**

修改 `source/_data/body-end.njk`，确保音频脚本正确加载：

```html
{%- if theme.forest_theme.features.audio %}
<script>
// 音频系统配置
window.FOREST_AUDIO_CONFIG = {
  enabled: {{ theme.forest_theme.audio.enabled | default(false) | json }},
  default_preset: {{ theme.forest_theme.audio.default_preset | default('morning') | json }}
};
</script>
{%- endif %}

{%- if theme.forest_theme.features.achievements %}
<script>
// 成就系统配置
window.FOREST_ACHIEVEMENTS_CONFIG = {
  enabled: {{ theme.forest_theme.achievements.enabled | default(false) | json }},
  show_notifications: {{ theme.forest_theme.achievements.show_notifications | default(true) | json }},
  show_progress_indicator: {{ theme.forest_theme.achievements.show_progress_indicator | default(true) | json }},
  max_plants: {{ theme.forest_theme.achievements.max_plants | default(12) | json }},
  achievement_sound: {{ theme.forest_theme.achievements.achievement_sound | default(true) | json }}
};
</script>
{%- endif %}

<!-- 森林主题脚本 -->
{%- if theme.forest_theme.features %}
<script>
// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 初始化主题系统
  if (typeof window.ForestTheme !== 'undefined') {
    window.ForestTheme.init();
  }
  
  // 初始化交互系统（延迟确保主题已加载）
  setTimeout(function() {
    if (typeof window.ForestInteractions !== 'undefined' && 
        theme.forest_theme.features.hidden_animals) {
      window.ForestInteractions.init();
    }
    
    // 初始化音频系统
    if (typeof window.ForestAudio !== 'undefined' && 
        theme.forest_theme.features.audio) {
      window.ForestAudio.init();
    }
    
    // 初始化成就系统
    if (typeof window.ForestAchievements !== 'undefined' && 
        theme.forest_theme.features.achievements) {
      window.ForestAchievements.init();
    }
  }, 300);
});
</script>
{%- endif %}
```

- [ ] **Step 3: 更新音频系统读取配置**

在 `forest-audio.js` 的 `init()` 函数开头添加配置读取：

```javascript
  init() {
    if (this.isInitialized) {
      console.log('🎧 音频系统已初始化');
      return;
    }
    
    // 读取全局配置
    if (window.FOREST_AUDIO_CONFIG) {
      this.config.enabled = window.FOREST_AUDIO_CONFIG.enabled;
      console.log('🎧 使用配置中的音频设置');
    }
    
    // 检查浏览器支持
    if (!window.AudioContext && !window.webkitAudioContext) {
      console.warn('🎧 浏览器不支持Web Audio API，音频功能不可用');
      this.showUnsupportedMessage();
      return;
    }
    
    // ... 其余初始化代码不变
  },
  
  // 显示不支持消息
  showUnsupportedMessage() {
    const toggleBtn = document.getElementById('forest-audio-toggle');
    if (toggleBtn) {
      toggleBtn.style.display = 'none';
    }
    
    // 可选：在控制台显示更详细的信息
    console.info('🎧 音频功能需要Web Audio API支持，当前浏览器不支持此功能');
  },
```

- [ ] **Step 4: 测试配置集成**

运行：`pnpm run clean && pnpm run build`
预期：成功构建，无配置错误

启动开发服务器：`pnpm run server &`
访问页面，检查：
1. 控制台应显示"使用配置中的音频设置"
2. 音频按钮应显示
3. 点击按钮应展开控制面板

预期：配置正确应用，音频系统正常工作

- [ ] **Step 5: 提交音频系统配置**

```bash
git add _config.next.yml source/_data/body-end.njk source/js/forest/forest-audio.js
git commit -m "feat: 添加音频系统配置与Hexo集成"
```

---

## 第二阶段：成就系统开发（预计2-3天）

### Task 5: 成就系统基础模块创建

**Files:**
- Create: `source/js/forest/forest-achievements.js`
- Create: `source/_data/forest-achievements.styl`

- [ ] **Step 1: 创建成就系统样式文件**

```stylus
// 森林成就系统样式
// 使用森林绿色调色板，完全避免黄色

// 成就通知
.forest-achievement-notification {
  position: fixed;
  bottom: 90px; // 音频按钮上方
  right: 30px;
  width: 300px;
  max-width: calc(100vw - 100px);
  background: rgba(94, 140, 49, 0.95); // #5E8C31
  border: 1px solid #9ACD32;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 9997;
  backdrop-filter: blur(10px);
  animation: achievement-slide-in 0.3s ease;
  transform: translateY(0);
  opacity: 1;
  transition: opacity 0.5s ease;

  &.hiding {
    opacity: 0;
    transform: translateY(20px);
  }

  .notification-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .achievement-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .achievement-title {
      flex: 1;
      color: white;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.3;

      .achievement-name {
        display: block;
        font-size: 18px;
        margin-bottom: 4px;
      }

      .achievement-status {
        display: block;
        font-size: 14px;
        color: #C8D4C0;
        font-weight: normal;
      }
    }
  }

  .notification-body {
    color: #E8F4E8;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
    padding: 12px;
    background: rgba(30, 40, 25, 0.3);
    border-radius: 8px;
    border-left: 3px solid #87CEEB;

    .achievement-description {
      margin-bottom: 8px;
    }

    .achievement-reward {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #9ACD32;
      font-weight: 500;

      .reward-emoji {
        font-size: 16px;
      }
    }

    .achievement-progress {
      margin-top: 12px;
      font-size: 13px;
      color: #C8D4C0;

      .progress-bar {
        height: 6px;
        background: rgba(154, 205, 50, 0.2);
        border-radius: 3px;
        margin-top: 4px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #5E8C31, #9ACD32);
          border-radius: 3px;
          transition: width 0.5s ease;
        }
      }
    }
  }

  .notification-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: #949C8F;

    .achievement-date {
      font-style: italic;
    }

    .close-notification {
      background: none;
      border: none;
      color: #87CEEB;
      cursor: pointer;
      font-size: 14px;
      padding: 4px 8px;
      border-radius: 4px;

      &:hover {
        background: rgba(135, 206, 235, 0.1);
      }
    }
  }
}

// 成就通知入场动画
@keyframes achievement-slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 庆祝动画 - 森林绿色粒子
.forest-celebration-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 9996;

  &.particle-1 {
    background: #5E8C31; // 主绿
    box-shadow: 0 0 8px #5E8C31;
  }

  &.particle-2 {
    background: #9ACD32; // 苔藓绿
    box-shadow: 0 0 8px #9ACD32;
  }

  &.particle-3 {
    background: #87CEEB; // 天空蓝
    box-shadow: 0 0 8px #87CEEB;
  }
}

// 成就图标缩放动画
@keyframes achievement-icon-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.achievement-icon-pop {
  animation: achievement-icon-pop 0.6s ease;
}

// 成就图鉴按钮
.forest-achievements-toggle {
  position: fixed;
  bottom: 30px;
  right: 90px; // 音频按钮左侧
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(94, 140, 49, 0.9);
  border: 2px solid #9ACD32;
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9995;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  user-select: none;

  &:hover {
    transform: scale(1.1);
    background: rgba(87, 140, 49, 0.95);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: scale(0.95);
  }

  .achievements-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #87CEEB;
    color: white;
    font-size: 12px;
    font-weight: bold;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

// 成就图鉴模态框
.forest-achievements-herbarium {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10000;
  display: none;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);

  &.visible {
    display: flex;
    animation: herbarium-fade-in 0.3s ease;
  }

  .herbarium-container {
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    background: rgba(30, 40, 25, 0.95);
    border: 2px solid #5E8C31;
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);
  }
}

@keyframes herbarium-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

// 图鉴头部
.herbarium-header {
  padding: 20px;
  background: rgba(46, 81, 22, 0.9); // #2E5116
  border-bottom: 1px solid #5E8C31;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    color: white;
    font-size: 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12px;

    .header-emoji {
      font-size: 24px;
    }
  }

  .herbarium-close-btn {
    background: none;
    border: none;
    color: #9ACD32;
    font-size: 28px;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    
    &:hover {
      background: rgba(154, 205, 50, 0.2);
    }
  }
}

// 图鉴选项卡
.herbarium-tabs {
  display: flex;
  background: rgba(40, 50, 35, 0.8);
  border-bottom: 1px solid #5E8C31;
  padding: 0 20px;

  .herbarium-tab {
    padding: 14px 24px;
    background: none;
    border: none;
    color: #C8D4C0;
    font-size: 15px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.2s;

    &:hover {
      color: white;
      background: rgba(94, 140, 49, 0.2);
    }

    &.active {
      color: white;
      font-weight: 600;

      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        height: 3px;
        background: #9ACD32;
        border-radius: 3px 3px 0 0;
      }
    }

    .tab-emoji {
      font-size: 18px;
    }

    .tab-badge {
      background: #87CEEB;
      color: white;
      font-size: 12px;
      padding: 2px 8px;
      border-radius: 10px;
      margin-left: 8px;
    }
  }
}

// 图鉴内容区域
.herbarium-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(94, 140, 49, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #5E8C31;
    border-radius: 4px;
  }
}

// 成就网格
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

// 成就卡片
.achievement-card {
  background: rgba(50, 60, 45, 0.6);
  border: 1px solid rgba(94, 140, 49, 0.4);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    border-color: #5E8C31;
    box-shadow: 0 8px 24px rgba(94, 140, 49, 0.2);
  }

  &.unlocked {
    background: rgba(94, 140, 49, 0.15);
    border-color: #5E8C31;

    .achievement-status {
      color: #9ACD32;
    }
  }

  &.locked {
    opacity: 0.7;
    background: rgba(40, 40, 40, 0.6);
    border-color: #555;

    .achievement-icon {
      filter: grayscale(1);
      opacity: 0.5;
    }

    .achievement-name {
      color: #888;
    }

    .achievement-status {
      color: #666;
    }
  }

  .achievement-icon {
    font-size: 40px;
    margin-bottom: 12px;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    margin-bottom: 16px;
  }

  .achievement-name {
    color: white;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    line-height: 1.3;
  }

  .achievement-description {
    color: #C8D4C0;
    font-size: 13px;
    line-height: 1.4;
    margin-bottom: 12px;
    flex: 1;
  }

  .achievement-status {
    font-size: 12px;
    font-weight: 500;
    padding: 4px 12px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    display: inline-block;

    &.status-unlocked {
      background: rgba(154, 205, 50, 0.2);
      color: #9ACD32;
    }

    &.status-locked {
      background: rgba(100, 100, 100, 0.2);
      color: #999;
    }
  }

  .achievement-progress {
    width: 100%;
    margin-top: 12px;

    .progress-text {
      font-size: 11px;
      color: #949C8F;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
    }

    .progress-bar {
      height: 4px;
      background: rgba(154, 205, 50, 0.2);
      border-radius: 2px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #5E8C31, #9ACD32);
        border-radius: 2px;
        transition: width 0.5s ease;
      }
    }
  }
}

// 统计面板
.achievements-stats {
  background: rgba(40, 50, 35, 0.6);
  border: 1px solid rgba(94, 140, 49, 0.4);
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;

  h3 {
    color: white;
    font-size: 18px;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 10px;

    .stats-emoji {
      font-size: 20px;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  .stat-item {
    .stat-label {
      color: #C8D4C0;
      font-size: 14px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;

      .stat-emoji {
        font-size: 16px;
      }
    }

    .stat-value {
      color: white;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .stat-progress {
      font-size: 13px;
      color: #949C8F;
    }
  }
}
```

- [ ] **Step 2: 在主样式文件中导入成就样式**

修改 `source/_data/forest-theme.styl`，在音频样式导入后添加：

```stylus
// ============================================================================
// 成就系统样式
// ============================================================================

@import 'forest-achievements'
```

- [ ] **Step 3: 创建成就系统JavaScript主模块框架**

创建 `source/js/forest/forest-achievements.js`：

```javascript
/**
 * 森林成就系统
 * 提供阅读、探索、互动三类成就，集成植物收集，与现有系统通过事件通信
 * 完全使用森林绿色调色板，避免黄色特效
 */

const ForestAchievements = {
  // 配置（从全局配置或默认值）
  config: {
    enabled: false,
    showNotifications: true,
    showProgressIndicator: true,
    maxPlants: 12,
    achievementSound: true,
    
    // 成就定义
    achievements: {
      // 阅读成就
      'reading-seedling': {
        id: 'reading-seedling',
        name: '阅读幼苗',
        icon: '🌱',
        type: 'reading',
        description: '阅读第一篇文章',
        condition: { type: 'articles_read', threshold: 1 },
        reward: { plantId: 1, points: 10 }
      },
      'knowledge-explorer': {
        id: 'knowledge-explorer',
        name: '知识探索者',
        icon: '📚',
        type: 'reading',
        description: '累计阅读10,000字',
        condition: { type: 'words_read', threshold: 10000 },
        reward: { plantId: 3, points: 30 }
      },
      'forest-scholar': {
        id: 'forest-scholar',
        name: '森林学者',
        icon: '🎓',
        type: 'reading',
        description: '累计阅读50,000字',
        condition: { type: 'words_read', threshold: 50000 },
        reward: { plantId: 6, points: 50 }
      },
      'immersive-reader': {
        id: 'immersive-reader',
        name: '沉浸阅读者',
        icon: '🌲',
        type: 'reading',
        description: '单篇文章阅读时长超过10分钟',
        condition: { type: 'reading_time', threshold: 600 }, // 秒
        reward: { plantId: 9, points: 25 }
      },
      
      // 探索成就
      'animal-observer': {
        id: 'animal-observer',
        name: '动物观察者',
        icon: '🐿️',
        type: 'exploration',
        description: '发现第一个隐藏动物',
        condition: { type: 'animals_discovered', threshold: 1 },
        reward: { plantId: 2, points: 15 }
      },
      'forest-detective': {
        id: 'forest-detective',
        name: '森林侦探',
        icon: '🦉',
        type: 'exploration',
        description: '发现所有3种隐藏动物',
        condition: { type: 'animals_discovered', threshold: 3 },
        reward: { plantId: 5, points: 40 }
      },
      'easter-egg-hunter': {
        id: 'easter-egg-hunter',
        name: '彩蛋猎人',
        icon: '🥚',
        type: 'exploration',
        description: '发现页面中的特殊彩蛋',
        condition: { type: 'easter_eggs_found', threshold: 1 },
        reward: { plantId: 8, points: 20 }
      },
      
      // 互动成就
      'bookmark-collector': {
        id: 'bookmark-collector',
        name: '书签收藏家',
        icon: '📖',
        type: 'interaction',
        description: '添加第一个书签',
        condition: { type: 'bookmarks_added', threshold: 1 },
        reward: { plantId: 4, points: 15 }
      },
      'share-promoter': {
        id: 'share-promoter',
        name: '分享传播者',
        icon: '📣',
        type: 'interaction',
        description: '首次分享文章',
        condition: { type: 'articles_shared', threshold: 1 },
        reward: { plantId: 7, points: 20 }
      },
      'comment-contributor': {
        id: 'comment-contributor',
        name: '评论贡献者',
        icon: '💬',
        type: 'interaction',
        description: '首次发表评论',
        condition: { type: 'comments_posted', threshold: 1 },
        reward: { plantId: 10, points: 25 }
      },
      'interaction-master': {
        id: 'interaction-master',
        name: '互动大师',
        icon: '✨',
        type: 'interaction',
        description: '完成所有互动成就',
        condition: { type: 'interactions_completed', threshold: 3 },
        reward: { plantId: 12, points: 60 }
      }
    },
    
    // 植物定义（与现有系统兼容）
    plants: [
      { id: 1, name: '神秘蘑菇', emoji: '🍄', description: '象征着新知识的萌芽' },
      { id: 2, name: '发光苔藓', emoji: '🌱', description: '在黑暗中指引方向' },
      { id: 3, name: '古老橡树', emoji: '🌳', description: '智慧与时间的见证' },
      { id: 4, name: '智慧蕨类', emoji: '🌿', description: '知识的精致纹理' },
      { id: 5, name: '月光花朵', emoji: '🌸', description: '在夜晚绽放的灵感' },
      { id: 6, name: '翡翠藤蔓', emoji: '🌿', description: '连接知识的脉络' },
      { id: 7, name: '水晶果实', emoji: '🍇', description: '思考的结晶' },
      { id: 8, name: '彩虹叶片', emoji: '🍂', description: '多彩的见解' },
      { id: 9, name: '梦境树枝', emoji: '🌴', description: '想象力的延伸' },
      { id: 10, name: '时光种子', emoji: '🌰', description: '未来的可能性' },
      { id: 11, name: '记忆根须', emoji: '🌾', description: '知识的坚实基础' },
      { id: 12, name: '星光草', emoji: '☘️', description: '灵感的闪烁' }
    ]
  },
  
  // 状态
  isInitialized: false,
  userData: null,
  unlockedAchievements: new Set(),
  collectedPlants: new Set(),
  pendingNotifications: [],
  
  // 统计数据
  stats: {
    reading: {
      totalWordsRead: 0,
      articlesRead: 0,
      totalReadingTime: 0, // 秒
      longestSession: 0
    },
    exploration: {
      animalsDiscovered: new Set(),
      easterEggsFound: new Set(),
      specialPagesVisited: new Set()
    },
    interaction: {
      bookmarksAdded: 0,
      articlesShared: 0,
      commentsPosted: 0
    }
  },
  
  // 当前会话状态
  currentSession: {
    startTime: null,
    currentArticleWords: 0,
    wordsReadThisSession: 0
  },
  
  // 初始化成就系统
  init() {
    if (this.isInitialized) {
      console.log('🏆 成就系统已初始化');
      return;
    }
    
    // 读取全局配置
    if (window.FOREST_ACHIEVEMENTS_CONFIG) {
      Object.assign(this.config, window.FOREST_ACHIEVEMENTS_CONFIG);
      console.log('🏆 使用配置中的成就设置');
    }
    
    if (!this.config.enabled) {
      console.log('🏆 成就系统已禁用');
      return;
    }
    
    // 加载用户数据
    this.loadUserData();
    
    // 设置检测器
    this.setupDetectors();
    
    // 创建UI元素
    this.createUIElements();
    
    // 设置事件监听
    this.setupEventListeners();
    
    // 开始当前会话
    this.startNewSession();
    
    this.isInitialized = true;
    console.log('🏆 森林成就系统已初始化');
  },
  
  // 加载用户数据
  loadUserData() {
    try {
      const savedData = localStorage.getItem('forest-achievements');
      if (savedData) {
        this.userData = JSON.parse(savedData);
        
        // 恢复成就状态
        if (this.userData.unlockedAchievements) {
          this.unlockedAchievements = new Set(this.userData.unlockedAchievements);
        }
        
        // 恢复植物收集
        if (this.userData.collectedPlants) {
          this.collectedPlants = new Set(this.userData.collectedPlants);
        }
        
        // 恢复统计数据
        if (this.userData.stats) {
          this.stats = {
            reading: {
              totalWordsRead: this.userData.stats.reading?.totalWordsRead || 0,
              articlesRead: this.userData.stats.reading?.articlesRead || 0,
              totalReadingTime: this.userData.stats.reading?.totalReadingTime || 0,
              longestSession: this.userData.stats.reading?.longestSession || 0
            },
            exploration: {
              animalsDiscovered: new Set(this.userData.stats.exploration?.animalsDiscovered || []),
              easterEggsFound: new Set(this.userData.stats.exploration?.easterEggsFound || []),
              specialPagesVisited: new Set(this.userData.stats.exploration?.specialPagesVisited || [])
            },
            interaction: {
              bookmarksAdded: this.userData.stats.interaction?.bookmarksAdded || 0,
              articlesShared: this.userData.stats.interaction?.articlesShared || 0,
              commentsPosted: this.userData.stats.interaction?.commentsPosted || 0
            }
          };
        }
        
        console.log('🏆 用户成就数据已加载');
      } else {
        this.userData = {
          firstVisitDate: new Date().toISOString(),
          unlockedAchievements: [],
          collectedPlants: [],
          stats: {
            reading: {
              totalWordsRead: 0,
              articlesRead: 0,
              totalReadingTime: 0,
              longestSession: 0
            },
            exploration: {
              animalsDiscovered: [],
              easterEggsFound: [],
              specialPagesVisited: []
            },
            interaction: {
              bookmarksAdded: 0,
              articlesShared: 0,
              commentsPosted: 0
            }
          }
        };
      }
    } catch (error) {
      console.warn('🏆 加载成就数据失败，使用默认数据', error);
      this.userData = {
        firstVisitDate: new Date().toISOString(),
        unlockedAchievements: [],
        collectedPlants: [],
        stats: {
          reading: {
            totalWordsRead: 0,
            articlesRead: 0,
            totalReadingTime: 0,
            longestSession: 0
          },
          exploration: {
            animalsDiscovered: [],
            easterEggsFound: [],
            specialPagesVisited: []
          },
          interaction: {
            bookmarksAdded: 0,
            articlesShared: 0,
            commentsPosted: 0
          }
        }
      };
    }
  },
  
  // 保存用户数据
  saveUserData() {
    if (!this.userData) return;
    
    // 更新用户数据
    this.userData.unlockedAchievements = Array.from(this.unlockedAchievements);
    this.userData.collectedPlants = Array.from(this.collectedPlants);
    
    // 更新统计数据
    this.userData.stats = {
      reading: {
        totalWordsRead: this.stats.reading.totalWordsRead,
        articlesRead: this.stats.reading.articlesRead,
        totalReadingTime: this.stats.reading.totalReadingTime,
        longestSession: this.stats.reading.longestSession
      },
      exploration: {
        animalsDiscovered: Array.from(this.stats.exploration.animalsDiscovered),
        easterEggsFound: Array.from(this.stats.exploration.easterEggsFound),
        specialPagesVisited: Array.from(this.stats.exploration.specialPagesVisited)
      },
      interaction: {
        bookmarksAdded: this.stats.interaction.bookmarksAdded,
        articlesShared: this.stats.interaction.articlesShared,
        commentsPosted: this.stats.interaction.commentsPosted
      }
    };
    
    this.userData.lastUpdated = new Date().toISOString();
    this.userData.totalAchievementPoints = this.calculateTotalPoints();
    
    try {
      localStorage.setItem('forest-achievements', JSON.stringify(this.userData));
    } catch (error) {
      console.warn('🏆 保存成就数据失败', error);
    }
  },
  
  // 计算总成就点数
  calculateTotalPoints() {
    let totalPoints = 0;
    this.unlockedAchievements.forEach(achievementId => {
      const achievement = this.config.achievements[achievementId];
      if (achievement && achievement.reward && achievement.reward.points) {
        totalPoints += achievement.reward.points;
      }
    });
    return totalPoints;
  },
  
  // 开始新会话
  startNewSession() {
    this.currentSession.startTime = Date.now();
    this.currentSession.wordsReadThisSession = 0;
    
    // 估算当前文章字数
    this.estimateCurrentArticleWords();
    
    console.log('🏆 新的阅读会话开始');
  },
  
  // 估算当前文章字数
  estimateCurrentArticleWords() {
    const articleContent = document.querySelector('.post-body');
    if (articleContent) {
      const text = articleContent.textContent || '';
      this.currentSession.currentArticleWords = text.split(/\s+/).length;
    } else {
      this.currentSession.currentArticleWords = 0;
    }
  },
  
  // 设置检测器
  setupDetectors() {
    // 阅读检测器
    this.setupReadingDetector();
    
    // 探索检测器
    this.setupExplorationDetector();
    
    // 互动检测器
    this.setupInteractionDetector();
    
    console.log('🏆 成就检测器已设置');
  },
  
  // 设置阅读检测器
  setupReadingDetector() {
    // 监听滚动事件来跟踪阅读
    let lastScrollTop = 0;
    let totalScrolled = 0;
    let isReading = false;
    let readingStartTime = null;
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollDiff = Math.abs(scrollTop - lastScrollTop);
      
      // 如果有滚动，说明用户在阅读
      if (scrollDiff > 0) {
        totalScrolled += scrollDiff;
        
        if (!isReading) {
          isReading = true;
          readingStartTime = Date.now();
        }
        
        // 检查阅读相关成就
        this.checkReadingAchievements(totalScrolled);
      }
      
      lastScrollTop = scrollTop;
    });
    
    // 监听焦点变化来检测阅读会话
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // 页面隐藏，结束当前阅读会话
        if (isReading && readingStartTime) {
          const readingDuration = Date.now() - readingStartTime;
          this.stats.reading.totalReadingTime += readingDuration;
          
          // 检查沉浸阅读成就
          if (readingDuration > 600000) { // 10分钟
            this.checkAchievement('immersive-reader');
          }
          
          isReading = false;
          readingStartTime = null;
        }
      }
    });
    
    // 监听文章加载
    if (typeof window.ForestInteractions !== 'undefined') {
      // 通过事件监听文章变化
      document.addEventListener('forest-article-loaded', () => {
        this.estimateCurrentArticleWords();
        this.stats.reading.articlesRead++;
        this.checkAchievement('reading-seedling');
        this.saveUserData();
      });
    }
  },
  
  // 设置探索检测器
  setupExplorationDetector() {
    // 监听动物发现事件（来自现有系统）
    document.addEventListener('forest-animal-discovered', (e) => {
      const animalType = e.detail?.animalType;
      if (animalType) {
        this.stats.exploration.animalsDiscovered.add(animalType);
        this.checkAchievement('animal-observer');
        
        // 检查是否发现所有动物
        if (this.stats.exploration.animalsDiscovered.size >= 3) {
          this.checkAchievement('forest-detective');
        }
        
        this.saveUserData();
      }
    });
    
    // 监听特殊页面访问
    const currentPath = window.location.pathname;
    if (currentPath.includes('/about') || currentPath.includes('/archives') || 
        currentPath.includes('/categories') || currentPath.includes('/tags')) {
      this.stats.exploration.specialPagesVisited.add(currentPath);
      this.saveUserData();
    }
  },
  
  // 设置互动检测器
  setupInteractionDetector() {
    // 监听书签添加事件
    document.addEventListener('forest-bookmark-added', () => {
      this.stats.interaction.bookmarksAdded++;
      this.checkAchievement('bookmark-collector');
      this.checkInteractionMasterAchievement();
      this.saveUserData();
    });
    
    // 监听分享事件（需要页面有分享按钮）
    const shareButtons = document.querySelectorAll('[data-share-button], .share-btn');
    shareButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.stats.interaction.articlesShared++;
        this.checkAchievement('share-promoter');
        this.checkInteractionMasterAchievement();
        this.saveUserData();
      });
    });
    
    // 监听评论提交（需要评论系统支持）
    const commentForms = document.querySelectorAll('#comment-form, .comment-form');
    commentForms.forEach(form => {
      form.addEventListener('submit', () => {
        this.stats.interaction.commentsPosted++;
        this.checkAchievement('comment-contributor');
        this.checkInteractionMasterAchievement();
        this.saveUserData();
      });
    });
  },
  
  // 检查阅读相关成就
  checkReadingAchievements(totalScrolled) {
    if (this.currentSession.currentArticleWords === 0) return;
    
    // 估算已阅读字数（基于滚动比例）
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const readPercentage = scrollHeight > 0 ? Math.min(totalScrolled / scrollHeight, 1) : 0;
    const wordsRead = Math.round(this.currentSession.currentArticleWords * readPercentage);
    
    // 更新会话统计
    this.currentSession.wordsReadThisSession = wordsRead;
    
    // 更新总统计
    const previousTotal = this.stats.reading.totalWordsRead;
    this.stats.reading.totalWordsRead = Math.max(previousTotal, wordsRead);
    
    // 检查字数相关成就
    if (this.stats.reading.totalWordsRead >= 10000 && previousTotal < 10000) {
      this.checkAchievement('knowledge-explorer');
    }
    
    if (this.stats.reading.totalWordsRead >= 50000 && previousTotal < 50000) {
      this.checkAchievement('forest-scholar');
    }
  },
  
  // 检查互动大师成就
  checkInteractionMasterAchievement() {
    const interactionsCompleted = 
      (this.stats.interaction.bookmarksAdded > 0 ? 1 : 0) +
      (this.stats.interaction.articlesShared > 0 ? 1 : 0) +
      (this.stats.interaction.commentsPosted > 0 ? 1 : 0);
    
    if (interactionsCompleted >= 3) {
      this.checkAchievement('interaction-master');
    }
  },
  
  // 检查成就条件
  checkAchievement(achievementId) {
    const achievement = this.config.achievements[achievementId];
    if (!achievement || this.unlockedAchievements.has(achievementId)) {
      return; // 成就不存在或已解锁
    }
    
    const condition = achievement.condition;
    let isUnlocked = false;
    
    switch (condition.type) {
      case 'articles_read':
        isUnlocked = this.stats.reading.articlesRead >= condition.threshold;
        break;
        
      case 'words_read':
        isUnlocked = this.stats.reading.totalWordsRead >= condition.threshold;
        break;
        
      case 'reading_time':
        isUnlocked = this.stats.reading.longestSession >= condition.threshold;
        break;
        
      case 'animals_discovered':
        isUnlocked = this.stats.exploration.animalsDiscovered.size >= condition.threshold;
        break;
        
      case 'easter_eggs_found':
        isUnlocked = this.stats.exploration.easterEggsFound.size >= condition.threshold;
        break;
        
      case 'bookmarks_added':
        isUnlocked = this.stats.interaction.bookmarksAdded >= condition.threshold;
        break;
        
      case 'articles_shared':
        isUnlocked = this.stats.interaction.articlesShared >= condition.threshold;
        break;
        
      case 'comments_posted':
        isUnlocked = this.stats.interaction.commentsPosted >= condition.threshold;
        break;
        
      case 'interactions_completed':
        const completed = 
          (this.stats.interaction.bookmarksAdded > 0 ? 1 : 0) +
          (this.stats.interaction.articlesShared > 0 ? 1 : 0) +
          (this.stats.interaction.commentsPosted > 0 ? 1 : 0);
        isUnlocked = completed >= condition.threshold;
        break;
    }
    
    if (isUnlocked) {
      this.unlockAchievement(achievementId);
    }
  },
  
  // 解锁成就
  unlockAchievement(achievementId) {
    const achievement = this.config.achievements[achievementId];
    if (!achievement) return;
    
    // 添加到已解锁集合
    this.unlockedAchievements.add(achievementId);
    
    // 发放奖励（植物）
    if (achievement.reward && achievement.reward.plantId) {
      this.collectPlant(achievement.reward.plantId);
    }
    
    // 保存数据
    this.saveUserData();
    
    // 显示通知
    if (this.config.showNotifications) {
      this.showAchievementNotification(achievement);
    }
    
    // 触发事件
    this.triggerAchievementUnlockedEvent(achievement);
    
    console.log(`🏆 成就解锁: ${achievement.name}`);
  },
  
  // 收集植物
  collectPlant(plantId) {
    if (plantId >= 1 && plantId <= this.config.maxPlants) {
      this.collectedPlants.add(plantId);
      console.log(`🌿 收集植物: ${this.getPlantName(plantId)}`);
    }
  },
  
  // 获取植物名称
  getPlantName(plantId) {
    const plant = this.config.plants.find(p => p.id === plantId);
    return plant ? plant.name : `植物 #${plantId}`;
  },
  
  // 获取植物emoji
  getPlantEmoji(plantId) {
    const plant = this.config.plants.find(p => p.id === plantId);
    return plant ? plant.emoji : '🌿';
  },
  
  // 显示成就通知
  showAchievementNotification(achievement) {
    // 实现将在Task 7中完成
    console.log(`🏆 显示成就通知: ${achievement.name}`);
  },
  
  // 触发成就解锁事件
  triggerAchievementUnlockedEvent(achievement) {
    const event = new CustomEvent('forest-achievement-unlocked', {
      detail: {
        id: achievement.id,
        name: achievement.name,
        type: achievement.type,
        reward: achievement.reward,
        timestamp: new Date().toISOString()
      }
    });
    document.dispatchEvent(event);
  },
  
  // 创建UI元素
  createUIElements() {
    // 实现将在Task 6中完成
    console.log('🏆 创建UI元素');
  },
  
  // 设置事件监听
  setupEventListeners() {
    // 实现将在Task 7中完成
    console.log('🏆 设置事件监听');
  },
  
  // 获取系统状态
  getStatus() {
    return {
      initialized: this.isInitialized,
      unlockedCount: this.unlockedAchievements.size,
      collectedPlantsCount: this.collectedPlants.size,
      totalPoints: this.calculateTotalPoints(),
      stats: {
        reading: this.stats.reading,
        exploration: {
          animalsDiscovered: this.stats.exploration.animalsDiscovered.size,
          easterEggsFound: this.stats.exploration.easterEggsFound.size,
          specialPagesVisited: this.stats.exploration.specialPagesVisited.size
        },
        interaction: this.stats.interaction
      }
    };
  }
};
```

- [ ] **Step 4: 测试基础模块创建**

运行：`pnpm run build`
预期：成功构建，无JavaScript错误

检查构建输出：`ls public/js/forest/` 应包含 `forest-achievements.js`
预期：`forest-achievements.js` 文件存在

- [ ] **Step 5: 提交成就系统基础**

```bash
git add source/js/forest/forest-achievements.js source/_data/forest-achievements.styl source/_data/forest-theme.styl
git commit -m "feat: 创建成就系统基础模块与样式框架"
```

### Task 6: 成就系统UI创建与通知

**Files:**
- Modify: `source/js/forest/forest-achievements.js`（添加UI创建函数）

- [ ] **Step 1: 添加成就通知创建函数**

在 `forest-achievements.js` 的 `createUIElements()` 函数中实现：

```javascript
  // 创建UI元素
  createUIElements() {
    // 创建成就图鉴按钮
    this.createHerbariumButton();
    
    // 创建通知容器
    this.createNotificationContainer();
    
    console.log('🏆 UI元素已创建');
  },
  
  // 创建成就图鉴按钮
  createHerbariumButton() {
    if (document.getElementById('forest-achievements-toggle')) return;
    
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
    
    document.body.appendChild(toggleBtn);
  },
  
  // 创建通知容器
  createNotificationContainer() {
    // 容器已通过CSS定位，不需要额外创建
  },
  
  // 显示成就通知
  showAchievementNotification(achievement) {
    if (!this.config.showNotifications) return;
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'forest-achievement-notification';
    notification.id = `achievement-notification-${Date.now()}`;
    
    // 获取植物奖励信息
    const plantId = achievement.reward?.plantId;
    const plantName = plantId ? this.getPlantName(plantId) : '';
    const plantEmoji = plantId ? this.getPlantEmoji(plantId) : '🌿';
    
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
        ${plantId ? `
        <div class="achievement-reward">
          <span class="reward-emoji">${plantEmoji}</span>
          <span>发现了新的植物：${plantName}</span>
        </div>
        ` : ''}
        <div class="achievement-progress">
          <div>进度：${this.unlockedAchievements.size}/${Object.keys(this.config.achievements).length} 项成就</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(this.unlockedAchievements.size / Object.keys(this.config.achievements).length) * 100}%"></div>
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
    
    // 自动隐藏（5秒后）
    setTimeout(() => {
      this.hideNotification(notification);
    }, 5000);
    
    // 播放庆祝动画
    this.playCelebrationAnimation(notification);
    
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
  
  // 播放庆祝动画
  playCelebrationAnimation(notification) {
    // 创建森林绿色粒子
    const particles = [];
    const particleColors = ['#5E8C31', '#9ACD32', '#87CEEB'];
    
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      const colorClass = `particle-${(i % 3) + 1}`;
      particle.className = `forest-celebration-particle ${colorClass}`;
      
      // 随机位置
      const rect = notification.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;
      
      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      
      // 随机运动
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      const targetX = startX + Math.cos(angle) * distance;
      const targetY = startY + Math.sin(angle) * distance;
      
      document.body.appendChild(particle);
      particles.push({ element: particle, targetX, targetY });
    }
    
    // 动画粒子
    particles.forEach((particle, index) => {
      const duration = 1000 + Math.random() * 500;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentX = particle.targetX * progress;
        const currentY = particle.targetY * progress;
        
        particle.element.style.transform = `translate(${currentX}px, ${currentY}px)`;
        particle.element.style.opacity = 1 - progress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (particle.element.parentNode) {
            particle.element.parentNode.removeChild(particle.element);
          }
        }
      };
      
      requestAnimationFrame(animate);
    });
    
    // 成就图标缩放动画
    const icon = notification.querySelector('.achievement-icon');
    if (icon) {
      icon.classList.add('achievement-icon-pop');
    }
  },
  
  // 更新成就徽章
  updateAchievementsBadge() {
    const badge = document.getElementById('forest-achievements-badge');
    if (badge) {
      // 如果有新解锁的成就，显示徽章
      const hasNewAchievements = this.pendingNotifications.length > 0;
      badge.style.display = hasNewAchievements ? 'flex' : 'none';
      badge.textContent = this.pendingNotifications.length > 9 ? '9+' : this.pendingNotifications.length.toString();
    }
  },
```

- [ ] **Step 2: 添加成就图鉴界面函数**

在 `forest-achievements.js` 中添加：

```javascript
  // 显示成就图鉴
  showHerbarium() {
    // 创建或显示图鉴模态框
    let herbarium = document.getElementById('forest-achievements-herbarium');
    
    if (!herbarium) {
      herbarium = document.createElement('div');
      herbarium.id = 'forest-achievements-herbarium';
      herbarium.className = 'forest-achievements-herbarium';
      herbarium.innerHTML = this.getHerbariumHTML();
      
      document.body.appendChild(herbarium);
      
      // 添加事件监听
      this.setupHerbariumEvents(herbarium);
    }
    
    // 更新内容
    this.updateHerbariumContent();
    
    // 显示模态框
    herbarium.classList.add('visible');
    
    // 清除徽章
    this.clearAchievementsBadge();
  },
  
  // 获取图鉴HTML
  getHerbariumHTML() {
    return `
      <div class="herbarium-container">
        <div class="herbarium-header">
          <h2><span class="header-emoji">🏆</span>森林成就图鉴</h2>
          <button class="herbarium-close-btn" aria-label="关闭">×</button>
        </div>
        <div class="herbarium-tabs">
          <button class="herbarium-tab active" data-tab="plants">
            <span class="tab-emoji">🌿</span>植物图鉴
            <span class="tab-badge" id="plants-badge">0</span>
          </button>
          <button class="herbarium-tab" data-tab="reading">
            <span class="tab-emoji">📚</span>阅读成就
            <span class="tab-badge" id="reading-badge">0</span>
          </button>
          <button class="herbarium-tab" data-tab="exploration">
            <span class="tab-emoji">🔍</span>探索成就
            <span class="tab-badge" id="exploration-badge">0</span>
          </button>
          <button class="herbarium-tab" data-tab="interaction">
            <span class="tab-emoji">💬</span>互动成就
            <span class="tab-badge" id="interaction-badge">0</span>
          </button>
        </div>
        <div class="herbarium-content" id="herbarium-content">
          <!-- 内容动态加载 -->
        </div>
      </div>
    `;
  },
  
  // 设置图鉴事件
  setupHerbariumEvents(herbarium) {
    // 关闭按钮
    herbarium.querySelector('.herbarium-close-btn').addEventListener('click', () => {
      herbarium.classList.remove('visible');
    });
    
    // 点击外部关闭
    herbarium.addEventListener('click', (e) => {
      if (e.target === herbarium) {
        herbarium.classList.remove('visible');
      }
    });
    
    // 选项卡切换
    herbarium.querySelectorAll('.herbarium-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabId = e.currentTarget.dataset.tab;
        this.switchHerbariumTab(tabId);
      });
    });
  },
  
  // 切换图鉴选项卡
  switchHerbariumTab(tabId) {
    // 更新激活状态
    document.querySelectorAll('.herbarium-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    
    // 更新内容
    this.updateHerbariumContent(tabId);
  },
  
  // 更新图鉴内容
  updateHerbariumContent(tabId = 'plants') {
    const content = document.getElementById('herbarium-content');
    if (!content) return;
    
    let html = '';
    
    switch (tabId) {
      case 'plants':
        html = this.getPlantsTabHTML();
        break;
      case 'reading':
        html = this.getAchievementsTabHTML('reading');
        break;
      case 'exploration':
        html = this.getAchievementsTabHTML('exploration');
        break;
      case 'interaction':
        html = this.getAchievementsTabHTML('interaction');
        break;
    }
    
    content.innerHTML = html;
    
    // 更新徽章计数
    this.updateTabBadges();
  },
  
  // 获取植物选项卡HTML
  getPlantsTabHTML() {
    let html = '<div class="achievements-grid">';
    
    for (let i = 1; i <= this.config.maxPlants; i++) {
      const isCollected = this.collectedPlants.has(i);
      const plant = this.config.plants.find(p => p.id === i) || { name: `植物 #${i}`, emoji: '🌿', description: '待发现的森林植物' };
      
      html += `
        <div class="achievement-card ${isCollected ? 'unlocked' : 'locked'}">
          <div class="achievement-icon">${isCollected ? plant.emoji : '❓'}</div>
          <div class="achievement-name">${isCollected ? plant.name : '未知植物'}</div>
          <div class="achievement-description">${isCollected ? plant.description : '尚未发现'}</div>
          <div class="achievement-status ${isCollected ? 'status-unlocked' : 'status-locked'}">
            ${isCollected ? '已收集' : '未发现'}
          </div>
        </div>
      `;
    }
    
    html += '</div>';
    html += this.getStatsHTML();
    
    return html;
  },
  
  // 获取成就选项卡HTML
  getAchievementsTabHTML(type) {
    const achievements = Object.values(this.config.achievements).filter(a => a.type === type);
    let html = '<div class="achievements-grid">';
    
    achievements.forEach(achievement => {
      const isUnlocked = this.unlockedAchievements.has(achievement.id);
      
      html += `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-name">${achievement.name}</div>
          <div class="achievement-description">${achievement.description}</div>
          <div class="achievement-status ${isUnlocked ? 'status-unlocked' : 'status-locked'}">
            ${isUnlocked ? '已解锁' : '待解锁'}
          </div>
          ${!isUnlocked ? `
          <div class="achievement-progress">
            <div class="progress-text">
              <span>进度</span>
              <span>${this.getAchievementProgress(achievement)}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${this.getAchievementProgressPercent(achievement)}%"></div>
            </div>
          </div>
          ` : ''}
        </div>
      `;
    });
    
    html += '</div>';
    html += this.getStatsHTML();
    
    return html;
  },
  
  // 获取成就进度文本
  getAchievementProgress(achievement) {
    const condition = achievement.condition;
    let current = 0;
    let total = condition.threshold;
    
    switch (condition.type) {
      case 'articles_read':
        current = this.stats.reading.articlesRead;
        break;
      case 'words_read':
        current = this.stats.reading.totalWordsRead;
        total = Math.min(total, 100000); // 显示上限
        break;
      case 'reading_time':
        current = this.stats.reading.longestSession;
        break;
      case 'animals_discovered':
        current = this.stats.exploration.animalsDiscovered.size;
        break;
      case 'easter_eggs_found':
        current = this.stats.exploration.easterEggsFound.size;
        break;
      case 'bookmarks_added':
        current = this.stats.interaction.bookmarksAdded;
        break;
      case 'articles_shared':
        current = this.stats.interaction.articlesShared;
        break;
      case 'comments_posted':
        current = this.stats.interaction.commentsPosted;
        break;
      case 'interactions_completed':
        current = (this.stats.interaction.bookmarksAdded > 0 ? 1 : 0) +
                 (this.stats.interaction.articlesShared > 0 ? 1 : 0) +
                 (this.stats.interaction.commentsPosted > 0 ? 1 : 0);
        break;
    }
    
    return `${current}/${total}`;
  },
  
  // 获取成就进度百分比
  getAchievementProgressPercent(achievement) {
    const condition = achievement.condition;
    let current = 0;
    let total = condition.threshold;
    
    switch (condition.type) {
      case 'articles_read':
        current = this.stats.reading.articlesRead;
        break;
      case 'words_read':
        current = this.stats.reading.totalWordsRead;
        total = Math.min(total, 100000);
        break;
      // ... 其他类型类似
    }
    
    return total > 0 ? Math.min((current / total) * 100, 100) : 0;
  },
  
  // 获取统计HTML
  getStatsHTML() {
    const totalPoints = this.calculateTotalPoints();
    const totalAchievements = Object.keys(this.config.achievements).length;
    const unlockedCount = this.unlockedAchievements.size;
    const collectedCount = this.collectedPlants.size;
    
    return `
      <div class="achievements-stats">
        <h3><span class="stats-emoji">📊</span>统计概览</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label"><span class="stat-emoji">🏆</span>成就进度</div>
            <div class="stat-value">${unlockedCount}/${totalAchievements}</div>
            <div class="stat-progress">${Math.round((unlockedCount / totalAchievements) * 100)}% 完成</div>
          </div>
          <div class="stat-item">
            <div class="stat-label"><span class="stat-emoji">🌿</span>植物收集</div>
            <div class="stat-value">${collectedCount}/${this.config.maxPlants}</div>
            <div class="stat-progress">${Math.round((collectedCount / this.config.maxPlants) * 100)}% 完成</div>
          </div>
          <div class="stat-item">
            <div class="stat-label"><span class="stat-emoji">⭐</span>总积分</div>
            <div class="stat-value">${totalPoints}</div>
            <div class="stat-progress">成就点数</div>
          </div>
          <div class="stat-item">
            <div class="stat-label"><span class="stat-emoji">📖</span>阅读字数</div>
            <div class="stat-value">${this.stats.reading.totalWordsRead.toLocaleString()}</div>
            <div class="stat-progress">累计阅读</div>
          </div>
        </div>
      </div>
    `;
  },
  
  // 更新选项卡徽章
  updateTabBadges() {
    const badges = {
      plants: this.collectedPlants.size,
      reading: Array.from(this.unlockedAchievements).filter(id => 
        this.config.achievements[id]?.type === 'reading').length,
      exploration: Array.from(this.unlockedAchievements).filter(id => 
        this.config.achievements[id]?.type === 'exploration').length,
      interaction: Array.from(this.unlockedAchievements).filter(id => 
        this.config.achievements[id]?.type === 'interaction').length
    };
    
    Object.entries(badges).forEach(([tabId, count]) => {
      const badge = document.getElementById(`${tabId}-badge`);
      if (badge) {
        badge.textContent = count.toString();
      }
    });
  },
  
  // 清除成就徽章
  clearAchievementsBadge() {
    const badge = document.getElementById('forest-achievements-badge');
    if (badge) {
      badge.style.display = 'none';
      this.pendingNotifications = [];
    }
  },
```

- [ ] **Step 3: 测试成就UI功能**

运行：`pnpm run build`
预期：成功构建

重启开发服务器：`pkill -f "hexo server" && pnpm run server &`
访问页面，测试：
1. 右下角应显示🏆按钮（音频按钮左侧）
2. 点击🏆按钮应打开成就图鉴
3. 图鉴应有四个选项卡，内容正确显示
4. 通过控制台手动触发成就解锁：`ForestAchievements.unlockAchievement('reading-seedling')`
5. 应显示成就通知和庆祝动画

预期：UI功能正常工作，通知显示正确，动画使用森林绿色

- [ ] **Step 4: 提交成就UI功能**

```bash
git add source/js/forest/forest-achievements.js
git commit -m "feat: 完成成就系统UI创建与通知功能"
```

### Task 7: 成就系统事件集成

**Files:**
- Modify: `source/js/forest/forest-achievements.js`（完善事件监听）
- Modify: `source/js/forest/forest-interactions.js`（转发动物发现事件）

- [ ] **Step 1: 完善成就系统事件监听**

在 `forest-achievements.js` 的 `setupEventListeners()` 函数中实现：

```javascript
  // 设置事件监听
  setupEventListeners() {
    // 监听成就解锁事件（用于音频反馈）
    document.addEventListener('forest-achievement-unlocked', (e) => {
      const achievement = e.detail;
      
      // 添加到待通知队列
      this.pendingNotifications.push(achievement);
      
      // 更新徽章
      this.updateAchievementsBadge();
      
      // 播放成就音效（如果音频系统可用且启用）
      if (this.config.achievementSound && window.ForestAudio && 
          typeof window.ForestAudio.playClickFeedback === 'function') {
        window.ForestAudio.playClickFeedback();
      }
    });
    
    // 监听文章加载事件
    document.addEventListener('forest-article-loaded', () => {
      this.estimateCurrentArticleWords();
      this.stats.reading.articlesRead++;
      this.checkAchievement('reading-seedling');
      this.saveUserData();
    });
    
    // 监听页面卸载以保存数据
    window.addEventListener('beforeunload', () => {
      this.saveUserData();
    });
    
    // 监听日夜切换事件
    document.addEventListener('forest-theme-changed', (e) => {
      const theme = e.detail?.theme;
      if (theme) {
        // 更新图鉴主题样式（如果需要）
        this.updateHerbariumTheme(theme);
      }
    });
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
```

- [ ] **Step 2: 修改现有交互系统转发动物发现事件**

修改 `source/js/forest/forest-interactions.js` 的 `onAnimalClick()` 函数（约782-795行）：

```javascript
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
```

- [ ] **Step 3: 禁用原成就框架并转发事件**

修改 `source/js/forest/forest-interactions.js` 的配置部分（约55-60行）：

```javascript
    // 阅读成就系统 - 禁用（由新系统处理）
    achievements: {
      enabled: false,  // 禁用原系统
      plantsToCollect: 12,
      discoveryThreshold: 1000
    }
```

修改 `setupAchievementSystem()` 函数（约802-827行）改为事件转发：

```javascript
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
```

- [ ] **Step 4: 测试事件集成**

运行：`pnpm run build`
预期：成功构建

重启开发服务器：`pkill -f "hexo server" && pnpm run server &`
访问包含隐藏动物的文章页面，测试：
1. 发现隐藏动物应触发成就系统记录
2. 控制台检查：`ForestAchievements.stats.exploration.animalsDiscovered` 应包含发现的动物
3. 发现第一个动物应解锁"动物观察者"成就
4. 发现所有三种动物应解锁"森林侦探"成就

预期：事件正确传递，成就自动解锁，通知正常显示

- [ ] **Step 5: 提交事件集成**

```bash
git add source/js/forest/forest-achievements.js source/js/forest/forest-interactions.js
git commit -m "feat: 完成成就系统事件集成与现有系统对接"
```

### Task 8: 成就系统配置完善与测试

**Files:**
- Modify: `_config.next.yml`（完善配置）
- Modify: `source/_data/body-end.njk`（更新脚本配置）

- [ ] **Step 1: 完善成就系统配置选项**

更新 `_config.next.yml` 中的成就配置：

```yaml
  # 成就系统配置
  achievements:
    enabled: true
    show_notifications: true
    show_progress_indicator: true
    max_plants: 12
    achievement_sound: true
    notification_duration: 5  # 通知显示秒数
    celebration_animations: true  # 庆祝动画开关
    enable_keyboard_shortcuts: true  # 快捷键(Ctrl+Shift+H打开图鉴)
```

- [ ] **Step 2: 更新脚本配置读取**

在 `forest-achievements.js` 的 `init()` 函数开头完善配置读取：

```javascript
    // 读取全局配置
    if (window.FOREST_ACHIEVEMENTS_CONFIG) {
      Object.assign(this.config, window.FOREST_ACHIEVEMENTS_CONFIG);
      console.log('🏆 使用配置中的成就设置');
    }
    
    // 应用配置覆盖
    if (this.config.notification_duration) {
      this.notificationDuration = this.config.notification_duration * 1000;
    }
    
    if (this.config.celebration_animations !== undefined) {
      this.enableCelebrationAnimations = this.config.celebration_animations;
    }
```

- [ ] **Step 3: 添加快捷键支持**

在 `setupEventListeners()` 函数中添加：

```javascript
    // 键盘快捷键（Ctrl+Shift+H 打开成就图鉴）
    if (this.config.enable_keyboard_shortcuts !== false) {
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
          e.preventDefault();
          this.showHerbarium();
        }
      });
    }
```

- [ ] **Step 4: 全面测试成就系统**

运行：`pnpm run clean && pnpm run build`
预期：成功构建

启动开发服务器：`pnpm run server &`
进行全面测试：
1. 访问首页，检查右下角按钮（音频🎵 + 成就🏆）
2. 点击成就按钮打开图鉴，切换各选项卡
3. 访问文章页面，滚动阅读触发阅读成就
4. 发现隐藏动物触发探索成就
5. 添加书签（如果启用）触发互动成就
6. 测试配置开关：禁用通知后应不显示
7. 测试数据持久化：刷新页面后进度保持

预期：所有功能正常工作，配置生效，数据正确保存

- [ ] **Step 5: 提交成就系统完成**

```bash
git add _config.next.yml source/js/forest/forest-achievements.js
git commit -m "feat: 完善成就系统配置与测试，完成第二阶段开发"
```

---

## 第三阶段：系统集成与测试（预计1天）

### Task 9: 系统间通信与错误处理

**Files:**
- Modify: `source/js/forest/forest-audio.js`（添加成就音效）
- Modify: `source/js/forest/forest-achievements.js`（添加音频集成）

- [ ] **Step 1: 在音频系统中添加成就音效**

在 `forest-audio.js` 的音效定义中添加成就音效：

```javascript
      achievement: {
        name: '成就解锁',
        path: '/audio/achievement.mp3',
        volume: 0.3,
        loop: false,
        description: '成就解锁庆祝音效'
      }
```

在 `playClickFeedback()` 函数旁添加：

```javascript
  // 播放成就音效
  playAchievementSound() {
    if (this.config.enabled && this.config.sounds.achievement) {
      this.playSound('achievement', false);
    }
  },
```

- [ ] **Step 2: 在成就系统中集成音频反馈**

更新 `forest-achievements.js` 的成就解锁处理：

```javascript
    // 播放成就音效（如果音频系统可用且启用）
    if (this.config.achievementSound && window.ForestAudio) {
      // 检查音频系统是否初始化
      if (typeof window.ForestAudio.playAchievementSound === 'function') {
        window.ForestAudio.playAchievementSound();
      } else if (typeof window.ForestAudio.playClickFeedback === 'function') {
        // 回退到点击音效
        window.ForestAudio.playClickFeedback();
      }
    }
```

- [ ] **Step 3: 添加错误处理与降级**

在 `forest-achievements.js` 的 `init()` 函数中添加：

```javascript
    // 错误处理：如果localStorage不可用，降级到内存存储
    try {
      localStorage.setItem('forest-test', 'test');
      localStorage.removeItem('forest-test');
    } catch (error) {
      console.warn('🏆 localStorage不可用，使用内存存储（进度不会持久化）');
      this.useMemoryStorage = true;
      this.memoryStorage = {};
    }
    
    // 兼容性检查
    if (!('Set' in window) || !('Map' in window)) {
      console.warn('🏆 浏览器不支持Set/Map，成就功能受限');
      this.config.enabled = false;
      return;
    }
```

- [ ] **Step 4: 添加性能监控**

在关键函数中添加性能日志：

```javascript
  // 带性能监控的成就检查
  checkAchievementWithPerf(achievementId) {
    const startTime = performance.now();
    this.checkAchievement(achievementId);
    const duration = performance.now() - startTime;
    
    if (duration > 50) {
      console.warn(`🏆 成就检查耗时较长: ${duration.toFixed(2)}ms (${achievementId})`);
    }
  },
```

- [ ] **Step 5: 测试系统集成**

运行：`pnpm run build`
预期：成功构建

测试集成功能：
1. 解锁成就时应有音效（如果音频启用）
2. 禁用localStorage时应使用内存存储（控制台警告）
3. 性能监控应在控制台显示耗时警告

预期：系统间通信正常，错误处理优雅，性能可接受

- [ ] **Step 6: 提交系统集成**

```bash
git add source/js/forest/forest-audio.js source/js/forest/forest-achievements.js
git commit -m "feat: 完成系统间通信与错误处理集成"
```

### Task 10: 跨浏览器兼容性测试

**Files:**
- Modify: `source/js/forest/forest-audio.js`（添加兼容性处理）
- Modify: `source/js/forest/forest-achievements.js`（添加Polyfill）

- [ ] **Step 1: 添加Web Audio API兼容性处理**

在 `forest-audio.js` 的 `init()` 函数中加强兼容性检查：

```javascript
    // 检查浏览器支持
    const audioContextSupported = !!(window.AudioContext || window.webkitAudioContext);
    const getUserMediaSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    if (!audioContextSupported) {
      console.warn('🎧 浏览器不支持Web Audio API，音频功能不可用');
      this.showUnsupportedMessage();
      this.config.enabled = false;
      return;
    }
    
    // 检查自动播放策略
    if (typeof this.audioContext.resume !== 'function') {
      console.warn('🎧 音频上下文不支持resume()，移动端体验可能受限');
    }
```

- [ ] **Step 2: 添加ES6+特性Polyfill检查**

在 `forest-achievements.js` 开头添加兼容性检查：

```javascript
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
  // ... 现有代码
}
```

- [ ] **Step 3: 添加CSS特性检测与回退**

在 `forest-achievements.styl` 开头添加CSS兼容性注释：

```stylus
// CSS特性检测建议
// 需要CSS Grid支持（2017+浏览器），如不支持可使用Flexbox回退
// 需要 backdrop-filter 支持（可选增强）

.forest-achievements-herbarium {
  // Flexbox回退
  display: flex;
  
  @supports (display: grid) {
    // Grid增强布局
  }
  
  @supports (backdrop-filter: blur(5px)) {
    backdrop-filter: blur(5px);
  }
  
  @supports not (backdrop-filter: blur(5px)) {
    background: rgba(0, 0, 0, 0.85); // 降级透明度
  }
}
```

- [ ] **Step 4: 测试不同浏览器环境**

模拟测试（无需实际不同浏览器）：
1. 运行构建检查语法兼容性：`npx es-check es5 source/js/forest/*.js`
2. 检查CSS兼容性：手动审查样式文件
3. 测试禁用JavaScript情况：页面应正常显示，功能不可用但无错误

预期：代码符合ES5+标准，CSS有适当回退

- [ ] **Step 5: 提交兼容性改进**

```bash
git add source/js/forest/forest-audio.js source/js/forest/forest-achievements.js source/_data/forest-achievements.styl
git commit -m "feat: 添加跨浏览器兼容性处理与Polyfill"
```

---

## 第四阶段：优化与部署（预计0.5天）

### Task 11: 性能优化与资源管理

**Files:**
- Modify: `source/js/forest/forest-audio.js`（添加懒加载）
- Modify: `source/js/forest/forest-achievements.js`（添加防抖）

- [ ] **Step 1: 音频资源懒加载优化**

修改 `forest-audio.js` 的 `loadSound()` 函数：

```javascript
  // 加载音效（带懒加载队列）
  loadSound(soundId, priority = 'normal') {
    // 如果已经在加载队列中，返回现有Promise
    if (this.loadingPromises[soundId]) {
      return this.loadingPromises[soundId];
    }
    
    const loadPromise = new Promise((resolve, reject) => {
      // 实际加载逻辑...
    });
    
    this.loadingPromises[soundId] = loadPromise;
    
    // 加载完成后清理Promise引用
    loadPromise.finally(() => {
      delete this.loadingPromises[soundId];
    });
    
    return loadPromise;
  },
  
  // 预加载常用音效
  preloadPrioritySounds() {
    const prioritySounds = ['click', 'achievement'];
    prioritySounds.forEach(soundId => {
      this.loadSound(soundId, 'high').catch(() => {
        console.warn(`🎧 预加载音效失败: ${soundId}`);
      });
    });
  },
```

- [ ] **Step 2: 成就检测防抖优化**

在 `forest-achievements.js` 中添加防抖函数：

```javascript
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
  
  // 防抖的滚动检测
  setupReadingDetector() {
    const checkReadingDebounced = this.debounce(() => {
      this.checkReadingAchievements(this.currentScrollTotal);
    }, 500);
    
    window.addEventListener('scroll', () => {
      // ... 更新滚动统计
      checkReadingDebounced();
    });
  },
```

- [ ] **Step 3: 内存泄漏预防**

添加清理函数：

```javascript
  // 清理函数（页面卸载时调用）
  cleanup() {
    // 移除事件监听器
    window.removeEventListener('scroll', this.scrollHandler);
    document.removeEventListener('forest-animal-discovered', this.animalHandler);
    
    // 清理DOM引用
    this.uiElements = null;
    
    // 保存最后状态
    this.saveUserData();
    
    console.log('🏆 成就系统已清理');
  },
```

- [ ] **Step 4: 性能测试与优化**

运行构建并测试性能：
1. 使用Chrome DevTools Performance面板记录页面加载
2. 检查JavaScript执行时间，目标<100ms
3. 检查内存使用，目标增加<5MB
4. 检查布局重绘，目标<10次/秒

优化建议：
- 如果性能不佳，考虑延迟加载非关键资源
- 如果内存增长，检查事件监听器泄漏

- [ ] **Step 5: 提交性能优化**

```bash
git add source/js/forest/forest-audio.js source/js/forest/forest-achievements.js
git commit -m "perf: 添加性能优化、懒加载和防抖处理"
```

### Task 12: 最终集成测试与部署

**Files:**
- Modify: `_config.next.yml`（最终配置）
- Create: `docs/forest-features-guide.md`（功能使用指南）

- [ ] **Step 1: 最终配置检查与优化**

更新 `_config.next.yml` 确保所有功能开关正确：

```yaml
# 森林主题配置 - 最终版本
forest_theme:
  features:
    audio: true                    # 音频系统
    achievements: true             # 成就系统
    hidden_animals: true           # 隐藏动物
    bookmarks: false               # 书签系统（暂不启用）
    
  audio:
    enabled: false                 # 默认静音，用户手动开启
    default_preset: 'morning'
    
  achievements:
    enabled: true
    show_notifications: true
    celebration_animations: true
    achievement_sound: true
```

- [ ] **Step 2: 创建功能使用指南**

创建 `docs/forest-features-guide.md`：

```markdown
# 森林图书馆主题功能指南

## 🎧 音频系统
- **位置**：页面右下角🎵按钮
- **功能**：6种环境音效（鸟鸣、风声、溪流等）
- **控制**：点击按钮展开控制面板，可调节音量和选择预设
- **预设**：晨林、雨林、溪畔三种预设组合
- **快捷键**：Ctrl+Shift+M 切换播放/暂停

## 🏆 成就系统
- **位置**：页面右下角🏆按钮（音频按钮左侧）
- **成就类型**：
  - 📚 阅读成就：阅读字数、文章数量、阅读时长
  - 🔍 探索成就：发现隐藏动物、彩蛋
  - 💬 互动成就：书签、分享、评论
- **奖励**：解锁成就可收集12种森林植物
- **图鉴**：点击🏆按钮打开成就图鉴，查看进度和统计
- **快捷键**：Ctrl+Shift+H 打开成就图鉴

## 🐿️ 隐藏动物彩蛋
- **位置**：文章段落中随机隐藏
- **发现**：鼠标悬停显示，点击有惊喜
- **动物**：松鼠🐿️、猫头鹰🦉、鹿🦌
- **成就**：发现动物解锁探索成就

## 🎨 主题特色
- **色彩**：森林绿色调色板，清新自然
- **动画**：所有动画避免黄色，使用绿色/蓝色
- **日夜模式**：右上角切换，适配不同光线

## ⚙️ 配置选项
在 `_config.next.yml` 中可调整：
- 启用/禁用特定功能
- 调整默认设置
- 自定义音效音量

## 🔧 故障排除
- **音频不工作**：检查浏览器是否支持Web Audio API
- **成就未保存**：检查浏览器localStorage是否启用
- **样式异常**：尝试强制刷新（Ctrl+F5）

---

*森林图书馆主题 v2.0 - 沉浸式阅读体验*
```

- [ ] **Step 3: 最终构建与验证**

运行完整构建流程：
```bash
pnpm run clean
pnpm run build
```

检查构建输出：
1. `public/js/forest/` 应包含所有JS文件
2. CSS应包含新样式
3. 无构建错误或警告

- [ ] **Step 4: 部署测试**

如果配置了Hexo部署，运行部署测试：
```bash
pnpm run deploy
```

或手动测试生产构建：
```bash
# 使用本地HTTP服务器测试
npx serve public -p 4000
```

访问 `http://localhost:4000` 测试所有功能

- [ ] **Step 5: 最终提交与标记**

```bash
git add _config.next.yml docs/forest-features-guide.md
git commit -m "chore: 最终配置、文档与部署准备

- 完善功能配置开关
- 添加用户使用指南
- 完成所有测试与优化"
```

---

## 执行选项

**计划完成并保存到 `docs/superpowers/plans/2026-04-06-hexo-blog-forest-library-audio-achievements-implementation.md`。**

**两个执行选项：**

**1. 子代理驱动（推荐）** - 我为每个任务派遣新的子代理，任务间进行审查，快速迭代

**2. 内联执行** - 在当前会话中使用executing-plans执行，批量执行并设置检查点

**选择哪种方式？**