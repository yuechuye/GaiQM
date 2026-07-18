# 三角洲改枪码管理网站 — 实现计划

> **对于 agentic workers：** 推荐使用 superpowers:subagent-driven-development 或 superpowers:executing-plans 按任务逐步实现。

**目标：** 构建一个纯静态网站，用于展示、搜索、筛选和复制三角洲游戏改枪码，托管到 GitHub Pages。

**架构：** 纯静态 HTML + CSS + JS，数据存储在 `data.json` 中。页面加载时通过 fetch 读取 JSON，渲染为按枪械分组的卡片列表。筛选和搜索在前端内存中完成，无需后端。

**技术栈：** HTML5 + CSS3 + Vanilla JavaScript (ES6)，Clipboard API，CSS Grid/Flexbox，GitHub Pages

---

## 文件结构

```
/
├── index.html      # 页面结构（顶栏、筛选栏、卡片列表容器）
├── style.css       # 样式（简洁实用风、响应式、卡片布局）
├── script.js       # 逻辑（数据加载、渲染、搜索、筛选、排序、复制）
└── data.json       # 改枪码数据（手动维护，git 版本管理）
```

---

### Task 1: 创建示例数据文件 data.json

**文件:**
- Create: `data.json`

- [ ] **Step 1: 写入示例数据**

```json
{
  "guns": [
    {
      "name": "M4A1",
      "codes": [
        {
          "code": "M4A1-CT-001",
          "description": "高精度远程配置，适合中远距离点射",
          "value": 15000
        },
        {
          "code": "M4A1-CQB-002",
          "description": "近战快速反应配置，提升射速和腰射精度",
          "value": 12000
        },
        {
          "code": "M4A1-ALL-003",
          "description": "全能均衡配置，兼顾精度与机动性",
          "value": 18000
        }
      ]
    },
    {
      "name": "AK-47",
      "codes": [
        {
          "code": "AK47-PWR-001",
          "description": "暴力输出配置，最大化单发伤害",
          "value": 20000
        },
        {
          "code": "AK47-CTRL-002",
          "description": "压枪优化配置，降低后坐力提升可控性",
          "value": 16000
        }
      ]
    },
    {
      "name": "AWM",
      "codes": [
        {
          "code": "AWM-SN-001",
          "description": "极限射程配置，一枪一个",
          "value": 35000
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: 验证 JSON 格式有效**

```bash
python3 -m json.tool data.json > /dev/null && echo "JSON valid"
```

---

### Task 2: 创建页面结构 index.html

**文件:**
- Create: `index.html`

- [ ] **Step 1: 写入完整 HTML 结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>三角洲改枪码</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <h1 class="title">🔫 三角洲改枪码</h1>
      <a class="github-link" href="https://github.com" target="_blank" rel="noopener">GitHub</a>
    </div>
  </header>

  <main class="main">
    <section class="filter-bar">
      <input
        type="text"
        id="searchInput"
        class="search-input"
        placeholder="搜索码、描述或枪械名称..."
        autocomplete="off"
      >
      <select id="gunFilter" class="gun-filter">
        <option value="">全部枪械</option>
      </select>
      <button id="sortBtn" class="sort-btn" data-sort="desc">
        价值 ↓
      </button>
    </section>

    <section id="codeList" class="code-list">
      <!-- JS 动态渲染 -->
    </section>

    <div id="emptyState" class="empty-state" style="display: none;">
      <p>没有匹配的改枪码</p>
    </div>
  </main>

  <footer class="footer">
    <p>改枪码数据通过 <a href="https://github.com" target="_blank" rel="noopener">GitHub</a> 维护</p>
  </footer>

  <div id="toast" class="toast">已复制到剪贴板</div>

  <script src="script.js"></script>
</body>
</html>
```

---

### Task 3: 创建样式文件 style.css

**文件:**
- Create: `style.css`

- [ ] **Step 1: 写入 CSS 变量与基础重置**

```css
/* ===== CSS 变量 ===== */
:root {
  --color-bg: #f5f5f5;
  --color-surface: #ffffff;
  --color-text: #1a1a1a;
  --color-text-secondary: #666666;
  --color-border: #e0e0e0;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-success: #16a34a;
  --color-accent: #f59e0b;
  --radius: 8px;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.12);
  --max-width: 800px;
}

/* ===== 基础重置 ===== */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans SC", sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  min-height: 100vh;
}
```

- [ ] **Step 2: 写入顶栏样式**

```css
/* ===== 顶栏 ===== */
.header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
}

.github-link {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 4px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  transition: all 0.2s;
}

.github-link:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}
```

- [ ] **Step 3: 写入主体与筛选栏样式**

