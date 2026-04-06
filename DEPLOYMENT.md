# 部署指南 - Hexo博客浏览量统计功能

## 部署前准备
1. 确保所有更改已提交：`git status --porcelain` 显示干净工作区
2. 确认部署配置正确（`_config.yml:115-122`）：
   ```yaml
   deploy:
     type: git
     repo: git@github.com:xinyvpeng/xinyvpeng.github.io.git
     branch: main
   ```
3. 确认 `hexo-deployer-git` 插件已安装（`package.json:17`）

## 部署步骤
1. **生成静态文件**：`hexo clean && hexo generate`
   - 验证无错误：检查输出是否显示生成成功
   - 验证浏览量功能：检查 `public/` 目录中文章页面是否包含 `busuanzi_container_page_pv`

2. **部署到GitHub Pages**：`hexo deploy`
   - 该命令将 `public/` 目录推送到配置的Git仓库
   - 自动生成提交信息：`Site updated: YYYY-MM-DD HH:mm:ss`

3. **等待GitHub Pages构建**（约1-2分钟）
   - 访问仓库设置：https://github.com/xinyvpeng/xinyvpeng.github.io/settings/pages
   - 确认GitHub Pages已启用并指向 `main` 分支

4. **验证生产环境功能**
   - 访问博客：https://xinyvpeng.github.io
   - 打开任意文章，检查文章末尾是否显示浏览量统计
   - 首次访问可能显示"0"，刷新或后续访问会递增

## 故障排除
### 部署失败
- 检查SSH密钥：`ssh -T git@github.com`
- 检查Git配置：`git remote -v`
- 检查插件：`npm list hexo-deployer-git`

### 浏览量不显示
- 检查Busuanzi配置：`_config.next.yml:239-253`
- 检查模板修改：`themes/next/layout/_macro/post.njk:129-138`
- 检查网络：Busuanzi服务可能需要网络访问权限

### 功能回滚
如果需要回滚到部署前状态：
```bash
# 回滚到上一个提交
git reset --hard HEAD~1
# 重新生成和部署
hexo clean && hexo generate && hexo deploy
```

## 功能验证清单
- [ ] 文章末尾显示浏览量容器（`busuanzi_container_page_pv`）
- [ ] 浏览量数字随访问递增
- [ ] 音频系统正常工作
- [ ] 主题切换功能正常
- [ ] 个人介绍页面正常显示

## 技术支持
- Busuanzi官网：http://ibruce.info/2015/04/04/busuanzi/
- Hexo部署文档：https://hexo.io/docs/one-command-deployment
- NexT主题文档：https://theme-next.js.org/

---
**最后更新：** 2026-04-06  
**版本：** 1.0  
**相关提交：** `3e1c097` (chore: 更新生成文件), `d7bed1e` (test: 验证浏览量功能与现有功能兼容)