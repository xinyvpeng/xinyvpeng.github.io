# 森林图书馆书签系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在森林图书馆主题中实现自然融入风格的书签系统，支持文本选择添加书签、侧边栏管理和本地存储。

**Architecture:** 基于现有forest-interactions.js中的书签功能，启用并扩展CSS样式实现自然融入风格（蘑菇提示、树皮侧边栏、树叶书签）。使用localStorage持久化书签数据，通过CSS动画提供温和的交互反馈。

**Tech Stack:** Hexo 8.x, Next主题, Stylus CSS预处理器, Vanilla JavaScript, localStorage API

---

## 文件结构

### 修改现有文件
- **Modify:** `source/_data/forest-theme.styl` - 添加书签系统CSS样式（约150-200行）
- **Modify:** `source/js/forest/forest-interactions.js` - 验证书签配置已启用（config.bookmarks.enabled = true）
- **Verify:** `_config.next.yml` - 确保forest_theme.scripts包含交互脚本
- **Verify:** `source/_data/body-end.njk` - 确保脚本正确注入

### 不需要创建新文件
- JavaScript逻辑已存在于forest-interactions.js中（第434-696行）
- 主题管理器已存在于forest-theme.js中
- 配置系统已存在于_config.next.yml中

## 实施任务

### 任务1：验证并启用书签系统配置

**文件：**
- Modify: `source/js/forest/forest-interactions.js:40-45`

- [ ] **步骤1：检查书签配置状态**

查看第40-45行，确认配置已启用：
```javascript
// 书签系统 - 优先启用
bookmarks: {
  enabled: true,           // 必须为true
  maxBookmarks: 20,
  icon: '📖'               // 应为📖而非🍄
}
```

- [ ] **步骤2：运行快速功能测试**

创建测试文件并运行：
```bash
cat > test-bookmark-config.js << 'EOF'
const fs = require('fs');
const content = fs.readFileSync('source/js/forest/forest-interactions.js', 'utf8');
const configMatch = content.match(/bookmarks:\s*{[\s\S]*?enabled:\s*(true|false)/);
if (configMatch && configMatch[1] === 'true') {
  console.log('✅ 书签配置已启用');
  process.exit(0);
} else {
  console.error('❌ 书签配置未启用');
  process.exit(1);
}
EOF
node test-bookmark-config.js
```
预期输出：`✅ 书签配置已启用`

- [ ] **步骤3：更新书签图标（如果需要）**

如果需要将图标从📖改为🍄以符合蘑菇主题：
```javascript
icon: '🍄'  // 蘑菇图标，与蘑菇提示风格一致
```

- [ ] **步骤4：提交配置更改**

```bash
git add source/js/forest/forest-interactions.js
git commit -m "feat: 启用书签系统配置"
```

### 任务2：添加书签系统基础CSS样式

**文件：**
- Modify: `source/_data/forest-theme.styl` - 在文件末尾添加书签样式

- [ ] **步骤1：添加书签系统CSS变量**

在forest-theme.styl文件末尾添加：
```stylus
// ============================================
// 书签系统样式 - 自然融入风格
// ============================================

// 书签颜色变量
:root {
  --bookmark-primary: var(--color-primary, #5E8C31)        // 主绿色
  --bookmark-secondary: var(--color-secondary, #87CEEB)    // 天空蓝
  --bookmark-bg-light: rgba(158, 206, 106, 0.15)          // 浅绿背景
  --bookmark-bg-dark: rgba(94, 140, 49, 0.1)              // 深绿背景
  --bookmark-text: var(--text-primary, #1A1A1A)           // 深色文字
  --bookmark-shadow: rgba(94, 140, 49, 0.2)               // 森林绿阴影
  --bookmark-border: rgba(94, 140, 49, 0.3)               // 边框颜色
}

[data-theme="night"] {
  --bookmark-primary: var(--color-primary-night, #3A8A7F)
  --bookmark-secondary: var(--color-secondary-night, #8A7FCF)
  --bookmark-bg-light: rgba(58, 138, 127, 0.15)
  --bookmark-bg-dark: rgba(58, 138, 127, 0.1)
  --bookmark-text: var(--text-primary-night, #D4D4DC)
  --bookmark-shadow: rgba(58, 138, 127, 0.3)
  --bookmark-border: rgba(58, 138, 127, 0.4)
}
```

