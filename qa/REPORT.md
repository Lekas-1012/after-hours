# AFTER HOURS 視覺修復與驗收

## 專案與版本

- 實際維護目錄：`/Users/lekas/VScode/after-hours`。原聊天工作目錄 pineball 是另一個 Python 專案，未修改。
- 檢查時尚無 Git repository；已初始化。`.gitignore` 排除系統暫存、依賴、環境變數、私鑰與測試暫存。已備份完整內容、程式、規範與 12 張正式圖片，沒有刪除原資料。
- 修改前：`b7df045`（`backup: before hero and image consistency fixes`）。修正分支：`fix/hero-and-cocktail-images`；修正 commit 可用 `git log -1 --oneline` 查詢。本次不建立遠端或推送。

## Gin Fizz：證據與可確認的原因

修改前 HTTP /after-hours/ 子路徑的 Playwright 實測，列表與詳情皆為 `assets/cocktails/gin-fizz.jpg`，`complete=true`，1024×768，列表沒有 SVG。證據：`before-gin-card.png`、`before-gin-detail.png`。因此**未重現使用者原先看到的 SVG，無法把歷史觸發原因認定為快取、路徑或圖片損壞**。

程式碼可確認的缺陷是：卡片 error handler 以 `image.parentElement.outerHTML = svgArt(...)` 刪除原圖片與容器，一旦發生載入失敗，該元件無法在後續成功載入時恢復；詳情卻另有 inline onerror，行為不一致。這可解釋一次失敗後持續顯示 SVG 的機制，但不是先前網路失敗的證據。

修正以共用 `cocktailImage()` 與 `cocktailImgSrc()` 管理卡片、搜尋、篩選、收藏、相關酒款、詳情、精選和故事圖片。error 只切換 hidden，保留原圖節點；load 隱藏 fallback 並恢復油畫。真正缺圖仍提供 SVG，正常圖片無可見 SVG 覆蓋。沒有替換 Gin Fizz 原圖。

另發現 Downloads 中有同名舊副本，缺少 assets；它不是本次測試來源，不能據此斷定使用者先前開啟哪一版。正式站若仍有問題，需要檢查該站實際部署版本及失敗請求，不以本機成功代替線上診斷。

## Hero：原因與修正

原圖 1376×768 的左側原本就是深色牆面，亮點集中於右側酒杯與燈，疊加亮度濾鏡、橫向漸層及底部 22% 遮罩後失衡加重。640px 置中的文案也侵入酒杯，直向手機 cover 則丟失大部分畫作。

使用內建 imagegen 生成琥珀色中間調牆面、酒吧拱門景深、右側杯組的新構圖；使用者確認「採用這張候選圖」後才正式替換。生成原件和完整 Prompt 在 `assets/candidates/`。正式 JPEG 1672×941，約 661 KiB，保留厚塗與暖光。

桌面比例接近橫向原圖、文案置左；取消全幅濾鏡和橫向暗罩，只保留局部 radial 遮罩、文字陰影及底端 8% 過渡。標題改奶油白確保對比；手機依使用者後續指示，也讓文案疊在全高油畫背景上；獨立設定 64% 裁切焦點、下方漸層保護文案，保持文字不隨捲動淡出。原 Hero 在 Git 備份中完整保留。

視差 tokens 未更動；250px 捲動時桌面背景 +12.5px、文案 −25px，手機 +8.75px／−17.5px。背景延伸邊界涵蓋既有最大位移。reduced motion 停止 transform 與淡出，保持文字可讀。

## 規範與修改清單

