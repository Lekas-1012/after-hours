# AFTER HOURS｜互動式調酒百科

以傳統厚塗油畫呈現經典調酒的繁體中文靜態網站，結合酒譜、歷史故事與材料百科。課堂作品的核心是根目錄的 [AGENTS.md](AGENTS.md)：讓新的 AI 能依相同格式、風格與驗收流程持續新增內容。

- 網站：https://lekas-1012.github.io/after-hours/
- 原始碼：https://github.com/Lekas-1012/after-hours
- AI 開發規範：[AGENTS.md](AGENTS.md)

## 主要功能

- 11 款調酒、4 篇故事、17 項材料百科，使用明確的資料關聯。
- 中英文名稱／材料／風味搜尋，基酒與風味篩選、風味偏好探索。
- 酒譜詳情、1／2／4 杯換算、調製步驟及資料來源。
- localStorage 收藏、相關酒款與材料連結。
- 油畫 Hero 與捲動視差、Sticky 故事閱讀、精選展示與手機橫滑。
- 響應式導覽、鍵盤操作、Escape 關閉選單與 reduced motion 回退。
- 所有尺寸的 Hero 文字都疊在油畫上；缺圖才顯示 SVG 容錯插畫。

## 技術與結構

HTML、CSS、Vanilla JavaScript、hash router、JSON；Node.js 僅用於資料建置和驗證。網站不需要後端、資料庫、API Key 或安裝依賴；字體使用 Google Fonts 並有系統字型回退。

```text
index.html                       入口、共用導覽與頁尾
app.js / styles.css              路由、共用元件、互動與視覺
AGENTS.md                        AI 開發規範
content/RECIPE_TEMPLATE.json      酒譜格式範本
content/recipes/*.json            酒譜唯一內容來源
content/encyclopedia/             材料、故事與關聯 JSON
assets/hero-banner.jpg            首頁油畫
assets/cocktails/<id>.jpg         酒款油畫
assets/candidates/                已保留的 Hero 生成原件與 Prompt
data/catalog.js                  自動生成的瀏覽器資料（須提交）
scripts/build.mjs / test.mjs      資料建置與技術驗證
scripts/browser-test.mjs          Playwright 回歸與截圖
qa/                              驗收紀錄與截圖
SUBMISSION_TEMPLATE.md           課堂作品說明與繳交連結
```

## 本機執行與測試

從專案根目錄執行（建議 Node.js 20 以上，Python 3 用於本機預覽）：

```sh
node scripts/build.mjs --check
node scripts/test.mjs
python3 -m http.server 8000
```

開啟 `http://localhost:8000/`，以 HTTP 測試圖片與相對路徑。

## 如何讓 AI 新增調酒

1. 閱讀 [AGENTS.md](AGENTS.md) 及酒譜範本，確認可信來源。
2. 建立 `content/recipes/<id>.json`，填寫酒譜資料及唯一排序。
3. 更新材料、故事（如有）與 `relations.json`；材料 ID 陣列與酒譜材料逐項對齊，沒有百科資料用 `null`。
4. 依酒款杯型、酒液及裝飾製作油畫，存為 `assets/cocktails/<id>.jpg`。統一筆觸與暖色光影，場景應多樣，不能每張都用列車背景。
5. 執行 `node scripts/build.mjs` 更新 catalog，再執行 `node scripts/build.mjs --check`、`node scripts/test.mjs`。
6. 完成桌面／手機的圖片及功能驗收，將 JSON、圖片與 catalog 一起提交。

資料和版型分離，使 AI 新增酒款時能沿用既有卡片、詳情、搜尋和換算，不需要複製 HTML。

## 瀏覽器回歸

需安裝 Google Chrome；Playwright 只用於開發驗收，不是網站依賴。

```sh
npm install --prefix /tmp/after-hours-qa playwright
# 保持本機 HTTP 伺服器運行後：
QA_BASE_URL=http://localhost:8000/ PLAYWRIGHT_MODULE=/tmp/after-hours-qa/node_modules/playwright/index.mjs node scripts/browser-test.mjs
```

正式站驗收時將 `QA_BASE_URL` 改為上述 Pages 網址。結果與截圖預設寫入 `qa/`，可用 `QA_OUT` 指定其他目錄。

## GitHub Pages 部署

提交並推送完整專案（含 `data/catalog.js`、`assets/`、`.nojekyll`）至 `main`。在 Repository 的 **Settings → Pages** 選 **Deploy from a branch → main → /(root) → Save**。訪客不需要執行 Node.js；hash 路由與相對資源適用於 `/after-hours/` 子路徑。

發布完成後實際檢查首頁、酒譜、故事、材料、手機導覽與資源載入。詳見 [GitHub 官方部署說明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

本站為課堂學習作品，酒譜主要參考 IBA，中文為非官方整理。理性飲酒，未成年請勿飲酒，酒後不開車。
