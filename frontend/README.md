# PCS-SignAI Frontend

PCS-SignAI 前端，采用 React、TypeScript、Vite、React Router、Framer Motion 与 Lucide 构建。项目包含品牌官网、完整账号流程以及可登录使用的语义理解系统。

## 本地运行

需要 Node.js 20.19 或更高版本。

```powershell
cd frontend
npm install
npm run dev
```

浏览器打开终端输出的本地地址。默认开发地址通常为 `http://localhost:5173`。

## 质量检查

```powershell
npm run typecheck
npm run lint
npm run build
```

生产构建输出到 `frontend/dist/`。

## 产品路由

- `/`：动态品牌官网
- `/login`、`/register`：登录、注册与密码找回
- `/app`、`/app/workspace`：双向智能手语交互、实时录制、文件输入、AI 语义梳理、虚拟人与结果反馈
- `/app/overview`：保留的产品总览，可通过内部品牌标识进入
- `/app/history`：简化后的交互历史、详情与再次处理
- `/app/memory`：现有个性化记忆与主动记忆上传
- `/app/settings`：用户资料、默认交互选项、界面与本地数据管理

左侧一级导航只展示智能理解、历史记录、记忆中心和系统设置。旧的案例、服务、反馈地址会回到智能理解页面。

## 数据与服务

页面只通过 `src/services/` 访问数据。账号会话、历史记录、任务反馈、记忆中心展示数据和偏好设置仍通过 `localStorage` 或 `sessionStorage` 持久化；手语转语言流程会把用户选择的视频发送到本机 `127.0.0.1:9001` 的 Module A，再把识别结果发送到本机 `127.0.0.1:9002` 的 Module B。文字转手语、虚拟人视频以及部分产品数据仍使用前端 Local Provider。

核心 demo 的完整启动方式、合成演示账号和素材命名要求见仓库根目录 `README.md`。反馈记录当前保存在浏览器本地，尚不会自动写入 Module B 的服务端记忆文件。