- `.gitignore`：修改前備份時新增安全忽略規則。
- `app.js`：共用圖片模板及非破壞式 load/error fallback。
- `styles.css`：Hero 比例、排版、局部遮罩、手機構圖、hidden 與 reduced-motion 規則。
- `assets/hero-banner.jpg`：經確認的新 Hero；`assets/candidates/hero-amber-v2.png` 及 README：原件、工具及完整 Prompt。
- `AGENTS.md`：整理重複圖片章節，拆分 Style Reference 與 Cocktail Subject；建立場景多樣化、酒款真實性、技術與美術驗收、共用圖片、Hero、Git 備份及安全恢復規範。
- `README.md`：更新 11 款酒與故事介紹、正確專案位置及瀏覽器測試操作。
- `scripts/browser-test.mjs`：可重跑的 Playwright 功能、圖片、缺圖恢復及截圖驗收。
- `qa/`：前後截圖、瀏覽器機器可讀結果與本報告。
- 酒譜、百科、故事、relations、catalog 及其他 11 張酒款油畫未修改。

## 驗收

- `node scripts/build.mjs --check`：PASS，11 款酒譜且 catalog 同步。
- `node scripts/test.mjs`：PASS，11 款酒譜、17 項材料、4 篇故事。
- Playwright + Google Chrome，桌面 1440×1000、手機 390×844，使用 `/after-hours/` 子路徑驗證相對資源。
- 搜尋、基酒／風味篩選、收藏與 reload 保存、1／2／4 杯（Gin Fizz 琴酒 45／90／180 ml）、故事館、章節鍵盤 focus、材料連結、相關酒款跳轉、桌面導覽及手機開關／Enter／Escape／選單連結關閉：PASS。
- 首頁、收藏、酒譜、故事索引／閱讀、材料索引／詳情、入門、關於頁無水平溢出，沒有 JavaScript pageerror。
- 所有 11 張酒款圖片成功 decode；搜尋／篩選／收藏／詳情／推薦圖片的 currentSrc、complete、naturalWidth／Height 與 SVG 可見性通過。共 23 筆圖片證據在 `browser-report.json`。
- 實際攔截圖片請求造成失敗，再恢復同一節點載入：卡片／詳情 fallback 與恢復 PASS。
- 桌面 story-stage sticky、章節切換、桌面與手機 Hero 差速、reduced motion：PASS。
- 截圖關閉有限進場動畫以取得穩定畫面；互動測試保留正常動態。

截圖：`hero-desktop.png`、`hero-mobile.png`、`collection-desktop.png`、`gin-card-desktop.png`、`gin-card-mobile.png`、`gin-detail-desktop.png`、`gin-detail-mobile.png`。已人工檢視 Hero 與 Gin Fizz 截圖；新 Hero 左側暖色筆觸清楚、酒杯不被標題壓住、手機文字與圖片同區呈現。

限制：未驗證實際 GitHub Pages 部署、真機 Safari 或每一種視窗比例；原先使用者看到的 SVG 觸發條件仍未重現。新 Hero 素材已獲確認，整合後的最終審美仍可由使用者依交付截圖確認。

## 安全恢復

先 `git status` 檢查，將後續使用者修改另行 commit 或保存，勿直接覆蓋。

只想查看／執行修改前版本（保留目前工作區）：

```sh
cd /Users/lekas/VScode/after-hours
git worktree add ../after-hours-before b7df045
```

若目錄已存在，選新的目錄名稱，不刪除它。這會在另一個資料夾提供完整舊版，包括原 Hero。

需要在現有分支正式撤銷本次修正時，先保存後續修改，以 `git log --oneline` 找到 `fix: balance hero composition and unify cocktail image recovery` 的 commit，執行 `git revert <該修正commit>`；如有衝突，保留資料、逐項解決後再提交。不使用 reset --hard、clean 或 force push。

## 後續修正：文字與圖片保持一起

依使用者回饋，取消 820px 以下圖片在上、文字在下的安排，所有尺寸都使用 Hero 全幅背景加文字疊放。桌面維持原配置；手機保留較小視差與 reduced-motion，並移除文字捲動淡出。修改前還原點為 `c06fdad`。已更新 `AGENTS.md`，避免未來再拆開。
