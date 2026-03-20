# 📊 会议保障排期表 - 安装与部署说明

本项目是一个基于 **Cloudflare** 生态构建的轻量级会议管理系统。采用前后端分离架构，利用 Cloudflare Pages 托管前端，Workers 处理 API，D1 数据库存储数据。

---

![演示图](https://imgbed.888710.xyz/file/会议保障演示图/1773910609246_会议保障排期表.png)

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
3.  创建成功后，你会看到一个 `Database ID`（一串英文字母和数字）。
4.  重要： 回到你的 GitHub 仓库，修改 `wrangler.toml` 文件，把刚才那个 ID 填入 `database_id = "你的ID"` 中。
5.  在数据库控制台中执行以下 SQL 语句初始化表结构：
    ```sql
    -- 1. 如果表已存在则删除（执行此步会清空已有会议数据，请知悉）
    DROP TABLE IF EXISTS meetings;
    -- 2. 创建结构完全匹配前端逻辑的表
    CREATE TABLE meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,            -- 唯一标识
    title TEXT NOT NULL,                             -- 会议名称
    meeting_time TEXT NOT NULL,                      -- 开始时间 (必填)
    meeting_end_time TEXT,                           -- 结束时间 (对应前端新增的止时字段)
    location TEXT NOT NULL,                          -- 会议地点 (必填)
    meeting_type TEXT DEFAULT '本地会',               -- 会议类型
    department TEXT,                                 -- 主办科室
    leader TEXT,                                     -- 参会领导
    status TEXT DEFAULT '市级',                       -- 参会范围
    notes TEXT,                                      -- 保障要求与备注
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP    -- 自动记录创建时间
    );
    ```

### 2. 创建 Pages 部署网站
1.  在 Cloudflare 左侧菜单点击 **Workers & Pages** -> **Overview**。
2.  点击 **Create** -> 选择 **Pages** 选项卡 -> 点击 **Connect to Git**。
3.  授权连接你的 **GitHub** 账号，选择你刚才建的 **meeting-tracker** 仓库。
4.  在构建设置（Build settings）里：
 - Framework preset: 选择 None
 - Build command: 留空
 - Build output directory: 填入 public
5. 不要急着点部署！ 往下滚动，展开 `Environment variables (环境变量)` 或 `Bindings (绑定)`。
 -  找到 `D1 database bindings`。
 -  Variable name (变量名) 填入：`DB`
 -  D1 database (数据库) 选择：`meeting-db`
6. 点击 Save and Deploy (保存并部署)。

### 3. 设置安全密码 (环境变量)
1.  在 Cloudflare Pages 项目设置中，进入 **Settings** -> **Environment variables**。
2.  添加一个变量 `ADMIN_PASSWORD`。
3.  设置一个你自定义的删除权限密码（例如：`666888`）。
4.  添加变量 `WEB_PASSWORD`（用于访问系统时的身份验证）。
   
| 变量名         | 是否必须 | 示例   | 说明       |
|:--------------:|:--------:|:------:|:------------------------------|
| ADMIN_PASSWORD | 否       | 123456 | 设置一个删除权限密码 |
| WEB_PASSWORD   | 是       | 123456 | 登录系统时的身份验证 |

### 4. 部署前端
1.  将最终版的 `index.html` 放入仓库的 `public` 文件夹下。
2.  提交代码并推送至 GitHub，Cloudflare Pages 会自动触发构建并完成部署。

### 5.大功告成 🎉
等待 1-2 分钟，Cloudflare 会给你分配一个免费的网址（类似 meeting-tracker.pages.dev）。
点击打开这个网址，你就能看到你的【每周会议保障排期表】了！

---

## 📝 核心功能亮点

### 1. 智能视觉分类（时效引导）
系统能自动识别会议的时间状态，并进行差异化视觉处理：

* **今日及未来会议**：采用粉色高亮背景，并配合蓝色左侧边框（border-l-4），同时字体保持加粗，确保当前任务极具辨识度。

* **历史会议**：自动降低透明度（opacity-60）并取消加粗，配合灰色调文字，实现视觉上的“自然淡出”，帮助用户专注于当下。

### 2. 自动化冲突检测
在保存会议时，系统会自动进行“时空校验”：

* **逻辑校验**：若输入的结束时间早于开始时间，系统会拦截并报错。

* **占用校验**：如果同一时间段、同一会议室已有排期，系统会弹出警告并显示冲突会议的名称，从源头上杜绝了排产事故。

### 3. 精细化的标签与布局
系统针对政务/商务会议场景做了大量细节优化：

* **参会领导标签化**：输入姓名后，系统会自动将其转换为独立的蓝色小标签（Leader Tags），视觉上清爽整洁。

* **响应式多栏布局**：表单采用网格系统（Grid），在电脑端自动分栏，在移动端竖排显示，适配各种办公设备。

* **字段针对性强**：内置了“主办科室”、“参会范围”、“保障要求”等特定字段，完美覆盖会议保障的每一个细节。

### 4. 生产级的数据交互
虽然代码简洁，但它具备了完整的增删改查（CRUD）能力：

* **实时更新**：支持无刷新加载数据（loadMeetings）。

* **安全认证**：内置了登录遮罩层（Login Overlay），通过密码校验访问令牌（Token），保障内部排期数据的安全性。

* **修改回显**：点击“修改”后，表单会自动填充原有数据并平滑滚动到顶部，用户体验流畅。

### 5. 一键办公集成
系统不仅是查看工具，更是生产力工具：

* **Excel 导出**：集成 xlsx.js 插件，一键即可将网页表格完整导出为标准的 .xlsx 文件，方便上报或打印。

* **即时搜索/定位**：利用浏览器的滚动优化（smooth behavior），让繁杂的排期管理变得井然有序。

---
## 📂 目录结构参考
```text
├── public/
│   └── index.html      # 前端界面逻辑
├── functions/
│   └── api/
│       └── meetings.js # 后端 API 接口逻辑
└── README.md           # 本说明文档
```

---

## ⚠️ 注意事项
- 网络依赖: 前端依赖 Tailwind CSS 的 CDN 资源，请确保访问环境网络正常。

- 数据安全: 务必在 Cloudflare 后台设置 ADMIN_PASSWORD，否则删除功能将无法进行安全校验。

