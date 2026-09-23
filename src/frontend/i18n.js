var I18n = (function() {
  var messages = {
    en: {
      new: 'New (Ctrl+N)', open: 'Open (Ctrl+O)', save: 'Save (Ctrl+S)',
      toggle: 'Toggle Preview (Ctrl+E)', split: 'Split View (Ctrl+\\)',
      outline: 'Outline (Ctrl+Shift+O)', theme: 'Toggle Theme',
      settings: 'Settings', language: 'Language', association: 'Set .md and .txt default apps…',
      associationHelp: 'Choose Peekdown for each extension in Windows Settings.',
      minimize: 'Minimize', maximize: 'Maximize', close: 'Close',
      find: 'Find...', previous: 'Previous (Shift+Enter)', next: 'Next (Enter)',
      closeFind: 'Close (Escape)', startWriting: 'Start writing markdown...',
      drop: 'Drop to open', untitled: 'Untitled', edit: 'EDIT', preview: 'PREVIEW',
      splitMode: 'SPLIT', saved: 'Saved', error: 'Error: ',
      associationReady: 'Registered. Choose Peekdown for .md and .txt in Settings.',
      words: function(n) { return n + ' word' + (n === 1 ? '' : 's'); },
      openError: function(detail) { return 'Failed to open file: ' + detail; },
      saveError: function(detail) { return 'Failed to save: ' + detail; },
      associationError: function(detail) { return 'File association registration failed: ' + detail; },
      recent: 'Recent Files', noHeadings: 'No headings', noResults: 'No results',
      of: function(current, total) { return current + ' of ' + total; },
      closeUnsaved: 'You have unsaved changes. Close anyway?',
      closeTabUnsaved: function(name) { return 'Unsaved changes in "' + name + '". Close anyway?'; },
      closeTab: 'Close tab'
    },
    'zh-CN': {
      new: '新建 (Ctrl+N)', open: '打开 (Ctrl+O)', save: '保存 (Ctrl+S)',
      toggle: '切换预览 (Ctrl+E)', split: '分屏 (Ctrl+\\)',
      outline: '大纲 (Ctrl+Shift+O)', theme: '切换主题',
      settings: '设置', language: '语言', association: '设置 .md 和 .txt 默认打开方式…',
      associationHelp: '在 Windows 设置中分别为两种扩展名选择 Peekdown。',
      minimize: '最小化', maximize: '最大化', close: '关闭',
      find: '查找…', previous: '上一个 (Shift+Enter)', next: '下一个 (Enter)',
      closeFind: '关闭 (Escape)', startWriting: '开始编写 Markdown…',
      drop: '拖放文件以打开', untitled: '未命名', edit: '编辑', preview: '预览',
      splitMode: '分屏', saved: '已保存', error: '错误：',
      associationReady: '已注册。请在系统设置中为 .md 和 .txt 选择 Peekdown。',
      words: function(n) { return n + ' 字'; },
      openError: function(detail) { return '打开文件失败：' + detail; },
      saveError: function(detail) { return '保存失败：' + detail; },
      associationError: function(detail) { return '注册打开方式失败：' + detail; },
      recent: '最近文件', noHeadings: '没有标题', noResults: '无结果',
      of: function(current, total) { return current + ' / ' + total; },
      closeUnsaved: '有未保存的更改，确定关闭吗？',
      closeTabUnsaved: function(name) { return '“' + name + '”有未保存的更改，确定关闭吗？'; },
      closeTab: '关闭标签页'
    }
  };
  var saved;
  try { saved = localStorage.getItem('peekdown-language'); } catch(e) {}
  var language = saved === 'en' || saved === 'zh-CN' ? saved :
    (/^zh\b/i.test(navigator.language) ? 'zh-CN' : 'en');

  function t(key) {
    var value = messages[language][key] || messages.en[key] || key;
    if (typeof value === 'function') return value.apply(null, Array.prototype.slice.call(arguments, 1));
    return value;
  }

  function apply() {
    document.documentElement.lang = language;
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
      el.title = t(el.getAttribute('data-i18n-title'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-language]').forEach(function(el) {
      el.classList.toggle('selected', el.getAttribute('data-language') === language);
    });
    if (typeof currentMode !== 'undefined') {
      document.getElementById('status-mode').textContent = t(
        splitMode ? 'splitMode' : currentMode === 'preview' ? 'preview' : 'edit');
    }
    if (typeof TabManager !== 'undefined') TabManager.localizeUntitled();
    if (typeof updateWordCount === 'function') updateWordCount();
    if (typeof showRecentPanel === 'function') showRecentPanel();
    if (typeof tocOpen !== 'undefined' && tocOpen && typeof updateTOC === 'function') updateTOC();
    if (typeof findState !== 'undefined' && findState.open) updateFindCount();
  }

  function setLanguage(next) {
    if (!messages[next]) return;
    language = next;
    try { localStorage.setItem('peekdown-language', next); } catch(e) {}
    apply();
  }

  return { t: t, apply: apply, setLanguage: setLanguage, getLanguage: function() { return language; } };
})();

function t(key) { return I18n.t.apply(I18n, arguments); }