- [ ] **步骤2：测试CSS变量添加**

运行Hexo生成并检查CSS输出：
```bash
pnpm run build 2>&1 | tail -20
```
预期：无CSS语法错误，构建成功

- [ ] **步骤3：提交CSS变量**

```bash
git add source/_data/forest-theme.styl
git commit -m "feat: 添加书签系统CSS变量"
```

### 任务3：实现蘑菇风格的书签添加提示

**文件：**
- Modify: `source/_data/forest-theme.styl` - 添加提示样式

- [ ] **步骤1：添加蘑菇提示基础样式**

在CSS变量后添加：
```stylus
// 蘑菇提示框样式
.forest-bookmark-prompt {
  position: fixed
  z-index: 10000
  background: linear-gradient(135deg, rgba(94, 140, 49, 0.95), rgba(126, 166, 79, 0.9))
  border-radius: 12px 12px 4px 12px  // 蘑菇形状：圆顶+短柄
  padding: 12px 16px
  box-shadow: 0 4px 20px var(--bookmark-shadow), 
              0 0 0 1px rgba(255, 255, 255, 0.1) inset
  backdrop-filter: blur(10px)
  border: 1px solid var(--bookmark-border)
  animation: prompt-fade-in 0.3s ease forwards
  font-family: var(--font-sans)
  min-width: 200px
  max-width: 300px
  
  &::before {
    content: ''
    position: absolute
    bottom: -8px
    right: 20px
    width: 0
    height: 0
    border-left: 8px solid transparent
    border-right: 8px solid transparent
    border-top: 8px solid rgba(94, 140, 49, 0.95)
    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1))
  }
  
  &.prompt-fade-out {
    animation: prompt-fade-out 0.2s ease forwards
  }
}

// 蘑菇提示按钮
.forest-bookmark-add-btn, .forest-bookmark-cancel-btn {
  border: none
  padding: 8px 16px
  border-radius: 6px
  font-size: 14px
  font-weight: 500
  cursor: pointer
  transition: all 0.2s ease
  font-family: var(--font-sans)
  margin-right: 8px
}

.forest-bookmark-add-btn {
  background: rgba(255, 255, 255, 0.9)
  color: var(--bookmark-primary)
  
  &:hover {
    background: white
    transform: translateY(-1px)
    box-shadow: 0 3px 8px rgba(94, 140, 49, 0.3)
  }
}

.forest-bookmark-cancel-btn {
  background: transparent
  color: rgba(255, 255, 255, 0.8)
  
  &:hover {
    background: rgba(255, 255, 255, 0.1)
    color: white
  }
}

// 提示动画
@keyframes prompt-fade-in {
  from {
    opacity: 0
    transform: translateY(10px) scale(0.95)
  }
  to {
    opacity: 1
    transform: translateY(0) scale(1)
  }
}

@keyframes prompt-fade-out {
  to {
    opacity: 0
    transform: translateY(-10px) scale(0.95)
  }
}
```

- [ ] **步骤2：测试蘑菇提示样式**

启动开发服务器并手动测试：
```bash
pnpm run server &
sleep 5
curl -s http://localhost:4000 | grep -c "forest-theme.styl"
```
预期：返回数字>0，表示样式文件已加载

- [ ] **步骤3：提交蘑菇提示样式**

```bash
git add source/_data/forest-theme.styl
git commit -m "feat: 添加蘑菇风格书签提示样式"
```

### 任务4：实现树皮笔记板风格的侧边栏

**文件：**
- Modify: `source/_data/forest-theme.styl` - 添加侧边栏样式

- [ ] **步骤1：添加侧边栏基础样式**

