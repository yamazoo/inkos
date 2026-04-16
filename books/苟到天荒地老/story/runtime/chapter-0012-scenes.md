```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "镇外废弃地窖入口",
      "sceneType": "revelation",
      "event": "四方角帽观察者现身地窖入口，注视藏身点后消失在夜色中",
      "protagonistReaction": "主角屏息，透过缝隙观察，心跳如擂鼓",
      "keyDialogue": {
        "speaker": "四方角帽观察者",
        "line": "「……在那里。」",
        "protagonistResponse": "主角无声地后退一步，握紧手中金丝缠",
        "dramaticMeaning": "第四势力锁定主角位置，悬念升级"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow",
        "technique": ["long-sentences", "sensory-detail", "suspense-pause"],
        "mood": "暗流·凝视",
        "wordCountTarget": 400
      },
      "factionActivity": [
        {
          "faction": "第四势力（四方角帽）",
          "action": "观察者确认主角藏身点位置后离去",
          "powerDelta": "+1（信息优势）"
        }
      ],
      "hooksTouched": ["H001"],
      "transitionToNext": "主角确认观察者离去后决定继续深入地窖搜索线索"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "地窖深处暗格区域",
      "sceneType": "discovery",
      "event": "主角翻找暗格，发现林师兄实验痕迹——记录残页与特殊器具",
      "protagonistReaction": "主角手指颤抖，辨认出熟悉的笔迹，心绪复杂",
      "keyDialogue": {
        "speaker": "主角",
        "line": "「这是……师兄的字迹。」",
        "protagonistResponse": "翻阅残页，主角瞳孔骤缩",
        "dramaticMeaning": "伏笔回收：林师兄实验线索浮出水面，指向更深的阴谋"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "measured",
        "technique": ["detail-focus", "revelation-beat", "interior-monologue"],
        "mood": "震惊·困惑",
        "wordCountTarget": 550
      },
      "factionActivity": [],
      "hooksTouched": ["H002", "H003"],
      "transitionToNext": "主角刚收起残页，地窖外传来脚步声——周平手下发现了异常"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "地窖通道转折处",
      "sceneType": "action",
      "event": "周平手下发现地窖异常进入追查，主角被迫躲避并转移",
      "protagonistReaction": "主角压低身形，借阴影掩护移动，呼吸刻意放轻",
      "keyDialogue": {
        "speaker": "周平手下",
        "line": "「地窖里有动静！分头搜！」",
        "protagonistResponse": "主角无声后退，手中金丝缠缠上腕间",
        "dramaticMeaning": "本地势力介入调查，主角陷入腹背受敌的局面"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "action-verbs", "environmental-sound"],
        "mood": "紧张·压迫",
        "wordCountTarget": 450
      },
      "factionActivity": [
        {
          "faction": "周平势力",
          "action": "手下进入地窖搜索，发现异常痕迹",
          "powerDelta": "+1（调查意愿激活）"
        }
      ],
      "hooksTouched": [],
      "transitionToNext": "主角被迫向地窖更深处撤退，恰好进入幽冥聚集区域"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "地窖最深处——幽冥聚集区",
      "sceneType": "action",
      "event": "主角闯入未知区域，黑暗中无数幽冥眼睛逐一亮起，锁定主角",
      "protagonistReaction": "主角血液冰凉，本能地后退却发现退路已被封堵",
      "keyDialogue": {
        "speaker": "幽冥（群体）",
        "line": "无声的凝视汇聚成实质压力",
        "protagonistResponse": "主角将残纸攥在胸前，试图激发护身之力",
        "dramaticMeaning": "主角被困绝境，代价一兑现：幽冥锁定"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "intense",
        "technique": ["rapid-switching", "accumulating-detail", "sensory-overload"],
        "mood": "恐怖·绝望",
        "wordCountTarget": 600
      },
      "factionActivity": [
        {
          "faction": "幽冥",
          "action": "大量幽冥苏醒，眼睛亮起锁定入侵者",
          "powerDelta": "+2（威胁等级急剧上升）"
        }
      ],
      "hooksTouched": ["H004"],
      "transitionToNext": "主角被围困，残纸突然发出微光，与腕间金丝缠产生共鸣"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "地窖最深处——幽冥聚集区核心",
      "sceneType": "revelation",
      "event": "残纸与金丝缠产生共振，释放力量驱退幽冥，同时揭示关键信息",
      "protagonistReaction": "主角感到腕间灼热与胸前温暖同时爆发，痛苦中夹杂顿悟",
      "keyDialogue": {
        "speaker": "主角（内心）",
        "line": "「原来……从一开始就是陷阱。」",
        "protagonistResponse": "金丝缠与残纸的光芒交织，幽冥退避，主角却发现更可怕的真相",
        "dramaticMeaning": "多线伏笔回收：幽冥气息外渗确认，指向更大的布局"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "explosive-then-silence",
        "technique": ["light-dark-contrast", "epiphany-moment", "cliffhanger"],
        "mood": "震撼·警觉",
        "wordCountTarget": 550
      },
      "factionActivity": [
        {
          "faction": "幽冥",
          "action": "被共振力量短暂驱退，但气息已开始外渗",
          "powerDelta": "-1（暂时受制）/ +3（气息外渗确认）"
        },
        {
          "faction": "第四势力（四方角帽）",
          "action": "在地窖外感知到幽冥气息外渗",
          "powerDelta": "+2（情报价值提升）"
        }
      ],
      "hooksTouched": ["H002", "H003", "H005"],
      "transitionToNext": "主角借力突围，却发现地窖出口已被四方角帽观察者封锁"
    }
  ],
  "scenePlanSummary": {
    "totalScenes": 5,
    "totalWordCountTarget": 2550,
    "beatDistribution": {
      "B1": { "scenes": 1, "wordCount": 400, "type": "悬念引入" },
      "B2": { "scenes": 2, "wordCount": 1000, "type": "局势升级" },
      "B3": { "scenes": 2, "wordCount": 1150, "type": "冲突爆发" }
    },
    "payoffHooks": ["H001（四方角帽观察者）", "H002（林师兄实验痕迹）", "H003（金丝缠与残纸）", "H004（幽冥聚集）", "H005（幽冥气息外渗）"],
    "costGainSummary": {
      "B2": { "cost": "被周平手下发现异常→追逃", "gain": "发现林师兄实验痕迹" },
      "B3": { "cost": "地窖深处大量幽冥眼睛亮起/主角被锁定", "gain": "伏笔共振真相揭示" }
    },
    "cliffhanger": "地窖出口处，四方角帽观察者再次出现，意味深长地望向从幽冥包围中突围的主角——「我们等你很久了。」"
  }
}
```

**场景规划说明：**

1. **B1-1（悬念引入）**：以四方角帽观察者的出现建立第四势力的威胁感，以「在那里」的判定性台词制造悬念，为后续回收埋线。

2. **B2-1（局势升级·发现线）**：深入地窖搜索，发现林师兄实验痕迹（伏笔回收），通过笔迹辨认和残页内容揭示阴谋深度。

3. **B2-2（局势升级·追逃线）**：周平手下介入，主角被迫深入，产生腹背受敌的压迫感，承接「代价」设定。

4. **B3-1（冲突爆发·代价一）**：幽冥眼睛逐一亮起的渐进式恐怖描写，主角被困绝境，节奏急促。

5. **B3-2（冲突爆发·高潮）**：金丝缠与残纸共振，驱退幽冥的同时揭示更可怕的真相——主角发现自己从一开始就是被引导入局的棋子。幽冥气息外渗被确认，危机升级的同时完成伏笔回收。

**字数分布**：总计约2550字，位于2400-3900字范围内，契合目标字数。