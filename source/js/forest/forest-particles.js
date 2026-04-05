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

  // 初始化粒子系统
  init() {
    if (this.isActive) return;
    
    this.checkEnvironment();
    this.createCanvas();
    this.loadImages();
    this.setupEventListeners();
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
  },

  // 处理鼠标移动
  handleMouseMove(e) {
    if (this.prefersReducedMotion || this.particles.length === 0) return;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;
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
      if (this.images[p.type]) {
        this.ctx.drawImage(
          this.images[p.type],
          -p.size / 2,
          -p.size / 2,
          p.size,
          p.size
        );
      } else {
        // 后备：绘制简单形状
        this.ctx.fillStyle = this.getLeafColor(p.type);
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.size / 2, p.size / 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
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
      prefersReducedMotion: this.prefersReducedMotion
    };
  }
};

// 自动初始化
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // 等待主题系统初始化
    setTimeout(() => {
      ForestParticles.init();
    }, 1000);
  });
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForestParticles;
}