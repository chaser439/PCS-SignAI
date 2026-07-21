# PCS-SignAI
Personalized Chinese Sign Language Semantic Understanding System via Multimodal Sign Parsing, RAG and User Memory.

## Dynamic Website

项目动态介绍首页位于 `frontend/`，可独立运行

```powershell
cd frontend
npm install
npm run dev
```

类型检查、代码规范检查和生产构建：

```powershell
npm run typecheck
npm run lint
npm run build
```

更完整的前端说明见 `frontend/README.md`。

## 核心 Demo 复现

仓库不包含 API Key、虚拟环境、运行输出或带人物画面的演示视频。组员拉取代码后可按以下方式复现当前结果页效果。

### 1. 安装依赖

建议使用 Python 3.10：

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r module_B_semantic_brain\requirements.txt
python -m pip install -r module_A_sign_encoder\requirements.txt
```

前端依赖：

```powershell
cd frontend
npm install
cd ..
```

### 2. 配置本地密钥

复制 `module_B_semantic_brain/.env.example` 为 `module_B_semantic_brain/.env`，填写组员自己的 `DEEPSEEK_API_KEY`。`.env` 已被 Git 忽略，禁止提交真实密钥。

### 3. 启动三个服务

分别打开三个终端：

```powershell
# 仓库根目录：Module A
.\.venv\Scripts\python.exe -m uvicorn module_A_sign_encoder.api:app --host 127.0.0.1 --port 9001 --reload
```

```powershell
# module_B_semantic_brain 目录：Module B
..\.venv\Scripts\python.exe -m uvicorn api.main:app --host 127.0.0.1 --port 9002 --reload
```

```powershell
# frontend 目录：前端
npm run dev
```

### 4. 使用合成演示用户

在登录页使用账号 `demo-memory-user` 和任意非空密码。该账号仅是公开的合成 demo 身份，不对应真实用户；前端会将其映射为 Module B 中的 `account:demo-memory-user`，从而保持严格用户隔离并复现“妈妈 + 药”的个性化记忆命中。

### 5. 运行两个案例

演示视频不进入公开仓库。请使用单独移交、已获授权的本地素材，并保持文件名主体不变：

- `吃席.mp4`：结果页应展示中文文化知识检索命中。
- `妈妈药.mp4`：结果页应展示个性化记忆命中，并输出“妈妈该吃药了”。

素材要求详见 `demo_cases/README.md`。反馈按钮当前将确认/纠正记录保存在浏览器本地，作为后续更新用户记忆的依据；它尚不会自动写入 Module B 的服务端记忆文件。
