# AGENTS.md — AFTER HOURS 互動式調酒百科

這份文件是 AFTER HOURS 的單一開發規範。任何 AI 或開發者開始修改前，必須先閱讀本文件、[content/RECIPE_TEMPLATE.json](./content/RECIPE_TEMPLATE.json) 以及相關資料檔。

## 1. Project Overview

AFTER HOURS 是繁體中文的互動式調酒百科，讓讀者探索經典調酒的風味、材料、比例、製作方式與歷史故事。主要使用者是想理解調酒結構、材料關係與文化背景的讀者，而不是只想快速取得酒單的人。

核心功能：

- `#/` 首頁：油畫 Hero、捲動敘事、精選酒款、搜尋、基酒與風味篩選。
- `#/cocktail/<id>`：酒譜、材料比例、1／2／4 杯換算、調製步驟、來源、收藏與明確關聯酒款。
- `#/story/<story-id>`：以 Sticky stage 與章節捲動呈現起源、文化、配方演變與可查證來源。
- `#/stories`：故事館索引。
- `#/ingredient/<ingredient-id>`：材料背景、風味、用途、來源與使用該材料的酒譜。
- `#/ingredients`：材料百科索引。
- `#/guide`、`#/about`：固定說明頁。
- `#/favorites`：使用 localStorage 保存的收藏檢視。

網站是 GitHub Pages 可部署的靜態網站；Node.js 只用於本機建置與驗證，訪客不需要後端、資料庫、帳號或追蹤服務。

## 2. Project Structure

```text
/
├── index.html                         # 靜態入口、共用 topbar/footer、載入 catalog
├── styles.css                         # token、版型、RWD、動畫與百科頁樣式
├── app.js                             # Vanilla JS hash router、元件模板、互動
├── data/catalog.js                    # build.mjs 產生，禁止直接編輯
├── content/
│   ├── RECIPE_TEMPLATE.json           # 新增酒譜範本
│   ├── recipes/*.json                 # 每款酒譜唯一內容來源
│   └── encyclopedia/
│       ├── ingredients.json           # 穩定 ingredient id 與材料百科
│       ├── stories.json               # story id、章節、來源與關聯酒款
│       └── relations.json             # cocktail id 對應材料、故事、相關酒款
├── assets/
│   ├── hero-banner.jpg
│   └── cocktails/<cocktail-id>.jpg
└── scripts/
    ├── build.mjs                      # 驗證並產生 data/catalog.js
    └── test.mjs                       # 資料、路由、互動與樣式結構測試
```

內容與版型分離：新增酒款、材料或故事不得複製 HTML 頁面；應新增 JSON，讓 `app.js` 的共用模板產生畫面。

## 3. Design System

### 3.1 視覺

- 維持傳統油畫、厚塗筆觸、暖色光影、深木質與懷舊旅行感。
- 禁止霓虹、科技儀表板、大量玻璃擬態、SaaS 卡片或冷硬 UI。
- 既有色彩 token：`--dark`、`--dark-2`、`--ink`、`--cream`、`--paper`、`--gold`、`--gold-light`、`--wine`、`--olive`、`--umber`、`--sienna`、`--muted`。新增顏色前先確認既有 token 無法滿足需求。
- 標題使用 `var(--serif)`（Playfair Display／Noto Serif TC），正文與 UI 使用 `var(--font)`（Noto Sans TC／系統字型）。
- 最大內容寬度 1240px；桌面左右留白約 48px，手機約 18px。

### 3.2 圖片

- 酒款圖片為 `assets/cocktails/<cocktail-id>.jpg`，JPG、4:3、建議小於 1.2 MB。
- 所有正式酒款圖片都必須是傳統油畫創作：可見實際筆觸、顏料肌理、自然混色與有故事性的暖色光影；必須先參考 `assets/cocktails/` 中既有油畫作品，維持同一藝術語言。
- SVG、CSS、簡單幾何圖形、普通照片或「照片套油畫濾鏡」都不能視為正式油畫圖片；SVG fallback 只能作為缺圖時的執行期保護。
- 風格參考圖只用來決定筆觸、顏料肌理、光影、色調、場景氛圍與構圖語言；不可複製參考圖的杯型、酒液、裝飾或其他酒款特徵。
- 正式酒款圖片的實際外觀必須以該酒譜的 `vessel`、`liquid`、`garnish` 與材料資料為準，即使與風格參考圖不同，也不得為了構圖而改錯酒款特徵。
- 圖片不得包含文字或浮水印。
- 使用相對路徑與 `loading="lazy"`；缺圖時保留 app.js 的 SVG fallback。
- 不得任意替換或刪除既有圖片，除非有明確品質或版權問題。

### 3.3 Image Production & Quality Assurance

