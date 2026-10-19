// ==UserScript==
// @name         搜索引擎大 Tab 切换
// @name:en      Search Engine Tabs
// @namespace    https://github.com/bingoup886/search-engine-tabs
// @homepageURL  https://github.com/bingoup886/search-engine-tabs
// @supportURL   https://github.com/bingoup886/search-engine-tabs/issues
// @version      1.0.0
// @description  在 Google、Bing、百度和 DuckDuckGo 顶部显示大 Tab，切换时保留搜索词。
// @description:en Switch between Google, Bing, Baidu and DuckDuckGo while keeping your search query.
// @match        https://www.google.com/search*
// @match        https://www.google.com.hk/search*
// @match        https://www.google.co.jp/search*
// @match        https://www.google.co.uk/search*
// @match        https://www.google.com.tw/search*
// @match        https://www.bing.com/search*
// @match        https://cn.bing.com/search*
// @match        https://www.baidu.com/s*
// @match        https://duckduckgo.com/*
// @match        https://www.duckduckgo.com/*
// @grant        none
// @run-at       document-idle
// @noframes
// @license      MIT
// ==/UserScript==

(() => {
  'use strict';

  const engines = [
    { id: 'google', name: 'Google', url: 'https://www.google.com/search', key: 'q' },
    { id: 'bing', name: 'Bing', url: 'https://www.bing.com/search', key: 'q' },
    { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s', key: 'wd' },
    { id: 'duckduckgo', name: 'DuckDuckGo', url: 'https://duckduckgo.com/', key: 'q' },
  ];
  const current = engines.find(engine => location.hostname.split('.').includes(engine.id));
  if (!current) return;

  const host = document.createElement('div');
  host.id = 'search-engine-tabs';
  host.style.cssText = 'display:block!important;position:fixed!important;inset:0 0 auto 0!important;z-index:2147483647!important;height:72px!important;';
  const root = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
    :host { color-scheme: light dark; }
    * { box-sizing: border-box; }
    nav { height:72px; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px 16px; background:#fff; border-bottom:1px solid #e4e7ec; font-family:system-ui,sans-serif; box-shadow:0 2px 12px #0000000a; }
    a { display:flex; align-items:center; justify-content:center; height:48px; padding:0 30px; border-radius:12px; color:#475467; text-decoration:none; font-size:18px; font-weight:650; white-space:nowrap; }
    a:hover { background:#f2f4f7; color:#101828; }
    a[aria-current="page"] { background:#2563eb; color:#fff; }
    a:focus-visible { outline:3px solid #f59e0b; outline-offset:2px; }
    @media(max-width:560px) { nav { gap:4px; padding:10px 6px; } a { flex:1; min-width:0; padding:0 8px; font-size:15px; } }
    @media(prefers-color-scheme:dark) { nav { background:#17191e; border-color:#343842; } a { color:#cbd2df; } a:hover { background:#292e38; color:#fff; } a[aria-current="page"] { background:#2563eb; color:#fff; } }
  `;
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', '切换搜索引擎');
  const links = engines.map(engine => {
    const link = document.createElement('a');
    link.textContent = engine.name;
    if (engine === current) link.setAttribute('aria-current', 'page');
    nav.append(link);
    return link;
  });
  root.append(style, nav);

  function query() {
    const params = new URL(location.href).searchParams;
    return params.get(current.key) ?? (current.id === 'baidu' ? params.get('word') : null) ?? '';
  }

  function update() {
    const text = query();
    host.hidden = !text.trim();
    spacer.style.height = text.trim() ? '72px' : '0';
    host.style.setProperty('display', text.trim() ? 'block' : 'none', 'important');
    engines.forEach((engine, index) => {
      const target = new URL(engine.url);
      target.searchParams.set(engine.key, text);
      links[index].href = target.href;
      links[index].title = `用 ${engine.name} 搜索：${text}`;
    });
    if (!host.isConnected) document.body.prepend(host);
    if (!spacer.isConnected) document.body.prepend(spacer);
  }

  const spacer = document.createElement('div');
  spacer.style.cssText = 'display:block!important;height:72px;flex-shrink:0;';
  document.body.prepend(spacer, host);
  update();
  nav.addEventListener('pointerdown', update);
  nav.addEventListener('focusin', update);
  window.addEventListener('popstate', update);
  let previous = location.href;
  window.setInterval(() => {
    if (location.href !== previous || !host.isConnected || !spacer.isConnected) {
      previous = location.href;
      update();
    }
  }, 500);
})();
