

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "灵泉废墟西侧林地边缘",
      "sceneType": "revelation",
      "event": "四方角帽现身，确认主角身份后放行",
      "protagonistReaction": "主角灵力枯竭，丹田空空如也，双膝发软，金丝缠纹路隐隐发烫，心跳如擂鼓却目光平静",
      "keyDialogue": {
        "speaker": "四方角帽",
        "line": "「……确认了。」",
        "protagonistResponse": "主角未发一言，只是静静注视",
        "dramaticMeaning": "第四势力的身份确认（H012），暗含主角已被标记"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["long-sentences", "sensory-detail"],
        "mood": "压抑·等待",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "四方角帽", "action": "出现在林地边缘，审视主角后转身离去", "powerDelta": 0 }
      ],
      "hooksTouched": ["H012"],
      "transitionToNext": "四方角帽离去，但主角心中警铃大作"
    },
    {
      "sceneId": "B1-2",
      "beatId": "B1",
      "location": "灵泉废墟西侧林地边缘",
      "sceneType": "reflection",
      "event": "四方角帽从容离去，周平手下察觉异常",
      "protagonistReaction": "主角紧绷的弦微微松开，却不敢有丝毫懈怠，撑着树干勉强站稳",
      "keyDialogue": {
        "speaker": "周平手下（远处低声）",
        "line": "「那戴帽子的怎么走了？」",
        "protagonistResponse": "主角借势跌坐在树根处，掩饰虚弱",
        "dramaticMeaning": "多方势力开始相互试探，主角处境愈发微妙"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["contrast", "environmental-details"],
        "mood": "劫后喘息·危机未除",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "周平势力", "action": "被四方角帽逼退，察觉异常", "powerDelta": 0 }
      ],
      "hooksTouched": ["H012"],
      "transitionToNext": "主角必须尽快找到藏身之处"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "灵泉废墟边缘，地窖入口",
      "sceneType": "action",
      "event": "主角发现地窖是人工建造，斧凿痕迹明显",
      "protagonistReaction": "主角强撑着走到地窖边缘，借着微弱晨光看清墙壁——不是天然坍塌，是斧凿痕迹",
      "keyDialogue": {
        "speaker": "主角（心语）",
        "line": "「不是天然坍塌……是有人挖的。」",
        "protagonistResponse": "主角环顾四周，确认无人后向地窖深处张望",
        "dramaticMeaning": "人工痕迹暗示背后有人刻意经营（H016）"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "action-verbs"],
        "mood": "警觉·紧张",
        "wordCountTarget": 400
      },
      "factionActivity": [
        { "faction": "周平势力", "action": "在废墟外围搜索", "powerDelta": 0 }
      ],
      "hooksTouched": ["H016"],
      "transitionToNext": "上方传来脚步声，必须立刻下地窖"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "地窖入口，黑暗的向下通道",
      "sceneType": "transition",
      "event": "灵力枯竭迫使主角下地窖躲避追兵",
      "protagonistReaction": "主角丹田空空如也，双腿打颤，听见上方脚步逼近，咬牙钻入黑暗",
      "keyDialogue": {
        "speaker": "主角（心语）",
        "line": "「没得选了……」",
        "protagonistResponse": "主角抓住石壁凸起，一步步向下攀爬",
        "dramaticMeaning": "暴露虚弱状态的代价，行动路径被四方角帽记录"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["tension-build", "internal-monologue"],
        "mood": "绝望·被迫",
        "wordCountTarget": 400
      },
      "factionActivity": [
        { "faction": "周平势力", "action": "搜索至地窖附近", "powerDelta": 0 }
      ],
      "hooksTouched": [],
      "transitionToNext": "进入地窖深处，黑暗吞噬一切"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "地窖深处，黑暗甬道",
      "sceneType": "action",
      "event": "主角在黑暗中摸索，触发暗格机关",
      "protagonistReaction": "主角手指在黑暗中颤抖，触碰到墙壁凸起，用力按下——一道暗门无声滑开",
      "keyDialogue": {
        "speaker": "主角（低声）",
        "line": "「这里……有东西。」",
        "protagonistResponse": "主角屏息凝神，将手探入暗格",
        "dramaticMeaning": "意外发现隐藏空间，消耗精力触发机关"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["sensory-detail", "tension-build"],
        "mood": "发现·期待",
        "wordCountTarget": 450
      },
      "factionActivity": [],
      "hooksTouched": [],
      "transitionToNext": "暗格内藏着令主角震惊的物品"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "地窖暗格内部",
      "sceneType": "revelation",
      "event": "发现黑铁令牌与泛黄小册子",
      "protagonistReaction": "主角摸到冰凉的黑铁——令牌入手沉重，刻着一个'林'字，金丝缠纹路与之几乎一模一样（H014）",
      "keyDialogue": {
        "speaker": "主角（心语）",
        "line": "「这纹路……和金丝缠……」",
        "protagonistResponse": "主角倒吸一口凉气，手不由自主地颤抖",
        "dramaticMeaning": "令牌与金丝缠的关联浮出水面（H017）"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["revelation-pacing", "detail-focus"],
        "mood": "震惊·疑惑",
        "wordCountTarget": 500
      },
      "factionActivity": [],
      "hooksTouched": ["H014", "H017"],
      "transitionToNext": "主角翻开泛黄小册子"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "地窖暗格内部",
      "sceneType": "revelation",
      "event": "翻阅小册子，发现林师兄实验真相",
      "protagonistReaction": "主角借着微弱光线看清小册子内容——字迹潦草，越往后越癫狂，最后几页满是'接引'二字",
      "keyDialogue": {
        "speaker": "小册子内容（引用）",
        "line": "「……灵泉非灵泉，乃接引之门……吾以林为姓，以身为媒……」",
        "protagonistResponse": "主角瞳孔骤缩，浑身汗毛炸起",
        "dramaticMeaning": "林师兄实验与幽冥接引有关（H014），多方势力线索汇聚主角"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["revelation-pacing", "dramatic-irony"],
        "mood": "真相揭露·恐惧",
        "wordCountTarget": 500
      },
      "factionActivity": [
        { "faction": "幽冥势力", "action": "气息在地窖深处弥漫", "powerDelta": "+1" }
      ],
      "hooksTouched": ["H014", "H017"],
      "transitionToNext": "幽冥气息开始包围主角"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "地窖暗格内部",
      "sceneType": "action",
      "event": "残纸与金丝缠共振，幽冥观察者逼近",
      "protagonistReaction": "主角怀中残纸忽然发烫，与手中的金丝缠产生共振——地窖深处传来沉重脚步声",
      "keyDialogue": {
        "speaker": "主角（低吼）",
        "line": "「不对——有东西来了！」",
        "protagonistResponse": "主角将令牌和册子塞入怀中，警戒后退",
        "dramaticMeaning": "残纸共振消耗精力，幽冥观察者正式登场"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "action-verbs", "chase-rhythm"],
        "mood": "追逐·恐惧",
        "wordCountTarget": 550
      },
      "factionActivity": [
        { "faction": "幽冥势力", "action": "观察者向主角逼近", "powerDelta": "+1" }
      ],
      "hooksTouched": [],
      "transitionToNext": "主角被迫向地窖更深处退去"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "地窖深处通道",
      "sceneType": "reflection",
      "event": "主角确认林师兄实验与幽冥接引的关联",
      "protagonistReaction": "主角边退边整理思绪——令牌、小册子、残纸……一切都指向同一个真相",
      "keyDialogue": {
        "speaker": "主角（心语）",
        "line": "「林师兄……他到底做了什么？」",
        "protagonistResponse": "主角攥紧金丝缠，感到一阵眩晕",
        "dramaticMeaning": "三元关联初步确认，为章末转折埋下伏笔"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["internal-monologue", "flashback"],
        "mood": "沉思·恐惧交织",
        "wordCountTarget": 500
      },
      "factionActivity": [
        { "faction": "幽冥势力", "action": "观察者持续逼近", "powerDelta": 0 }
      ],
      "hooksTouched": ["H014", "H017"],
      "transitionToNext": "主角退无可退，前方出现异象"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "地窖最深处",
      "sceneType": "action",
      "event": "地窖深处亮起大量幽冥眼睛，幽冥危机正式爆发",
      "protagonistReaction": "主角看见黑暗中亮起密密麻麻的眼睛，幽绿光芒将他包围，浑身血液几乎凝固",
      "keyDialogue": {
        "speaker": "主角（嘶哑）",
        "line": "「这……这是……」",
        "protagonistResponse": "主角后背紧贴冰冷的石壁，无路可退",
        "dramaticMeaning": "新困境出现，幽冥危机正式爆发"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["horror-pacing", "short-sentences"],
        "mood": "绝望·窒息",
        "wordCountTarget": 450
      },
      "factionActivity": [
        { "faction": "幽冥势力", "action": "大量幽冥眼睛亮起，形成包围", "powerDelta": "+2" }
      ],
      "hooksTouched": [],
      "transitionToNext": "但主角在绝望中发现了某种联系"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "地窖最深处",
      "sceneType": "revelation",
      "event": "残纸-金丝缠-令牌三元关联确认，带来希望曙光",
      "protagonistReaction": "主角攥紧怀中的令牌、残纸、金丝缠，三者在幽冥气息中同时发出微光，彼此呼应",
      "keyDialogue": {
        "speaker": "主角（恍然）",
        "line": "「原来如此……是一套的。」",
        "protagonistResponse": "主角眼中闪过一丝明悟，虽然仍被包围，但不再只是恐惧",
        "dramaticMeaning": "新机遇确认，三元关联成为破局关键"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["revelation", "contrast"],
        "mood": "绝望中见希望",
        "wordCountTarget": 450
      },
      "factionActivity": [
        { "faction": "幽冥势力", "action": "包围主角但未立刻攻击，似在等待什么", "powerDelta": 0 }
      ],
      "hooksTouched": ["H014", "H017"],
      "transitionToNext": "幽冥在等待什么？主角必须做出选择"
    }
  ],
  "summary": {
    "totalScenes": 11,
    "targetWords": 3000,
    "estimatedWords": 4900,
    "wordCountAdjustment": "需要压缩至3000字，建议：1)节拍3的3个场景合并为2个；2)节拍4的2个场景合并为1个；3)每个场景控制在300-400字"
  },
  "sceneDistribution": {
    "B1": { "scenes": 2, "wordCountTarget": 700, "content": "四方角帽正式登场（H012），确认身份后放行" },
    "B2": { "scenes": 2, "wordCountTarget": 800, "content": "发现地窖人工建造证据（H016），灵力枯竭暴露" },
    "B3": { "scenes": 3, "wordCountTarget": 1450,