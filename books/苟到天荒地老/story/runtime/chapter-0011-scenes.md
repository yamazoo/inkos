
# 第11章 ScenePlan

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "地窖·黑暗深处",
      "sceneType": "reflection",
      "event": "感官承接上章悬念，金丝缠异常滚烫，深处幽暗眼睛注视",
      "protagonistReaction": "主角屏息凝神，心跳如擂鼓，试图平复呼吸",
      "keyDialogue": { "speaker": "主角内心", "line": "「这个选择，将决定他的生死——上章那句话，是什么意思？」", "protagonistResponse": "他咬紧牙关，将后背抵在冰冷的石壁上", "dramaticMeaning": "承接悬念，延续上章钩子" },
      "povCharacter": "主角",
      "pacing": { "speed": "slow", "technique": ["sensory-details", "inner-monologue"], "mood": "压抑·未知恐惧", "wordCountTarget": 380 },
      "factionActivity": [{ "faction": "幽冥势力", "action": "地窖深处眼睛注视主角藏身方向", "powerDelta": 0 }],
      "hooksTouched": ["H019"],
      "transitionToNext": "主角试图稳定心神，转而检查随身物品"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "地窖·黑暗角落",
      "sceneType": "revelation",
      "event": "主角检查随身物品，发现黑铁令牌纹路与金丝缠相同",
      "protagonistReaction": "主角屏息凝视，瞳孔骤缩，手指微颤",
      "keyDialogue": { "speaker": "主角内心", "line": "「这纹路……和金丝缠一模一样。」", "protagonistResponse": "他下意识攥紧令牌，残纸处传来一阵微弱的力量涌动", "dramaticMeaning": "重大伏笔回收（H017），两物关联暗示" },
      "povCharacter": "主角",
      "pacing": { "speed": "medium", "technique": ["contrast", "suspense-building"], "mood": "震惊·疑惑", "wordCountTarget": 350 },
      "factionActivity": [{ "faction": "第四势力", "action": "在暗处观察主角的一举一动", "powerDelta": "未知" }],
      "hooksTouched": ["H017"],
      "transitionToNext": "主角继续摸索，发现暗格中的人工建造痕迹"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "地窖·暗格处",
      "sceneType": "revelation",
      "event": "发现人工暗格，取出小册子\"林记\"，翻到\"第七次实验\"",
      "protagonistReaction": "主角心跳骤然加速，指尖触及暗格边缘时一阵寒意袭来",
      "keyDialogue": { "speaker": "主角内心", "line": "「林记……第七次实验……纹路转移？」", "protagonistResponse": "他屏住呼吸，指尖发凉，意识到这与林师兄的过往有关", "dramaticMeaning": "伏笔深化，\"林记\"人物/场景正式入场" },
      "povCharacter": "主角",
      "pacing": { "speed": "slow", "technique": ["tension-escalation", "discovery-moment"], "mood": "紧张·期待揭示", "wordCountTarget": 400 },
      "factionActivity": [{ "faction": "第四势力", "action": "继续在暗处观察，等待时机", "powerDelta": 0 }],
      "hooksTouched": ["H016"],
      "transitionToNext": "主角翻开小册子，阅读\"经脉走向与幽冥接引\"的内容"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "地窖·暗格旁",
      "sceneType": "revelation",
      "event": "主角阅读小册子内容，\"经脉走向与幽冥接引\"令金丝缠剧烈反应",
      "protagonistReaction": "主角倒吸一口凉气，手腕处传来撕裂般的灼痛",
      "keyDialogue": { "speaker": "主角内心", "line": "「经脉走向……幽冥接引……这不是普通的功法！」", "protagonistResponse": "他死死咬住下唇，试图用意志压制金丝缠的暴走", "dramaticMeaning": "核心秘密初露端倪，冲突触发" },
      "povCharacter": "主角",
      "pacing": { "speed": "urgent", "technique": ["escalating-tension", "physical-reaction"], "mood": "惊骇·痛苦", "wordCountTarget": 350 },
      "factionActivity": [{ "faction": "幽冥势力", "action": "感知到金丝缠的异常波动", "powerDelta": "+10" }],
      "hooksTouched": [],
      "transitionToNext": "金丝缠失控加剧，地窖深处传来异响"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "地窖·更深处",
      "sceneType": "action",
      "event": "地窖深处眼睛骤然亮起，幽冥存在逼近主角",
      "protagonistReaction": "主角瞳孔剧震，双腿如灌铅，肾上腺素飙升",
      "keyDialogue": { "speaker": "幽冥存在", "line": "（无声威压直逼主角心神）", "protagonistResponse": "他牙关紧咬，拼命将小册子塞入怀中", "dramaticMeaning": "幽冥势力正式登场，冲突白热化" },
      "povCharacter": "主角",
      "pacing": { "speed": "very-urgent", "technique": ["short-sentences", "action-verbs", "fear-paralysis"], "mood": "恐怖·濒死边缘", "wordCountTarget": 300 },
      "factionActivity": [
        { "faction": "幽冥势力", "action": "眼睛亮起，向主角逼近", "powerDelta": "+20" },
        { "faction": "主角", "action": "金丝缠失控，身体开始排斥", "powerDelta": "-15" }
      ],
      "hooksTouched": [],
      "transitionToNext": "主角不顾一切地逃跑"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "地窖深处至通道",
      "sceneType": "action",
      "event": "连锁反应爆发，主角强行压制金丝缠，撕裂般痛苦中逃跑",
      "protagonistReaction": "主角额头青筋暴起，一口咬破舌尖，以痛止痛",
      "keyDialogue": { "speaker": "主角内心", "line": "「不能死在这里！林师兄的仇还没报！」", "protagonistResponse": "他踉跄着向反方向冲去，鲜血顺着嘴角淌下", "dramaticMeaning": "代价触发，复仇信念支撑主角逃生" },
      "povCharacter": "主角",
      "pacing": { "speed": "urgent", "technique": ["pain描述", "desperate-action"], "mood": "决绝·痛苦", "wordCountTarget": 280 },
      "factionActivity": [
        { "faction": "幽冥势力", "action": "紧追不舍", "powerDelta": 0 },
        { "faction": "主角", "action": "身体排斥加剧，体力急剧下降", "powerDelta": "-25" }
      ],
      "hooksTouched": [],
      "transitionToNext": "主角看到前方光亮，拼尽全力冲刺"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "地窖通道",
      "sceneType": "action",
      "event": "幽冥眼睛逼近，主角拼死逃跑",
      "protagonistReaction": "主角跌跌撞撞但目光锁定光亮处，誓要活着离开",
      "keyDialogue": { "speaker": "主角", "line": "「滚开！」", "protagonistResponse": "他用尽全力撞向挡在前方的一根木梁", "dramaticMeaning": "小高潮动作戏，逃生决心" },
      "povCharacter": "主角",
      "pacing": { "speed": "very-urgent", "technique": ["chase-scene", "physical-struggle"], "mood": "紧张·窒息感", "wordCountTarget": 380 },
      "factionActivity": [{ "faction": "幽冥势力", "action": "被主角甩开一段距离", "powerDelta": "-5" }],
      "hooksTouched": [],
      "transitionToNext": "主角冲出地窖，逃出生天"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "地窖出口",
      "sceneType": "reflection",
      "event": "脱险后回望地窖，确认人工建造痕迹，得知金丝缠来源",
      "protagonistReaction": "主角扶着墙壁喘息，回望黑暗时眼中闪过复杂神色",
      "keyDialogue": { "speaker": "主角内心", "line": "「原来如此……这就是金丝缠的来历。三十年前的实验……」", "protagonistResponse": "他攥紧手中的令牌与小册子残页", "dramaticMeaning": "代价与收获并置：真相揭示，复仇成功，宝物到手" },
      "povCharacter": "主角",
      "pacing": { "speed": "slow", "technique": ["retrospective", "closure-moment"], "mood": "释然·沉重", "wordCountTarget": 420 },
      "factionActivity": [
        { "faction": "幽冥势力", "action": "退回地窖深处", "powerDelta": 0 },
        { "faction": "主角", "action": "获得令牌与小册子残页", "powerDelta": "+30" }
      ],
      "hooksTouched": [],
      "transitionToNext": "主角整理思绪，准备离开，却发现周平的手下"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "地窖外·黄昏阴影处",
      "sceneType": "transition",
      "event": "逃出地窖后与周平手下视线交汇，四方角帽去向不明",
      "protagonistReaction": "主角脚步一顿，心头警铃大作，强迫自己镇定",
      "keyDialogue": { "speaker": "周平手下", "line": "（沉默对视，目光中带着审视）", "protagonistResponse": "他微微颔首，装作若无其事地点头致意", "dramaticMeaning": "新困境生成，势力格局真空待填补" },
      "povCharacter": "主角",
      "pacing": { "speed": "medium", "technique": ["standoff", "new-threat"], "mood": "警觉·危机感", "wordCountTarget": 420 },
      "factionActivity": [
        { "faction": "周平势力", "action": "手下确认主角异常，重新评估", "powerDelta": "+5" },
        { "faction": "第四势力", "action": "继续潜伏，意图不明", "powerDelta": "未知" }
      ],
      "hooksTouched": [],
      "transitionToNext": "主角若无其事离开，但知道危机刚刚开始"
    }
  ],
  "summary": {
    "totalScenes": 9,
    "totalWordCount": 3280,
    "beatDistribution": {
      "B1": { "scenes": 1, "words": 380, "percentage": "12%" },
      "B2": { "scenes": 2, "words": 750, "percentage": "23%" },
      "B3": { "scenes": 3, "words": 930, "percentage": "28%" },
      "B4": { "scenes": 2, "words": 800, "percentage": "24%" },
      "B5": { "scenes": 1, "words": 420, "percentage": "13%" }
    },
    "sceneTypeBreakdown": {
      "reflection": 2,
      "revelation": 3,
      "action": 3,
      "transition": 1
    },
    "hooksResolved": ["H019", "H017", "H016"],
    "costGainAnalysis": {
      "B4": {
        "cost": "金丝缠失控导致身体排斥，体力大幅下降；林师兄三十年前实验真相揭示（情感代价）",
        "gain": "复仇成功（得知金丝缠来源）/ 真相大白（实验内容）/ 宝物到手（令牌、小册子残页）"
      },
      "B5": {
        "cost": "新困境：周平手下确认主角异常，第四势力意图不明