```css
/* ===== 主体 ===== */
.main {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 20px;
}

/* ===== 筛选栏 ===== */
.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 180px;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--color-primary);
}

.gun-filter {
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.95rem;
  background: var(--color-surface);
  outline: none;
  cursor: pointer;
  min-width: 140px;
}

.gun-filter:focus {
  border-color: var(--color-primary);
}

.sort-btn {
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.95rem;
  background: var(--color-surface);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.sort-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
```

- [ ] **Step 4: 写入码列表与卡片样式**

```css
/* ===== 码列表 ===== */
.code-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== 枪械分组 ===== */
.gun-group {
  background: var(--color-surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.gun-group-header {
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gun-group-name {
  font-size: 1.1rem;
  font-weight: 700;
}

.gun-group-count {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  padding: 2px 10px;
  border-radius: 12px;
}

/* ===== 码卡片 ===== */
.code-cards {
  padding: 10px 12px;
}

.code-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 10px;
  border-bottom: 1px solid var(--color-bg);
  gap: 12px;
}

.code-card:last-child {
  border-bottom: none;
}

.code-info {
  flex: 1;
  min-width: 0;
}

.code-text {
  font-family: "SF Mono", "Fira Code", "Fira Mono", Menlo, Consolas, monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-bottom: 4px;
  word-break: break-all;
}

.code-desc {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}

.code-value {
  font-size: 0.85rem;
  color: var(--color-accent);
  font-weight: 600;
}

.copy-btn {
  flex-shrink: 0;
  padding: 6px 14px;
  font-size: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.copy-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.copy-btn.copied {
  background: var(--color-success);
  color: #fff;
  border-color: var(--color-success);
}
```

- [ ] **Step 5: 写入空状态、Toast 和响应式样式**

```css
/* ===== 空状态 ===== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary);
  font-size: 1rem;
}

/* ===== Toast ===== */
.toast {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: #333;
  color: #fff;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 0.9rem;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;
  z-index: 100;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ===== 页脚 ===== */
.footer {
  text-align: center;
  padding: 20px;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.footer a {
  color: var(--color-primary);
  text-decoration: none;
}

/* ===== 响应式 ===== */
@media (max-width: 600px) {
  .header-inner {
    padding: 12px 16px;
  }

  .title {
    font-size: 1.1rem;
  }

  .main {
    padding: 12px;
  }

  .filter-bar {
    gap: 8px;
  }

  .search-input {
    min-width: 100%;
    flex-basis: 100%;
  }

  .gun-filter {
    flex: 1;
  }

  .code-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .copy-btn {
    align-self: flex-end;
  }
}
```

---

### Task 4: 创建交互逻辑 script.js

**文件:**
- Create: `script.js`

- [ ] **Step 1: 写入数据加载和初始化**

```javascript
// ===== 全局状态 =====
let allGuns = [];
let currentSort = 'desc'; // 'desc' | 'asc'

// ===== DOM 引用 =====
const searchInput = document.getElementById('searchInput');
const gunFilter = document.getElementById('gunFilter');
const sortBtn = document.getElementById('sortBtn');
const codeList = document.getElementById('codeList');
const emptyState = document.getElementById('emptyState');
const toast = document.getElementById('toast');

// ===== 加载数据 =====
async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Failed to load data');
    const data = await response.json();
    allGuns = data.guns;
    initGunFilter();
    render();
  } catch (err) {
    codeList.innerHTML = '<p style="text-align:center;padding:40px;color:#ef4444;">数据加载失败，请检查 data.json 文件</p>';
    console.error('Data load error:', err);
  }
}

// ===== 初始化枪械筛选下拉 =====
function initGunFilter() {
  gunFilter.innerHTML = '<option value="">全部枪械</option>';
  allGuns.forEach(gun => {
    const option = document.createElement('option');
    option.value = gun.name;
    option.textContent = `${gun.name} (${gun.codes.length})`;
    gunFilter.appendChild(option);
  });
}
```

- [ ] **Step 2: 写入筛选和排序逻辑**

```javascript
// ===== 获取筛选排序后的数据 =====
function getFilteredGuns() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const gunFilterValue = gunFilter.value;

  // 筛选
  let filtered = allGuns;
  if (gunFilterValue) {
    filtered = filtered.filter(gun => gun.name === gunFilterValue);
  }

  // 搜索
  if (searchTerm) {
    filtered = filtered.map(gun => ({
      ...gun,
      codes: gun.codes.filter(c =>
        c.code.toLowerCase().includes(searchTerm) ||
        c.description.toLowerCase().includes(searchTerm)
      )
    })).filter(gun => gun.codes.length > 0);
  }

  // 排序（按价值）
  filtered = filtered.map(gun => ({
    ...gun,
    codes: [...gun.codes].sort((a, b) =>
      currentSort === 'desc' ? b.value - a.value : a.value - b.value
    )
  }));

  return filtered;
}
```

