/**
 * 森林音频环境系统
 * 提供环境音效管理，支持森林音效、专注音效和交互反馈
 * 默认静音，用户可手动启用
 */

const ForestAudio = {
  // 配置
  config: {
    enabled: false, // 默认静音
    masterVolume: 0.5,
    sounds: {
      // 音效定义 - 路径相对于站点根目录
      birds: {
        name: '鸟鸣',
        path: '/audio/birds.mp3',
        volume: 0.4,
        loop: true,
        description: '清晨森林鸟鸣声'
      },
      wind: {
        name: '风声', 
        path: '/audio/wind.mp3',
        volume: 0.3,
        loop: true,
        description: '轻柔的森林微风'
      },
      leaves: {
        name: '树叶声',
        path: '/audio/leaves.mp3',
        volume: 0.2,
        loop: true,
        description: '树叶沙沙声'
      },
      rain: {
        name: '雨声',
        path: '/audio/rain.mp3', 
        volume: 0.6,
        loop: true,
        description: '舒缓的雨声'
      },
      stream: {
        name: '溪流声',
        path: '/audio/stream.mp3',
        volume: 0.5,
        loop: true,
        description: '山间溪流声'
      },
      click: {
        name: '点击反馈',
        path: '/audio/click.mp3',
        volume: 0.1,
        loop: false,
        description: '点击交互音效'
      }
    }
  },
  
  // 状态
  audioContext: null,
  sounds: {},
  gainNodes: {},
  isInitialized: false,
  isPlaying: false,
  
  // 初始化音频系统
  init() {
    if (this.isInitialized) {
      console.log('🎧 音频系统已初始化');
      return;
    }
    
    // 检查浏览器支持
    if (!window.AudioContext && !window.webkitAudioContext) {
      console.warn('🎧 浏览器不支持Web Audio API，音频功能不可用');
      return;
    }
    
    // 创建音频上下文
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass();
    
    // 加载用户偏好
    this.loadPreferences();
    
    // 创建主音量控制
    this.createMasterGain();
    
    // 预加载音效（懒加载，实际使用时加载）
    this.setupSoundBuffers();
    
    this.isInitialized = true;
    console.log('🎧 森林音频系统已初始化');
    
    // 如果用户启用了音频，则开始播放环境音效
    if (this.config.enabled) {
      this.startAmbientSounds();
    }
    
    // 创建UI控制面板
    this.createAudioControls();
  },
  
  // 加载用户偏好
  loadPreferences() {
    const savedPrefs = localStorage.getItem('forest-audio-preferences');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        this.config.enabled = prefs.enabled || false;
        this.config.masterVolume = prefs.masterVolume || 0.5;
        
        // 更新各个音效的音量
        if (prefs.soundVolumes) {
          Object.keys(prefs.soundVolumes).forEach(soundId => {
            if (this.config.sounds[soundId]) {
              this.config.sounds[soundId].volume = prefs.soundVolumes[soundId];
            }
          });
        }
      } catch (e) {
        console.warn('🎧 无法加载音频偏好，使用默认设置', e);
      }
    }
  },
  
  // 保存用户偏好
  savePreferences() {
    const soundVolumes = {};
    Object.keys(this.config.sounds).forEach(soundId => {
      soundVolumes[soundId] = this.config.sounds[soundId].volume;
    });
    
    const prefs = {
      enabled: this.config.enabled,
      masterVolume: this.config.masterVolume,
      soundVolumes
    };
    
    localStorage.setItem('forest-audio-preferences', JSON.stringify(prefs));
  },
  
  // 创建主音量增益节点
  createMasterGain() {
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = this.config.masterVolume;
    this.masterGain.connect(this.audioContext.destination);
  },
  
  // 设置音效缓冲区（懒加载）
  setupSoundBuffers() {
    this.sounds = {};
    this.gainNodes = {};
    
    Object.keys(this.config.sounds).forEach(soundId => {
      this.sounds[soundId] = null; // null表示未加载
      this.gainNodes[soundId] = this.audioContext.createGain();
      this.gainNodes[soundId].gain.value = this.config.sounds[soundId].volume;
      this.gainNodes[soundId].connect(this.masterGain);
    });
  },
  
  // 加载单个音效
  async loadSound(soundId) {
    if (!this.config.sounds[soundId]) {
      console.error(`🎧 音效 "${soundId}" 不存在`);
      return false;
    }
    
    // 如果已加载，直接返回
    if (this.sounds[soundId]) {
      return true;
    }
    
    const soundConfig = this.config.sounds[soundId];
    
    try {
      // 注意：实际项目中需要提供音频文件
      // 这里使用占位符，实际使用时应取消注释以下代码：
      /*
      const response = await fetch(soundConfig.path);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds[soundId] = audioBuffer;
      */
      
      // 临时：生成一个简单的合成音效作为占位符
      this.sounds[soundId] = this.generatePlaceholderSound(soundId);
      
      console.log(`🎧 音效 "${soundConfig.name}" 加载成功`);
      return true;
    } catch (error) {
      console.error(`🎧 音效 "${soundConfig.name}" 加载失败:`, error);
      
      // 生成占位符音效
      this.sounds[soundId] = this.generatePlaceholderSound(soundId);
      return true;
    }
  },
  
  // 生成占位符音效（简单合成音效）
  generatePlaceholderSound(soundId) {
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 2, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // 根据音效类型生成不同的声音
    switch(soundId) {
      case 'birds':
        // 鸟鸣：短促的啾啾声
        for (let i = 0; i < data.length; i++) {
          const t = i / this.audioContext.sampleRate;
          // 随机产生鸟鸣声
          if (Math.random() < 0.001) {
            const freq = 800 + Math.random() * 800;
            const duration = 0.1 + Math.random() * 0.2;
            for (let j = 0; j < duration * this.audioContext.sampleRate && i + j < data.length; j++) {
              const t2 = j / this.audioContext.sampleRate;
              data[i + j] = Math.sin(2 * Math.PI * freq * t2) * Math.exp(-t2 * 10);
            }
            i += duration * this.audioContext.sampleRate;
          }
        }
        break;
        
      case 'wind':
        // 风声：低频噪声
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * 0.1;
        }
        break;
        
      case 'rain':
        // 雨声：随机滴答声
        for (let i = 0; i < data.length; i++) {
          if (Math.random() < 0.01) {
            const amplitude = 0.05 + Math.random() * 0.1;
            const decay = 0.01 + Math.random() * 0.02;
            for (let j = 0; j < 100 && i + j < data.length; j++) {
              data[i + j] = amplitude * Math.exp(-j * decay);
            }
            i += 100;
          }
        }
        break;
        
      default:
        // 默认：静音
        for (let i = 0; i < data.length; i++) {
          data[i] = 0;
        }
    }
    
    return buffer;
  },
  
  // 播放音效
  playSound(soundId, options = {}) {
    if (!this.isInitialized || !this.config.enabled) {
      return null;
    }
    
    if (!this.config.sounds[soundId]) {
      console.error(`🎧 音效 "${soundId}" 不存在`);
      return null;
    }
    
    // 确保音频上下文已恢复（浏览器策略）
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // 如果音效未加载，先加载
    if (!this.sounds[soundId]) {
      this.loadSound(soundId).then(() => {
        this.playSound(soundId, options);
      });
      return null;
    }
    
    const soundConfig = this.config.sounds[soundId];
    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[soundId];
    
    // 连接增益节点
    source.connect(this.gainNodes[soundId]);
    
    // 设置播放选项
    if (options.volume !== undefined) {
      this.gainNodes[soundId].gain.value = options.volume;
    } else {
      this.gainNodes[soundId].gain.value = soundConfig.volume;
    }
    
    // 设置循环
    source.loop = options.loop !== undefined ? options.loop : soundConfig.loop;
    
    // 开始播放
    source.start();
    
    // 如果不是循环播放，设置停止时间
    if (!source.loop && options.duration) {
      source.stop(this.audioContext.currentTime + options.duration);
    }
    
    return source;
  },
  
  // 停止播放音效
  stopSound(soundId) {
    // 由于我们使用BufferSource，每次播放都是新的实例
    // 无法停止特定音效，可以通过设置音量为0来实现
    if (this.gainNodes[soundId]) {
      this.gainNodes[soundId].gain.value = 0;
    }
  },
  
  // 开始播放环境音效
  startAmbientSounds() {
    if (!this.isInitialized) {
      this.init();
      return;
    }
    
    if (this.isPlaying) {
      return;
    }
    
    // 播放循环环境音效
    Object.keys(this.config.sounds).forEach(soundId => {
      const soundConfig = this.config.sounds[soundId];
      if (soundConfig.loop && soundId !== 'click') {
        this.playSound(soundId);
      }
    });
    
    this.isPlaying = true;
    console.log('🎧 环境音效开始播放');
  },
  
  // 停止所有音效
  stopAllSounds() {
    Object.keys(this.gainNodes).forEach(soundId => {
      this.gainNodes[soundId].gain.value = 0;
    });
    
    this.isPlaying = false;
    console.log('🎧 所有音效已停止');
  },
  
  // 启用/禁用音频系统（旧版本 - 新UI使用单独的音效控制）
  toggleEnabled() {
    this.config.enabled = !this.config.enabled;
    
    if (this.config.enabled) {
      this.startAmbientSounds();
    } else {
      this.stopAllSounds();
    }
    
    this.savePreferences();
    // this.updateControlPanel(); // 旧UI函数已弃用
    
    return this.config.enabled;
  },
  
  // 设置主音量
  setMasterVolume(volume) {
    if (volume < 0) volume = 0;
    if (volume > 1) volume = 1;
    
    this.config.masterVolume = volume;
    this.masterGain.gain.value = volume;
    this.savePreferences();
  },
  
  // 设置单个音效音量
  setSoundVolume(soundId, volume) {
    if (!this.config.sounds[soundId]) {
      return;
    }
    
    if (volume < 0) volume = 0;
    if (volume > 1) volume = 1;
    
    this.config.sounds[soundId].volume = volume;
    this.gainNodes[soundId].gain.value = volume;
    this.savePreferences();
  },
  
  // 创建UI控制面板（旧版本 - 已弃用，由createAudioControls替代）
  /*
  createControlPanel() {
    // 检查是否已存在控制面板
    if (document.getElementById('forest-audio-controls')) {
      return;
    }
    
    // 创建控制面板容器
    const controls = document.createElement('div');
    controls.id = 'forest-audio-controls';
    controls.className = 'forest-audio-controls';
    
    // 创建控制按钮
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'forest-audio-toggle';
    toggleBtn.className = 'forest-audio-toggle';
    toggleBtn.innerHTML = this.config.enabled ? '🔊' : '🔇';
    toggleBtn.setAttribute('aria-label', this.config.enabled ? '关闭音效' : '开启音效');
    
    // 创建音量滑块容器（默认隐藏）
    const volumePanel = document.createElement('div');
    volumePanel.id = 'forest-audio-volume-panel';
    volumePanel.className = 'forest-audio-volume-panel';
    volumePanel.style.display = 'none';
    
    // 主音量滑块
    const masterVolumeLabel = document.createElement('label');
    masterVolumeLabel.textContent = '主音量';
    masterVolumeLabel.htmlFor = 'forest-audio-master-volume';
    
    const masterVolumeSlider = document.createElement('input');
    masterVolumeSlider.id = 'forest-audio-master-volume';
    masterVolumeSlider.type = 'range';
    masterVolumeSlider.min = '0';
    masterVolumeSlider.max = '100';
    masterVolumeSlider.value = this.config.masterVolume * 100;
    
    // 音效选择器（简化版）
    const soundsList = document.createElement('div');
    soundsList.className = 'forest-audio-sounds-list';
    
    Object.keys(this.config.sounds).forEach(soundId => {
      if (soundId === 'click') return; // 跳过点击音效
      
      const soundConfig = this.config.sounds[soundId];
      const soundItem = document.createElement('div');
      soundItem.className = 'forest-audio-sound-item';
      
      const soundLabel = document.createElement('label');
      soundLabel.textContent = soundConfig.name;
      soundLabel.htmlFor = `forest-audio-${soundId}`;
      
      const soundSlider = document.createElement('input');
      soundSlider.id = `forest-audio-${soundId}`;
      soundSlider.type = 'range';
      soundSlider.min = '0';
      soundSlider.max = '100';
      soundSlider.value = soundConfig.volume * 100;
      soundSlider.dataset.soundId = soundId;
      
      soundItem.appendChild(soundLabel);
      soundItem.appendChild(soundSlider);
      soundsList.appendChild(soundItem);
    });
    
    // 组装面板
    volumePanel.appendChild(masterVolumeLabel);
    volumePanel.appendChild(masterVolumeSlider);
    volumePanel.appendChild(soundsList);
    
    controls.appendChild(toggleBtn);
    controls.appendChild(volumePanel);
    
    // 添加到页面
    document.body.appendChild(controls);
    
    // 添加事件监听
    toggleBtn.addEventListener('click', () => {
      const enabled = this.toggleEnabled();
      toggleBtn.innerHTML = enabled ? '🔊' : '🔇';
      toggleBtn.setAttribute('aria-label', enabled ? '关闭音效' : '开启音效');
    });
    
    // 点击按钮展开/收起音量面板
    toggleBtn.addEventListener('dblclick', (e) => {
      e.preventDefault();
      volumePanel.style.display = volumePanel.style.display === 'none' ? 'block' : 'none';
    });
    
    // 音量滑块事件
    masterVolumeSlider.addEventListener('input', (e) => {
      const volume = e.target.value / 100;
      this.setMasterVolume(volume);
    });
    
    // 各音效音量滑块事件
    soundsList.querySelectorAll('input[type="range"]').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const soundId = e.target.dataset.soundId;
        const volume = e.target.value / 100;
        this.setSoundVolume(soundId, volume);
      });
    });
    
    // 点击页面其他地方关闭音量面板
    document.addEventListener('click', (e) => {
      if (!controls.contains(e.target) && volumePanel.style.display === 'block') {
        volumePanel.style.display = 'none';
      }
    });
    
    console.log('🎧 音频控制面板已创建');
  },
  */
  
  // 更新控制面板状态（旧版本 - 已弃用）
  /*
  updateControlPanel() {
    const toggleBtn = document.getElementById('forest-audio-toggle');
    const masterSlider = document.getElementById('forest-audio-master-volume');
    
    if (toggleBtn) {
      toggleBtn.innerHTML = this.config.enabled ? '🔊' : '🔇';
      toggleBtn.setAttribute('aria-label', this.config.enabled ? '关闭音效' : '开启音效');
    }
    
    if (masterSlider) {
      masterSlider.value = this.config.masterVolume * 100;
    }
    
    // 更新各音效滑块
    Object.keys(this.config.sounds).forEach(soundId => {
      const slider = document.getElementById(`forest-audio-${soundId}`);
      if (slider) {
        slider.value = this.config.sounds[soundId].volume * 100;
      }
    });
  },
  */
  
  // 播放点击反馈音效
  playClickFeedback() {
    if (this.config.enabled) {
      this.playSound('click');
    }
  },
  
  // 创建UI控制面板（新版本）
  createAudioControls() {
    // 检查是否已存在
    if (document.getElementById('forest-audio-toggle')) {
      return;
    }
    
    // 初始化用户设置（Task 3将实现完整状态管理）
    if (!this.userSettings) {
      this.userSettings = {
        enabledSounds: {},
        soundVolumes: {}
      };
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
    // 首先检查用户设置（Task 3将实现完整状态管理）
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
  
  // 设置主音量（新UI版本）
  setMasterVolume(volume) {
    this.config.masterVolume = volume;
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
    this.saveSettings();
  },
  
  // 切换音效
  toggleSound(soundId) {
    const soundItem = document.querySelector(`[data-sound-id="${soundId}"]`);
    if (!soundItem) return;
    
    const checkbox = soundItem.querySelector('.sound-checkbox');
    const volumeControl = soundItem.querySelector('.sound-volume-control');
    if (!checkbox || !volumeControl) return;
    
    const isEnabled = checkbox.classList.contains('checked');
    
    if (isEnabled) {
      // 禁用音效
      checkbox.classList.remove('checked');
      volumeControl.style.display = 'none';
      this.stopSound(soundId);
      
      // 更新用户设置（Task 3将实现完整状态管理）
      if (!this.userSettings.enabledSounds) {
        this.userSettings.enabledSounds = {};
      }
      this.userSettings.enabledSounds[soundId] = false;
    } else {
      // 启用音效
      checkbox.classList.add('checked');
      volumeControl.style.display = 'flex';
      this.playSound(soundId);
      
      // 更新用户设置（Task 3将实现完整状态管理）
      if (!this.userSettings.enabledSounds) {
        this.userSettings.enabledSounds = {};
      }
      this.userSettings.enabledSounds[soundId] = true;
    }
    
    this.saveSettings();
  },
  
  // 设置音效音量（新UI版本）
  setSoundVolume(soundId, volume) {
    if (!this.config.sounds[soundId]) {
      return;
    }
    
    if (volume < 0) volume = 0;
    if (volume > 1) volume = 1;
    
    this.config.sounds[soundId].volume = volume;
    
    // 更新增益节点，考虑主音量
    if (this.gainNodes[soundId]) {
      this.gainNodes[soundId].gain.value = volume * this.config.masterVolume;
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
  
  // 保存用户设置（临时占位）
  saveSettings() {
    console.log('🎧 保存设置（Task 3将实现完整功能）');
  },
  
  // 销毁音频系统
  destroy() {
    if (!this.isInitialized) {
      return;
    }
    
    this.stopAllSounds();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    // 移除控制面板（新UI）
    const toggleBtn = document.getElementById('forest-audio-toggle');
    if (toggleBtn && toggleBtn.parentNode) {
      toggleBtn.parentNode.removeChild(toggleBtn);
    }
    
    const controlsPanel = document.getElementById('forest-audio-controls-panel');
    if (controlsPanel && controlsPanel.parentNode) {
      controlsPanel.parentNode.removeChild(controlsPanel);
    }
    
    this.isInitialized = false;
    console.log('🎧 森林音频系统已销毁');
  }
};

// 自动初始化
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // 等待主题系统初始化
    const initAudio = () => {
      if (typeof window.ForestTheme !== 'undefined' && 
          typeof window.ForestTheme.getCurrentTheme === 'function') {
        ForestAudio.init();
      } else {
        setTimeout(initAudio, 100);
      }
    };
    setTimeout(initAudio, 100);
  });
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForestAudio;
}