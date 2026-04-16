

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "破屋内",
      "sceneType": "revelation",
      "event": "天机簿残页震颤失控，灵泉异变正式爆发，远山光芒闪烁",
      "protagonistReaction": "主角心脏猛地一沉，手中残页震颤剧烈程度远超晨曦，与远处闷响完全同步",
      "keyDialogue": {
        "speaker": "主角（内心）",
        "line": "「暴风雨……已至。」",
        "protagonistResponse": null,
        "dramaticMeaning": "承接上章悬念，灵泉异变正式爆发而非将至"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow-to-fast",
        "technique": ["sensory-details", "environmental-imagery"],
        "mood": "震撼·压迫·宿命感",
        "wordCountTarget": 300
      },
      "factionActivity": [],
      "hooksTouched": ["H002"],
      "transitionToNext": "主角左臂伤疤发热，与残页产生共鸣"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "破屋内",
      "sceneType": "action",
      "event": "主角试图压制残页震颤，却发现灵泉方向闷响带有规律性，类似\"呼吸\"",
      "protagonistReaction": "主角运起灵力压制残页，却发现灵力正被残页反向抽取，心中大惊",
      "keyDialogue": {
        "speaker": "主角（内心）",
        "line": "「这闷响……是某种存在在苏醒？」",
        "protagonistResponse": null,
        "dramaticMeaning": "揭示灵泉深处有未知存在，与主角命运关联"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "urgent",
        "technique": ["internal-monologue", "rising-tension"],
        "mood": "恐惧·困惑·警觉",
        "wordCountTarget": 250
      },
      "factionActivity": [],
      "hooksTouched": ["H002", "H003"],
      "transitionToNext": "残页表面浮现微弱纹路，与主角伤疤高度相似"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "破屋内",
      "sceneType": "revelation",
      "event": "主角发现灵泉\"呼吸\"越来越弱，印证灵气衰减周期——灵泉正在\"死去\"",
      "protagonistReaction": "主角灵力储备急剧下降，同时将灵泉异变与mustKeep设定中的灵气衰减周期关联",
      "keyDialogue": {
        "speaker": "主角（内心）",
        "line": "「100%……70%……49%……趋近于零。灵泉正在死去。」",
        "protagonistResponse": null,
        "dramaticMeaning": "核心伏笔回收，灵泉枯竭与灵气衰减周期的关联确认"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow",
        "technique": ["revelation", "flashback-reference"],
        "mood": "沉重·顿悟·绝望",
        "wordCountTarget": 200
      },
      "factionActivity": [
        { "faction": "未知势力", "action": "远处感知灵泉异变", "powerDelta": 0 }
      ],
      "hooksTouched": ["H002", "H003"],
      "transitionToNext": "主角意识到三股势力即将逼近"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "破屋外小径",
      "sceneType": "dialogue",
      "event": "周平派人以\"关心\"为名试探主角，杂役王二出现在破屋外",
      "protagonistReaction": "主角心跳如擂鼓但目光平静，沉着应对试探",
      "keyDialogue": {
        "speaker": "杂役王二",
        "line": "「赵海昨夜没回来，周管事让各处找找。你可知道他去哪了？」",
        "protagonistResponse": "「我睡得早，不知外头的事。」",
        "dramaticMeaning": "周平试探主角是否还活着，同时暗中观察主角屋内动静"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "moderate",
        "technique": ["tension-dialogue", "understatement"],
        "mood": "警觉·伪装的平静",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "周平势力", "action": "派人试探主角", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H004"],
      "transitionToNext": "主角借故返回屋内，王二继续在附近徘徊"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "破屋后窗暗处",
      "sceneType": "revelation",
      "event": "陈老通过暗号传递信息，\"三天后见分晓\"的赌注已失效，时间窗口被压缩",
      "protagonistReaction": "主角悄然接近后窗，发现陈老留下的暗号，心中一沉",
      "keyDialogue": {
        "speaker": "陈老（通过暗号）",
        "line": "「时间不多了。」",
        "protagonistResponse": "主角点头，心中苦笑",
        "dramaticMeaning": "陈老警告主角灵泉异变已提前爆发，原定计划作废"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "moderate",
        "technique": ["subtext", "crypted-communication"],
        "mood": "紧迫·焦虑·信任的纠结",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "陈老", "action": "传递警告信息", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H004"],
      "transitionToNext": "主角刚离开后窗，察觉到第三股势力接近的迹象"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "破屋角落暗处",
      "sceneType": "dialogue",
      "event": "苏婉儿悄然现身，带来林师兄的新信息，并再次注意到主角的\"金丝缠\"伤疤",
      "protagonistReaction": "主角心跳加速，苏婉儿对伤疤的异常反应仍是未解之谜",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": "「林师兄查到了一些事……关于灵气衰减。还有，你手臂上的伤疤……」",
        "protagonistResponse": "「这伤疤怎么了？」",
        "dramaticMeaning": "苏婉儿对伤疤的震惊反应暗示重大秘密，伤疤可能是某种标志或印记"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "moderate-to-slow",
        "technique": ["emotional-dialogue", "mystery-building"],
        "mood": "复杂·困惑·隐隐的期待",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "苏婉儿/林师兄", "action": "传递关键信息", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H005"],
      "transitionToNext": "三股势力压力同时达到临界，主角必须在夹缝中做出选择"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "破屋内",
      "sceneType": "action",
      "event": "天机簿残页失控震颤，一角短暂露出袖口，主角灵力被抽取至临界点",
      "protagonistReaction": "主角面色苍白、灵力波动不稳，身体出现明显虚弱症状",
      "keyDialogue": {
        "speaker": "主角（内心）",
        "line": "「糟了——被看到了吗？」",
        "protagonistResponse": null,
        "dramaticMeaning": "暴露风险剧增，若被观察者看到将极大增加主角危险"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "fast",
        "technique": ["action-verbs", "sensory-overload"],
        "mood": "危机·失控·紧迫",
        "wordCountTarget": 380
      },
      "factionActivity": [
        { "faction": "周平势力", "action": "观察者可能看到残页", "powerDelta": "+10（若确认主角持有残页）" }
      ],
      "hooksTouched": ["H001", "H002"],
      "transitionToNext": "残页失控震颤的瞬间，主角脑海中闪过远古画面"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "主角意识深处（灵泉幻象）",
      "sceneType": "revelation",
      "event": "残页失控瞬间，主角脑海闪过远古画面——灵泉充沛、灵气充沛的景象，与现状对比",
      "protagonistReaction": "主角沉浸在远古画面中，震撼于灵泉昔日的辉煌与如今的衰败",
      "keyDialogue": {
        "speaker": "主角（内心）",
        "line": "「原来……灵泉曾经如此充沛。天机簿记录的，不只是天机，更是这段消亡的历史。」",
        "protagonistResponse": null,
        "dramaticMeaning": "关键真相碎片获得：天机簿残页记录的是灵气衰减的历史，而非单纯的天机预言"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow",
        "technique": ["vision-sequence", "contrast-imagery"],
        "mood": "震撼·顿悟·历史的厚重",
        "wordCountTarget": 370
      },
      "factionActivity": [],
      "hooksTouched": ["H002", "H003"],
      "transitionToNext": "主角从幻象中回神，发现苏婉儿正注视着自己的\"金丝缠\"伤疤"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "破屋内",
      "sceneType": "action",
      "event": "灵泉异变进入不可控阶段，天机簿残页反噬加剧，主角陷入新困境",
      "protagonistReaction": "主角感到体内灵力枯竭，短期难以恢复，同时感知到灵泉方向的异变愈发剧烈",
      "keyDialogue": {
        "speaker": "主角（内心）",
        "line": "「三天？不，时间已经不够了……」",
        "protagonistResponse": null,
        "dramaticMeaning": "新困境确认：原定时间窗口已失效，灵泉可能随时彻底失控"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "desperation"],
        "mood": "绝望·危机·紧迫",
        "wordCountTarget": 250
      },
      "factionActivity": [
        { "faction": "周平势力", "action": "试探可能升级为正式行动", "powerDelta": "+15" }
      ],
      "hooksTouched": ["H001", "H002", "H004"],
      "transitionToNext": "就在主角陷入绝境时，意外的气息出现在破屋外——新势力入场"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "破屋外",
      "sceneType": "transition",
      "event": "第四股势力悄然入场，主角发现新机遇——灵气衰减周期的原始记载线索",
      "protagonistReaction": "主角强撑着站起身，透过窗缝看到一个陌生的身影正在接近",
      "keyDialogue": {
        "speaker": "陌生身影",
        "line": "「……你就是那个人？」",
        "protagonistResponse": "主角沉默，目光警惕",
        "dramaticMeaning": "新势力入场，格局即将重置；主角发现残页可能包含灵气衰减周期的原始记载"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow-to-moderate",
        "technique": ["mystery-introduction", "cliffhanger"],
        "mood": "悬念·未知·新局开启",
        "wordCountTarget": 200
      },
      "factionActivity": [
        { "faction": "第四势力", "action": "悄然入场", "powerDelta": "未知" }
      ],
      "hooksTouched": ["H001", "H002", "H003", "H004", "H005"],
      "transitionToNext": "章节在悬念中结束，新势力的目的、主角的应对以及三股旧势力的反应，将构成第8章的核心冲突"
    }
  ],
  "chapterSummary": {
    "chapterNumber": 7,
    "chapterTitle": "暴风雨已至",
    "chapterType": "回收章（payoff）",
    "totalWordCount": 3000,
    "corePayoff": [
      "灵泉异变正式爆发，远山光芒闪烁证实灵泉深处有未知存在苏醒",
      "主角意识到灵泉正在\"死去\"，与mustKeep中的灵气衰减周期设定关联",
      "天机簿残页失控暴露一角，暴露风险剧增",
      "主角获得关键真相碎片：天机簿记录的是灵气衰减的历史",
      "苏婉儿对\"金丝缠\"伤疤的异常反应再次被提及，伏笔深化",
     