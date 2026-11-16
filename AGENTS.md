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
    ├── test.mjs                       # 資料與程式結構檢查（不是瀏覽器測試）
    └── browser-test.mjs               # Playwright 實際互動、圖片與截圖驗收
```

內容與版型分離：新增酒款、材料或故事不得複製 HTML 頁面；應新增 JSON，讓 `app.js` 的共用模板產生畫面。

## 3. Design System

### 3.1 視覺

- 維持傳統油畫、厚塗筆觸、暖色光影、深木質與懷舊旅行感。
- 禁止霓虹、科技儀表板、大量玻璃擬態、SaaS 卡片或冷硬 UI。
- 既有色彩 token：`--dark`、`--dark-2`、`--ink`、`--cream`、`--paper`、`--gold`、`--gold-light`、`--wine`、`--olive`、`--umber`、`--sienna`、`--muted`。新增顏色前先確認既有 token 無法滿足需求。
- 標題使用 `var(--serif)`（Playfair Display／Noto Serif TC），正文與 UI 使用 `var(--font)`（Noto Sans TC／系統字型）。
- 最大內容寬度 1240px；桌面左右留白約 48px，手機約 18px。

### 3.2 藝術語言與場景

- 正式酒款圖片是 `assets/cocktails/<cocktail-id>.jpg`，真正 JPEG、4:3、建議小於 1.2 MB；使用相對路徑。
- **Style Reference** 只定義傳統厚塗油畫、可見顏料筆觸、自然光影反射、復古暖色與景深。**Cocktail Subject** 獨立依酒譜的 `vessel`、`liquid`、`garnish`、材料及冰塊描述決定，不能複製參考酒款。
- 統一藝術語言，不統一背景。每次新增前先看現有圖片，選擇符合文化、風味與敘事的不同場景，同時改變視角、道具和光源；不可只在同一構圖替換酒杯。
- 場景可選義大利咖啡館、古典酒吧、紐約飯店酒廊、海邊露台、雨夜街景、法式餐館、燭光吧台、書房壁爐、花園、屋頂或藝術靜物，不限於此。復古列車只是選項，不能作為預設。
- Negroni 可探索義大利 aperitivo；Manhattan 可探索紐約酒廊；Martini 可探索都會飯店；Margarita 可探索海邊；Old Fashioned 可探索書房或木質吧台，均非固定模板。
- 禁止扁平向量、SVG 轉 JPG、普通商品照、照片套濾鏡、3D 塑膠渲染、霓虹科技場景冒充正式油畫。格式轉換不是風格生成。
- 無文字、商標或浮水印；先確認參考圖來源與使用權限。
- `assets/cocktails/gin-fizz.jpg` 是已驗收的火車窗邊、淡金氣泡高球與檸檬油畫，保持原件；不得任意替換其他已驗收圖片。

### 3.3 圖片整合與驗收

- 所有卡片（首頁、搜尋、分類、收藏、相關推薦）、詳情、精選與故事圖片都使用 `cocktailImgSrc()` 路徑及 `cocktailImage()` 模板，不另維護酒款特例或內嵌 onerror。
- 共用模板保留 `<img>` 和預設 `hidden` 的 `.image-fallback`。只有真正的 error 才隱藏圖片、顯示 SVG；load 必須恢復圖片並隱藏 fallback。不得刪掉原圖節點或讓 fallback 覆蓋正常油畫。保留其他缺圖酒款的容錯。
- 非首屏圖片 lazy loading，詳情主圖 eager。不得把所有圖片強制預載來掩蓋事件問題。
- 以 `file assets/cocktails/*.jpg`、`sips -g pixelWidth -g pixelHeight <圖片>` 和 `ls -lh` 檢查實際格式、尺寸比例、大小。歷史圖片約 4:3（1200×896）可保留，新增使用精確 4:3。
- 用 HTTP 在 GitHub Pages 子路徑驗證，Playwright 檢查列表與詳情的 `currentSrc`、`complete`、`naturalWidth`、`naturalHeight`、fallback 可見性；還需驗證搜尋、篩選、收藏、推薦、缺圖降級及圖片恢復。
- 技術通過不代表美術通過。桌面／手機實際截圖需檢查油畫肌理、酒款真實性、構圖、裁切、光影、風格一致性。
- 沒有真正生成工具時提供完整 Prompt 並標示待確認，不得用 SVG、照片或格式轉換冒充成品。有工具則先生成候選，未獲使用者確認不得替換正式 Hero；未完成美術驗收的候選獨立放在 `assets/candidates/`。

### 3.4 Hero 構圖

- 先看原圖：光暗分布、主體與標題空間、桌面／手機比例，再設計文字位置。不得只反覆調 brightness、scale、object-position。
- 標題放在平靜區域，酒杯與環境保有完整敘事；遮罩只局部保護文字，搭配文字陰影，不壓黑半幅油畫，不使用破壞顏料色彩的濾鏡。
- 桌面與手機 Hero 的文字都必須疊在油畫上，維持同一個沉浸式主視覺，不可拆成圖片在上、文字在下。手機使用獨立裁切焦點與局部遮罩，顧及酒杯、環境及文字可讀性；不因捲動淡出而讓手機文字難讀。
- 若素材本身有大片暗牆，CSS 無法還原不存在的細節；保留原圖並提出更均衡光線的新構圖候選，待確認後更換，不無限疊濾鏡補救。
- 修改後交付桌面／手機截圖與尚未解決的設計限制。保留第 4 節視差係數、背景慢於文字、無露白／跳動、Sticky storytelling 與 reduced-motion 回退。

### 3.5 RWD

| 寬度 | 規則 |
|---|---|
| >1120px | 酒譜三欄、完整 Sticky 展示 |
| 820–1120px | 酒譜卡片仍三欄、隱藏 topbar note |
| 550–820px | 酒譜兩欄、detail hero 單欄、故事舞台降級流式、手機選單 |
| <550px | 酒譜單欄、材料與故事索引單欄、展示列可觸控橫滑 |

手機不得水平溢出；水平 Scroll Snap 只套用於自己的展示容器，不劫持整頁捲動。

## 4. Motion & Interaction

### 4.1 Scroll-linked 規範

- Hero 使用 `requestAnimationFrame` 節流的 scroll progress，將 `--scroll-y`、`--hero-progress` 交給 CSS 做縮放、視差、透明度與 progress indicator。
- 視差係數集中在 `styles.css` 的 `--parallax-*` tokens；背景速度必須低於前景文字，手機使用較小係數，調整時只做小幅增量並檢查是否露白或晃動。
- Story stage 使用 `position: sticky`，章節以 `IntersectionObserver` 切換文字與進度；故事結束後恢復正常流式捲動。離開故事路由先 disconnect Observer，延遲回呼須確認原頁仍在 DOM，避免更新已移除的元素。Sticky 需以實際捲動座標驗證，外層不得使用會建立錯誤捲動祖先的 overflow: hidden。
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

`id`、`name`、`nameZh`、`subtitle`、`description`、`base`、`flavors`、`difficulty`、`method`、`glass`、`prepMinutes`、`liquid`、`vessel`、`garnish`、`ingredients`、`steps`、`tip`、`source`、`order`。

材料格式為 `{ "name": "琴酒", "amount": 45, "unit": "ml" }`；amount 必須是正數或 null，null 代表少許／補滿等不隨杯數數值換算的材料。來源格式為 `{ "label": "來源名稱", "url": "https://…" }`。至少兩項材料與兩個非空步驟；不可擅自推算沒有來源支持的比例。

- `order`：不重複的正整數；`prepMinutes`：1–120 的整數；`liquid`：六位十六進位色碼。
- `base`：琴酒／龍舌蘭／蘭姆酒／威士忌／伏特加／氣泡酒。
- `difficulty`：入門／中等／進階；`method`：直調／搖盪／攪拌。
- `vessel`：rocks／coupe／highball／wine；`garnish`：orange／lime／lemon／coffee／cherry／mint／none。
- `flavors`：1–3 項，從苦甜／草本／酸爽／柑橘／清新／甜潤／果香／咖啡／氣泡／濃郁選取。
- 範本內的 id 與 order 只是例子，複製後必須改成未使用的值。新值如超出列舉，先有意識地同步 build 驗證與必要的顯示支援，不可只填未支援字串。


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

材料檔案是物件陣列；id 為唯一小寫 kebab-case。flavors、uses、relatedIngredientIds 為非空字串陣列；sources 至少一個且 URL 為 HTTPS。uses 是展示用途文字，不是網站酒譜 ID，不保證每項都有收錄酒譜。實際使用該材料的酒譜由 relations 反查。

顯示名稱可以修訂，但 `id` 不可因文案變更而改動。無詳細資料的材料暫時不要建立虛構百科頁；酒譜可在 relations 中不連結，UI 必須顯示純文字而非無效連結。

### 5.3 Story

`content/encyclopedia/stories.json` 每篇故事必須包含 `id`、`cocktailId`、`title`、`subtitle`、`imageCocktailId`、至少三個 `sections`、`relatedCocktailIds` 與 `sources`。每個章節包含非空字串 `title`、`body`、`type`（例如 recipe／history／culture）。故事檔案是物件陣列，id 為唯一小寫 kebab-case；sources 是至少一組 `{label,url}` 且 URL 為 HTTPS，relatedCocktailIds 可以為空陣列。

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

`ingredientIds` 與 recipe.ingredients **等長且逐項對齊**，因為 `ingredients()` 按位置建立連結。無百科或不完全相同的材料必須用 null 佔位，不可省略中間位置、不可以近似材料硬連結：例如細砂糖不能連到糖漿，Prosecco 不能連到甜紅苦艾酒。例：`[null, null, "club-soda"]`。

`storyId` 沒有故事時省略；有值時須指向屬於該酒款的故事。`relatedCocktailIds` 可以為空，但不可包含自己。所有非 null id 由 build 驗證存在；推薦必須有明確可解釋的關聯。新增後仍要人工比對材料名稱與百科內容，build 不會辨識語意是否相同。

## 6. AI Development Rules

### 新增調酒

1. 閱讀本文件與 template，確認 IBA 或其他可信來源。
2. 先新增 `content/recipes/<id>.json`，確認欄位、來源、比例、杯型、酒液色與裝飾。
3. 若材料不存在，先新增到 `ingredients.json`；再於 `relations.json` 建立 cocktail id、ingredient ids、相關酒款及可用 story id，不可建立死連結。
4. 若有故事，新增至少三段可查證章節至 `stories.json`，並以 relation 的 `storyId` 連回酒款。
5. 依第 3 節圖片製作與驗收規範 產生或取得有權限的油畫 JPG；沒有生成工具時先停在「待視覺驗收」，不可用技術暫存冒充完成。
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

## 7. Git 安全規則

- 大型修改前先 `git status --short --branch`，確認正確專案，讀取規範、README 與相關程式／資料／圖片。
- 無 Repository 才 `git init`；既有歷史不可覆寫。檢查 `.gitignore` 與待提交清單，排除敏感資訊、API Keys、系統暫存與依賴，保留酒譜、故事、材料、圖片與規範。
- 功能修改前建立可還原的 backup commit，重大修改在獨立分支完成。不得擅自丟棄使用者變更。
- 禁止未核准的 `git reset --hard`、`git clean -fd`、force push、改寫 commit 或刪除資料。只有使用者已授權發布時才建立遠端、推送或部署；操作前確認帳號與 Repository，不能推到其他專案。
- 修改後完成 build/test 和瀏覽器驗收才建立修正 commit，回報前後 commit ID、分支、未完成項目與還原方法。
- 安全檢視舊版使用 `git worktree add ../after-hours-before <backup-commit>`，不影響目前工作區；正式撤銷已提交修正前先保存新修改，再使用 `git revert <fix-commit>` 建立反向 commit，保留歷史。

## 8. Testing & Deployment

### 本機

```bash
python3 -m http.server 8000
node scripts/build.mjs --check
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

### 瀏覽器回歸

參考 README 安裝獨立的 Playwright 驗收依賴與 Google Chrome，啟動 HTTP 後執行：

```sh
QA_BASE_URL=http://localhost:8000/ PLAYWRIGHT_MODULE=/tmp/after-hours-qa/node_modules/playwright/index.mjs node scripts/browser-test.mjs
```

`QA_OUT` 可指定證據資料夾，預設 qa。正式部署需用實際 Pages URL 再執行；Node 結構測試通過不代表互動正常。

### GitHub Pages 發布

1. 先通過 build --check、test 及本機瀏覽器驗收，檢查待公開檔案與歷史均無密碼、金鑰、Token、個人附件；不提交 node_modules、.env、憑證。
2. 確認正確帳號及 remote。使用 Public Repository；根目錄保留 AGENTS.md、README.md、index.html、app.js、styles.css、完整 content、data/catalog.js、assets 和 `.nojekyll`。
3. 將驗收分支以一般 merge（可 fast-forward）整合至 main，保留所有原有歷史與備份分支；正常 push，不 force push。不需要新增 framework、package.json 或網站 runtime build。
4. Repository → Settings → Pages → Deploy from a branch → main → /(root) → Save。發布設定由 GitHub 保存，不需另建後端或自訂 Actions。
5. 等待 Pages build/deployment 成功，再訪問 GitHub 回傳的 https 正式網址。確認 CSS、JavaScript、Hero、所有酒款圖片沒有 404；hash 路由 `#/cocktail/gin-fizz`、`#/stories`、`#/ingredients` 和手機操作正常。
6. README 和 SUBMISSION_TEMPLATE.md 填入已確認的 Repository、Pages 和根目錄 AGENTS.md 連結，保存驗收結果。未完成部署不得標示發布成功。

資源必須以相對路徑引用，禁止把 localhost、本機絕對路徑或站台根目錄 `/assets` 寫進訪客 runtime；hash router 不需要伺服器 rewrite。Google Fonts 有系統字型回退。開發工具、歷史 qa 報告中的 localhost 不是 runtime 依賴。

官方說明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 9. 後續構想（本次不實作）

目前已有以標籤距離排序的風味偏好滑桿；下列是未實作的進階構想，不屬於既有功能或本次交付要求：

1. **互動式風味圖譜**：以現有 `flavors`、ingredient id 與 recipe id 建立可鍵盤操作的二維／分群探索；先定義 normalized flavor score，再做視覺化。
2. **我的調酒實驗室**：保存使用者選定酒款、份量、替換材料與備註；資料只放 localStorage，先設計版本化 schema 與匯出格式。
3. **調酒關係圖**：以 relations.json 的明確關係建立可縮放、可聚焦的圖；先處理鍵盤列表 fallback，再考慮 SVG/Canvas。
4. **個人品飲紀錄**：建立日期、評分、筆記與酒款 id schema；設計隱私、匯出與刪除策略後才實作。

第二階段不可在第一階段的資料驗證、路由、無障礙與效能尚未穩定前同時展開。
