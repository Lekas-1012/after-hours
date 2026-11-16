/* AFTER HOURS — Oil Painting Art Collection Edition
   A tiny, dependency-free, hash-routed cocktail guide. */
(() => {
  'use strict';
  const catalog = Array.isArray(window.COCKTAIL_CATALOG) ? window.COCKTAIL_CATALOG : [];
  const ingredientCatalog = Array.isArray(window.INGREDIENT_CATALOG) ? window.INGREDIENT_CATALOG : [];
  const storyCatalog = Array.isArray(window.STORY_CATALOG) ? window.STORY_CATALOG : [];
  const relations = window.COCKTAIL_RELATIONS && typeof window.COCKTAIL_RELATIONS === 'object' ? window.COCKTAIL_RELATIONS : {};
  const view = document.querySelector('#view');
  const state = { search: '', base: '全部', flavor: '全部', servings: 1, flavorProfile: { acidity: 2, sweetness: 2, bitterness: 2, spirit: 2 } };
  const favoriteKey = 'after-hours:favorites';
  let storyObserver = null;
  let storedFavorites = [];
  try { storedFavorites = JSON.parse(localStorage.getItem(favoriteKey) || '[]'); }
  catch (error) { console.warn('Unable to read saved favorites.', error); }
  const favorites = new Set(Array.isArray(storedFavorites) ? storedFavorites : []);
  const allBases = ['全部', ...new Set(catalog.map(x => x.base))];
  const filterFlavors = ['全部', '酸爽', '苦甜', '果香', '氣泡', '咖啡', '濃郁'];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'": '&#39;' })[c]);
  const noDiacritics = s => String(s).toLocaleLowerCase().normalize('NFKC').trim();
  const ingredientById = id => ingredientCatalog.find(item => item.id === id);
  const storyById = id => storyCatalog.find(item => item.id === id);
  const relationFor = id => relations[id] || { ingredientIds: [], relatedCocktailIds: [] };
  const cocktailById = id => catalog.find(item => item.id === id);
  const isFavorite = id => favorites.has(id);
  function saveFavorites() { localStorage.setItem(favoriteKey, JSON.stringify([...favorites])); }
  function toggleFavorite(id) {
    if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
    saveFavorites();
  }

  /* ---------- Image Path Helper ---------- */
  function cocktailImgSrc(id) {
    return `./assets/cocktails/${encodeURIComponent(id)}.jpg`;
  }

  // Keep the real image in the DOM: a later successful load must clear fallback.
  function cocktailImage(c, {className = '', loading = 'lazy', hero = false} = {}) {
    return `<img class="${className}" src="${esc(cocktailImgSrc(c.id))}" alt="${esc(c.nameZh)} — ${esc(c.name)} 油畫風格插圖" loading="${loading}" data-fallback-id="${esc(c.id)}"><div class="image-fallback" hidden>${svgArt(c, hero)}</div>`;
  }

  /* ---------- SVG Art (Fallback when image doesn't exist) ---------- */
  function citrus(type, x, y, scale=1) {
    const palette = { orange:['#efac55','#fff0c1'], lime:['#92bf76','#e5ecc2'], lemon:['#e8cf80','#fff0c2'] };
    if (!palette[type]) return '';
    const [outer, inner] = palette[type];
    return `<g transform="translate(${x},${y}) scale(${scale})" aria-hidden="true">
      <circle r="37" fill="${outer}" stroke="#f9e7b2" stroke-width="4"/>
      <circle r="30" fill="${inner}" stroke="${outer}" stroke-width="3"/>
      ${[0,45,90,135].map(angle => `<path d="M-27 0 H27" stroke="${outer}" stroke-width="2.2" transform="rotate(${angle})"/>`).join('')}
      <circle r="6" fill="${inner}" stroke="${outer}" stroke-width="2"/>
    </g>`;
  }
  function garnishArt(c) {
    const g = c.garnish;
    if (['orange','lemon','lime'].includes(g)) return citrus(g, c.vessel === 'rocks'?222:c.vessel==='highball'?211:231, c.vessel==='rocks'?77:c.vessel==='highball'?61:88, .72);
    if (g === 'coffee') return `<g transform="translate(154,126)" fill="#2c2018" stroke="#ad805d" stroke-width="2"><ellipse cx="-20" cy="0" rx="12" ry="8" transform="rotate(-30 -20 0)"/><ellipse cx="4" cy="-7" rx="12" ry="8"/><ellipse cx="24" cy="3" rx="12" ry="8" transform="rotate(32 24 3)"/></g>`;
    if (g === 'cherry') return `<path d="M190 101 Q201 70 211 58" stroke="#64825b" fill="none" stroke-width="3"/><circle cx="191" cy="105" r="12" fill="#ad2730" stroke="#e18b79" stroke-width="3"/>`;
    if (g === 'mint') return `<path d="M191 96 Q166 51 191 38 Q207 69 191 96 M191 96 Q218 48 233 52 Q229 82 191 96" fill="#6c9c69" stroke="#d0e2b1" stroke-width="2"/>`;
    return '';
  }
  function svgArt(c, hero=false) {
    const l = c.liquid;
    const vessel = {
      rocks: `<ellipse cx="160" cy="268" rx="98" ry="12" fill="#0c1715" opacity=".2"/>
        <path d="M90 65 H230 L214 244 Q212 251 204 251 H116 Q108 251 106 244 Z" fill="#e5eef0" fill-opacity=".11" stroke="#ffffff" stroke-opacity=".66" stroke-width="3"/>
        <path d="M98 129 H222 L208 237 Q207 243 199 243 H122 Q114 243 113 237 Z" fill="${l}" opacity=".96"/>
        <path d="M111 132 l42 -10 22 49 -43 18 z" fill="#f7faf8" opacity=".3" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>
        <path d="M167 161 l40 -12 18 45 -43 16 z" fill="#fff" opacity=".2" stroke="#fff" stroke-opacity=".42" stroke-width="2"/>
        <path d="M99 91 L114 228" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".26"/>
        <path d="M89 65 Q160 52 231 65" stroke="#fff" stroke-width="5" stroke-opacity=".74" fill="none"/>`,
      coupe: `<ellipse cx="160" cy="267" rx="79" ry="10" fill="#0c1715" opacity=".16"/>
        <path d="M160 177 L160 250 M123 255 Q160 244 197 255" fill="none" stroke="#f3fbf9" stroke-width="7" stroke-linecap="round" stroke-opacity=".69"/>
        <path d="M59 90 Q72 149 111 167 Q130 179 160 179 Q190 179 209 167 Q248 149 261 90 Z" fill="#edf8f6" fill-opacity=".11" stroke="#fff" stroke-opacity=".76" stroke-width="3"/>
        <path d="M67 111 Q80 148 113 163 Q130 171 160 171 Q191 171 207 163 Q240 148 253 111 Z" fill="${l}" opacity=".9"/>
        <ellipse cx="160" cy="110" rx="92" ry="8" fill="${l}" stroke="#fff" stroke-opacity=".32" stroke-width="2"/>
        <ellipse cx="160" cy="90" rx="101" ry="8" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="4"/>
        <path d="M80 103 Q91 141 115 154" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-opacity=".33" fill="none"/>`,
      highball: `<ellipse cx="159" cy="268" rx="79" ry="10" fill="#0c1715" opacity=".17"/>
        <path d="M110 42 H210 L205 246 Q202 252 194 252 H126 Q118 252 115 246 Z" fill="#f7fbfb" fill-opacity=".11" stroke="#fff" stroke-opacity=".69" stroke-width="3"/>
        <path d="M116 104 H205 L199 239 Q198 244 192 244 H129 Q122 244 122 239 Z" fill="${l}" opacity=".84"/>
        <path d="M123 89 l42 -12 20 45 -42 13 z M154 143 l41 -8 10 44 -38 10 z M122 181 l40 -4 8 42 -39 6 z" fill="#fff" opacity=".25" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>
        <path d="M120 58 L125 223" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".27"/>
        <path d="M109 42 Q160 34 211 42" stroke="#fff" stroke-width="5" stroke-opacity=".74" fill="none"/>`,
      wine: `<ellipse cx="160" cy="270" rx="83" ry="10" fill="#0c1715" opacity=".16"/>
        <path d="M160 195 V253 M119 257 Q160 245 201 257" fill="none" stroke="#f8fcfb" stroke-width="7" stroke-linecap="round" stroke-opacity=".69"/>
        <path d="M83 48 H237 Q244 138 205 171 Q186 193 160 193 Q134 193 115 171 Q76 138 83 48 Z" fill="#eff9f6" fill-opacity=".12" stroke="#fff" stroke-opacity=".76" stroke-width="3"/>
        <path d="M84 98 H236 Q229 151 201 172 Q183 185 160 185 Q137 185 119 172 Q91 151 84 98 Z" fill="${l}" opacity=".88"/>
        <ellipse cx="160" cy="98" rx="76" ry="11" fill="${l}" stroke="#fff" stroke-opacity=".38" stroke-width="2"/>
        <ellipse cx="160" cy="48" rx="78" ry="9" fill="none" stroke="#fff" stroke-width="4" stroke-opacity=".79"/>
        <path d="M95 74 Q95 140 122 164" stroke="#fff" stroke-opacity=".28" stroke-width="6" fill="none" stroke-linecap="round"/>`
    }[c.vessel];
    return `<div class="art-frame ${hero?'art-frame--hero':''}" style="--drink-tint:${esc(c.liquid)}"><div class="art-orbit art-orbit--a"></div><div class="art-orbit art-orbit--b"></div><svg viewBox="0 0 320 300" class="drink-art" role="img" aria-label="${esc(c.nameZh)} 的風格化酒杯插畫">${vessel}${garnishArt(c)}</svg><span class="art-index" aria-hidden="true">${hero?'THE CLASSICS':String(c.order).padStart(2,'0')+' / 10'}</span></div>`;
  }

  /* ---------- Card Visual ---------- */
  function cardVisual(c) {
    return `<div class="card-visual">
      <div class="card-img-wrap">
        ${cocktailImage(c)}
      </div>
      <span class="card-index">Nº ${String(c.order).padStart(2,'0')}</span>
    </div>`;
  }

  /* ---------- Detail Art Visual ---------- */
  function detailArt(c) {
    return `<div class="detail-art-col">
      ${cocktailImage(c, {className: 'detail-painting', loading: 'eager', hero: true})}
      <span class="detail-glass-caption">SERVE IN · ${esc(c.glass)}</span>
    </div>`;
  }

  /* ---------- Card Component ---------- */
  function card(c, delay=0) {
    return `<article class="cocktail-card" style="--card-delay:${delay}ms">
      <a class="cocktail-card-link" href="#/cocktail/${encodeURIComponent(c.id)}">
      ${cardVisual(c)}
      <div class="card-body"><div class="card-overline">${esc(c.base)} <span>·</span> ${esc(c.method)}</div>
      <div class="card-names"><h3>${esc(c.name)}</h3><span>${esc(c.nameZh)}</span></div>
      <p>${esc(c.subtitle)}</p><div class="card-bottom"><span>${c.flavors.map(x=>esc(x)).join(' / ')}</span><span class="circle-arrow" aria-hidden="true">↗</span></div></div>
      </a><button class="favorite-toggle ${isFavorite(c.id) ? 'is-favorite' : ''}" type="button" data-favorite="${esc(c.id)}" aria-pressed="${isFavorite(c.id)}" aria-label="${isFavorite(c.id) ? '取消收藏' : '收藏'} ${esc(c.nameZh)}"><span aria-hidden="true">♡</span></button>
    </article>`;
  }

  /* ---------- Filter Chips ---------- */
  function chips(options, current, key) {
    return options.map(v => `<button type="button" class="chip ${v===current?'is-active':''}" data-filter="${key}" data-value="${esc(v)}" aria-pressed="${v===current}">${esc(v)}</button>`).join('');
  }

  /* ---------- Home Page ---------- */
  function home() {
    const feature = catalog[0];
    view.innerHTML = `<div class="homepage">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-bg">
          <img src="./assets/hero-banner.jpg" alt="AFTER HOURS 酒吧場景油畫" />
        </div>
        <div class="scroll-progress" aria-hidden="true"><span></span></div>
        <div class="hero-content wrap">
          <div class="eyebrow"><span class="tiny-star">✳</span> AN ARCHIVE OF GOOD DRINKS <span class="line"></span> VOL. 001</div>
          <h1 id="hero-title" class="scroll-reveal scroll-reveal--hero">每一杯，<br>都有它的<span class="serif-italic">故事。</span></h1>
          <p class="hero-lead">從經典到日常，收藏值得認識的調酒。<br>依照風味探索，找到今晚想喝的那一杯。</p>
          <div class="hero-ctas"><button type="button" class="btn btn-primary" data-action="explore">開始探索 <span aria-hidden="true">↗</span></button><button type="button" class="btn btn-quiet" data-action="random">隨機選一杯 <span aria-hidden="true">↗</span></button></div>
          <div class="hero-meta"><span><b>${catalog.length.toString().padStart(2,'0')}</b> 經典酒譜</span><span class="meta-rule"></span><span><b>${new Set(catalog.map(c=>c.base)).size.toString().padStart(2,'0')}</b> 種基酒類別</span><span class="meta-rule"></span><span>持續收錄中</span></div>
        </div>
      </section>
      <section class="story-section" aria-labelledby="story-title"><div class="wrap story-layout">
        <div class="story-sticky"><div class="section-eyebrow">01 — A POUR IN MOTION</div><div class="story-art" id="story-art">${cardVisual(feature)}</div><div class="story-copy"><p class="story-kicker" id="story-kicker">${esc(feature.base)} · ${esc(feature.method)}</p><h2 id="story-title">${esc(feature.name)}</h2><p id="story-description">${esc(feature.description)}</p><a class="text-link" id="story-link" href="#/cocktail/${encodeURIComponent(feature.id)}">閱讀酒譜 <span>↗</span></a><a class="story-teaser-link" href="#/stories">進入調酒故事館 <span>↗</span></a></div></div>
        <div class="showcase-rail" id="showcase-rail" aria-label="精選調酒展示">${catalog.slice(0,6).map((c,i)=>`<button class="showcase-card ${i===0?'is-active':''}" type="button" data-showcase="${esc(c.id)}"><span class="showcase-number">${String(c.order).padStart(2,'0')}</span>${cocktailImage(c)}<strong>${esc(c.name)}</strong><small>${esc(c.nameZh)}</small></button>`).join('')}</div>
      </div></section>
      <section class="catalog-section" id="discover" aria-labelledby="discover-title"><div class="wrap"><div class="section-eyebrow">01 — THE COLLECTION</div>
      <div class="section-heading"><div><h2 id="discover-title">調酒圖鑑 <span class="serif-italic">/ The Collection</span></h2><p>從酸甜、苦甜，到有個性的經典配方。</p></div><span class="section-counter">EXPLORE THE CLASSICS <span>↘</span></span></div>
      <div class="search-panel"><label class="search-field" for="recipe-search"><span class="search-symbol" aria-hidden="true">⌕</span><input id="recipe-search" type="search" placeholder="搜尋調酒名稱、材料或風味..." autocomplete="off" value="${esc(state.search)}" /><span class="kbd">SEARCH</span></label>
      <div class="filter-caption">基酒分類 <span class="filter-line"></span></div><div class="chip-row" id="base-filters" aria-label="基酒分類">${chips(allBases,state.base,'base')}</div>
      <div class="filter-caption">風味偏好 <span class="filter-line"></span></div><div class="chip-row" id="flavor-filters" aria-label="風味篩選">${chips(filterFlavors,state.flavor,'flavor')}</div></div>
      <section class="flavor-explorer" aria-labelledby="flavor-title"><div><div class="section-eyebrow">A TASTE OF TONIGHT</div><h2 id="flavor-title">用風味找到下一杯。</h2><p>調整你的偏好，結果只會來自現有酒譜。</p></div><div class="flavor-controls">${[['acidity','酸爽'],['sweetness','甜潤'],['bitterness','苦味'],['spirit','酒感']].map(([key,label])=>`<label class="flavor-control"><span>${label}</span><input type="range" min="0" max="4" value="${state.flavorProfile[key]}" data-flavor-profile="${key}" aria-label="${label}偏好"><output>${state.flavorProfile[key]}</output></label>`).join('')}</div><div class="flavor-results" id="flavor-results"></div></section>
      <div class="catalog-result-row"><p id="results-count" aria-live="polite"></p><button type="button" class="clear-button" data-action="clear">清除篩選 <span aria-hidden="true">↗</span></button></div>
      <div class="cards-grid" id="cards-grid"></div>
      </div></section>
      <section class="feature-banner wrap"><div><span class="section-eyebrow">02 — LEARN THE BASICS</span><h2>不只是照著配方做。<br><i>先認識怎麼調。</i></h2><p>直調、攪拌、搖盪，從三種基本方法開始了解調酒。</p><a href="#/guide" class="text-link">閱讀調酒入門 <span>↗</span></a></div><div class="feature-mark" aria-hidden="true">✳<span>LESS IS MORE</span></div></section>
    </div>`;
    grid();
    renderFlavorResults();
    setupScrollEffects();
    setupShowcaseEffects();
  }

  /* ---------- Search/Filter Logic ---------- */
  function matches(c) {
    const q = noDiacritics(state.search);
    const haystack = [c.name,c.nameZh,c.subtitle,c.description,c.base,c.method,...c.flavors,...c.ingredients.map(i=>i.name)].join(' ');
    return (!q || noDiacritics(haystack).includes(q)) && (state.base==='全部' || c.base===state.base) && (state.flavor==='全部' || c.flavors.includes(state.flavor));
  }
  function flavorScore(c) {
    const flavors = c.flavors;
    return {
      acidity: flavors.includes('酸爽') ? 4 : flavors.includes('柑橘') ? 3 : 1,
      sweetness: flavors.includes('甜潤') ? 4 : flavors.includes('果香') ? 3 : 1,
      bitterness: flavors.includes('苦甜') || flavors.includes('咖啡') ? 4 : flavors.includes('草本') ? 2 : 1,
      spirit: ['威士忌','蘭姆酒','龍舌蘭'].includes(c.base) || flavors.includes('濃郁') ? 4 : 2
    };
  }
  function renderFlavorResults() {
    const node = document.querySelector('#flavor-results');
    if (!node) return;
    const ranked = catalog.map(c => {
      const score = flavorScore(c);
      return { c, distance: Object.keys(score).reduce((sum,key) => sum + Math.abs(score[key] - state.flavorProfile[key]), 0) };
    }).sort((a,b) => a.distance - b.distance).slice(0,3);
    node.innerHTML = ranked.map(({c}) => `<a href="#/cocktail/${encodeURIComponent(c.id)}"><span>${esc(c.base)}</span><strong>${esc(c.name)}</strong><small>${esc(c.nameZh)} · ${c.flavors.map(esc).join(' / ')}</small><b aria-hidden="true">↗</b></a>`).join('');
  }
  function grid() {
    const matchesList = catalog.filter(matches);
    const node = document.querySelector('#cards-grid');
    if (!node) return;
    document.querySelector('#results-count').textContent = `顯示 ${matchesList.length} / ${catalog.length} 款調酒`;
    node.innerHTML = matchesList.length ? matchesList.map((c,i)=>card(c,Math.min(i,8)*25)).join('') : `<div class="empty-state"><span>✳</span><h3>這次沒有找到符合的調酒</h3><p>換個名稱或調整篩選條件試試看。</p><button type="button" class="btn btn-primary" data-action="clear">重設篩選 ↗</button></div>`;
    for (const key of ['base','flavor']) {
      document.querySelectorAll(`[data-filter="${key}"]`).forEach(button => {
        const active = button.dataset.value === state[key];
        button.classList.toggle('is-active',active);
        button.setAttribute('aria-pressed',String(active));
      });
    }
  }
  function setupScrollEffects() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.scroll-reveal, .cocktail-card, .story-sticky').forEach(node => node.classList.add('is-visible'));
      return;
    }
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting)), { threshold: .18 });
    document.querySelectorAll('.scroll-reveal, .cocktail-card, .story-sticky').forEach(node => revealObserver.observe(node));
  }
  function setShowcase(c) {
    if (!c) return;
    document.querySelectorAll('[data-showcase]').forEach(item => item.classList.toggle('is-active', item.dataset.showcase === c.id));
    const kicker = document.querySelector('#story-kicker');
    const title = document.querySelector('#story-title');
    const description = document.querySelector('#story-description');
    const link = document.querySelector('#story-link');
    const art = document.querySelector('#story-art');
    if (kicker) kicker.textContent = `${c.base} · ${c.method}`;
    if (title) title.textContent = c.name;
    if (description) description.textContent = c.description;
    if (link) link.href = `#/cocktail/${encodeURIComponent(c.id)}`;
    if (art) art.innerHTML = cardVisual(c);
  }
  function setupShowcaseEffects() {
    const cards = [...document.querySelectorAll('[data-showcase]')];
    if (!('IntersectionObserver' in window) || !cards.length) return;
    const rail = document.querySelector('#showcase-rail');
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio).slice(0,1).forEach(entry => setShowcase(cocktailById(entry.target.dataset.showcase)));
    }, { root: rail, threshold: [.55, .8] });
    cards.forEach(item => observer.observe(item));
  }

  /* ---------- Serving Calculator ---------- */
  function formatAmount(ing) {
    if (ing.amount === null) return esc(ing.unit);
    return `${Number((ing.amount * state.servings).toFixed(2)).toLocaleString('en-US')} ${esc(ing.unit)}`;
  }
  function ingredients(c) {
    const ids = relationFor(c.id).ingredientIds;
    return c.ingredients.map((i, index) => {
      const ingredient = ingredientById(ids[index]);
      const label = ingredient ? `<a class="ingredient-link" href="#/ingredient/${encodeURIComponent(ingredient.id)}">${esc(i.name)} <span aria-hidden="true">↗</span></a>` : `<span>${esc(i.name)}</span>`;
      return `<li>${label}<strong>${formatAmount(i)}</strong></li>`;
    }).join('');
  }

  /* ---------- Detail Page ---------- */
  function detail(c) {
    state.servings = 1;
    const related = relationFor(c.id).relatedCocktailIds.map(cocktailById).filter(Boolean).slice(0,3);
    const story = relationFor(c.id).storyId ? storyById(relationFor(c.id).storyId) : null;
    view.innerHTML = `<div class="detail-page">
      <section class="detail-hero wrap"><div class="detail-copy"><a class="back-link" href="#/">← 返回調酒圖鑑</a><div class="section-eyebrow">THE CLASSICS / Nº ${String(c.order).padStart(2,'0')}</div>
      <div class="detail-kicker">${esc(c.base)} <span>—</span> ${esc(c.method)}</div><div class="detail-title-row"><h1>${esc(c.name)}</h1><button class="favorite-toggle detail-favorite ${isFavorite(c.id) ? 'is-favorite' : ''}" type="button" data-favorite="${esc(c.id)}" aria-pressed="${isFavorite(c.id)}" aria-label="${isFavorite(c.id) ? '取消收藏' : '收藏'} ${esc(c.nameZh)}"><span aria-hidden="true">${isFavorite(c.id) ? '♥' : '♡'}</span></button></div><p class="detail-zh">${esc(c.nameZh)}</p><p class="detail-summary">${esc(c.description)}</p>
      <div class="detail-tags">${c.flavors.map(x=>`<span>${esc(x)}</span>`).join('')}</div>
      ${story ? `<a class="story-callout" href="#/story/${encodeURIComponent(story.id)}"><span>THE STORY / ${esc(story.title)}</span><strong>閱讀這杯酒的起源、文化與演變 ↗</strong></a>` : ''}
      <div class="detail-stat-row"><div><span>難度</span><strong>${esc(c.difficulty)}</strong></div><div><span>時間</span><strong>約 ${c.prepMinutes} 分鐘</strong></div><div><span>調製方法</span><strong>${esc(c.method)}</strong></div></div></div>
      ${detailArt(c)}</section>
      <section class="recipe-panel"><div class="wrap recipe-columns"><div class="ingredients-col"><div class="section-eyebrow">01 — INGREDIENTS</div><h2>準備材料</h2><p class="recipe-intro">選擇要調製的杯數，材料用量會自動換算。</p>
      <div class="serving-row" role="group" aria-label="調製杯數"><span>份量</span><div class="servings">${[1,2,4].map(n=>`<button type="button" data-servings="${n}" aria-pressed="${n===1}" class="${n===1?'is-active':''}">${n} 杯</button>`).join('')}</div></div>
      <ul class="ingredient-list" id="ingredient-list">${ingredients(c)}</ul><p class="quantity-note">※ 數值以每杯配方為基準；少許或裝飾等依實際情況調整。</p></div>
      <div class="steps-col"><div class="section-eyebrow">02 — METHOD</div><h2>調製步驟</h2><ol class="step-list">${c.steps.map((s,i)=>`<li><span>${String(i+1).padStart(2,'0')}</span><p>${esc(s)}</p></li>`).join('')}</ol>
      <div class="tip-box"><span>✳ BARTENDER'S NOTE</span><p>${esc(c.tip)}</p></div>
      <p class="recipe-source">資料來源：<a href="${esc(c.source.url)}" target="_blank" rel="noopener noreferrer">${esc(c.source.label)} ↗</a><br><small>本網站以中文整理，部分描述為編輯性說明。</small></p>
      </div></div></section>
      <section class="related-section wrap"><div class="section-eyebrow">03 — YOU MIGHT ALSO LIKE</div><div class="related-heading"><h2>再探索一杯 <i>↗</i></h2><a href="#/">查看全部酒譜 →</a></div><div class="cards-grid related-grid">${related.map((x,i)=>card(x,i*40)).join('')}</div></section>
    </div>`;
  }

  /* ---------- Guide Page ---------- */
  function guide() {
    view.innerHTML = `<div class="inner-page"><div class="page-hero wrap"><a class="back-link" href="#/">← 返回調酒圖鑑</a><div class="section-eyebrow">THE JOURNAL / 01</div>
    <h1>調酒，從<span class="serif-italic">基本功</span>開始。</h1><p>不一定要有整間酒吧的器材。先理解三種常見調製方式，就能開始閱讀大部分經典酒譜。</p></div>
    <div class="wrap guide-grid"><article class="guide-card"><span>01 / BUILD</span><div class="guide-symbol">↡</div><h2>直調</h2><h3>Build</h3><p>材料直接在飲用杯中加入冰塊並混合。步驟簡單，常見於氣泡感較強的酒款。</p><strong>酒款例子：Negroni、Paloma、Spritz</strong></article>
    <article class="guide-card"><span>02 / STIR</span><div class="guide-symbol">◌</div><h2>攪拌</h2><h3>Stir</h3><p>用吧匙將酒與冰塊攪拌冷卻、稀釋，適合希望維持清澈酒體的配方。</p><strong>酒款例子：Manhattan、Boulevardier</strong></article>
    <article class="guide-card"><span>03 / SHAKE</span><div class="guide-symbol">⤨</div><h2>搖盪</h2><h3>Shake</h3><p>將材料與冰塊放進雪克杯，快速搖盪讓它們充分混合並降溫，常用於含果汁的配方。</p><strong>酒款例子：Margarita、Daiquiri、Whiskey Sour</strong></article></div>
    <section class="guide-footer wrap"><div class="section-eyebrow">A SMALL REMINDER</div><h2>先讀懂配方，再開始實作。</h2><p>本站介紹經典調酒的知識與常見比例。飲酒有風險，應遵守所在地法規；未成年請勿飲酒，飲酒後不駕駛。</p><a class="btn btn-primary" href="#/">開始探索酒譜 ↗</a></section></div>`;
  }

  /* ---------- About Page ---------- */
  function about() {
    view.innerHTML = `<div class="inner-page"><div class="page-hero wrap"><a class="back-link" href="#/">← 返回調酒圖鑑</a><div class="section-eyebrow">THE JOURNAL / 02</div>
    <h1>關於 <span class="serif-italic">AFTER HOURS.</span></h1><p>這是一個把調酒當成知識來整理的個人網站。它不只是酒單，也是一本可以不斷更新的數位調酒筆記。</p></div>
    <section class="wrap about-columns"><div><span class="section-eyebrow">OUR IDEA</span><h2>把知識收藏，<br>讓風味更好懂。</h2></div><div><p>我們用固定的文章格式介紹每款酒：中英文名稱、基酒、風味、材料比例、調製方法及來源。每款調酒搭配獨立的油畫風格插圖，營造獨一無二的藝術氛圍。</p><p>網站設計與資料格式由 <code>AGENTS.md</code> 規範。未來只要新增一個符合規則的 JSON 檔案與對應油畫圖片，再執行建置指令，就能得到新的一張卡片與獨立內容頁，不用重複製作版型。</p><p>經典配方以 IBA 官方酒譜為主要參考來源，中文描述為本站整理，不代表官方翻譯。</p><a class="text-link" href="#/guide">調酒入門 ↗</a></div></section></div>`;
  }
  function storyTeaser(story) {
    const cocktail = cocktailById(story.cocktailId);
    return `<a class="story-card" href="#/story/${encodeURIComponent(story.id)}"><div class="story-card-image">${cocktailImage(cocktailById(story.imageCocktailId))}</div><div class="story-card-body"><span>${esc(cocktail?.name || 'COCKTAIL STORY')}</span><h2>${esc(story.title)}</h2><p>${esc(story.subtitle)}</p><b>閱讀故事 ↗</b></div></a>`;
  }
  function storiesPage() {
    view.innerHTML = `<div class="inner-page stories-page"><div class="page-hero wrap"><a class="back-link" href="#/">← 返回調酒圖鑑</a><div class="section-eyebrow">THE ARCHIVE / STORIES</div><h1>一杯酒的<span class="serif-italic">來處。</span></h1><p>從配方、文化與可靠來源出發，慢慢讀懂經典調酒如何被記住。</p></div><section class="wrap story-index-grid">${storyCatalog.map(storyTeaser).join('')}</section></div>`;
  }
  function storyPage(story) {
    const cocktail = cocktailById(story.cocktailId);
    view.innerHTML = `<div class="story-page"><section class="story-reader-hero wrap"><a class="back-link" href="#/stories">← 返回故事館</a><div class="section-eyebrow">COCKTAIL STORY / ${esc(cocktail?.name || '')}</div><h1>${esc(story.title)}</h1><p>${esc(story.subtitle)}</p></section><section class="story-reader" data-story-id="${esc(story.id)}"><div class="wrap story-reader-layout"><div class="story-stage" aria-live="polite"><div class="story-stage-art">${cocktailImage(cocktailById(story.imageCocktailId), {loading: 'eager'})}</div><div class="story-stage-copy"><span id="story-stage-type">${esc(story.sections[0].type)}</span><h2 id="story-stage-title">${esc(story.sections[0].title)}</h2><p id="story-stage-body">${esc(story.sections[0].body)}</p></div><div class="story-stage-progress"><span></span></div></div><div class="story-chapters">${story.sections.map((section,index)=>`<article class="story-chapter ${index===0?'is-active':''}" data-story-chapter="${index}" tabindex="0"><span>${String(index+1).padStart(2,'0')}</span><div><small>${esc(section.type)}</small><h2>${esc(section.title)}</h2><p>${esc(section.body)}</p></div></article>`).join('')}<div class="story-sources"><span>可查證資料</span>${story.sources.map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)} ↗</a>`).join('')}</div></div></div></section><section class="wrap story-related"><div class="section-eyebrow">CONTINUE EXPLORING</div><h2>沿著這杯酒，再走遠一點。</h2><div class="cards-grid">${story.relatedCocktailIds.map(cocktailById).filter(Boolean).map((item,index)=>card(item,index*35)).join('')}</div></section></div>`;
    setupStoryEffects(story);
  }
  function setupStoryEffects(story) {
    const reader = document.querySelector('.story-reader');
    const chapters = [...document.querySelectorAll('[data-story-chapter]')];
    const update = index => {
      if (!reader.isConnected) return;
      const section = story.sections[index];
      if (!section) return;
      chapters.forEach((chapter, chapterIndex) => chapter.classList.toggle('is-active', chapterIndex === index));
      document.querySelector('#story-stage-type').textContent = section.type;
      document.querySelector('#story-stage-title').textContent = section.title;
      document.querySelector('#story-stage-body').textContent = section.body;
      document.querySelector('.story-stage')?.style.setProperty('--story-progress', `${((index + 1) / story.sections.length) * 100}%`);
    };
    chapters.forEach(chapter => chapter.addEventListener('focus', () => update(Number(chapter.dataset.storyChapter))));
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => update(Number(entry.target.dataset.storyChapter)));
    }, { threshold: .55 });
    storyObserver = observer;
    chapters.forEach(chapter => observer.observe(chapter));
  }
  function ingredientsPage() {
    view.innerHTML = `<div class="inner-page ingredients-page"><div class="page-hero wrap"><a class="back-link" href="#/">← 返回調酒圖鑑</a><div class="section-eyebrow">THE ARCHIVE / INGREDIENTS</div><h1>認識<span class="serif-italic">材料。</span></h1><p>材料不只是清單；它們決定香氣、結構，也讓不同酒款彼此連起來。</p></div><section class="wrap ingredient-index-grid">${ingredientCatalog.map(ingredient => `<a class="ingredient-card" href="#/ingredient/${encodeURIComponent(ingredient.id)}"><span>${esc(ingredient.category)}</span><h2>${esc(ingredient.name)}</h2><h3>${esc(ingredient.nameZh)}</h3><p>${esc(ingredient.summary)}</p><b>${ingredient.uses.length} 款相關酒譜 ↗</b></a>`).join('')}</section></div>`;
  }
  function ingredientPage(ingredient) {
    const usedBy = catalog.filter(c => relationFor(c.id).ingredientIds.includes(ingredient.id));
    const related = ingredient.relatedIngredientIds.map(ingredientById).filter(Boolean);
    view.innerHTML = `<div class="inner-page ingredient-page"><div class="page-hero wrap"><a class="back-link" href="#/ingredients">← 返回材料百科</a><div class="section-eyebrow">${esc(ingredient.category)}</div><h1>${esc(ingredient.name)} <span class="serif-italic">${esc(ingredient.nameZh)}</span></h1><p>${esc(ingredient.summary)}</p></div><section class="wrap ingredient-detail-grid"><div><div class="section-eyebrow">PROFILE</div><h2>風味與背景</h2><p class="ingredient-history">${esc(ingredient.history)}</p><div class="detail-tags">${ingredient.flavors.map(flavor=>`<span>${esc(flavor)}</span>`).join('')}</div><div class="ingredient-sources"><span>資料來源</span>${ingredient.sources.map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)} ↗</a>`).join('')}</div></div><div><div class="section-eyebrow">IN THE ARCHIVE</div><h2>使用這項材料的酒譜</h2><div class="ingredient-cocktail-links">${usedBy.map(c=>`<a href="#/cocktail/${encodeURIComponent(c.id)}"><span>${esc(c.base)}</span><strong>${esc(c.name)}</strong><small>${esc(c.nameZh)}</small><b>↗</b></a>`).join('')}</div><h2 class="related-ingredient-title">相關材料</h2><div class="related-ingredient-links">${related.map(item=>`<a href="#/ingredient/${encodeURIComponent(item.id)}">${esc(item.nameZh)} <span>↗</span></a>`).join('')}</div></div></section></div>`;
  }
  function favoritesPage() {
    const saved = catalog.filter(c => favorites.has(c.id));
    view.innerHTML = `<div class="inner-page favorites-page"><div class="page-hero wrap"><a class="back-link" href="#/">← 返回調酒圖鑑</a><div class="section-eyebrow">THE JOURNAL / 03</div><h1>我的<span class="serif-italic">收藏。</span></h1><p>把想再次調製、也想慢慢理解的酒譜留在這裡。</p></div><section class="wrap favorites-content"><div class="catalog-result-row"><p>${saved.length ? `已收藏 ${saved.length} 款調酒` : '還沒有收藏的調酒'}</p><a class="text-link" href="#/">繼續探索 <span>↗</span></a></div><div class="cards-grid">${saved.length ? saved.map((c,i)=>card(c,i*35)).join('') : '<div class="empty-state"><span>♡</span><h3>收藏一杯喜歡的酒</h3><p>在調酒卡片右上角按下愛心，之後就能在這裡找到。</p><a class="btn btn-primary" href="#/">開始探索 ↗</a></div>'}</div></section></div>`;
  }

  /* ---------- Router ---------- */
  function navigate() {
    storyObserver?.disconnect();
    storyObserver = null;
    const route = decodeURIComponent(location.hash.replace(/^#/, '') || '/');
    document.querySelectorAll('[data-nav]').forEach(a => {
      const target = a.getAttribute('href').slice(1);
      const active = route === target || (a.dataset.nav === 'home' && route.startsWith('/cocktail/'));
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    if (route.startsWith('/cocktail/')) {
      const item = catalog.find(x=>x.id===route.slice('/cocktail/'.length));
      if (item) detail(item); else notFound();
    } else if (route.startsWith('/story/')) {
      const item = storyById(route.slice('/story/'.length));
      if (item) storyPage(item); else notFound();
    } else if (route.startsWith('/ingredient/')) {
      const item = ingredientById(route.slice('/ingredient/'.length));
      if (item) ingredientPage(item); else notFound();
    } else if (route === '/' || route === '') home();
    else if (route === '/favorites') favoritesPage();
    else if (route === '/stories') storiesPage();
    else if (route === '/ingredients') ingredientsPage();
    else if (route === '/guide') guide();
    else if (route === '/about') about();
    else notFound();
    window.scrollTo({ top: 0, behavior: 'instant' });
    const title = route.startsWith('/cocktail/') ? catalog.find(x=>x.id===route.split('/')[2])?.name : route.startsWith('/story/') ? storyById(route.slice('/story/'.length))?.title : route.startsWith('/ingredient/') ? ingredientById(route.slice('/ingredient/'.length))?.name : route==='/guide'?'調酒入門':route==='/about'?'關於本站':route==='/favorites'?'我的收藏':route==='/stories'?'調酒故事館':route==='/ingredients'?'材料百科':null;
    document.title = title ? `${title} — AFTER HOURS` : 'AFTER HOURS — 經典調酒圖鑑';
  }
  function notFound() {
    view.innerHTML = `<section class="not-found wrap"><span>404 / NOT FOUND</span><h1>這杯還沒收錄。</h1><p>目前找不到你要的頁面，可以回到調酒圖鑑繼續探索。</p><a class="btn btn-primary" href="#/">返回首頁 ↗</a></section>`;
  }

  /* ---------- Events ---------- */
  view.addEventListener('input', e => {
    if (e.target.id === 'recipe-search') {
      state.search = e.target.value;
      grid();
    }
    if (e.target.dataset.flavorProfile) {
      state.flavorProfile[e.target.dataset.flavorProfile] = Number(e.target.value);
      e.target.nextElementSibling.value = e.target.value;
      renderFlavorResults();
    }
  });
  function setImageFallback(image, failed) {
    if (!image?.matches?.('img[data-fallback-id]')) return;
    const fallback = image.nextElementSibling;
    if (!fallback?.classList.contains('image-fallback')) return;
    image.hidden = failed;
    fallback.hidden = !failed;
  }
  view.addEventListener('error', e => setImageFallback(e.target, true), true);
  view.addEventListener('load', e => setImageFallback(e.target, false), true);
  document.querySelector('.menu-toggle').addEventListener('click', e => {
    const open = e.currentTarget.getAttribute('aria-expanded') === 'true';
    e.currentTarget.setAttribute('aria-expanded', String(!open));
    document.querySelector('.nav').classList.toggle('is-open', !open);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelector('.menu-toggle')?.setAttribute('aria-expanded','false');
      document.querySelector('.nav')?.classList.remove('is-open');
    }
  });
  let scrollFrame = 0;
  window.addEventListener('scroll', () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      document.querySelector('.topbar')?.classList.toggle('is-scrolled', window.scrollY > 24);
      const progress = Math.min(window.scrollY / Math.max(window.innerHeight * .85, 1), 1);
      document.documentElement.style.setProperty('--scroll-y', String(Math.min(window.scrollY, 600)));
      document.documentElement.style.setProperty('--hero-progress', progress.toFixed(3));
      const storyReader = document.querySelector('.story-reader');
      if (storyReader) {
        const bounds = storyReader.getBoundingClientRect();
        const storyProgress = Math.max(0, Math.min(1, (window.innerHeight - bounds.top) / (bounds.height + window.innerHeight)));
        storyReader.querySelector('.story-stage')?.style.setProperty('--story-scroll-progress', storyProgress.toFixed(3));
      }
      scrollFrame = 0;
    });
  }, { passive: true });
  view.addEventListener('click', e => {
    const favorite = e.target.closest('[data-favorite]');
    if (favorite) {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(favorite.dataset.favorite);
      const saved = favorites.has(favorite.dataset.favorite);
      favorite.classList.toggle('is-favorite', saved);
      favorite.setAttribute('aria-pressed', String(saved));
      favorite.setAttribute('aria-label', `${saved ? '取消收藏' : '收藏'} ${catalog.find(c=>c.id===favorite.dataset.favorite)?.nameZh || ''}`);
      favorite.querySelector('span').textContent = saved ? '♥' : '♡';
      return;
    }
    const showcase = e.target.closest('[data-showcase]');
    if (showcase) {
      setShowcase(cocktailById(showcase.dataset.showcase));
      return;
    }
    const filter = e.target.closest('[data-filter]');
    if (filter) { state[filter.dataset.filter] = filter.dataset.value; grid(); return; }
    const serving = e.target.closest('[data-servings]');
    if (serving) {
      state.servings = Number(serving.dataset.servings);
      const c = catalog.find(x=>`#/cocktail/${x.id}`===location.hash);
      if (c) document.querySelector('#ingredient-list').innerHTML = ingredients(c);
      document.querySelectorAll('[data-servings]').forEach(b => { b.classList.toggle('is-active', Number(b.dataset.servings)===state.servings); b.setAttribute('aria-pressed',String(Number(b.dataset.servings)===state.servings)); });
      return;
    }
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'random' && catalog.length) location.hash = `/cocktail/${catalog[Math.floor(Math.random()*catalog.length)].id}`;
    if (action === 'explore') document.querySelector('#discover')?.scrollIntoView({behavior:'smooth'});
    if (action === 'clear') { state.search=''; state.base='全部'; state.flavor='全部'; const search = document.querySelector('#recipe-search'); if(search) search.value=''; grid(); }
  });
  document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => {
    document.querySelector('.menu-toggle')?.setAttribute('aria-expanded','false');
    document.querySelector('.nav')?.classList.remove('is-open');
  }));
  window.addEventListener('hashchange', navigate);
  if (catalog.length) navigate();
  else view.innerHTML = '<section class="not-found wrap"><h1>調酒資料尚未建立</h1><p>請執行 node scripts/build.mjs 後重新整理頁面。</p></section>';
})();