- 新增圖片前，先確認生成工具、參考圖的來源與使用權限；不可把未授權的他人圖片或商標當作素材。
- 圖片生成必須同時確認：傳統油畫筆觸與肌理、暖色深木質場景、故事性構圖、正確 `vessel`、接近 `liquid` 的酒液色、正確 `garnish`、無文字與無浮水印。
- 生成 Prompt 應分開描述「Style reference」與「Cocktail subject」：前者限定藝術語言，後者限定該酒款的杯型、酒液、冰塊、裝飾與可辨識細節。
- 技術驗收至少包含 JPG 格式、4:3 比例、檔案大小、相對路徑、HTTP 載入、`naturalWidth`／`naturalHeight` 與手機／桌面版顯示。
- 技術驗收不等於視覺驗收；正式合併前必須以瀏覽器或截圖檢查筆觸、光影、構圖與既有作品的一致性。
- 若環境沒有真正的圖片生成工具，AI 必須提供可執行的生成 Prompt 與待確認狀態，不得用 SVG、CSS、簡單圖形或普通照片宣稱完成。
- 圖片尚未經使用者或設計驗收時，必須明確標示為「待視覺驗收／技術暫存」；不可因格式正確、尺寸正確或能載入就視為正式成品。
- `assets/cocktails/gin-fizz.jpg` 已完成 Gin Fizz 杯型、酒液、氣泡、檸檬裝飾與油畫風格的視覺驗收；未來若替換，仍須重新完成同一套驗收。

### 3.3 RWD

| 寬度 | 規則 |
|---|---|
| >1120px | 酒譜三欄、完整 Sticky 展示 |
| 820–1120px | 酒譜兩欄、隱藏 topbar note |
| 550–820px | 酒譜兩欄、detail hero 單欄 |
| <550px | 酒譜單欄、Sticky story 降級流式、展示列可觸控橫滑 |

手機不得水平溢出；水平 Scroll Snap 只能套用於自己的展示容器，不能劫持整頁捲動。

## 4. Motion & Interaction

### 4.1 Scroll-linked 規範

- Hero 使用 `requestAnimationFrame` 節流的 scroll progress，將 `--scroll-y`、`--hero-progress` 交給 CSS 做縮放、視差、透明度與 progress indicator。
- 視差係數集中在 `styles.css` 的 `--parallax-*` tokens；背景速度必須低於前景文字，手機使用較小係數，調整時只做小幅增量並檢查是否露白或晃動。
- Story stage 使用 `position: sticky`，章節以 `IntersectionObserver` 切換文字與進度；故事結束後恢復正常流式捲動。
- Story stage 的圖片與文字可使用 `--story-scroll-progress` 做小幅相對位移，但不可改變容器尺寸或阻礙章節閱讀。
- 精選展示可使用 Sticky 左側與 Observer／Scroll Snap 右側切換酒款；不將整個網站做成強制分鏡。
- 優先使用 `transform`、`opacity`、`filter`、CSS transition；標準 easing 是 `cubic-bezier(.22, 1, .36, 1)`。
- 不在 scroll handler 大量重建 DOM；所有動畫都要有 `prefers-reduced-motion: reduce` 回退。

### 4.2 導覽與選單

- topbar sticky；捲動後可縮小並使用適度 backdrop blur。
- 手機使用真正的 `.menu-toggle` button，控制 `#primary-navigation` 的 `aria-expanded`。
- 關閉狀態使用 `max-height: 0`、`opacity: 0`、`visibility: hidden`、`pointer-events: none` 與位移；按鈕本身不可被隱藏。
- Escape 關閉；導覽連結點擊後關閉；路由切換更新 `aria-current` 與頁面標題。
- 所有按鈕、連結、滑桿與選擇器必須有可見焦點狀態與清楚的文字或 aria-label。

### 4.3 共用互動元件

- 使用語意化 class 與資料屬性：`data-action`、`data-filter`、`data-servings`、`data-showcase`、`data-favorite`。
- 使用事件委派與共用模板；不要為單一酒款複製 HTML。
- 收藏只保存 cocktail id 到 `after-hours:favorites`；格式錯誤時保留頁面功能並輸出可診斷 warning。
- 篩選、份量控制、故事章節、收藏、材料連結都必須可用鍵盤操作。

## 5. Content Rules & Data Relations

### 5.1 Cocktail

酒譜檔案位於 `content/recipes/<id>.json`，`id` 必須是小寫 kebab-case 且與檔名一致。必要欄位：

`name`、`nameZh`、`subtitle`、`description`、`base`、`flavors`、`difficulty`、`method`、`glass`、`prepMinutes`、`liquid`、`vessel`、`garnish`、`ingredients`、`steps`、`tip`、`source`、`order`。

材料 `amount` 必須是正數或 `null`；來源 URL 必須 HTTPS；至少兩項材料與兩個完整步驟；不可擅自推算沒有來源支持的比例。

### 5.2 Ingredient

`content/encyclopedia/ingredients.json` 每項材料必須包含：

```json
{
  "id": "stable-kebab-id",
  "name": "English name",
  "nameZh": "繁體中文名",
  "category": "分類",
  "summary": "簡短特色",
  "flavors": ["風味"],
  "history": "可查證且不誇大的背景",
  "uses": ["常見酒款或用途"],
  "relatedIngredientIds": ["other-id"],
  "sources": [{"label": "來源名稱", "url": "https://..."}]
}
```

