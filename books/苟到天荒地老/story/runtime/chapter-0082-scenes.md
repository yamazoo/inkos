```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "狭窄洞穴深处",
      "sceneType": "reflection",
      "event": "主角陈守一在赵猛怀中短暂清醒，发现自己身处幽冥兽即将入洞的绝境",
      "protagonistReaction": "意识如破布般残破，却本能地攥紧手中残符",
      "keyDialogue": {
        "speaker": "赵猛",
        "line": ""守一！守一你别睡！幽冥兽的脚步声越来越近了！"",
        "protagonistResponse": "……嗯……还在……",
        "dramaticMeaning": "绝境中的微弱回应，暗示主角生命力顽强但状态危急"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["fragmented-thoughts", "sensory-detail"],
        "mood": "昏迷·紧迫",
        "wordCountTarget": 300
      },
      "factionActivity": [],
      "hooksTouched": ["H001", "H002"],
      "transitionToNext": "主角挣扎着睁开眼，试图看清周围局势"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "洞穴入口处",
      "sceneType": "action",
      "event": "主角挣扎起身，发现洞穴入口处透进来的不再是月光，而是蠕动的黑色鳞片——幽冥兽已经开始破壁而入",
      "protagonistReaction": "瞳孔骤缩，体内残存的灵力疯狂涌动，但经脉寸寸断裂的身体根本跟不上意识",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": ""来不及了吗……"\"",
        "protagonistResponse": "（试图驱动残符但手指痉挛）",
        "dramaticMeaning": "绝望中主角第一次正视自己即将暴露的现实"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "rapid-shifts"],
        "mood": "窒息·崩溃边缘",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "幽冥兽", "action": "破壁而入", "powerDelta": 1 }
      ],
      "hooksTouched": ["H001"],
      "transitionToNext": "就在幽冥兽鳞片即将触及主角的瞬间，一道熟悉的意识波动再次侵入脑海"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "主角意识深处",
      "sceneType": "revelation",
      "event": "冥将的意识再次试探，这次比之前更加深入，带着审判般的压迫感——\"因果反噬之身，果然还活着\"",
      "protagonistReaction": "脑海中炸开一道金光，主角头痛欲裂，但这次他没有尖叫，反而死死咬住嘴唇，用痛楚对抗意识侵入",
      "keyDialogue": {
        "speaker": "冥将（意识）",
        "line": ""你以为那次反噬是你自己的力量？愚蠢。是我在借你的身体……"\"",
        "protagonistResponse": ""是你……一直都是你……？！"",
        "dramaticMeaning": "真相碎片的第一次揭露，暗示主角一直被冥将利用"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "intense",
        "technique": ["internal-monologue", "power-word-repetition"],
        "mood": "震惊·愤怒",
        "wordCountTarget": 400
      },
      "factionActivity": [
        { "faction": "冥将", "action": "意识试探深化", "powerDelta": 1 }
      ],
      "hooksTouched": ["H002", "H003"],
      "transitionToNext": "冥将的意识如潮水般退去，留下主角独自承受真相的重量"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "洞穴入口处",
      "sceneType": "action",
      "event": "主角被冥将意识冲击震得七窍渗血，身体彻底崩溃，但就在此刻——他看清了幽冥兽的全貌，一只足有洞穴三倍宽的巨兽正在破壁而入",
      "protagonistReaction": "身体轰然倒下，但手中残符却自行燃起微光，仿佛在回应主人最后的意志",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": ""赵猛……快走……别管我……"\"",
        "protagonistResponse": "（颤抖着将残符推向赵猛）",
        "dramaticMeaning": "主角在生死关头选择牺牲自己保护同伴"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "rapid",
        "technique": ["body-horror", "desperate-action"],
        "mood": "悲壮·献祭",
        "wordCountTarget": 400
      },
      "factionActivity": [
        { "faction": "幽冥兽", "action": "破壁成功", "powerDelta": 2 }
      ],
      "hooksTouched": ["H001"],
      "transitionToNext": "赵猛拒绝离开，反而将主角背起，向洞穴深处仅存的一条裂隙逃去"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "狭窄裂隙通道",
      "sceneType": "action",
      "event": "赵猛背负主角在黑暗中狂奔，身后幽冥兽的咆哮震落碎石，主角在剧烈颠簸中意识再次模糊，但这次——他看到了不该看到的东西",
      "protagonistReaction": "意识边缘闪过一道画面：三年前的矿洞、那场\"意外\"、以及一个被刻意抹去的关键细节",
      "keyDialogue": {
        "speaker": "陈守一（意识闪回）",
        "line": ""那不是意外……是有人……故意……"\"",
        "protagonistResponse": "（猛然睁眼）",
        "dramaticMeaning": "真相碎片揭露：主角的因果反噬并非偶然，背后有人为操作的痕迹"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "chaotic",
        "technique": ["fragmented-flashback", "sensory-overload"],
        "mood": "眩晕·真相冲击",
        "wordCountTarget": 350
      },
      "factionActivity": [],
      "hooksTouched": ["H003", "H004"],
      "transitionToNext": "主角正想开口，却被一道刺眼的金光打断——裂隙尽头出现了某种阵法的光芒"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "裂隙尽头的古老阵法",
      "sceneType": "revelation",
      "event": "赵猛将主角带到一处隐蔽的古老阵法前，阵法上的符文与主角手背的因果印记惊人地吻合——\"这是我父亲留下的，他说有一天会有人需要它\"",
      "protagonistReaction": "主角难以置信地盯着阵法，一个疯狂的念头浮现：赵猛的父亲早就知道这一切？",
      "keyDialogue": {
        "speaker": "赵猛",
        "line": ""我不知道这阵是做什么的，但爹临死前说——'因果轮回，终有尽时'……"\"",
        "protagonistResponse": ""所以你一直在等？等一个能激活这阵的人？"",
        "dramaticMeaning": "关键道具登场，赵猛父亲的身份成为新的悬念"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "measured",
        "technique": ["symbolic-detail", "tension-pause"],
        "mood": "震动·希望萌芽",
        "wordCountTarget": 350
      },
      "factionActivity": [],
      "hooksTouched": ["H002", "H004"],
      "transitionToNext": "身后传来石壁崩塌的声音，幽冥兽正在强行扩大裂隙"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "古老阵法前",
      "sceneType": "action",
      "event": "主角强撑残躯踏入阵法中央，手背的因果印记与阵法符文共振——但代价随之而来：因果反噬如万箭穿心，主角的身体开始从内部崩解",
      "protagonistReaction": "每一寸肌肤都在燃烧，经脉中的灵力与因果之力激烈碰撞，主角咬碎牙齿不让自己惨叫出声",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": ""因果……原来如此……不是反噬……是我自己在吞噬……"\"",
        "protagonistResponse": "（呕出一口黑血，但眼中迸发出前所未有的光芒）",
        "dramaticMeaning": "大劫真相揭露：因果反噬的本质是主角在无意识中吸收并转化因果之力"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "extreme",
        "technique": ["body-horror", "metaphor-cascade"],
        "mood": "撕裂·顿悟",
        "wordCountTarget": 400
      },
      "factionActivity": [
        { "faction": "冥将", "action": "试图阻止阵法激活", "powerDelta": -1 }
      ],
      "hooksTouched": ["H002", "H003"],
      "transitionToNext": "阵法金光大盛，一道光柱冲天而起，幽冥兽发出痛苦的嘶吼"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "阵法空间内外",
      "sceneType": "action",
      "event": "金光形成屏障将幽冥兽阻隔在外，而主角的意识被拉入一个特殊的空间——冥将的虚影首次完整显现在他面前",
      "protagonistReaction": "面对冥将的真容，主角没有恐惧，反而露出释然的笑容：\"所以你不是想杀我……你是在逼我觉醒\"",
      "keyDialogue": {
        "speaker": "冥将",
        "line": ""聪明。三百年前我输给了因果，不得不附身于你体内等待……现在，是时候终结这场大劫了——但代价，是你"\"",
        "protagonistResponse": ""如果我的死能终结大劫……"\"",
        "dramaticMeaning": "大劫真相完整揭露，冥将的真实身份和目的浮出水面"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "dramatic",
        "technique": ["confrontation", "revelation-pause"],
        "mood": "悲壮·对决前夕",
        "wordCountTarget": 400
      },
      "factionActivity": [
        { "faction": "冥将", "action": "主动现身对峙", "powerDelta": 0 },
        { "faction": "陈守一", "action": "承受因果反噬", "powerDelta": -2 }
      ],
      "hooksTouched": ["H002", "H003", "H004"],
      "transitionToNext": "就在主角即将接受命运之际，赵猛的声音从外界传来——\"守一！外面有人来了！\""
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "阵法内外",
      "sceneType": "action",
      "event": "冥将虚影骤然消散，取而代之的是一个完全陌生的气息——阵法外出现了三道身影，为首者身披青云门长老服饰，但周身萦绕着诡异的黑雾",
      "protagonistReaction": "主角瞳孔猛缩：此人身上既有青云门正统功法，又有幽冥之气的痕迹——\"你是什么人？！\"",
      "keyDialogue": {
        "speaker": "神秘来客",
        "line": ""青云门叛徒？不……我才是真正的青云门正统。三百年前那一脉之争，你以为是谁赢了？"\"",
        "protagonistResponse": "（难以置信地看着对方）",
        "dramaticMeaning": "新敌人现身，青云门内部隐藏的三百年前的秘密被撕开一角"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "suspenseful",
        "technique": ["revelation-foreshadow", "tension-build"],
        "mood": "震惊·格局震荡",
        "wordCountTarget": 400
      },
      "factionActivity": [
        { "faction": "神秘势力", "action": "首次登场", "powerDelta": 1 },
        { "faction": "青云门", "action": "内部势力存疑", "powerDelta": -1 }
      ],
      "hooksTouched": ["H001", "H003", "H004"],
      "transitionToNext": "神秘来客抬手，黑雾化作锁链缠向阵法——\"赵家小子，你父亲欠我的债，今天该还了\""
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "阵法边缘",
      "sceneType": "reflection",
      "event": "赵猛挡在主角身前，第一次露出从未有过的坚定：\"我爹临死前说……如果有一天我遇到因果之身的传人，就把三聚居点的秘密告诉他\"",
      "protagonistReaction": "主角挣扎着从阵法中伸出手，抓住了赵猛递来的东西——一枚刻着三座山峰的令牌",
      "keyDialogue": {
        "speaker": "赵猛",
        "line": ""三聚居点……不止是流民聚集地。那里有我爹留下的后手——大劫的第三个关键。"\"",
        "protagonistResponse": "（握紧令牌，心中燃起新的希望）",
        "dramaticMeaning": "三聚居点的希望被揭示，为后续剧情埋下伏笔"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "hopeful",
        "technique": ["symbolic-detail", "resolve-building"],
        "mood": "绝望中透出希望",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "三聚居点", "action": "秘密首次被提及", "powerDelta": 1 }
      ],
      "hooksTouched": ["H001", "H003", "H004"],
      "transitionToNext": "神秘来客冷笑：\"以为躲在三聚居点就能活命？大劫将至，无处可逃——不过，我倒要看看你们能撑多久。\"黑雾锁链骤然收紧。"
    }
  ],
  "chapterSummary": {
    "totalScenes": 10,
    "targetWordCount": 3000,
    "estimatedWordCount": 3550,
    "beatCoverage": {
      "B1": "1 scene (100%)",
      "B2": "2 scenes (100%)",
      "B3": "3 scenes (100%)",
      "B4": "2 scenes (100%)",
      "B5": "2 scenes (100%)"
    },
    "keyPayoffs": [
      "因果反噬真相：主角被动吸收因果之力，非单纯反噬",
      "冥将身份：三百年前大劫的失败者，附身主角等待觉醒",
      "赵猛父亲：隐藏三百年前秘密的关键人物，留有后手",
      "三聚居点：大劫第三个关键所在",
      "新势力登场：青云门三百年前的另一脉"
    ],
    "hooksSetUp": [
      "H001: 三聚居点的秘密",
      "H002: 因果反噬的真相",
      "H003: 冥将的真实身份",
      "H004: 赵猛父亲的遗产"
    ]
  }
}
```