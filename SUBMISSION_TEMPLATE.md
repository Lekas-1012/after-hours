# AFTER HOURS — 課堂作品繳交說明

## 1. 專案簡介

AFTER HOURS 是繁體中文互動式調酒百科，以傳統油畫呈現 11 款經典調酒，提供搜尋、基酒與風味篩選、材料比例、製作步驟、1／2／4 杯換算與收藏；另有 4 篇故事及 17 項材料百科，讓讀者理解調酒的結構與文化。

網站使用 HTML、CSS、Vanilla JavaScript 與 JSON，完全靜態，訪客不需要後端或安裝 Node.js。

## 2. GitHub Repository

https://github.com/Lekas-1012/after-hours

## 3. GitHub Pages 網站

https://lekas-1012.github.io/after-hours/

可直接體驗：[Gin Fizz 酒譜](https://lekas-1012.github.io/after-hours/#/cocktail/gin-fizz)、[故事館](https://lekas-1012.github.io/after-hours/#/stories)、[材料百科](https://lekas-1012.github.io/after-hours/#/ingredients)。

## 4. AGENTS.md 開發規範

https://github.com/Lekas-1012/after-hours/blob/main/AGENTS.md

根目錄 AGENTS.md 定義專案目的、頁面路由、油畫風格與場景多樣性、資料格式、檔名及目錄、共用圖片模板、響應式與捲動互動、Git 安全、建置驗收及 Pages 發布流程。

## 5. 規則如何幫助 AI 新增內容

新的 AI 先閱讀 AGENTS.md 與 RECIPE_TEMPLATE.json，建立具有唯一 id 的酒譜 JSON，依序對應材料百科 ID，並在 relations.json 連結相關酒款及故事。圖片依酒款杯型、酒液、裝飾與油畫規範製作，以 `<id>.jpg` 命名；未建立百科的材料以 null 佔位，避免錯誤連結。

內容經 build 轉為靜態 catalog 後，現有共用模板會自動建立卡片與詳情，也能直接參與搜尋、篩選與杯數換算。最後執行 Node 資料驗證及桌面／手機瀏覽器驗收，再提交版本。這讓新增內容可重複操作，並維持資料、風格與功能一致，而不需要依賴舊聊天紀錄或為每款酒複製 HTML。