顯示名稱可以修訂，但 `id` 不可因文案變更而改動。無詳細資料的材料暫時不要建立虛構百科頁；酒譜可在 relations 中不連結，UI 必須顯示純文字而非無效連結。

### 5.3 Story

`content/encyclopedia/stories.json` 每篇故事必須包含 `id`、`cocktailId`、`title`、`subtitle`、`imageCocktailId`、至少三個 `sections`、`relatedCocktailIds` 與 `sources`。每個章節包含 `title`、`body`、`type`。

歷史內容必須區分史實、常見說法與未證實傳聞；有爭議時明確寫出「常見說法」或「起源存在多種版本」。不可產生虛假引用、人物或年份。

### 5.4 Relations

`content/encyclopedia/relations.json` 以 cocktail id 為 key：

```json
{
  "negroni": {
    "storyId": "story-negroni",
    "ingredientIds": ["gin", "campari", "sweet-vermouth"],
    "relatedCocktailIds": ["boulevardier", "manhattan"]
  }
}
```

所有 id 都由 `scripts/build.mjs` 驗證存在；推薦不可隨機產生，必須是明確定義且可解釋的關聯。

## 6. AI Development Rules

### 新增調酒

1. 閱讀本文件與 template，確認 IBA 或其他可信來源。
2. 先新增 `content/recipes/<id>.json`，確認欄位、來源、比例、杯型、酒液色與裝飾。
3. 若材料不存在，先新增到 `ingredients.json`；再於 `relations.json` 建立 cocktail id、ingredient ids、相關酒款及可用 story id，不可建立死連結。
4. 若有故事，新增至少三段可查證章節至 `stories.json`，並以 relation 的 `storyId` 連回酒款。
5. 依本節 Image Production & Quality Assurance 產生或取得有權限的油畫 JPG；沒有生成工具時先停在「待視覺驗收」，不可用技術暫存冒充完成。
6. 執行 `node scripts/build.mjs`、`node scripts/test.mjs`，確認 `data/catalog.js` 同步。
7. 先做圖片技術與視覺驗收，再做桌面與手機的搜尋、篩選、卡片、詳細頁、故事、來源、份量與水平溢出檢查。

### 新增故事

1. 確認至少三段可查證內容，標示起源爭議。
2. 在 `stories.json` 建立 story id、章節、來源與相關酒款。
3. 在 `relations.json` 將 story id 連到 cocktail id。
4. 使用既有 story reader、Sticky stage、Observer 與 source component，不另建單一頁面版型。
5. 執行 build/test，檢查章節鍵盤 focus、reduced motion、來源連結與路由返回。

### 新增材料

1. 使用穩定小寫 kebab-case id，補齊背景、風味、用途、相關材料與 HTTPS 來源。
2. 更新 relations 中的使用酒款，不在 recipe 內複製材料百科文字。
3. 確認材料索引、材料詳情、酒譜材料連結與反向酒款列表都可用。

禁止直接編輯 `data/catalog.js`、刪除既有內容、修改無關酒譜比例、引入不必要框架或服務。外觀優先修改 `styles.css`，資料優先修改 `content/`。

## 7. Testing & Deployment

### 本機

```bash
python3 -m http.server 8000
node scripts/build.mjs
node scripts/test.mjs
```

開啟 `http://localhost:8000/`；Hero 與相對圖片路徑應透過 HTTP 測試，不以 `file://` 作為唯一驗證。

### 驗收清單

- build 與 test 通過，catalog 與百科資料同步。
- 搜尋、基酒／風味篩選、收藏、1／2／4 杯換算正常。
- `#/cocktail/<id>`、`#/story/<id>`、`#/ingredient/<id>`、索引頁與返回路由正常。
- 材料連結只指向存在的 ingredient id；相關酒款不是隨機。
- Hero progress、Sticky story、精選展示與手機 Scroll Snap 不會卡住或阻礙原生捲動。
- 手機導覽可開關、Escape 關閉、焦點可見，無水平溢出。
- `prefers-reduced-motion` 關閉非必要動畫。
- 圖片使用相對路徑、lazy loading 與 fallback，GitHub Pages 不依賴後端。
- 每張新增圖片都已完成技術驗收與視覺品質驗收；若尚未完成，必須在交付摘要明確列為待辦。

若測試工具、Node.js 或瀏覽器不可用，必須明確列出未驗證項目，不得宣稱通過。

## 8. Phase 2 Roadmap

第一階段完成後，再依序規劃：

1. **互動式風味圖譜**：以現有 `flavors`、ingredient id 與 recipe id 建立可鍵盤操作的二維／分群探索；先定義 normalized flavor score，再做視覺化。
2. **我的調酒實驗室**：保存使用者選定酒款、份量、替換材料與備註；資料只放 localStorage，先設計版本化 schema 與匯出格式。
3. **調酒關係圖**：以 relations.json 的明確關係建立可縮放、可聚焦的圖；先處理鍵盤列表 fallback，再考慮 SVG/Canvas。
4. **個人品飲紀錄**：建立日期、評分、筆記與酒款 id schema；設計隱私、匯出與刪除策略後才實作。

第二階段不可在第一階段的資料驗證、路由、無障礙與效能尚未穩定前同時展開。