- [ ] **Step 3: 写入渲染逻辑**

```javascript
// ===== 渲染 =====
function render() {
  const filtered = getFilteredGuns();

  if (filtered.length === 0) {
    codeList.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  codeList.innerHTML = filtered.map(gun => `
    <div class="gun-group">
      <div class="gun-group-header">
        <span class="gun-group-name">${escapeHTML(gun.name)}</span>
        <span class="gun-group-count">${gun.codes.length} 个码</span>
      </div>
      <div class="code-cards">
        ${gun.codes.map(code => `
          <div class="code-card">
            <div class="code-info">
              <div class="code-text">${escapeHTML(code.code)}</div>
              <div class="code-desc">${escapeHTML(code.description)}</div>
              <div class="code-value">¥${code.value.toLocaleString()}</div>
            </div>
            <button class="copy-btn" data-code="${escapeHTML(code.code)}">
              📋 复制
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // 绑定复制按钮事件
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', handleCopy);
  });
}

// ===== HTML 转义 =====
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

- [ ] **Step 4: 写入复制和事件绑定逻辑**

```javascript
// ===== 复制到剪贴板 =====
async function handleCopy(e) {
  const btn = e.currentTarget;
  const code = btn.getAttribute('data-code');

  try {
    await navigator.clipboard.writeText(code);
    btn.classList.add('copied');
    btn.textContent = '✓ 已复制';
    showToast();

    setTimeout(() => {
      btn.classList.remove('copied');
      btn.textContent = '📋 复制';
    }, 1500);
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = code;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    btn.classList.add('copied');
    btn.textContent = '✓ 已复制';
    showToast();
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.textContent = '📋 复制';
    }, 1500);
  }
}

// ===== Toast =====
let toastTimer;
function showToast() {
  clearTimeout(toastTimer);
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

// ===== 事件绑定 =====
searchInput.addEventListener('input', render);
gunFilter.addEventListener('change', render);

sortBtn.addEventListener('click', () => {
  currentSort = currentSort === 'desc' ? 'asc' : 'desc';
  sortBtn.textContent = currentSort === 'desc' ? '价值 ↓' : '价值 ↑';
  render();
});

// ===== 启动 =====
loadData();
```

---

### Task 5: 本地验证

- [ ] **Step 1: 验证所有文件存在**

```bash
ls -la /Users/yuechu/MY/GaiQM/index.html /Users/yuechu/MY/GaiQM/style.css /Users/yuechu/MY/GaiQM/script.js /Users/yuechu/MY/GaiQM/data.json
```

- [ ] **Step 2: 启动本地服务器测试**

```bash
cd /Users/yuechu/MY/GaiQM && python3 -m http.server 8080
```

打开浏览器访问 `http://localhost:8080`，验证：
- 页面正常加载，所有改枪码展示出来
- 搜索框输入能筛选
- 枪械下拉筛选正常
- 价值排序按钮正常切换
- 复制按钮能复制码到剪贴板
- 移动端（Chrome DevTools 模拟）布局正常

- [ ] **Step 3: 关闭测试服务器** (Ctrl+C)

---

### Task 6: 初始化 Git 仓库并推送到 GitHub

- [ ] **Step 1: 初始化 Git 仓库**

```bash
cd /Users/yuechu/MY/GaiQM
git init
git checkout -b main
```

- [ ] **Step 2: 添加 .gitignore**

```bash
echo '.DS_Store' > /Users/yuechu/MY/GaiQM/.gitignore
```

- [ ] **Step 3: 提交所有文件**

```bash
cd /Users/yuechu/MY/GaiQM
git add index.html style.css script.js data.json .gitignore
git commit -m "feat: 三角洲改枪码管理网站

- 纯静态网站，支持展示、搜索、筛选、复制改枪码
- 数据存储在 data.json 中，通过 git 版本管理
- 响应式设计，适配手机和桌面端

Co-Authored-By: Claude <noreply@anthropic.com>"
```

- [ ] **Step 4: 创建 GitHub 仓库并推送**

在 GitHub 上创建新仓库（名称如 `delta-force-codes`），然后：

```bash
cd /Users/yuechu/MY/GaiQM
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

- [ ] **Step 5: 启用 GitHub Pages**

在 GitHub 仓库的 Settings → Pages 中，选择 `main` 分支作为部署源，保存后等待几分钟即可通过 `https://<你的用户名>.github.io/<仓库名>/` 访问。
