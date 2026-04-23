# 项目: 个人技术博客

基于 Hexo + NexT 主题构建的个人博客，以"森林图书馆"为设计主题。

## 技术栈

- **框架:** Hexo (Node.js 静态站点生成器)
- **主题:** NexT (自定义 "forest" 主题覆盖)
- **样式:** Stylus (通过 NexT injects 机制注入)
- **部署:** GitHub Pages (xinyvpeng.github.io)
- **域名:** ran-i.cn
- **源码分支:** `source` (远程), 本地开发在 `main` 分支
- **部署分支:** `main` (远程, 由 `hexo deploy` 推送构建产物)

## 项目结构

```
myblog/
├── source/                    # 博客源文件
│   ├── _posts/                # 文章目录 (Markdown)
│   ├── _drafts/               # 草稿目录
│   ├── _data/                 # 自定义数据/样式
│   │   ├── forest-theme.styl  # 主自定义样式 (入口)
│   │   ├── forest-animations.styl
│   │   ├── forest-audio-controls.styl
│   │   └── forest-achievements.styl
│   ├── about/                 # 关于页面
│   ├── links/                 # 友链页面
│   ├── books/                 # 书架/书评
│   └── images/                # 图片资源
├── themes/next/               # NexT 主题 (git submodule)
├── scripts/                   # Hexo 脚本 (加载 .env 等)
├── _config.yml                # 站点配置
└── _config.next.yml           # NexT 主题配置
```

## 常用命令

```bash
# 启动本地开发服务器
npx hexo server

# 新建文章
npx hexo new "文章标题"

# 新建草稿
npx hexo new draft "草稿标题"

# 生成静态文件
npx hexo generate

# 部署到 GitHub Pages (本地部署)
npx hexo deploy

# 清理缓存
npx hexo clean

# 推送源码到远程 (触发 GitHub Actions 自动部署)
git push origin main:source
```

## 部署方式

本博客支持两种部署方式：

### 1. GitHub Actions 自动部署（推荐）
推送源码到 `source` 分支即可自动触发构建和部署到 `main`：
```bash
git push origin main:source
```
Actions 工作流: `.github/workflows/deploy.yml`

### 2. 本地手动部署
```bash
npx hexo deploy
```

> **注意:** GitHub Actions 需要使用 `GITALK_CLIENT_SECRET` 仓库密钥。请在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加此密钥。

## 设计主题

"森林图书馆"主题特色:
- 森林绿色系配色方案 (日间/夜间模式)
- 粒子动画背景 (落叶、萤火虫)
- 植物图鉴系统 (自定义页面)
- 音频控制系统 (背景音乐)
- 成就系统

## 维护注意事项

- 主题样式统一维护在 `source/_data/forest-theme.styl` 中
- 不要在 `source/_data/` 下创建重复的 styl 文件
- 新动画关键帧添加到 `forest-animations.styl` 并在 `forest-theme.styl` 中 import
- 构建产物 (forest-theme.css 等) 不要提交到仓库
- 环境变量通过 `scripts/load-env.js` 加载
- 文章图片放在 `source/images/` 下
