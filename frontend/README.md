# PCS-SignAI Frontend

PCS-SignAI 产品前端，采用 React、TypeScript、Vite、React Router、Framer Motion 与 Lucide 构建。项目包含品牌官网、完整账号流程以及可登录使用的语义理解系统。

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

页面只通过 `src/services/` 访问数据。当前 Local Provider 提供账号会话、双向转换结果、虚拟人视频、历史记录、任务反馈、用户记忆和偏好设置，并通过 `localStorage` 或 `sessionStorage` 持久化。`interactionService.ts` 为视频、实时流、双向转换、虚拟人、AI 文本梳理、反馈和记忆上传保留了未来 HTTP Provider 边界。

所有视觉均由本地 SVG 与 CSS 构成，没有外部图片或字体依赖。上传文件只用于浏览器内预览和记录文件信息；当前 Local Provider 不会把内容发送到远端。
