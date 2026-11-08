# 红色记忆 · 党史征程

甘肃农业大学「第五届红色网页设计大赛」参赛作品。一个纯静态、零依赖的红色主题展示网站。

## 内容结构

- `index.html` —— 首页（封面 + 序言导读 + 红色圣地 + 经典诗词 + 数据带）
- `history.html` —— 党史历程（1921 → 2012 垂直时间轴，点击展开详情）
- `heroes.html` —— 红色人物（9 位先驱/英烈，卡片翻转看背面）
- `spirit.html` —— 红色精神（9 种精神谱系，卡片翻转）
- `about.html` —— 作品简介 / 关于本站 / 原创声明
- `css/style.css` —— 全站「中国红 + 描金」设计系统
- `js/main.js` —— 轻量 SPA 导航（切页音乐不中断）、滚动动画、时间轴展开、卡片翻转、Hero 轮播
- `images/` —— 原创矢量 SVG（Logo、剪影、图标、分隔纹样）
- `music/bgm.mp3` —— 原创背景音乐

## 技术约束（对照比赛要求）

- 纯静态 HTML/CSS/JS，无构建步骤、无外部依赖
- 目录深度 ≤ 3 层（当前仅 1 层）
- 图片统一存放于 `images/`，本地链接一律相对路径
- 交互性强：时间轴展开、卡片翻转、滚动入场、视差、音乐常驻
- 兼容 Edge 90+（已补 `-webkit-backdrop-filter`）

## 本地预览

```bash
cd red-web
python3 -m http.server 8000
# 浏览器打开 http://127.0.0.1:8000
```

> 注意：背景音乐跨页面不中断依赖 SPA 局部刷新，需通过 http 访问（即本命令或部署后），直接双击 `index.html`（`file://`）会回退为整页跳转、音乐仍会停。

## 部署到 GitHub Pages

1. 在 GitHub 新建一个**空仓库**（建议名 `red-web`，不要勾选 README/.gitignore 初始化）。
2. 在本目录执行：

```bash
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git branch -M main
git push -u origin main
```

3. 仓库 → Settings → Pages → Branch 选 `main`、文件夹选 `/ (root)` → Save。
4. 约 1–2 分钟后访问 `https://<你的用户名>.github.io/<仓库名>/`，即为公网可访问地址。

## 提交比赛

将上方公网地址填入 `../output/作品简介.docx` 的「访问地址」占位，连同 docx 作为附件，于 **11 月 17 日之前** 发送至 `2967256170@QQ.com`。提交前请用杀毒软件扫描本文件夹。
