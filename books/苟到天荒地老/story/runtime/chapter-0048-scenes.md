```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "后山老槐树下",
      "sceneType": "reflection",
      "event": "陈守一喘息中回忆方才血脉共鸣的凶险，苏婉儿取出完整地图",
      "protagonistReaction": "陈守一紧握玉牌，感受后颈弯月印记与胸口金丝缠印记的呼应",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": "「地图和玉牌都在。若不是孙师兄提前送来玉牌，今夜怕是……」",
        "protagonistResponse": "「没事了。」",
        "dramaticMeaning": "劫后余生的庆幸，玉牌成为关键道具"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["sensory-details", "internal-monologue"],
        "mood": "紧绷→释然",
        "wordCountTarget": 350
      },
      "factionActivity": [
        {
          "faction": "幽冥兽",
          "action": "退至山林深处，血脉共鸣断开",
          "powerDelta": -1
        }
      ],
      "hooksTouched": ["H001", "H002"],
      "transitionToNext": "后山方向传来低沉兽吼"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "后山隐蔽处·情报整合",
      "sceneType": "dialogue",
      "event": "苏婉儿与陈守一分析地图，发现两条线索在灵泉核心交汇",
      "protagonistReaction": "陈守一眉头紧锁，意识到周执事的监视升级",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": "「你父亲的记录里提到的灵泉，和这张地图标注的……是同一个地方。」",
        "protagonistResponse": "「周执事盯上我了。三人三班，从今夜开始。」",
        "dramaticMeaning": "监视升级意味着周执事等不及了"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["dialogue-heavy", "information-reveal"],
        "mood": "警觉·紧迫",
        "wordCountTarget": 400
      },
      "factionActivity": [
        {
          "faction": "周执事派系",
          "action": "监视升级为三人三班轮换",
          "powerDelta": +1
        },
        {
          "faction": "苏婉儿",
          "action": "提供地图与陈守一情报共享",
          "powerDelta": +1
        }
      ],
      "hooksTouched": ["H003", "H005"],
      "transitionToNext": "陈守一决定主动前往演武场"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "通往演武场的小径",
      "sceneType": "action",
      "event": "陈守一在前往演武场途中，发现第三名监视者的行踪",
      "protagonistReaction": "陈守一心跳加速，但面上不动声色",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "「三人三班……周执事是真的等不及了。」",
        "protagonistResponse": "加快脚步，绕道而行",
        "dramaticMeaning": "证实周执事的急切，暗示事态严重"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "tension-build"],
        "mood": "警觉·压迫",
        "wordCountTarget": 300
      },
      "factionActivity": [
        {
          "faction": "周执事派系",
          "action": "派遣第三人跟踪陈守一",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H005"],
      "transitionToNext": "陈守一甩开跟踪，抵达演武场"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "演武场·中央广场",
      "sceneType": "revelation",
      "event": "长老当众揭示父亲三十年前献祭真相，三人触发封印的往事",
      "protagonistReaction": "陈守一双拳紧握，指甲刺入掌心，面色惨白",
      "keyDialogue": {
        "speaker": "大长老",
        "line": "「三十年前，陈守一的父亲与另外两人，共同触发了幽冥封印——他选择了献祭自己。」",
        "protagonistResponse": "「……献祭？」",
        "dramaticMeaning": "父亲献祭真相大白，三十年前的悲剧浮出水面"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["revelation-pacing", "emotional-pause"],
        "mood": "震惊·悲痛",
        "wordCountTarget": 450
      },
      "factionActivity": [
        {
          "faction": "长老派",
          "action": "揭示陈守一父亲献祭真相",
          "powerDelta": +1
        },
        {
          "faction": "周执事派系",
          "action": "试图打断长老发言",
          "powerDelta": -1
        }
      ],
      "hooksTouched": ["H001", "H002", "H006"],
      "transitionToNext": "铜环与玉牌同时发光"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "演武场·法阵中央",
      "sceneType": "action",
      "event": "铜环与玉牌产生共鸣，同源之秘揭露，三人封印触发者身份确认",
      "protagonistReaction": "陈守一手中的铜环剧烈震动，与苏婉儿手中的玉牌遥相呼应",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": "「这玉牌……和你父亲的铜环，是同一块玉劈开的！」",
        "protagonistResponse": "「所以父亲和孙师兄的父亲……」",
        "dramaticMeaning": "铜环玉牌同源之秘揭示，两代人的命运交织"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "fast",
        "technique": ["sensory-explosion", "action-acceleration"],
        "mood": "震撼·顿悟",
        "wordCountTarget": 400
      },
      "factionActivity": [
        {
          "faction": "陈守一",
          "action": "铜环与玉牌共鸣，激活封印残留",
          "powerDelta": +1
        },
        {
          "faction": "孙师兄（推测）",
          "action": "其父为三十年前三人之一",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H002", "H006"],
      "transitionToNext": "长老派系出面保护陈守一"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "演武场·长老席位前",
      "sceneType": "dialogue",
      "event": "长老派系介入，当众宣布保护陈守一，与周执事派系形成对立",
      "protagonistReaction": "陈守一感受到长老目光中的复杂情感，既有愧疚也有期待",
      "keyDialogue": {
        "speaker": "大长老",
        "line": "「陈守一是陈氏唯一的血脉后人，任何人不得擅动。」",
        "protagonistResponse": "（看向周执事）紧握铜环",
        "dramaticMeaning": "长老派系介入保护，势力格局初现裂痕"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["faction-tension", "dialogue-confrontation"],
        "mood": "紧张·对峙",
        "wordCountTarget": 350
      },
      "factionActivity": [
        {
          "faction": "长老派",
          "action": "当众宣布保护陈守一",
          "powerDelta": +1
        },
        {
          "faction": "周执事派系",
          "action": "被迫退让，但目光阴沉",
          "powerDelta": -1
        }
      ],
      "hooksTouched": ["H005"],
      "transitionToNext": "陈守一追问幽冥隐脉体之事"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "演武场·法阵边缘",
      "sceneType": "revelation",
      "event": "长老揭示幽冥隐脉体觉醒的代价，陈守一体内血脉开始躁动",
      "protagonistReaction": "后颈弯月印记剧烈灼热，陈守一强忍剧痛，面色苍白如纸",
      "keyDialogue": {
        "speaker": "大长老",
        "line": "「幽冥隐脉体一旦觉醒，封印之物便会苏醒。而你父亲……正是为此献祭。」",
        "protagonistResponse": "「所以我体内的东西……是父亲用命压住的？」",
        "dramaticMeaning": "幽冥隐脉体觉醒代价显现，父亲献祭的意义明确"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["revelation-heavy", "internal-struggle"],
        "mood": "痛苦·理解",
        "wordCountTarget": 400
      },
      "factionActivity": [
        {
          "faction": "陈守一体内",
          "action": "幽冥隐脉体开始躁动",
          "powerDelta": +1
        },
        {
          "faction": "封印",
          "action": "感应到血脉波动",
          "powerDelta": -1
        }
      ],
      "hooksTouched": ["H001", "H002", "H006"],
      "transitionToNext": "陈守一追问长老与父亲的关系"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "演武场·长老席位",
      "sceneType": "dialogue",
      "event": "长老揭示与陈守一父亲的师徒关系，承认当年决策失误",
      "protagonistReaction": "陈守一望着长老苍老的面容，心中五味杂陈",
      "keyDialogue": {
        "speaker": "大长老",
        "line": "「你父亲是我的关门弟子。当年……是我同意他以命换命的。」",
        "protagonistResponse": "「所以您一直在等……等我能接替他？」",
        "dramaticMeaning": "长老与父亲的真实关系揭露，因果浮现"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["emotional-reveal", "backstory-unfold"],
        "mood": "复杂·释然",
        "wordCountTarget": 350
      },
      "factionActivity": [
        {
          "faction": "长老派",
          "action": "揭示与陈守一父亲的师徒关系",
          "powerDelta": +1
        },
        {
          "faction": "周执事派系",
          "action": "在旁冷眼旁观",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H001", "H006"],
      "transitionToNext": "演武场突然震动，封印告警"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "演武场·法阵中央",
      "sceneType": "action",
      "event": "封印深处传来震动，有东西正在苏醒，演武场众人陷入恐慌",
      "protagonistReaction": "陈守一体内的弯月印记剧烈反应，剧痛中他听到来自深处的低语",
      "keyDialogue": {
        "speaker": "大长老",
        "line": "「封印……撑不住了！」",
        "protagonistResponse": "（捂住后颈）低声嘶吼",
        "dramaticMeaning": "新困境出现：封印深处有东西苏醒"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "fast",
        "technique": ["action-acceleration", "cliffhanger"],
        "mood": "惊恐·紧迫",
        "wordCountTarget": 300
      },
      "factionActivity": [
        {
          "faction": "封印",
          "action": "剧烈震动，内部之物苏醒中",
          "powerDelta": -2
        },
        {
          "faction": "陈守一体内",
          "action": "幽冥隐脉体与封印产生共鸣",
          "powerDelta": +1
        }
      ],
      "hooksTouched": ["H001", "H004"],
      "transitionToNext": "一道陌生的气息从远处接近"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "演武场·入口处",
      "sceneType": "action",
      "event": "神秘势力登场，陈守一在混乱中得到父亲遗物线索",
      "protagonistReaction": "陈守一紧握铜环，在长老的掩护下得知遗物下落",
      "keyDialogue": {
        "speaker": "大长老（传音）",
        "line": "「你父亲在灵泉核心留了东西——若想真正封印它，你必须去那里。」",
        "protagonistResponse": "「灵泉核心……」（想起苏婉儿的地图）",
        "dramaticMeaning": "新机遇：父亲遗物线索浮现；新势力入场：格局重置"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "fast",
        "technique": ["setup-future", "mystery-introduction"],
        "mood": "决心·悬念",
        "wordCountTarget": 350
      },
      "factionActivity": [
        {
          "faction": "未知势力",
          "action": "神秘人物出现在演武场边缘",
          "powerDelta": 0
        },
        {
          "faction": "陈守一",
          "action": "获得父亲遗物线索",
          "powerDelta": +1
        }
      ],
      "hooksTouched": ["H001", "H002", "H003", "H006"],
      "transitionToNext": "陈守一望向远方，做出决定"
    }
  ],
  "chapterSummary": {
    "title": "第48章 真相与觉醒",
    "type": "回收章（payoff）",
    "totalScenes": 10,
    "totalWordCountTarget": 3650,
    "wordCountRange": {
      "min": 3000,
      "target": 3650,
      "max": 4000
    },
    "beatsCoverage": {
      "B1": { "scenes": 1, "wordCount": 350, "coverage": "100%" },
      "B2": { "scenes": 2, "wordCount": 700, "coverage": "100%" },
      "B3": { "scenes": 3, "wordCount": 1200, "coverage": "100%" },
      "B4": { "scenes": 2, "wordCount": 750