```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "归途之地石室门外甬道",
      "sceneType": "action",
      "event": "幽冥兽撕裂岩缝，黑雾涌入，主角强撑关闭石门",
      "protagonistReaction": "陈守一以最后一丝灵力封住石门，七窍渗血加剧，意识边缘模糊",
      "keyDialogue": {
        "speaker": "环境",
        "line": "（岩壁崩裂声如雷鸣，黑雾中传来幽冥兽的嘶吼）",
        "protagonistResponse": "（陈守一将后背抵在石门上，鲜血顺着下颌滴落）",
        "dramaticMeaning": "危机倒计时启动，末章紧张感直接延续"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "intense",
        "technique": ["short-sentences", "sensory-focus", "rapid-shifts"],
        "mood": "窒息·绝望",
        "wordCountTarget": 320
      },
      "factionActivity": [
        {
          "faction": "幽冥兽",
          "action": "撕裂岩缝，黑雾涌入石室",
          "powerDelta": 1
        }
      ],
      "hooksTouched": ["H017-幽冥兽威胁"],
      "transitionToNext": "主角跌入石室内部，黑暗中传来苍老的声音"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "归途之地石室内部",
      "sceneType": "revelation",
      "event": "守夜者第八代现身，三百年等待揭示",
      "protagonistReaction": "陈守一强撑意识，认出老人身上与归途之地同源的气息",
      "keyDialogue": {
        "speaker": "守夜者第八代",
        "line": ""你来了。"",
        "protagonistResponse": ""你是……？"",
        "dramaticMeaning": "三百年的等待终于迎来终章，守夜者一族最后传人登场"
      },
      "pacing": {
        "speed": "slow",
        "technique": ["long-sentences", "description", "pause"],
        "mood": "苍凉·沉重",
        "wordCountTarget": 480
      },
      "factionActivity": [
        {
          "faction": "守夜者一族",
          "action": "第八代现身，三百年守候揭示",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H008-守夜者一族"],
      "transitionToNext": "老人示意主角坐下，开始讲述归途之地的秘密"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "石室核心祭坛前",
      "sceneType": "revelation",
      "event": "末法真相揭露——人类主动献祭修行界未来",
      "protagonistReaction": "陈守一道心震动，三观崩塌边缘",
      "keyDialogue": {
        "speaker": "守夜者第八代",
        "line": ""上古时代，人类为求生存，亲手封印了自己的修行之路……"……千年前的先祖们，以禁术封印幽冥界裂缝，代价是——灵气被永远锁在封印核心。"",
        "protagonistResponse": "（陈守一握紧拳头，指节泛白）",
        "dramaticMeaning": "世界观颠覆：末法非天道惩罚，乃人类自断前程"
      },
      "pacing": {
        "speed": "measured",
        "technique": ["explanation", "flashback", "emotional-pause"],
        "mood": "震惊·悲凉",
        "wordCountTarget": 380
      },
      "factionActivity": [
        {
          "faction": "守夜者一族",
          "action": "揭露末法真相",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H002-末法时代根源"],
      "transitionToNext": "守夜者第八代继续揭露三条路的真相"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "石室核心祭坛前",
      "sceneType": "revelation",
      "event": "三条路完整揭露——封印、开放、平衡",
      "protagonistReaction": "陈守一听闻第三条路需要活人献祭，面色苍白",
      "keyDialogue": {
        "speaker": "守夜者第八代",
        "line": ""第一条路，永固封印，需要三源血脉作为第二道锁的替代品……第二条路，打开封印释放灵气，代价是三百年前的浩劫重演……第三条路，平衡之路——成为活的锁，以自身为过滤器，让灵气与幽冥之气相互转化。"",
        "protagonistResponse": ""第三条路的代价是什么？"",
        "dramaticMeaning": "三条路揭示主角命运抉择的必然性"
      },
      "pacing": {
        "speed": "building",
        "technique": ["list-structure", "tension-climb", "repetition"],
        "mood": "压迫·宿命",
        "wordCountTarget": 380
      },
      "factionActivity": [
        {
          "faction": "守夜者一族",
          "action": "完整揭露三条路",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H005-三条路抉择"],
      "transitionToNext": "守夜者第八代指向石壁，母亲的字迹显现"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "石室核心祭坛旁石壁",
      "sceneType": "revelation",
      "event": "母亲石壁血书显现——"你是第三道锁的钥匙"",
      "protagonistReaction": "陈守一浑身颤抖，幼时祭坛前母亲带他参加仪式的记忆涌现",
      "keyDialogue": {
        "speaker": "石壁血书（母亲遗言）",
        "line": ""吾儿，若你能看到此处，说明你已走到最后一步……你是第三道锁的钥匙，也是唯一的选择……不要恨他们。"",
        "protagonistResponse": "（陈守一双膝跪地，泪水与血水交融）",
        "dramaticMeaning": "母子羁绊揭示，母亲早已预见并安排好一切"
      },
      "pacing": {
        "speed": "slow",
        "technique": ["flashback", "emotional-surge", "silence"],
        "mood": "悲恸·心碎",
        "wordCountTarget": 350
      },
      "factionActivity": [],
      "hooksTouched": ["H003-母亲线索", "H006-幼时祭坛记忆"],
      "transitionToNext": "守夜者第八代告知更多关于母亲选择第三条路的代价"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "石室核心祭坛前",
      "sceneType": "revelation",
      "event": "母亲死亡真相——因果反噬导致英年早逝",
      "protagonistReaction": "陈守一悲痛欲绝，终于明白母亲月圆夜叹息的原因",
      "keyDialogue": {
        "speaker": "守夜者第八代",
        "line": ""你母亲选择了第三条路……每平衡一年，消耗一年寿元……因果反噬最终吞噬了她的生命。"",
        "protagonistResponse": ""是我……是我害死了她？"",
        "dramaticMeaning": "母子命运的因果闭环揭示，愧疚与理解交织"
      },
      "pacing": {
        "speed": "heavy",
        "technique": ["emotional-pause", "long-sentences", "dialogue-focus"],
        "mood": "沉痛·崩溃边缘",
        "wordCountTarget": 380
      },
      "factionActivity": [
        {
          "faction": "守夜者一族",
          "action": "揭示因果反噬机制",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H004-因果反噬机制", "H003-母亲死亡真相"],
      "transitionToNext": "守夜者第八代同时揭露赵猛等人的危险处境"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "石室核心祭坛",
      "sceneType": "action",
      "event": "守夜者传承开始——石牌交接",
      "protagonistReaction": "陈守一接过古朴石牌，感受到三百年来所有守夜者的意志与经验涌入识海",
      "keyDialogue": {
        "speaker": "守夜者第八代",
        "line": ""从今日起，你便是守夜者……愿你完成我们未竟的使命。"",
        "protagonistResponse": "（陈守一单膝跪地，双手接过石牌）"陈守一，领命。"",
        "dramaticMeaning": "使命确立，传承交接，新旧交替的仪式感"
      },
      "pacing": {
        "speed": "solemn",
        "technique": ["ritual-description", "sensory-immersion", "symbolism"],
        "mood": "庄严·使命感",
        "wordCountTarget": 380
      },
      "factionActivity": [
        {
          "faction": "守夜者一族",
          "action": "第八代传承给陈守一",
          "powerDelta": -1
        },
        {
          "faction": "陈守一",
          "action": "继承守夜者使命",
          "powerDelta": 1
        }
      ],
      "hooksTouched": ["H008-守夜者一族", "H009-守夜者传承"],
      "transitionToNext": "石门传来巨响，幽冥兽即将破门而入"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "石室核心祭坛",
      "sceneType": "action",
      "event": "幽冥兽破开第一道阻隔，传承在极限中完成",
      "protagonistReaction": "陈守一强撑将守夜者第八代安置在安全处，七窍流血加剧，意识边缘挣扎",
      "keyDialogue": {
        "speaker": "守夜者第八代",
        "line": ""废墟西北角……有一处隐蔽出口……赵猛他们应该在那里……快走……"（喷出一口黑血）",
        "protagonistResponse": "（陈守一咬牙记下位置）"我会完成使命。"",
        "dramaticMeaning": "生死存亡之际，关键情报获取，伏笔收束"
      },
      "pacing": {
        "speed": "urgent",
        "technique": ["parallel-action", "short-sentences", "cliffhanger"],
        "mood": "危急·决绝",
        "wordCountTarget": 420
      },
      "factionActivity": [
        {
          "faction": "幽冥兽",
          "action": "破开第一道石门阻隔",
          "powerDelta": 1
        },
        {
          "faction": "守夜者一族",
          "action": "第八代油尽灯枯",
          "powerDelta": -1
        }
      ],
      "hooksTouched": ["H017-幽冥兽威胁", "H010-赵猛等人安危", "H011-废墟出口"],
      "transitionToNext": "陈守一携传承石牌向西北角出口冲去，章末悬念：能否逃出？赵猛等人命运如何？"
    }
  ],
  "chapterMetadata": {
    "chapterNumber": 79,
    "chapterTitle": "节拍规划",
    "chapterType": "回收章（payoff）",
    "targetWords": 3000,
    "minWords": 2400,
    "maxWords": 3900,
    "totalScenes": 8,
    "beatCoverage": {
      "B1": ["B1-1"],
      "B2": ["B2-1"],
      "B3": ["B3-1", "B3-2", "B3-3"],
      "B4": ["B4-1", "B4-2"],
      "B5": ["B5-1"]
    },
    "sceneTypeDistribution": {
      "action": 3,
      "revelation": 5
    },
    "hooksRecap": [
      "H002-末法时代根源",
      "H003-母亲线索",
      "H004-因果反噬机制",
      "H005-三条路抉择",
      "H006-幼时祭坛记忆",
      "H008-守夜者一族",
      "H009-守夜者传承",
      "H010-赵猛等人安危",
      "H011-废墟出口",
      "H017-幽冥兽威胁"
    ],
    "costGainSummary": {
      "beat4": {
        "cost": ["母亲为第三条路英年早逝", "因果反噬机制揭示", "赵猛等人处于猎杀路径"],
        "gain": ["第三条路完整代价清晰", "陈守一使命确立", "守夜者传承开始"]
      },
      "beat5": {
        "cost": ["幽冥兽破开第一道阻隔", "主角身体到达极限", "守夜者第八代油尽灯枯"],
        "gain": ["传承初步完成", "关键情报到手（废墟出口位置）", "赵猛等人确认安全方向"]
      }
    }
  }
}
```