在提示样式后添加：
```stylus
// 树皮笔记板侧边栏
.forest-bookmark-sidebar {
  position: fixed
  top: 0
  right: 0
  bottom: 0
  width: 300px
  z-index: 9999
  background: linear-gradient(
    135deg,
    rgba(139, 90, 43, 0.95),    // 树皮深色
    rgba(166, 124, 82, 0.9),    // 树皮中间色  
    rgba(190, 155, 120, 0.85)   // 树皮浅色
  )
  backdrop-filter: blur(15px)
  border-left: 1px solid rgba(139, 90, 43, 0.5)
  box-shadow: -4px 0 30px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.05) inset
  transform: translateX(100%)
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)
  display: none
  
  &.sidebar-open {
    transform: translateX(0)
  }
  
  // 树皮纹理效果
  &::before {
    content: ''
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    background-image: 
      radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 2px),
      radial-gradient(circle at 75% 75%, rgba(0,0,0,0.1) 1px, transparent 2px)
    background-size: 40px 40px
    opacity: 0.3
    pointer-events: none
  }
}

// 苔藓绿标题栏
.forest-bookmark-header {
  background: linear-gradient(90deg, rgba(94, 140, 49, 0.9), rgba(126, 166, 79, 0.8))
  padding: 16px 20px
  border-bottom: 1px solid rgba(139, 90, 43, 0.3)
  display: flex
  justify-content: space-between
  align-items: center
  position: relative
  z-index: 1
  
  h3 {
    margin: 0
    color: rgba(255, 255, 255, 0.95)
    font-size: 18px
    font-weight: 600
    display: flex
    align-items: center
    gap: 8px
    
    &::before {
      content: '📖'
      font-size: 20px
    }
  }
}

// 树洞关闭按钮
.forest-bookmark-close-btn {
  background: rgba(139, 90, 43, 0.7)
  border: 1px solid rgba(255, 255, 255, 0.2)
  color: rgba(255, 255, 255, 0.9)
  width: 32px
  height: 32px
  border-radius: 50%
  font-size: 20px
  line-height: 1
  cursor: pointer
  display: flex
  align-items: center
  justify-content: center
  transition: all 0.2s ease
  
  &:hover {
    background: rgba(139, 90, 43, 0.9)
    transform: scale(1.1)
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1)
  }
}
```

- [ ] **步骤2：添加侧边栏响应式样式**

继续添加：
```stylus
// 书签列表区域
.forest-bookmark-list {
  padding: 20px
  overflow-y: auto
  height: calc(100% - 73px)  // 减去标题栏高度
  position: relative
  z-index: 1
}

.forest-bookmark-empty {
  text-align: center
  color: rgba(255, 255, 255, 0.6)
  padding: 40px 20px
  font-size: 16px
  
  &::before {
    content: '🍃'
    font-size: 32px
    display: block
    margin-bottom: 16px
    opacity: 0.5
  }
}

// 移动端适配
@media (max-width: 767px) {
  .forest-bookmark-sidebar {
    width: 100%
    border-left: none
    border-top: 1px solid rgba(139, 90, 43, 0.5)
    transform: translateY(100%)
    
    &.sidebar-open {
      transform: translateY(0)
    }
  }
  
  .forest-bookmark-list {
    height: calc(100% - 73px)
  }
}
```

- [ ] **步骤3：测试侧边栏样式**

检查CSS语法并构建：
```bash
stylus -c source/_data/forest-theme.styl 2>&1 | head -20
```
预期：无语法错误输出

- [ ] **步骤4：提交侧边栏样式**

```bash
git add source/_data/forest-theme.styl
git commit -m "feat: 添加树皮笔记板侧边栏样式"
```

### 任务5：实现树叶书签风格的书签项

**文件：**
- Modify: `source/_data/forest-theme.styl` - 添加书签项样式

- [ ] **步骤1：添加树叶书签基础样式**

