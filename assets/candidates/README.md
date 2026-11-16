# Hero amber v2

使用內建 imagegen 生成，使用者在本次對話確認「採用這張候選圖」後，以 sips 轉 JPEG（品質 84）整合至 `assets/hero-banner.jpg`。PNG 保留生成原件。原 Hero 在修改前 commit `b7df045` 完整保留。

工具：內建 imagegen；非 CLI、非照片濾鏡或 SVG 轉換。美術檢查：厚塗筆觸、暖色反射、酒吧景深、左側平靜的中間調留白，右側杯組。桌面／手機整合畫面請見 `qa/hero-*.png`。

完整生成 Prompt：

```text
Use case: stylized-concept. Asset type: AFTER HOURS website hero candidate, wide landscape 16:9. Traditional hand-painted oil painting, thick impasto, visible loaded brush strokes, rich pigment, gallery-quality atmospheric vintage cocktail bar. An inviting amber-lit bar at dusk, natural warm reflected light distributed across the entire canvas including the LEFT half: softly glowing ochre plaster, wood grain, bottle shelves with diffuse reflections on the left, subtle depth through an archway in middle, brass lamp and three beautifully painted cocktail glasses on the lower right wooden counter. Left upper 40 percent should have quiet MID-TONE ochre/umber painted detail suitable for cream headline overlay, NOT a black empty wall. Gentle value hierarchy, restrained highlights, tactile pigment and artistic composition rather than product photography. Keep glass subjects within right-center safe area for responsive framing, full setting meaningful edge to edge. No train, no neon, no text, no watermark, no vector, no CGI, no photorealistic advertising. This is a new candidate composition, not an edit of an existing image.
```
