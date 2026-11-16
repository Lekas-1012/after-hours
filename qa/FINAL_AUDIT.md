# AFTER HOURS 最終驗收（2026-11-16）

## 安全與範圍

- 起始工作區乾淨，保留原有 3 個 commit 及所有分支；新增 `backup/final-audit-start` 保留 `d3e78c7`，在 `chore/final-audit` 修正後整合 main。
- 待公開檔案及既有 Git 追蹤清單已檢查，未發現 API Keys、Token、密碼、憑證或個人附件；.gitignore 已排除環境檔、私鑰、依賴與系統暫存。
- 未新增網站功能，未重新設計，未更換圖片或刪除酒譜／故事／材料。保留既有油畫與 Hero 文字疊圖。

## 必要修正

1. 材料連結按陣列位置對應，Spritz 的 Prosecco 原本誤連甜紅苦艾酒，Daiquiri 細砂糖誤連糖漿。改為 null 純文字佔位，補上既有蘇打水與蔓越莓百科連結；build 驗證陣列等長、非 null ID 有效。配方未改。
2. `.site-shell { overflow: hidden }` 建立錯誤的捲動祖先，使 Sticky 樣式存在但實際不固定。改為 `overflow: clip`；以捲動後 topbar=0px、story-stage=105px 驗證，不只看 computed position。
3. reduced motion 原本未停用 `.story-stage-art` 容器位移，補入既有回退規則。
4. 新增小型品牌 favicon，避免 Chrome 預設 `/favicon.ico` 404 與 Console Error。
5. 整理 AGENTS.md 的資料格式、列舉、材料 null 佔位、實際 RWD、驗收、Git 及 Pages 流程；README 改為精簡課堂介紹；SUBMISSION_TEMPLATE.md 提供專案簡介、連結及 AI 擴充方式。

## 本機驗收

- `node scripts/build.mjs --check`：PASS。
- `node scripts/test.mjs`：PASS，11 款調酒、17 項材料、4 篇故事；加入材料誤連結回歸檢查。
- 只有 relations 修改後重新生成 `data/catalog.js`；最初 catalog 同步檢查原本即通過。
- Playwright／Google Chrome：1440×1000、390×844，HTTP `/after-hours/` 子路徑。
- 搜尋、基酒／風味、收藏與 reload 保存、1／2／4 杯、故事與章節鍵盤操作、相關酒款、材料百科、桌面與手機選單、Escape、無水平溢出、實際 Sticky、Hero 差速、reduced motion 全部 PASS。
- 11 張卡片油畫、11 個酒譜詳情、4 篇故事主圖成功載入；Gin Fizz currentSrc 正確、1024×768、無可見 SVG 覆蓋。共 38 筆圖片證據。
- 17 項材料頁均正常，Spritz／Daiquiri／Cosmopolitan 連結修正已實測。
- 正常流程未出現 pageerror、Console Error 或站內 HTTP 4xx/5xx。刻意攔截失敗請求的容錯測試獨立進行，卡片／詳情降級和恢復均 PASS。
- 證據與截圖在 `qa/final-local/`；實測工具為 Chrome 手機尺寸模擬，非真機 Safari。

## 作業要求對照

根目錄 AGENTS.md 定義專案目的、風格、路由、檔案命名／目錄、JSON schema、內容新增步驟、油畫驗收、動畫、手機操作、Git 安全、建置測試與發布。README 提供簡介與使用方式，SUBMISSION_TEMPLATE.md 解釋 AI 如何依規範產生新資料並沿用共用模板，無須依賴過去聊天紀錄。

## 安全回復

不影響現在版本地查看修改前：`git worktree add ../after-hours-before-final backup/final-audit-start`。先確認目錄未被使用；不要刪除既有資料夾。正式撤回修正時先保存後續工作，以 `git revert <修正commit>` 建立反向提交，不使用 reset --hard、clean 或 force push。

## 發布結果

正式網址及測試結果於部署後補記；尚未確認的部署不計為通過。
