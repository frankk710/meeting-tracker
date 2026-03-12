# 📊 每周会议保障排期表 - 安装与部署说明

本项目是一个基于 **Cloudflare** 生态构建的轻量级会议管理系统。采用前后端分离架构，利用 Cloudflare Pages 托管前端，Workers 处理 API，D1 数据库存储数据。

---

## 🛠️ 技术架构

* **前端**: HTML5 + Tailwind CSS (通过 CDN 加载)
* **后端**: Cloudflare Workers (接口逻辑)
* **数据库**: Cloudflare D1 (关系型数据库)
* **部署平台**: Cloudflare Pages + GitHub 自动联动

---

## 🚀 部署步骤

### 1. 准备数据库 (Cloudflare D1)
1.  登录 Cloudflare 控制台，进入 **Workers & Pages** -> **D1**。
2.  创建一个名为 `meeting_db` 的数据库。
3.  在数据库控制台中执行以下 SQL 语句初始化表结构：
    ```sql
    DROP TABLE IF EXISTS meetings;
    CREATE TABLE meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,          -- 会议名称
    meeting_time TEXT NOT NULL,   -- 会议时间
    location TEXT,                -- 会议地点
    meeting_type TEXT DEFAULT '本地会', -- 会议类型
    department TEXT,              -- 主办科室
    leader TEXT,                  -- 参会领导
    status TEXT DEFAULT '都不参加',  -- 参会范围
    notes TEXT                    -- 备注/保障要求
    ```

### 2. 部署后端 (Cloudflare Workers)
1.  在项目根目录下创建 `functions/api/meetings.js` 文件。
2.  将后端接口逻辑代码粘贴至该文件。
3.  在 Cloudflare Pages 项目设置中：
    * 进入 **Settings** -> **Functions** -> **D1 database bindings**。
    * 添加绑定：变量名设为 `DB`，绑定到你创建的 `meeting_db` 数据库。

### 3. 设置安全密码 (环境变量)
1.  在 Cloudflare Pages 项目设置中，进入 **Settings** -> **Environment variables**。
2.  添加一个变量 `ADMIN_PASSWORD`。
3.  设置一个你自定义的删除权限密码（例如：`666888`）。

### 4. 部署前端
1.  将最终版的 `index.html` 放入仓库的 `public` 文件夹下。
2.  提交代码并推送至 GitHub，Cloudflare Pages 会自动触发构建并完成部署。

---

## 📝 核心功能亮点

### 1. 视觉隔离设计
* **单元格隔离**: 采用 `border` 样式实现物理边框，确保表格行列数据清晰、不混淆。
* **领导标签化**: 输入时使用顿号（`、`）分隔多个姓名，系统自动渲染为独立的蓝色隔离标签。
* **类型防换行**: 针对“本地会”、“视频会”等状态标签设置了 `whitespace-nowrap`，确保标签整齐美观。

### 2. 交互与逻辑
* **自动序号**: 列表首列通过前端索引实时生成序号，删除或修改后会自动重排，无需手动维护。
* **表单回填**: 修改功能支持将已有数据一键回填至表单，并伴随表单边框变色提醒，提升操作感知。
* **删除保护**: 执行删除操作时需验证管理员密码，确保数据安全性。

### 3. 响应式布局
* **宽幅优化**: 页面容器设为网页宽度的 `95%`，完美适配大屏办公环境。
* **自适应折行**: 时间、类型等短信息固定不换行，会议名称、备注等长文本支持自动折行，防止撑破布局。

---

## 📂 目录结构参考
```text
├── public/
│   └── index.html      # 前端界面逻辑
├── functions/
│   └── api/
│       └── meetings.js # 后端 API 接口逻辑
└── README.md           # 本说明文档
