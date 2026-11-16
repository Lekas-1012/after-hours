# AFTER HOURS｜經典調酒圖鑑

一個用 HTML、CSS、JavaScript 製作的繁體中文調酒知識網站。以**傳統油畫藝術風格**呈現，每款調酒搭配獨立的油畫場景插圖，支援基酒／風味篩選、關鍵字搜尋、各款酒譜詳情及 1／2／4 杯材料換算。

**本作業的重點不是只做網站，而是透過 [`AGENTS.md`](./AGENTS.md) 讓 AI 能用一致的規則持續擴充網站。**

## 特色

- 10 款經典調酒與獨立的詳情連結（`#/cocktail/酒名-id`）
- 每款調酒配有獨立的**油畫風格原創插圖**，場景各異（義大利廣場、古巴酒吧、巴黎小酒館等）
- 首頁大幅油畫 Hero 視覺，沉浸式藝術氛圍
- 中文／英文名稱、材料、風味可搜尋
- 基酒及風味篩選
- Scroll-driven Hero、Sticky 油畫展示與 Scroll Snap 調酒畫廊
- localStorage 收藏與依風味偏好排序的探索工具
- 可鍵盤操作、支援 reduced motion 的浮動導覽與手機選單
- 調酒故事館：Negroni、Daiquiri、Margarita 的可查證捲動故事
- 材料百科與穩定 Ingredient ID 關聯
- 明確定義的相關調酒探索，不使用隨機推薦
- 材料份量換算與調製步驟
- 手機、平板、電腦自動排版
- 保留 SVG 風格化酒杯插畫作為圖片載入的回退機制
- 完全靜態，無資料庫，免費發布於 GitHub Pages
- 內容來源以 IBA 官方酒譜為主；網站整理為非官方中文說明

## 視覺風格

- **傳統油畫風格**：可見筆觸、厚塗質感、自然顏料混色
- **暖色光影**：琥珀色酒液、黃昏陽光、深木質調
- **配色系統**：深棕 `#1a1410`、奶油白 `#f5f0e3`、暖金 `#c9a55a`、酒紅 `#6b2d3e`、赭褐 `#8b5e3c`
- **字體**：Playfair Display（襯線標題）+ Noto Sans TC（正文）

## 本機預覽

最簡單的方法：直接用瀏覽器開啟 `index.html`，或者用 VS Code 的 Live Server。

如要用 Python 本機伺服器：

```bash
python -m http.server 8000
```

接著開啟 `http://localhost:8000/`。

百科頁面包括 `#/stories`、`#/story/<story-id>`、`#/ingredients` 與
`#/ingredient/<ingredient-id>`。

> **注意**：首頁 Hero 區的背景圖片需透過 HTTP 伺服器載入；直接開 `file://` 可能無法正確顯示背景。

## 新增一款調酒（可交給 AI 做）

1. 先給 AI 閱讀 [`AGENTS.md`](./AGENTS.md)。
2. 複製 `content/RECIPE_TEMPLATE.json`，在 `content/recipes/` 建立 `新酒名-id.json`。
3. 按照範本填寫資料、來源與新排序 `order`。
4. 生成或提供油畫風格圖片，存放於 `assets/cocktails/新酒名-id.jpg`。
5. 透過本機 Node.js 執行：

```bash
node scripts/build.mjs
node scripts/test.mjs
```

6. 將新的 JSON、新圖片**和**更新後的 `data/catalog.js` 一起上傳 GitHub，網站就會自動新增新卡片與詳情頁。

> 網站訪客不需要 Node.js：它只用來驗證內容、輸出靜態 JS 資料。

## GitHub Pages 部署（免指令版）

1. 建立一個公開 GitHub Repository，例如 `after-hours`。
2. 將本專案**資料夾內的檔案**上傳到 Repository 根目錄；必須能直接看見 `index.html` 與 `AGENTS.md`。
3. 進入 **Settings → Pages → Build and deployment**。
4. **Source** 選 `Deploy from a branch`，選 `main` 及 `/(root)`，按 `Save`。
5. 發布完成後，網址一般是 `https://你的帳號.github.io/after-hours/`。
6. 開啟首頁，點入任一酒譜並測試搜尋、篩選和份量換算。

GitHub 官方教學：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 專案結構

```text
index.html              網站入口
styles.css              共用樣式（油畫暖色調主題）
app.js                  前端互動與共用頁面模板
AGENTS.md               讓 AI 持續維護網站的開發規則
assets/
  hero-banner.jpg       首頁 Hero 區油畫背景
  cocktails/            每款調酒的油畫圖片
content/recipes/        一款調酒一個 JSON 檔
content/RECIPE_TEMPLATE.json  新內容範本
content/encyclopedia/  材料、故事與 cocktail 關聯資料
data/catalog.js         自動產生（勿直接編輯）
scripts/build.mjs       資料驗證與建置
scripts/test.mjs        基本結構與資料測試
```

## 注意

- 專案為學習用途。所有酒譜可透過詳細頁面的來源連結查證，中文文字經過編輯整理。
- 飲酒須遵守當地法定年齡規定。酒後不開車。