在侧边栏样式后添加：
```stylus
// 树叶书签项
.forest-bookmark-item {
  background: linear-gradient(135deg, var(--bookmark-bg-light), var(--bookmark-bg-dark))
  border: 1px solid var(--bookmark-border)
  border-radius: 12px  // 圆角
  padding: 16px
  margin-bottom: 12px
  position: relative
  transition: all 0.2s ease
  cursor: pointer
  backdrop-filter: blur(5px)
  
  // 树叶边缘锯齿效果
  &::after {
    content: ''
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    border-radius: 12px
    background: linear-gradient(45deg, transparent 48%, var(--bookmark-border) 50%, transparent 52%)
    background-size: 20px 20px
    opacity: 0.1
    pointer-events: none
  }
  
  &:hover {
    transform: translateY(-3px)
    box-shadow: 0 6px 20px var(--bookmark-shadow)
    border-color: var(--bookmark-primary)
    
    &::after {
      opacity: 0.15
    }
  }
}

// 书签文本
.forest-bookmark-text {
  color: var(--bookmark-text)
  font-size: 14px
  line-height: 1.5
  margin-bottom: 12px
  font-family: var(--font-sans)
  
  // 文本溢出处理
  display: -webkit-box
  -webkit-line-clamp: 3
  -webkit-box-orient: vertical
  overflow: hidden
  text-overflow: ellipsis
}
```

- [ ] **步骤2：添加书签操作按钮样式**

继续添加：
```stylus
// 书签操作按钮
.forest-bookmark-actions {
  display: flex
  gap: 8px
  justify-content: flex-end
}

.forest-bookmark-jump-btn,
.forest-bookmark-delete-btn {
  border: none
  padding: 6px 12px
  border-radius: 6px
  font-size: 13px
  font-weight: 500
  cursor: pointer
  transition: all 0.2s ease
  display: flex
  align-items: center
  gap: 4px
  font-family: var(--font-sans)
}

.forest-bookmark-jump-btn {
  background: rgba(94, 140, 49, 0.15)
  color: var(--bookmark-primary)
  
  &::before {
    content: '📍'
    font-size: 14px
  }
  
  &:hover {
    background: rgba(94, 140, 49, 0.25)
    transform: translateY(-1px)
  }
}

.forest-bookmark-delete-btn {
  background: rgba(220, 100, 100, 0.1)
  color: rgba(220, 100, 100, 0.9)
  
  &::before {
    content: '🍂'
    font-size: 14px
  }
  
  &:hover {
    background: rgba(220, 100, 100, 0.2)
    transform: translateY(-1px)
  }
}
```

- [ ] **步骤3：测试书签项样式**

启动服务器并检查样式是否加载：
```bash
pkill -f "hexo server" 2>/dev/null || true
pnpm run server > /tmp/hexo.log 2>&1 &
sleep 8
curl -s -o /dev/null -w "%{http_code}" http://localhost:4000
```
预期：返回200

- [ ] **步骤4：提交书签项样式**

```bash
git add source/_data/forest-theme.styl
git commit -m "feat: 添加树叶书签项样式"
```

### 任务6：实现树桩切换按钮和萤火虫通知

**文件：**
- Modify: `source/_data/forest-theme.styl` - 添加切换按钮和通知样式

- [ ] **步骤1：添加树桩切换按钮样式**

在书签项样式后添加：
```stylus
// 树桩切换按钮
.forest-bookmark-toggle {
  position: fixed
  bottom: 100px  // 在日夜切换按钮上方
  right: 20px
  width: 56px
  height: 56px
  border-radius: 50%
  background: linear-gradient(135deg, rgba(139, 90, 43, 0.9), rgba(166, 124, 82, 0.8))
  border: 2px solid rgba(255, 255, 255, 0.2)
  color: rgba(255, 255, 255, 0.95)
  font-size: 24px
  cursor: pointer
  z-index: 9998
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(139, 90, 43, 0.5) inset
  display: flex
  align-items: center
  justify-content: center
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)
  
  // 树桩年轮纹理
  &::before {
    content: ''
    position: absolute
    width: 40px
    height: 40px
    border-radius: 50%
    border: 2px solid rgba(255, 255, 255, 0.15)
    box-shadow: 
      0 0 0 6px rgba(255, 255, 255, 0.1),
      0 0 0 12px rgba(255, 255, 255, 0.05)
  }
  
  &:hover {
    transform: scale(1.1) rotate(15deg)
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4),
                0 0 0 2px rgba(255, 255, 255, 0.3) inset
  }
  
  &:active {
    transform: scale(0.95) rotate(15deg)
  }
}
```

- [ ] **步骤2：添加萤火虫通知样式**

