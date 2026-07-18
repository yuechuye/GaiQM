// ===== 全局状态 =====
let allGuns = [];
let currentSort = 'desc'; // 'desc' | 'asc'
let currentCategory = ''; // '' = 全部

// ===== DOM 引用 =====
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
    render();
  } catch (err) {
    codeList.innerHTML = '<p style="text-align:center;padding:40px;color:#ef4444;">数据加载失败，请检查 data.json 文件</p>';
    console.error('Data load error:', err);
  }
}

// ===== 分类筛选 =====
function getCategoryFiltered() {
  if (!currentCategory) return allGuns;
  return allGuns.filter(gun => gun.category === currentCategory);
}

// ===== 获取筛选排序后的数据 =====
function getFilteredGuns() {
  let filtered = getCategoryFiltered();

  // 排序（按价值）
  filtered = filtered.map(gun => ({
    ...gun,
    codes: [...gun.codes].sort((a, b) =>
      currentSort === 'desc' ? b.value - a.value : a.value - b.value
    )
  }));

  return filtered;
}

// ===== 排序后的分类数据 =====
function getFilteredByCategory() {
  const filtered = getFilteredGuns();
  const categoryOrder = ['突击步枪', '冲锋枪', '狙击步枪', '精确射手步枪', '轻机枪', '霰弹枪', '手枪', '特殊武器'];
  const grouped = {};

  filtered.forEach(gun => {
    const cat = gun.category || '其他';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(gun);
  });

  const result = [];
  categoryOrder.forEach(cat => {
    if (grouped[cat] && grouped[cat].length > 0) {
      result.push({ category: cat, guns: grouped[cat] });
    }
  });
  Object.keys(grouped).forEach(cat => {
    if (!categoryOrder.includes(cat)) {
      result.push({ category: cat, guns: grouped[cat] });
    }
  });

  return result;
}

// ===== 渲染 =====
function render() {
  const grouped = getFilteredByCategory();

  if (grouped.length === 0) {
    codeList.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  let html = '';
  grouped.forEach(group => {
    html += '<div class="category-section">';
    html += '<h2 class="category-title">' + escapeHTML(group.category) + '</h2>';
    group.guns.forEach(gun => {
      html += '<div class="gun-group">';
      html += '<div class="gun-group-header" onclick="toggleGunGroup(this)">';
      html += '<span class="gun-group-arrow">▶</span>';
      html += '<span class="gun-group-name">' + escapeHTML(gun.name) + '</span>';
      html += '<span class="gun-group-count">' + gun.codes.length + ' 个码</span>';
      html += '</div>';
      html += '<div class="code-cards collapsed">';
      gun.codes.forEach(code => {
        html += '<div class="code-card">';
        html += '<div class="code-info">';
        html += '<div class="code-text">' + escapeHTML(code.code) + '</div>';
        html += '<div class="code-desc">' + escapeHTML(code.description) + '</div>';
        html += '<div class="code-value">¥' + code.value.toLocaleString() + '</div>';
        html += '</div>';
        html += '<button class="copy-btn" data-code="' + escapeHTML(code.code) + '">📋 复制</button>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
  });

  codeList.innerHTML = html;

  // 绑定复制按钮事件
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', handleCopy);
  });
}

// ===== 折叠/展开切换 =====
function toggleGunGroup(header) {
  const arrow = header.querySelector('.gun-group-arrow');
  const cards = header.nextElementSibling;
  const isCollapsed = cards.classList.contains('collapsed');

  if (isCollapsed) {
    cards.classList.remove('collapsed');
    arrow.textContent = '▼';
  } else {
    cards.classList.add('collapsed');
    arrow.textContent = '▶';
  }
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
// 分类标签切换
document.querySelectorAll('.category-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentCategory = tab.getAttribute('data-category');
    render();
  });
});

sortBtn.addEventListener('click', () => {
  currentSort = currentSort === 'desc' ? 'asc' : 'desc';
  sortBtn.textContent = currentSort === 'desc' ? '价值 ↓' : '价值 ↑';
  render();
});

// ===== 启动 =====
loadData();
