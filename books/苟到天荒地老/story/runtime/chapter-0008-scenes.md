

```json
{
  "scenePlan": {
    "chapterNumber": 8,
    "chapterType": "combat",
    "targetWordCount": 3000,
    "sceneCount": 10,
    "scenes": [
      {
        "sceneId": "B1-1",
        "beatId": "B1",
        "location": "破屋残垣",
        "sceneType": "reflection",
        "event": "陈守一灵力枯竭至极限，月光下瞥见第四势力身影",
        "protagonistReaction": "心脏狂跳却强迫呼吸放缓，掌心灵力如风中残烛",
        "keyDialogue": null,
        "povCharacter": "陈守一",
        "pacing": {
          "speed": "slow",
          "technique": ["sensory-details", "inner-monologue"],
          "mood": "绝望·警觉",
          "wordCountTarget": 280
        },
        "factionActivity": [],
        "hooksTouched": ["H012"],
        "transitionToNext": "黑影消失，主角判断必须转移"
      },
      {
        "sceneId": "B2-1",
        "beatId": "B2",
        "location": "破屋至院门通道",
        "sceneType": "action",
        "event": "主角强撑残躯潜行，灵力波动压制不稳，两方脚步声逼近",
        "protagonistReaction": "灵力如漏水的陶罐，压制越狠反噬越重，左臂隐隐刺痛",
        "keyDialogue": null,
        "povCharacter": "陈守一",
        "pacing": {
          "speed": "urgent",
          "technique": ["short-sentences", "action-verbs", "sound-imagery"],
          "mood": "紧张·压迫",
          "wordCountTarget": 350
        },
        "factionActivity": [
          { "faction": "周平手下", "action": "从王二方向逼近搜索", "powerDelta": 0 },
          { "faction": "不明势力", "action": "从另一方向隐蔽接近", "powerDelta": 0 }
        ],
        "hooksTouched": [],
        "transitionToNext": "主角确认至少两股势力在搜索自己，必须尽快脱离"
      },
      {
        "sceneId": "B3-1",
        "beatId": "B3",
        "location": "灵泉废墟边缘",
        "sceneType": "action",
        "event": "三方对峙格局形成——周平手下从左，林师兄传话者从右，第四势力堵退路",
        "protagonistReaction": "后背紧贴残墙，瞳孔收缩判断三方距离与战力",
        "keyDialogue": {
          "speaker": "周平手下",
          "line": "「周管事有请，陈药师请随我等走一趟。」",
          "protagonistResponse": "（沉默，目光扫向另外两方）",
          "dramaticMeaning": "以退为进，试探其他两方反应"
        },
        "povCharacter": "陈守一",
        "pacing": {
          "speed": "slow",
          "technique": ["dialogue-tension", "spatial-description"],
          "mood": "窒息·绝境",
          "wordCountTarget": 380
        },
        "factionActivity": [
          { "faction": "周平势力", "action": "从左侧逼近，礼貌施压", "powerDelta": 0 },
          { "faction": "林师兄势力", "action": "从右侧现身，展示信物", "powerDelta": 0 },
          { "faction": "第四势力", "action": "堵住唯一退路，沉默观察", "powerDelta": 0 }
        ],
        "hooksTouched": [],
        "transitionToNext": "林师兄传话者开口，主角残纸一角在月光下突然反光"
      },
      {
        "sceneId": "B3-2",
        "beatId": "B3",
        "location": "灵泉废墟边缘",
        "sceneType": "revelation",
        "event": "残纸反光引发短暂骚动，三方目光同时聚焦主角怀中",
        "protagonistReaction": "心跳骤停，手不由自主按住胸口，指尖触及残纸温热",
        "keyDialogue": {
          "speaker": "林师兄传话者",
          "line": "「那东西……拿出来让我们瞧瞧。」",
          "protagonistResponse": "「诸位认错人了，我不过是走方药师。」",
          "dramaticMeaning": "三方虎视眈眈，身份暴露临界"
        },
        "povCharacter": "陈守一",
        "pacing": {
          "speed": "urgent",
          "technique": ["tension-building", "repeated-rejection"],
          "mood": "危机·转机",
          "wordCountTarget": 320
        },
        "factionActivity": [
          { "faction": "周平势力", "action": "目光锁定残纸方向", "powerDelta": 0 },
          { "faction": "林师兄势力", "action": "伸手欲取信物", "powerDelta": 0 },
          { "faction": "第四势力", "action": "四方角帽微微转动，锁定主角", "powerDelta": 0 }
        ],
        "hooksTouched": ["H012", "H014"],
        "transitionToNext": "三方短暂交锋，互相牵制，主角获得喘息之机"
      },
      {
        "sceneId": "B3-3",
        "beatId": "B3",
        "location": "灵泉废墟边缘",
        "sceneType": "dialogue",
        "event": "三方互相试探，主角趁机观察——确认幽冥气息外渗范围已扩至外围",
        "protagonistReaction": "屏息凝神，借三方僵持观察环境，捕捉到空气中腥甜气息",
        "keyDialogue": {
          "speaker": "第四势力（低沉）",
          "line": "「周管事的东西，林师兄的东西……今日谁也别想独吞。」",
          "protagonistResponse": "（心道：第四方目的不明，但至少打破了两方默契）",
          "dramaticMeaning": "三方制衡初现，主角喘息之机"
        },
        "povCharacter": "陈守一",
        "pacing": {
          "speed": "moderate",
          "technique": ["observation", "environmental-details"],
          "mood": "紧张·暗喜",
          "wordCountTarget": 300
        },
        "factionActivity": [
          { "faction": "周平势力", "action": "与林师兄势力对峙", "powerDelta": -1 },
          { "faction": "林师兄势力", "action": "与周平势力言语交锋", "powerDelta": -1 },
          { "faction": "第四势力", "action": "保持压制姿态，等待时机", "powerDelta": 0 }
        ],
        "hooksTouched": ["H015"],
        "transitionToNext": "第四势力率先打破僵局"
      },
      {
        "sceneId": "B4-1",
        "beatId": "B4",
        "location": "灵泉废墟边缘",
        "sceneType": "action",
        "event": "四方角帽者出手——对周平、林师兄两方同时发动攻击，意图阻止任何一方独吞",
        "protagonistReaction": "瞳孔骤缩，看清四方角帽者出手轨迹，心知这是唯一逃生窗口",
        "keyDialogue": {
          "speaker": "四方角帽者",
          "line": "「都别动。」",
          "protagonistResponse": "（身体比意识更快做出反应——向灵泉废墟方向逃窜）",
          "dramaticMeaning": "第四势力展现碾压性实力，主角必须抓住混战缝隙"
        },
        "povCharacter": "陈守一",
        "pacing": {
          "speed": "explosive",
          "technique": ["action-blur", "quick-cuts"],
          "mood": "混乱·决断",
          "wordCountTarget": 400
        },
        "factionActivity": [
          { "faction": "第四势力", "action": "同时压制周平、林师兄两方", "powerDelta": 1 },
          { "faction": "周平势力", "action": "被迫应对突袭，无法追击主角", "powerDelta": -1 },
          { "faction": "林师兄势力", "action": "传话者被击退，信物脱手", "powerDelta": -1 }
        ],
        "hooksTouched": ["H012"],
        "transitionToNext": "主角趁乱向灵泉废墟方向逃窜，左臂金丝缠突然灼痛"
      },
      {
        "sceneId": "B4-2",
        "beatId": "B4",
        "location": "废墟至灵泉废墟深处",
        "sceneType": "action",
        "event": "主角趁乱逃窜，左臂金丝缠被幽冥气息刺激剧烈灼痛",
        "protagonistReaction": "咬紧牙关不让自己叫出声，金丝缠灼烧如烙铁，却强撑着继续奔跑",
        "keyDialogue": null,
        "povCharacter": "陈守一",
        "pacing": {
          "speed": "urgent",
          "technique": ["pain-description", "kinesthetic-sensory"],
          "mood": "痛楚·逃离",
          "wordCountTarget": 350
        },
        "factionActivity": [
          { "faction": "第四势力", "action": "暂时无暇追击主角，专注于另外两方", "powerDelta": 0 }
        ],
        "hooksTouched": ["H014"],
        "transitionToNext": "暂时脱离周平/林师兄控制范围，但金丝缠灼痛与幽冥气息产生共鸣"
      },
      {
        "sceneId": "B5-1",
        "beatId": "B5",
        "location": "灵泉废墟深处",
        "sceneType": "revelation",
        "event": "主角跌入灵泉废墟核心，发现灵泉口并非枯竭——被黑色物质半堵塞",
        "protagonistReaction": "屏住呼吸，腥甜气息扑面而来，胃部剧烈翻涌",
        "keyDialogue": null,
        "povCharacter": "陈守一",
        "pacing": {
          "speed": "slow",
          "technique": ["horror-details", "environmental-revelation"],
          "mood": "震惊·恐惧",
          "wordCountTarget": 400
        },
        "factionActivity": [],
        "hooksTouched": ["H015", "H006"],
        "transitionToNext": "金丝缠纹路与黑色物质产生诡异共鸣，天机簿残页开始震颤"
      },
      {
        "sceneId": "B5-2",
        "beatId": "B5",
        "location": "灵泉废墟核心",
        "sceneType": "revelation",
        "event": "金丝缠纹路与黑色物质共振，天机簿残页剧烈震颤指向裂隙深处",
        "protagonistReaction": "左臂灼痛与残页震颤形成双重牵引，仿佛有无形力量在召唤",
        "keyDialogue": {
          "speaker": "天机簿残页（震颤）",
          "line": "（无声的共振，指向裂隙深处某物）",
          "protagonistResponse": "（心跳如擂鼓，却不由自主向裂隙迈出一步）",
          "dramaticMeaning": "天机簿主动指引，揭示更深层真相"
        },
        "povCharacter": "陈守一",
        "pacing": {
          "speed": "moderate",
          "technique": ["supernatural-description", "psychological-struggle"],
          "mood": "诱惑·危险",
          "wordCountTarget": 350
        },
        "factionActivity": [],
        "hooksTouched": ["H014", "H015"],
        "transitionToNext": "主角必须做出选择——是否跟随指引深入裂隙"
      },
      {
        "sceneId": "EPILOGUE-1",
        "beatId": "回收伏笔",
        "location": "灵泉废墟核心",
        "sceneType": "reflection",
        "event": "主角回顾金丝缠来源与残纸来历，两条伏笔产生共振",
        "protagonistReaction": "冷汗涔涔，意识到金丝缠与残纸早有联系——林师兄当年在类似纹路上'下过功夫'",
        "keyDialogue": {
          "speaker": "陈守一（内心）",
          "line": "（当年林师兄为何要在纹路上'下功夫'？这与幽冥隐脉有何关联？）",
          "protagonistResponse": "（暂时压下疑问，必须先决定下一步）",
          "dramaticMeaning": "伏笔H014与幽冥隐脉关联初步显现，为后续章节埋下线索"
        },
        "povCharacter": "陈守一",
        "pacing": {
          "speed": "slow",
          "technique": ["memory-recollection", "causal-link"],
          "mood": "困惑·警觉",
          "wordCountTarget": 200
        },
        "factionActivity": [],
        "hooksTouched": ["H014", "H006"],
        "transitionToNext": "章末——主角面临选择：深入裂隙探索真相，还是尽快撤离"
      }
    ]
  },
  "distribution": {
    "byBeat": {
      "B1": { "scenes": 1, "wordCount": 280, "percentage": "9.3%" },
      "B2": { "scenes": 1, "wordCount": 350, "percentage": "11.7%" },
      "B3": { "scenes": 3, "wordCount": 1000, "percentage": "33.3%" },
      "B4": { "scenes": 2, "wordCount": 750, "percentage": "25.0%" },
      "B5": { "scenes": 2, "wordCount": 750, "percentage": "25.0%" },
      "伏笔回收": { "scenes": 1, "wordCount": 200, "percentage": "6.7%" }
    },
    "bySceneType": {
      "action": 4,
      "dialogue": 1,
      "revelation": 3,
      "reflection": 2
    },
    "totalWordCount": {
      "minimum": 2400,
      "target": 3000,
      "estimated": 3280,
      "maximum": 3900
    }
  },
  "hooksProgress": {
    "H012_四方角帽第四势力": {
      "status": "重大推进",
      "description": "从'被目击'升级为'主动出手搅局'，展现强大战力和不明目的"
    },
    "H014_金丝缠与残纸关联": {
      "status": "深化中",
      "description": "金丝缠被幽冥气息刺激产生灼痛，与裂隙产生诡异共鸣"
    },
    "H015_幽冥气息外渗": {
      "status": "重大推进",
      "description": "主角亲眼目睹裂隙中幽冥气息外渗，腥甜气息可感"
    },
    "H006_灵气衰减": {
      "status": "隐性推进",
      "description": "灵泉'死去'的景象再次印证灵气衰减历史"
    },
    "plot-灵泉异变": {
      "status": "持续推进",
      "description": "灵泉被黑色物质堵塞的真相进一步揭示"
    }
  },
  "writingNotes": [
    "节拍3（冲突爆发）是本章核心，字数占比最高，需重点刻画三方对峙的张力",
    "第四势力的四方角帽者出手时，动作要干净利落，体现碾压性实力",
    "金丝缠灼痛要写得具体——不是单纯的痛，而是与幽冥气息的'共鸣'",
    "天机簿残页的震颤要有超自然感，但不要过于玄幻，保持悬疑基调",
    "黑色物质的描写要注重'恶心'和'危险'的双重感受，为后续情节埋下恐惧感"
  ]
}
```