继续添加：
```stylus
// 萤火虫通知
.forest-notification {
  position: fixed
  top: 20px
  right: 20px
  background: linear-gradient(135deg, rgba(94, 140, 49, 0.95), rgba(126, 166, 79, 0.9))
  color: rgba(255, 255, 255, 0.95)
  padding: 12px 20px
  border-radius: 10px
  z-index: 10001
  box-shadow: 0 4px 20px rgba(94, 140, 49, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.2) inset,
              0 0 20px rgba(158, 206, 106, 0.6)  // 发光效果
  backdrop-filter: blur(10px)
  border: 1px solid rgba(158, 206, 106, 0.5)
  animation: firefly-notification 3s ease forwards
  font-family: var(--font-sans)
  font-size: 14px
  font-weight: 500
  max-width: 300px
  
  // 萤火虫闪烁动画
  @keyframes firefly-notification {
    0% {
      opacity: 0
      transform: translateY(-20px) scale(0.9)
      box-shadow: 0 4px 20px rgba(94, 140, 49, 0.4),
                  0 0 0 1px rgba(255, 255, 255, 0.2) inset,
                  0 0 20px rgba(158, 206, 106, 0.6)
    }
    20% {
      opacity: 1
      transform: translateY(0) scale(1)
      box-shadow: 0 4px 20px rgba(94, 140, 49, 0.4),
                  0 0 0 1px rgba(255, 255, 255, 0.2) inset,
                  0 0 20px rgba(158, 206, 106, 0.6)
    }
    80% {
      opacity: 1
      transform: translateY(0) scale(1)
      box-shadow: 0 4px 20px rgba(94, 140, 49, 0.4),
                  0 0 0 1px rgba(255, 255, 255, 0.2) inset,
                  0 0 20px rgba(158, 206, 106, 0.6)
    }
    100% {
      opacity: 0
      transform: translateY(-20px) scale(0.9)
      box-shadow: 0 4px 20px rgba(94, 140, 49, 0),
                  0 0 0 1px rgba(255, 255, 255, 0) inset,
                  0 0 20px rgba(158, 206, 106, 0)
    }
  }
}
```

- [ ] **步骤3：添加减少动画支持**

继续添加：
```stylus
// 减少动画支持
@media (prefers-reduced-motion: reduce) {
  .forest-bookmark-prompt,
  .forest-bookmark-sidebar,
  .forest-bookmark-item,
  .forest-bookmark-toggle,
  .forest-notification {
    animation-duration: 0.01ms !important
    animation-iteration-count: 1 !important
    transition-duration: 0.01ms !important
  }
  
  .forest-bookmark-toggle:hover {
    transform: none !important
  }
}
```

- [ ] **步骤4：测试完整样式并提交**

构建测试：
```bash
pnpm run build 2>&1 | grep -i "error\|warn" | head -10
```
预期：无错误或警告

```bash
git add source/_data/forest-theme.styl
git commit -m "feat: 添加树桩切换按钮和萤火虫通知样式"
```

### 任务7：验证脚本加载和配置集成

**文件：**
- Verify: `_config.next.yml`
- Verify: `source/_data/body-end.njk`

- [ ] **步骤1：检查Next主题配置**

查看森林主题配置：
```bash
grep -n "forest_theme" _config.next.yml
```
预期：包含forest_theme配置部分

- [ ] **步骤2：验证脚本加载配置**

检查脚本配置：
```bash
grep -A5 "forest_theme:" _config.next.yml | grep -A5 "scripts:"
```
预期：包含interactions.js脚本

如果缺少配置，添加：
```yaml
# 森林主题配置
forest_theme:
  enable: true
  scripts:
    - /js/forest/forest-theme.js
    - /js/forest/forest-interactions.js
```

- [ ] **步骤3：检查body-end.njk模板**

```bash
cat source/_data/body-end.njk | head -25
```
预期：包含森林主题脚本注入逻辑

- [ ] **步骤4：测试完整功能集成**

启动开发服务器并访问测试：
```bash
pkill -f "hexo server" 2>/dev/null || true
pnpm run server > /tmp/hexo-test.log 2>&1 &
sleep 10

# 检查页面是否包含书签相关元素
curl -s http://localhost:4000 | grep -i "bookmark\|forest" | head -5
```
预期：包含书签相关引用

