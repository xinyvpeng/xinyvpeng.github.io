/**
 * 森林粒子系统 - 落叶效果
 * 提供动态落叶粒子动画，支持三种树叶类型，性能优化
 */

const ForestParticles = {
  // 配置
  config: {
    maxParticles: 50,
    spawnRate: 0.5, // 粒子每秒生成率
    particleTypes: ['oak', 'maple', 'ginkgo'],
    baseSpeed: 0.5,
    baseSize: 20,
    windStrength: 0.2,
    swayAmplitude: 2,
    swayFrequency: 0.01,
    opacityDay: 0.6,
    opacityNight: 0.3,
    mobileMaxParticles: 25,
    mobileBaseSize: 15
  },

  // 状态
  canvas: null,
  ctx: null,
  particles: [],
  images: {},
  lastTime: 0,
  animationId: null,
  isActive: false,
  isMobile: false,
  prefersReducedMotion: false,
  
  // 光线交互状态
  lightInteraction: {
    config: {
      speedThreshold: 100, // 像素/秒
      maxLights: 8,
      lightDuration: 1000, // 毫秒
      // 颜色配置（当前未使用，通过CSS控制，保留供未来扩展）
      dayColor: 'rgba(244, 211, 94, 0.4)',
      nightColor: 'rgba(173, 216, 230, 0.3)'
    },
    
    lights: [],
    timeoutIds: new Set(),
    lastMousePosition: null,
    lastMouseTime: null,
    container: null,
    isInitialized: false,
    
    // 初始化光线交互
    init() {
      if (this.isInitialized) return;
      
      this.createContainer();
      this.updateThemeColors();
      this.isInitialized = true;
    },
    
    // 创建光线容器
    createContainer() {
      if (this.container) return;
      
      // 检查document.body是否就绪
      if (!document.body) {
        console.warn('🍃 光线系统: document.body 未就绪，延迟容器创建');
        setTimeout(() => this.createContainer(), 100);
        return;
      }
      
      try {
        this.container = document.createElement('div');
        this.container.className = 'forest-light-effects';
        document.body.appendChild(this.container);
      } catch (error) {
        console.error('🍃 光线系统: 创建容器失败', error);
      }
    },
    
    // 更新主题颜色
    updateThemeColors() {
      const theme = document.documentElement.getAttribute('data-theme');
      const isNight = theme === 'dark' || theme === 'night';
      
      // 主题切换时，交互光线的颜色由CSS选择器自动处理
      // [data-theme="dark"] .forest-light.interactive 等选择器会生效
      // 配置中的dayColor和nightColor当前未被使用，保留以供未来扩展
      console.log(`🍃 光线系统主题已更新: ${isNight ? '夜间' : '日间'}模式`);
    },
    
    // 处理鼠标交互
    handleMouseInteraction(x, y, timestamp) {
      if (!this.lastMousePosition) {
        this.lastMousePosition = {x, y};
        this.lastMouseTime = timestamp;
        return;
      }
      
      const deltaX = x - this.lastMousePosition.x;
      const deltaY = y - this.lastMousePosition.y;
      const deltaTime = timestamp - this.lastMouseTime;
      
      if (deltaTime > 0) {
        const speed = Math.sqrt(deltaX*deltaX + deltaY*deltaY) / (deltaTime / 1000);
        
        if (speed > this.config.speedThreshold) {
          this.createInteractiveLight(x, y);
        }
      }
      
      this.lastMousePosition = {x, y};
      this.lastMouseTime = timestamp;
    },
    
    // 创建交互光线
    createInteractiveLight(x, y) {
      // 参数验证
      if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
        console.warn('🍃 光线系统: 无效的坐标参数', {x, y});
        return;
      }
      
      // 检查系统状态
      if (!this.isInitialized) {
        console.warn('🍃 光线系统: 系统未初始化');
        return;
      }
      
      // 检查容器（如果容器不存在，尝试创建）
      if (!this.container && document.body) {
        this.createContainer();
      }
      
      if (this.lights.length >= this.config.maxLights) {
        // 移除最旧的光线
        const oldestLight = this.lights.shift();
        if (oldestLight && oldestLight.element && oldestLight.element.parentNode) {
          oldestLight.element.parentNode.removeChild(oldestLight.element);
        }
        // 清理旧光线的定时器
        if (oldestLight && oldestLight.timeoutIds) {
          oldestLight.timeoutIds.forEach(timeoutId => {
            clearTimeout(timeoutId);
            this.timeoutIds.delete(timeoutId);
          });
        }
      }
      
      const light = document.createElement('div');
      light.className = 'forest-light interactive';
      
      // 随机大小
      const sizes = ['small', 'medium', 'large'];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      light.classList.add(size);
      
      // 大小到像素的映射（与CSS中的定义匹配）
      const sizePixels = {
        small: 60,
        medium: 100,
        large: 150
      };
      const pixelSize = sizePixels[size] || 100;
      
      // 设置位置
      light.style.left = `${x - pixelSize / 2}px`;
      light.style.top = `${y - pixelSize / 2}px`;
      
      // 初始透明
      light.style.opacity = '0';
      
      // 添加到容器
      try {
        if (this.container) {
          this.container.appendChild(light);
        } else if (document.body) {
          document.body.appendChild(light);
        } else {
          console.warn('🍃 光线系统: 无法添加光线，容器和document.body均不可用');
          return;
        }
      } catch (error) {
        console.error('🍃 光线系统: 添加光线到DOM失败', error);
        return;
      }
      
      // 创建光线对象
      const lightObj = {
        element: light,
        createdAt: Date.now(),
        x,
        y,
        size,
        pixelSize,
        timeoutIds: []
      };
      
      // 淡入定时器
      const fadeInTimeout = setTimeout(() => {
        try {
          light.style.opacity = '0.7';
        } catch (error) {
          // 光线元素可能已被移除，忽略错误
        }
      }, 10);
      lightObj.timeoutIds.push(fadeInTimeout);
      this.timeoutIds.add(fadeInTimeout);
      
      // 自动淡出和移除定时器
      const fadeOutTimeout = setTimeout(() => {
        try {
          light.style.opacity = '0';
        } catch (error) {
          // 光线元素可能已被移除，忽略错误
        }
        
        const removeTimeout = setTimeout(() => {
          try {
            if (light.parentNode) {
              light.parentNode.removeChild(light);
            }
            
            // 从数组中移除
            const index = this.lights.indexOf(lightObj);
            if (index > -1) {
              this.lights.splice(index, 1);
            }
            
            // 清理当前光线的定时器ID
            lightObj.timeoutIds.forEach(id => this.timeoutIds.delete(id));
          } catch (error) {
            // 清理过程中出错，忽略错误
          }
        }, 500); // 等待淡出完成
        
        lightObj.timeoutIds.push(removeTimeout);
        this.timeoutIds.add(removeTimeout);
      }, this.config.lightDuration);
      
      lightObj.timeoutIds.push(fadeOutTimeout);
      this.timeoutIds.add(fadeOutTimeout);
      
      this.lights.push(lightObj);
    },
    
    // 清理所有光线
    clearAllLights() {
      // 取消所有定时器
      this.timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
      this.timeoutIds.clear();
      
      // 移除DOM元素
      this.lights.forEach(light => {
        if (light.element && light.element.parentNode) {
          light.element.parentNode.removeChild(light.element);
        }
        // 清理光线的定时器引用
        if (light.timeoutIds) {
          light.timeoutIds = [];
        }
      });
      this.lights = [];
    },
    
    // 销毁光线系统
    destroy() {
      this.clearAllLights();
      
      if (this.container && this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      
      this.container = null;
      this.lastMousePosition = null;
      this.lastMouseTime = null;
      this.isInitialized = false;
    }
  },

  // 初始化粒子系统
  init() {
    if (this.isActive) return;
    
    this.checkEnvironment();
    this.createCanvas();
    this.loadImages();
    this.setupEventListeners();
    
    // 初始化光线交互（如果不是移动端且没有减少动画偏好）
    if (!this.isMobile && !this.prefersReducedMotion) {
      this.lightInteraction.init();
    }
    
    this.startAnimation();
    
    this.isActive = true;
    console.log('🍃 森林粒子系统已初始化');
  },

  // 检查环境
  checkEnvironment() {
    this.isMobile = window.innerWidth <= 768;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.prefersReducedMotion) {
      console.log('🍃 检测到减少动画偏好，粒子系统将使用简化效果');
    }
  },

  // 创建Canvas元素
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'forest-particles-canvas';
    this.canvas.className = 'forest-particles-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '0';
    
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    this.resizeCanvas();
  },

  // 调整Canvas大小
  resizeCanvas() {
    if (!this.canvas || !this.ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    
    // 使用 setTransform 避免缩放累积
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  },

  // 加载树叶图片
  loadImages() {
    this._imageLoads = [];
    
    this.config.particleTypes.forEach(type => {
      const img = new Image();
      img.src = `/images/forest/leaves/${type}-leaf.svg`;
      
      img.onload = () => {
        if (this.isActive) {
          this.images[type] = img;
        }
      };
      
      img.onerror = () => {
        if (this.isActive) {
          console.warn(`🍃 无法加载树叶图片: ${type}-leaf.svg`);
          this.images[type] = null;
        }
      };
      
      this._imageLoads.push(img);
    });
  },

  // 设置事件监听器
  setupEventListeners() {
    // 存储函数引用以便后续移除
    this._handleResize = () => this.resizeCanvas();
    this._handleThemeChange = (e) => this.handleThemeChange(e.detail.theme);
    this._handleVisibilityChange = () => {
      if (document.hidden) {
        this.pauseAnimation();
      } else {
        this.resumeAnimation();
      }
    };
    this._handleMouseMove = (e) => this.handleMouseMove(e);
    
    window.addEventListener('resize', this._handleResize);
    window.addEventListener('forest-theme-change', this._handleThemeChange);
    document.addEventListener('visibilitychange', this._handleVisibilityChange);
    
    // 鼠标交互（可选）
    if (!this.isMobile && this.canvas) {
      this.canvas.addEventListener('mousemove', this._handleMouseMove);
    }
  },

  // 处理主题变化
  handleThemeChange(theme) {
    // 主题变化时粒子系统会自动调整透明度
    // 实际透明度通过CSS变量控制
    console.log(`🍃 主题已切换为${theme}，粒子透明度将调整`);
    
    // 更新光线交互的主题颜色
    if (this.lightInteraction.isInitialized) {
      this.lightInteraction.updateThemeColors();
    }
  },

  // 处理鼠标移动
  handleMouseMove(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const timestamp = e.timeStamp || Date.now();
    
    // 处理光线交互（如果不是移动端且没有减少动画偏好）
    if (!this.isMobile && !this.prefersReducedMotion && this.lightInteraction.isInitialized) {
      this.lightInteraction.handleMouseInteraction(mouseX, mouseY, timestamp);
    }
    
    // 处理粒子交互
    if (this.prefersReducedMotion || this.particles.length === 0) return;
    
    const influenceRadius = 100;
    
    this.particles.forEach(particle => {
      const dx = particle.x - mouseX;
      const dy = particle.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < influenceRadius) {
        const force = (influenceRadius - distance) / influenceRadius * 2;
        particle.vx += dx / distance * force;
        particle.vy += dy / distance * force;
      }
    });
  },

  // 创建新粒子
  createParticle() {
    if (this.particles.length >= this.getMaxParticles()) return null;
    
    const type = this.config.particleTypes[
      Math.floor(Math.random() * this.config.particleTypes.length)
    ];
    
    const size = this.getBaseSize() * (0.7 + Math.random() * 0.6);
    const speed = this.config.baseSpeed * (0.5 + Math.random() * 1.0);
    
    return {
      type,
      x: Math.random() * window.innerWidth,
      y: -size,
      vx: (Math.random() - 0.5) * this.config.windStrength,
      vy: speed,
      size,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      swayPhase: Math.random() * Math.PI * 2,
      opacity: 1,
      life: 1,
      maxLife: 10 + Math.random() * 20
    };
  },

  // 获取最大粒子数
  getMaxParticles() {
    return this.isMobile ? this.config.mobileMaxParticles : this.config.maxParticles;
  },

  // 获取基础大小
  getBaseSize() {
    return this.isMobile ? this.config.mobileBaseSize : this.config.baseSize;
  },

  // 开始动画循环
  startAnimation() {
    if (this.prefersReducedMotion) {
      this.createStaticParticles();
      return;
    }
    
    this.lastTime = performance.now();
    this.animationLoop();
  },

  // 创建静态粒子（减少动画时）
  createStaticParticles() {
    const count = Math.min(10, this.getMaxParticles());
    for (let i = 0; i < count; i++) {
      const particle = this.createParticle();
      if (particle) {
        particle.y = Math.random() * window.innerHeight;
        particle.vx = 0;
        particle.vy = 0;
        particle.rotationSpeed = 0;
        this.particles.push(particle);
      }
    }
    this.render();
  },

  // 动画循环
  animationLoop(timestamp) {
    if (!this.isActive) return;
    
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;
    
    this.updateParticles(deltaTime);
    this.spawnParticles(deltaTime);
    this.render();
    
    this.animationId = requestAnimationFrame((t) => this.animationLoop(t));
  },

  // 更新粒子状态
  updateParticles(deltaTime) {
    const seconds = deltaTime / 1000;
    
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // 更新生命值
      p.life -= seconds / p.maxLife;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // 更新位置
      p.x += p.vx;
      p.y += p.vy;
      
      // 摇摆运动
      p.swayPhase += this.config.swayFrequency;
      p.x += Math.sin(p.swayPhase) * this.config.swayAmplitude * seconds * 10;
      
      // 更新旋转
      p.rotation += p.rotationSpeed;
      
      // 边界检查
      if (p.x < -p.size || p.x > window.innerWidth + p.size || p.y > window.innerHeight + p.size) {
        this.particles.splice(i, 1);
      }
    }
  },

  // 生成新粒子
  spawnParticles(deltaTime) {
    const seconds = deltaTime / 1000;
    const spawnChance = this.config.spawnRate * seconds;
    
    if (Math.random() < spawnChance) {
      const particle = this.createParticle();
      if (particle) {
        this.particles.push(particle);
      }
    }
  },

  // 渲染粒子
  render() {
    if (!this.ctx || !this.canvas) return;
    
    // 清除画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 渲染每个粒子
    this.particles.forEach(p => {
      this.ctx.save();
      
      // 设置透明度
      const opacity = p.opacity * p.life;
      this.ctx.globalAlpha = opacity;
      
      // 变换到粒子位置
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      
      // 绘制树叶图片或后备形状
      const img = this.images[p.type];
      if (img && img.complete && img.naturalWidth !== 0) {
        // 图片已成功加载，使用图片渲染
        this.ctx.drawImage(
          img,
          -p.size / 2,
          -p.size / 2,
          p.size,
          p.size
        );
      } else {
        // 后备：绘制简单形状（图片未加载、加载失败或仍在加载中）
        this.ctx.fillStyle = this.getLeafColor(p.type);
        this.ctx.globalAlpha = opacity * 0.7; // 后备系统降低透明度
        this.ctx.beginPath();
        // 更自然的树叶形状（椭圆带旋转）
        this.ctx.ellipse(0, 0, p.size / 2, p.size / 3, p.rotation, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = opacity; // 恢复透明度
      }
      
      this.ctx.restore();
    });
  },

  // 获取树叶颜色（后备）
  getLeafColor(type) {
    const colors = {
      oak: '#8B4513',
      maple: '#B22222',
      ginkgo: '#FFD700'
    };
    return colors[type] || '#8B4513';
  },

  // 暂停动画
  pauseAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  },

  // 恢复动画
  resumeAnimation() {
    if (this.isActive && !this.animationId && !this.prefersReducedMotion) {
      this.lastTime = performance.now();
      this.animationLoop();
    }
  },

  // 销毁粒子系统
  destroy() {
    this.pauseAnimation();
    this.isActive = false;
    
    // 销毁光线交互
    if (this.lightInteraction.isInitialized) {
      this.lightInteraction.destroy();
    }
    
    // 移除事件监听器
    if (this._handleResize) {
      window.removeEventListener('resize', this._handleResize);
    }
    if (this._handleThemeChange) {
      window.removeEventListener('forest-theme-change', this._handleThemeChange);
    }
    if (this._handleVisibilityChange) {
      document.removeEventListener('visibilitychange', this._handleVisibilityChange);
    }
    if (this._handleMouseMove && this.canvas) {
      this.canvas.removeEventListener('mousemove', this._handleMouseMove);
    }
    
    // 取消图片加载
    if (this._imageLoads) {
      this._imageLoads.forEach(img => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
      });
      this._imageLoads = [];
    }
    
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    this.particles = [];
    this.images = {};
    this.canvas = null;
    this.ctx = null;
    
    console.log('🍃 森林粒子系统已销毁');
  },

  // 获取当前粒子数
  getParticleCount() {
    return this.particles.length;
  },

  // 获取系统状态
  getStatus() {
    return {
      active: this.isActive,
      particleCount: this.particles.length,
      maxParticles: this.getMaxParticles(),
      isMobile: this.isMobile,
      prefersReducedMotion: this.prefersReducedMotion,
      lightInteraction: {
        initialized: this.lightInteraction.isInitialized,
        lightCount: this.lightInteraction.lights.length,
        maxLights: this.lightInteraction.config.maxLights
      }
    };
  }
};

// 自动初始化
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // 等待主题系统初始化
    const initParticles = () => {
      if (typeof window.ForestTheme !== 'undefined' && 
          typeof window.ForestTheme.getCurrentTheme === 'function') {
        ForestParticles.init();
      } else {
        setTimeout(initParticles, 100);
      }
    };
    setTimeout(initParticles, 100);
  });
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForestParticles;
}