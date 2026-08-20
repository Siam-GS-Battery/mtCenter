<div align="center">

<h1>🔧 &nbsp;M T &nbsp;C E N T E R</h1>

<strong>ผู้ช่วย AI ดูแลซ่อมบำรุงเครื่องจักร (CMMS) สำหรับโรงงาน GS Battery Thailand</strong>

<code>📷 Scan QR</code>&nbsp;&nbsp;→&nbsp;&nbsp;<code>🤖 AI Diagnose</code>&nbsp;&nbsp;→&nbsp;&nbsp;<code>🧾 Work Order</code>&nbsp;&nbsp;→&nbsp;&nbsp;<code>📚 Knowledge</code>&nbsp;&nbsp;→&nbsp;&nbsp;<code>📊 Dashboard</code>

<br />

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

</div>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" width="100%" />

## <img src="https://media.giphy.com/media/WUlplcMpOCEmTGBtBW/giphy.gif" width="30"> Table of Contents

<details open>
<summary><kbd>Click to expand</kbd></summary>

&nbsp;&nbsp;[Overview](#overview)<br />
&nbsp;&nbsp;[Tech Stack](#tech-stack)<br />
&nbsp;&nbsp;[Project Structure](#project-structure)<br />
&nbsp;&nbsp;[Features](#features)<br />
&nbsp;&nbsp;[Getting Started](#getting-started)<br />
&nbsp;&nbsp;[API Reference](#api-reference)<br />
&nbsp;&nbsp;[Deployment](#deployment)<br />
&nbsp;&nbsp;[Branch Strategy / Roadmap](#branch-strategy--roadmap)<br />

</details>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" width="100%" />

## <img src="https://media.giphy.com/media/VgCDAzcKvsR6OM0uWg/giphy.gif" width="30"> Overview

**MT Center — AI Machine Maintenance Assistant (CMMS)** เป็นระบบผู้ช่วยดูแลซ่อมบำรุงเครื่องจักรด้วย AI ของโรงงาน GS Battery Thailand ช่วยลด **downtime** และ **MTTR** โดยให้ช่างเทคนิคเข้าถึงข้อมูลเครื่องจักร คู่มือ อะไหล่ และคำวินิจฉัยจาก AI ได้ทันทีบนมือถือ/แท็บเล็ต วิศวกรตรวจสอบและอนุมัติใบงาน พร้อมคัดกรององค์ความรู้เข้าคลัง ส่วนหัวหน้างานเห็นภาพรวมโรงงานแบบเรียลไทม์

**เป้าหมายความสำเร็จ (ตาม PRD):**
- ลด MTTR ≥ 20% ภายใน 6 เดือน
- เพิ่ม uptime เครื่องจักร +3–5%
- อัตราการใช้งานระบบ (adoption) ≥ 80% ภายใน 3 เดือน
- ความแม่นยำของคำตอบ AI ≥ 70%
- ความคลาดเคลื่อนของสต๊อกอะไหล่ < 2%

<table align="center">
<tr>
<td align="center" width="25%">

![Technician](https://img.shields.io/badge/-Technician-4C6EF5?style=for-the-badge)
<br /><sub>ช่างเทคนิคสแกน QR แจ้งเสีย เปิดใบงาน เบิกอะไหล่ ถาม AI</sub>

</td>
<td align="center" width="25%">

![Engineer](https://img.shields.io/badge/-Engineer-12B886?style=for-the-badge)
<br /><sub>วิศวกรตรวจ-อนุมัติใบงาน อัปโหลดคู่มือ ยืนยันองค์ความรู้</sub>

</td>
<td align="center" width="25%">

![Supervisor](https://img.shields.io/badge/-Supervisor-F59F00?style=for-the-badge)
<br /><sub>หัวหน้างานดูแดชบอร์ด รายงาน วางกำลังคน</sub>

</td>
<td align="center" width="25%">

![AI Powered](https://img.shields.io/badge/-AI%20Powered-E64980?style=for-the-badge)
<br /><sub>วินิจฉัยปัญหาและตอบคำถามด้วย Gemini AI</sub>

</td>
</tr>
</table>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" width="100%" />

## <img src="https://media2.giphy.com/media/QssGEmpkyEOhBCb7e1/giphy.gif" width="30"> Tech Stack

<div align="center">

<strong>Backend</strong><br />
<img src="https://skillicons.dev/icons?i=nodejs,express,typescript,supabase&theme=dark" /><br /><br />

<strong>Frontend</strong><br />
<img src="https://skillicons.dev/icons?i=react,vite,typescript,tailwind,threejs&theme=dark" />

</div>

**Backend** (`backend/`, ESM TypeScript รันด้วย `tsx`)

| Technology | Version | Role |
|---|---|---|
| ![Express](https://img.shields.io/badge/Express-4.19.2-000000?style=flat-square) | ^4.19.2 | HTTP server / routing |
| ![Supabase](https://img.shields.io/badge/Supabase--js-2.45.4-3ECF8E?style=flat-square) | ^2.45.4 | Database client (Postgres) |
| ![Gemini](https://img.shields.io/badge/@google/genai-2.4.0-8E75B2?style=flat-square) | ^2.4.0 | AI diagnosis / chat / embeddings |
| ![jsonwebtoken](https://img.shields.io/badge/jsonwebtoken-9.0.3-000000?style=flat-square) | ^9.0.3 | JWT authentication |
| ![bcryptjs](https://img.shields.io/badge/bcryptjs-3.0.3-338033?style=flat-square) | ^3.0.3 | Password hashing |
| ![express-rate-limit](https://img.shields.io/badge/express--rate--limit-8.6.2-000000?style=flat-square) | ^8.6.2 | Login rate limiting |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square) | ~5.8 | Type safety |
| ![xlsx](https://img.shields.io/badge/xlsx-0.18.5-217346?style=flat-square) | ^0.18.5 | Excel import scripts |

**Frontend** (`frontend/`, package name ยังคงเป็น `react-example`)

| Technology | Version | Role |
|---|---|---|
| ![React](https://img.shields.io/badge/React-19.0.1-61DAFB?style=flat-square) | 19.0.1 | UI library |
| ![Vite](https://img.shields.io/badge/Vite-6.2.3-646CFF?style=flat-square) | ^6.2.3 | Build tool / dev server |
| ![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-4.1.14-06B6D4?style=flat-square) | ^4.1.14 | Styling |
| ![react-three-fiber](https://img.shields.io/badge/@react--three/fiber-9.7.0-000000?style=flat-square) | ^9.7.0 | Live Floor 4D (3D scene) |
| ![drei](https://img.shields.io/badge/@react--three/drei-10.7.8-000000?style=flat-square) | ^10.7.8 | 3D helpers |
| ![three](https://img.shields.io/badge/three-0.180.0-000000?style=flat-square) | ^0.180.0 | 3D engine |
| ![recharts](https://img.shields.io/badge/recharts-3.10.1-8884D8?style=flat-square) | ^3.10.1 | Dashboard charts |
| ![motion](https://img.shields.io/badge/motion-12.23.24-FF0080?style=flat-square) | ^12.23.24 | Animations |
| ![sweetalert2](https://img.shields.io/badge/sweetalert2-11.26.25-6BC0E1?style=flat-square) | ^11.26.25 | Dialogs / alerts |
| ![react-markdown](https://img.shields.io/badge/react--markdown-10.1.0-000000?style=flat-square) | ^10.1.0 | Render AI markdown replies |
| ![jsqr](https://img.shields.io/badge/jsqr-1.4.0-000000?style=flat-square) | ^1.4.0 | QR code scanning |
| ![express](https://img.shields.io/badge/express-4.21.2-000000?style=flat-square) | ^4.21.2 | Dev static server (`server.ts`) |

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" width="100%" />

## <img src="https://media.giphy.com/media/iY8CRBdQXODJSCERIr/giphy.gif" width="30"> Project Structure

```
mtcenter/
├── 📂 backend/
│   └── 📂 src/
│       ├── 📄 config.ts              # ตรวจสอบ env ตอน boot
│       ├── 📄 index.ts               # Express app, middleware, static SPA
│       ├── 📂 lib/                   # aiActionTokens, aiContext, aiInteractionLog, auth,
│       │                             # embeddings, knowledgeDraft, knowledgeStats,
│       │                             # manualChunker, manualIndexer, manualRetrieval (RAG),
│       │                             # mappers, mockAssistant (AI_MODE=mock),
│       │                             # queryHelpers, reviewQueue, supabase, thresholds
│       ├── 📂 middleware/            # authenticate, errorHandler, loginRateLimit,
│       │                             # requireAuth, requireRole, requireSupervisor
│       └── 📂 routes/                # ai, auth, knowledge, machines, manuals,
│                                     # partWithdrawals, pmPlans, spareParts, users, workOrders
│
├── 📂 frontend/
│   └── 📂 src/
│       ├── 📄 App.tsx                # root, role-based tabs
│       ├── 📄 main.tsx
│       ├── 📄 types.ts
│       ├── 📄 index.css
│       ├── 📂 components/            # LoginPage, ChangePasswordScreen, Sidebar, TopBar,
│       │                             # SettingsModal, HelpModal, AIAssistantDrawer,
│       │                             # AIAssistantToggleButton, CreateWorkOrderModal,
│       │                             # EditWorkOrderModal, WorkOrderDetailModal,
│       │                             # WorkOrderForm, MachineSelect, MicDictationButton,
│       │                             # GloveFriendlyCTA, PixelAILogo
│       │   ├── 📂 ai/                # AiChatHistoryPanel, AssistantConversation
│       │   ├── 📂 ui/                # Modal, Pagination
│       │   └── 📂 views/             # AIChatView, AllWorkOrdersView, CreateWorkOrderView,
│       │       │                     # KnowledgeBaseView, KnowledgeOverviewPanel,
│       │       │                     # KnowledgeReviewView, MachineAdminView, ManualsView,
│       │       │                     # MyWorkOrdersView, PendingReviewView, ScanMachineView,
│       │       │                     # SparePartsAdminView, SparePartsView,
│       │       │                     # SupervisorDashboardView, SupervisorReportsView,
│       │       │                     # TelemetryTrendCard, UploadManualView
│       │       └── 📂 liveFloor/     # InspectorPanel, InspectorRobot, LiveFloor4DScene,
│       │                             # LiveFloorFacility, LiveFloorHUD, LiveFloorView,
│       │                             # liveFloorTheme, machineParts
│       ├── 📂 contexts/              # AuthContext
│       ├── 📂 hooks/                 # useAiChatSessions, useDebouncedValue,
│       │                             # useQrScanner, useSpeechToText
│       ├── 📂 services/              # apiService.ts (VITE_API_URL + x-user-id header)
│       ├── 📂 lib/                   # aiActions, floorLayout, floorNavGraph,
│       │                             # floorSimulation, format, inspectionAgent,
│       │                             # manualCategories, manualToc, pillStyles,
│       │                             # qrPayload, swal, thresholds, workOrderStatus
│       ├── 📂 data/                  # mockData.ts (MOCK_KB_ARTICLES เท่านั้น)
│       └── 📂 docs/                  # PRD.md, 2.3_Design_System_Template.md,
│                                     # Cost_Benefit_Analysis.md, data-import-spec.md,
│                                     # Manual_MD/
│
├── 📄 Dockerfile
├── 📄 railway.json
└── 📄 package.json                   # scripts monorepo (dev, build, start)
```

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" width="100%" />

## <img src="https://media.giphy.com/media/LnQjpWaON8nhr21vNW/giphy.gif" width="30"> Features

### <img src="https://img.shields.io/badge/-Authentication%20%26%20Roles-4C6EF5?style=for-the-badge&logoColor=white" />

- เข้าสู่ระบบด้วย JWT และเก็บรหัสผ่านด้วย bcrypt
- บังคับให้เปลี่ยนรหัสผ่านในการเข้าใช้ครั้งแรก (403 `PASSWORD_CHANGE_REQUIRED`)
- จำกัดจำนวนครั้งการ login ต่อ IP (rate limit) เพื่อป้องกัน brute-force
- แบ่งสิทธิ์การใช้งานตามบทบาท: technician / engineer / supervisor

### <img src="https://img.shields.io/badge/-Machines%20%26%20QR%20Scan-12B886?style=for-the-badge&logoColor=white" />

- สแกน QR code ด้วย jsQR เพื่อดูข้อมูลเครื่องจักรทันที
- ดูค่าการอ่านเซนเซอร์ (readings) และกราฟแนวโน้ม telemetry

### <img src="https://img.shields.io/badge/-Work%20Orders-FCA130?style=for-the-badge&logoColor=white" />

- สร้าง แก้ไข และมอบหมายใบงานซ่อมบำรุง
- แนบไฟล์ประกอบใบงาน
- วิศวกร/หัวหน้างานตรวจสอบและอนุมัติใบงาน

```mermaid
graph LR
    A[Open] --> B[In Progress]
    B --> C[Pending Review]
    C --> D[Approved / Completed]
    C --> E[Rejected]
    E --> B

    style A fill:#4C6EF5,color:#fff
    style B fill:#F59F00,color:#fff
    style C fill:#C5862B,color:#fff
    style D fill:#12B886,color:#fff
    style E fill:#F93E3E,color:#fff
```

<table align="center">
<tr><th>Role</th><th>สิทธิ์ในใบงาน</th></tr>
<tr><td align="center">technician</td><td>สร้าง / แก้ไขใบงานของตนเอง</td></tr>
<tr><td align="center">engineer</td><td>ตรวจสอบ / อนุมัติ / จัดการไฟล์แนบ</td></tr>
<tr><td align="center">supervisor</td><td>อนุมัติ / ดูภาพรวมทั้งหมด</td></tr>
</table>

### <img src="https://img.shields.io/badge/-AI%20Assistant-8E75B2?style=for-the-badge&logoColor=white" />

- ขับเคลื่อนด้วย Gemini AI รองรับสองโหมด: `mock` (rule/DB based ไม่เรียก LLM) และ `live`
- แชทถาม-ตอบ วินิจฉัยปัญหาเครื่องจักร (diagnose) และให้ feedback ผลลัพธ์
- ค้นคืนข้อมูลจากคู่มือด้วยเทคนิค RAG ผ่าน embeddings
- พิมพ์หรือพูดด้วย speech-to-text

### <img src="https://img.shields.io/badge/-Spare%20Parts%20%26%20PM-E64980?style=for-the-badge&logoColor=white" />

- จัดการสต๊อกอะไหล่ เบิกอะไหล่ พร้อมสถิติการเบิกใช้
- ดูแผนการบำรุงรักษาเชิงป้องกัน (PM Plans)

### <img src="https://img.shields.io/badge/-Knowledge%20Base-228BE6?style=for-the-badge&logoColor=white" />

- ร่างองค์ความรู้อัตโนมัติจากใบงานที่ปิดแล้ว
- วิศวกรตรวจสอบและยืนยันเข้าคลังความรู้
- ดูภาพรวมและสถิติการนำองค์ความรู้ไปใช้

### <img src="https://img.shields.io/badge/-Live%20Floor%204D-15AABF?style=for-the-badge&logoColor=white" />

- ผังโรงงานแบบ 3D ด้วย react-three-fiber
- หุ่นยนต์ AI เดินตรวจเครื่องจักรในผังโรงงาน

### <img src="https://img.shields.io/badge/-Reports%20%26%20Dashboard-495057?style=for-the-badge&logoColor=white" />

- แดชบอร์ดและรายงานภาพรวมโรงงานด้วย recharts

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" width="100%" />

## <img src="https://media.giphy.com/media/WFZvB7VIXBgiz3oDXE/giphy.gif" width="30"> Getting Started

<table align="center">
<tr><th>Requirement</th><th>Version</th></tr>
<tr><td align="center"><img src="https://skillicons.dev/icons?i=nodejs" width="30" /></td><td align="center">&gt;= 20</td></tr>
<tr><td align="center"><img src="https://skillicons.dev/icons?i=npm" width="30" /></td><td align="center">latest</td></tr>
<tr><td align="center"><img src="https://skillicons.dev/icons?i=supabase" width="30" /></td><td align="center">โปรเจกต์ Supabase (Postgres)</td></tr>
</table>

**Install**

```bash
npm run install:all
```

**Dev (backend + frontend พร้อมกัน)**

```bash
npm run dev
```

**Build**

```bash
npm run build
```

<details>
<summary><img src="https://img.shields.io/badge/backend-.env-000000?style=for-the-badge" /></summary>

```env
PORT=4000
SUPABASE_URL=                     # required
SUPABASE_SERVICE_ROLE_KEY=        # required
# JWT_SECRET: สร้าง secret สุ่ม >= 32 ตัวอักษร
# PowerShell: -join ((48..57)+(65..90)+(97..122) | Get-Random -Count 32 | % {[char]$_})
# openssl:    openssl rand -hex 32
JWT_SECRET=                       # required, >= 32 ตัวอักษร
GEMINI_API_KEY=                   # optional
CORS_ORIGIN=http://localhost:3000 # comma separated
AI_MODE=mock                      # mock | live
GEMINI_EMBED_RPM=
STATIC_DIR=./public
```

</details>

<details>
<summary><img src="https://img.shields.io/badge/frontend-.env-000000?style=for-the-badge" /></summary>

```env
VITE_API_URL=   # default "" = same origin
```

</details>

> **Testing:** ยังไม่มี test framework ในโปรเจกนี้ (ไม่มี vitest/jest/playwright) — เป็นงานที่วางแผนไว้

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" width="100%" />

## <img src="https://media.giphy.com/media/pOEbLRT4SwD35IELiQ/giphy.gif" width="30"> API Reference

> Base URL: `/api`

<details>
<summary><strong>Auth</strong> — <code>/api/auth</code> (public)</summary>

| Method | Endpoint | Description |
|---|---|---|
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/auth/login` | เข้าสู่ระบบ (rate limit ต่อ IP) |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/auth/me` | ข้อมูลผู้ใช้ปัจจุบัน |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/auth/change-password` | เปลี่ยนรหัสผ่าน |

</details>

<details>
<summary><strong>Users</strong> — <code>/api/users</code></summary>

| Method | Endpoint | Description |
|---|---|---|
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/users` | รายชื่อผู้ใช้ |

</details>

<details>
<summary><strong>Machines</strong> — <code>/api/machines</code></summary>

| Method | Endpoint | Description |
|---|---|---|
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/machines/stats` | สถิติเครื่องจักร |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/machines` | รายการเครื่องจักร |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/machines` | สร้างเครื่องจักร (admin) |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/machines/:id` | รายละเอียดเครื่องจักร |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/machines/:id/readings` | ค่าการอ่านเซนเซอร์ |
| ![PATCH](https://img.shields.io/badge/PATCH-C5862B?style=flat-square) | `/api/machines/:id` | แก้ไขเครื่องจักร (admin) |
| ![DELETE](https://img.shields.io/badge/DELETE-F93E3E?style=flat-square) | `/api/machines/:id` | ลบเครื่องจักร (admin) |

</details>

<details>
<summary><strong>Work Orders</strong> — <code>/api/work-orders</code></summary>

| Method | Endpoint | Description |
|---|---|---|
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/work-orders/stats` | สถิติใบงาน |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/work-orders` | รายการใบงาน |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/work-orders` | สร้างใบงาน |
| ![PATCH](https://img.shields.io/badge/PATCH-C5862B?style=flat-square) | `/api/work-orders/:id` | แก้ไขใบงาน |
| ![DELETE](https://img.shields.io/badge/DELETE-F93E3E?style=flat-square) | `/api/work-orders/:id` | ลบใบงาน |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/work-orders/:id/approve` | อนุมัติใบงาน (engineer/supervisor) |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/work-orders/:id/attachments` | รายการไฟล์แนบ |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/work-orders/:id/attachments/upload-url` | ขอ URL อัปโหลด (eng/sup) |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/work-orders/:id/attachments` | บันทึกไฟล์แนบ (eng/sup) |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/work-orders/:id/attachments/:attachmentId/file` | ดาวน์โหลดไฟล์แนบ |
| ![DELETE](https://img.shields.io/badge/DELETE-F93E3E?style=flat-square) | `/api/work-orders/:id/attachments/:attachmentId` | ลบไฟล์แนบ (eng/sup) |

</details>

<details>
<summary><strong>Spare Parts</strong> — <code>/api/spare-parts</code></summary>

| Method | Endpoint | Description |
|---|---|---|
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/spare-parts/stats` | สถิติอะไหล่ |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/spare-parts/for-machine` | อะไหล่ตามเครื่องจักร |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/spare-parts` | รายการอะไหล่ |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/spare-parts` | สร้างอะไหล่ (supervisor) |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/spare-parts/:id/stock` | ปรับสต๊อก (supervisor) |
| ![PATCH](https://img.shields.io/badge/PATCH-C5862B?style=flat-square) | `/api/spare-parts/:id` | แก้ไขอะไหล่ (supervisor) |
| ![DELETE](https://img.shields.io/badge/DELETE-F93E3E?style=flat-square) | `/api/spare-parts/:id` | ลบอะไหล่ (supervisor) |

</details>

<details>
<summary><strong>Part Withdrawals</strong> — <code>/api/part-withdrawals</code></summary>

| Method | Endpoint | Description |
|---|---|---|
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/part-withdrawals/stats` | สถิติการเบิก |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/part-withdrawals` | รายการการเบิก |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/part-withdrawals` | เบิกอะไหล่ |

</details>

<details>
<summary><strong>Manuals</strong> — <code>/api/manuals</code></summary>

| Method | Endpoint | Description |
|---|---|---|
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/manuals` | รายการคู่มือ |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/manuals/upload-url` | ขอ URL อัปโหลดคู่มือ (manual admin) |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/manuals` | บันทึกคู่มือ (manual admin) |
| ![DELETE](https://img.shields.io/badge/DELETE-F93E3E?style=flat-square) | `/api/manuals/:id` | ลบคู่มือ |
| ![PATCH](https://img.shields.io/badge/PATCH-C5862B?style=flat-square) | `/api/manuals/:id` | แก้ไขคู่มือ |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/manuals/:id/file` | ดาวน์โหลดไฟล์คู่มือ |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/manuals/:id/content` | เนื้อหาคู่มือ |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/manuals/:id/index` | สร้าง index/embeddings คู่มือ |

</details>

<details>
<summary><strong>PM Plans</strong> — <code>/api/pm-plans</code></summary>

| Method | Endpoint | Description |
|---|---|---|
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/pm-plans/stats` | สถิติแผน PM |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/pm-plans` | รายการแผน PM |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/pm-plans/:id` | รายละเอียดแผน PM |

</details>

<details>
<summary><strong>Knowledge</strong> — <code>/api/knowledge</code></summary>

| Method | Endpoint | Description |
|---|---|---|
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/knowledge/review-queue` | คิวใบงานรอรีวิว (จัดลำดับด้วย rule) |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/knowledge/draft/:workOrderId` | ร่างองค์ความรู้ (ไม่บันทึก) |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/knowledge/confirm` | วิศวกรยืนยันเข้าคลัง |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/knowledge/overview` | ภาพรวม + สถิติการนำไปใช้ |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/knowledge` | รายการที่ยืนยันแล้ว |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/knowledge/:id/content` | เนื้อหาองค์ความรู้ |

</details>

<details>
<summary><strong>AI</strong> — <code>/api/ai</code></summary>

| Method | Endpoint | Description |
|---|---|---|
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/ai/chat` | แชทกับผู้ช่วย AI |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/ai/feedback` | ส่ง feedback คำตอบ AI |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/ai/mode` | ดูโหมด AI ปัจจุบัน (mock/live) |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/ai/diagnose` | วินิจฉัยปัญหาเครื่องจักร |

</details>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" width="100%" />

## <img src="https://media.giphy.com/media/jSKBmKkvo2dPQQtsR1/giphy.gif" width="30"> Deployment

ระบบ deploy เป็น **single container** ที่เสิร์ฟทั้ง API และ static frontend ด้วย `Dockerfile` แบบ 3-stage:

1. **frontend-build** (`node:22-slim`) — `npm ci`, ตั้ง `VITE_API_URL=""`, `vite build`
2. **backend-build** (`node:22-slim`) — `npm ci`, `tsc`
3. **runner** (`node:22-slim`, `NODE_ENV=production`) — `npm ci --omit=dev`, copy backend `dist` + frontend `dist` เป็น `./public`, `EXPOSE 4000`, `CMD node dist/index.js`

`railway.json` กำหนด builder เป็น `DOCKERFILE`, `healthcheckPath` = `/api/health`, timeout 100 วินาที, restart policy `ON_FAILURE` สูงสุด 10 ครั้ง

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" width="100%" />

## <img src="https://media.giphy.com/media/cNZqrH5IzOG0xrl2yS/giphy.gif" width="30"> Branch Strategy / Roadmap

| Branch | Purpose |
|---|---|
| `main` | Production |
| `develop` | Active Development |
| `feature/*` | Feature Branches |

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" alt="line" width="100%" />

<div align="center">

---

<sub>Built with ❤ by <strong>Pantira S.</strong> &mdash; Siam GS Battery · Private, internal use only</sub>

</div>
</content>