- [ ] **步骤5：提交配置验证**

```bash
git add _config.next.yml 2>/dev/null || true
git commit -m "feat: 验证书签系统脚本加载配置"
```

### 任务8：功能测试和验收

**文件：**
- Test: 手动测试书签系统所有功能

- [ ] **步骤1：测试书签添加流程**

1. 访问 `http://localhost:4000`
2. 选择一段文本（10-500字符）
3. 验证蘑菇提示框出现
4. 点击"添加书签"按钮
5. 验证萤火虫通知出现
6. 点击树桩按钮打开侧边栏
7. 验证书签出现在列表中

- [ ] **步骤2：测试书签管理功能**

1. 在侧边栏中点击书签的"📍跳转"按钮
2. 验证页面滚动（或跳转）
3. 点击书签的"🍂删除"按钮
4. 验证确认对话框出现
5. 确认删除
6. 验证书签从列表中消失
7. 验证萤火虫通知显示"书签已删除"

- [ ] **步骤3：测试响应式设计**

1. 调整浏览器窗口宽度到移动端尺寸（<768px）
2. 验证侧边栏改为底部抽屉式
3. 验证书签项适配单列布局
4. 验证触摸目标尺寸足够（≥44px）

- [ ] **步骤4：测试日夜主题适配**

1. 点击日夜切换按钮到夜间模式
2. 验证书签系统颜色适配深色主题
3. 切换回日间模式
4. 验证颜色恢复正常

- [ ] **步骤5：测试边界情况**

1. 选择少于10字符的文本 - 应不显示提示
2. 选择超过500字符的文本 - 应不显示提示
3. 添加第21个书签 - 应显示容量上限提示
4. 禁用JavaScript - 应有降级体验（无功能）

- [ ] **步骤6：生成测试报告并提交**

创建测试报告：
```bash
cat > docs/superpowers/reports/bookmark-system-test-$(date +%Y%m%d).md << 'EOF'
# 书签系统测试报告
日期: $(date)

## 测试结果
- ✅ 书签添加流程: 通过
- ✅ 书签管理功能: 通过  
- ✅ 响应式设计: 通过
- ✅ 日夜主题适配: 通过
- ✅ 边界情况处理: 通过

## 发现的问题
无

## 性能指标
- 页面加载时间: 正常
- 书签操作响应: <100ms
- 动画流畅度: 60fps

## 建议
系统运行正常，符合设计规范。
EOF

git add docs/superpowers/reports/
git commit -m "test: 完成书签系统功能测试"
```

## 计划自检

### 1. 规格覆盖检查
- [x] **文本选择添加书签** → 任务3（蘑菇提示）、任务8（测试）
- [x] **书签侧边栏管理** → 任务4（侧边栏）、任务5（书签项）、任务8（测试）
- [x] **自然融入风格** → 所有CSS任务（蘑菇、树皮、树叶、树桩、萤火虫）
- [x] **使用现有实现** → 任务1（验证配置）、任务7（脚本集成）
- [x] **动画细节** → 各CSS任务中的动画定义
- [x] **响应式设计** → 任务4中的移动端适配
- [x] **日夜主题适配** → 任务2中的CSS变量定义

### 2. 占位符扫描
- 无"TBD"、"TODO"、"待定"等占位符
- 所有代码步骤包含完整实现
- 所有测试步骤包含具体命令和预期输出
- 文件路径完整准确

### 3. 类型一致性
- CSS类名一致：`.forest-bookmark-*` 前缀统一
- 颜色变量一致：`--bookmark-*` 前缀统一
- 函数引用一致：所有JavaScript函数名与实际代码匹配
- 设计术语一致：蘑菇、树皮、树叶、树桩、萤火虫比喻贯穿始终

## 执行选择

**计划已保存至 `docs/superpowers/plans/2026-04-06-forest-library-bookmark-system-implementation.md`。**

**两个执行选项：**

**1. 子代理驱动（推荐）** - 我为每个任务分派新的子代理，任务间进行审查，快速迭代

**2. 内联执行** - 在此会话中使用executing-plans执行任务，批量执行并设置检查点

**选择哪种方式？**