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
