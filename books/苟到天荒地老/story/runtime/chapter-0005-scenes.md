
```json
{
  "scenes": [
    {
      "sceneId": "B5-1",
      "beatId": "B5-1",
      "location": "破屋内·深夜",
      "sceneType": "revelation",
      "event": "陈守一从噩梦中惊醒，天机簿残页异动，灵泉方向传来沉闷异响",
      "protagonistReaction": "猛然睁眼，胸膛剧烈起伏，指尖触及滚烫的残页",
      "keyDialogue": { "speaker": "无（独白）", "line": "「灵泉……又出事了。」", "protagonistResponse": "「这震动，不对劲。」", "dramaticMeaning": "危机信号立即落地，悬念承接上章" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "urgent", "technique": ["short-sentences", "sensory-detail"], "mood": "警觉·不安", "wordCountTarget": 280 },
      "factionActivity": [{ "faction": "执法堂", "action": "暗中监视破屋方向", "powerDelta": 0 }],
      "hooksTouched": ["H001", "H003"],
      "transitionToNext": "异响过后，破屋外传来轻微脚步声"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5-2",
      "location": "破屋内·深夜",
      "sceneType": "dialogue",
      "event": "苏婉儿深夜密访，神色紧张地敲门确认身份",
      "protagonistReaction": "警觉中开门，确认无人跟踪后才侧身让入",
      "keyDialogue": { "speaker": "苏婉儿", "line": "「是我，别动手。」", "protagonistResponse": "「……进来说。」", "dramaticMeaning": "深夜密访暗示事态紧急" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "measured", "technique": ["suspense-building", "environmental-detail"], "mood": "紧张·审视", "wordCountTarget": 350 },
      "factionActivity": [{ "faction": "苏婉儿", "action": "冒险传递情报", "powerDelta": 0 }],
      "hooksTouched": ["H002"],
      "transitionToNext": "苏婉儿入内后迅速掩上门，警惕地望向窗外"
    },
    {
      "sceneId": "B5-3",
      "beatId": "B5-2",
      "location": "破屋内·深夜",
      "sceneType": "revelation",
      "event": "苏婉儿说明来意：灵泉异动、执法堂动态及她所掌握的情报网络",
      "protagonistReaction": "沉默倾听，心中快速权衡信任与风险",
      "keyDialogue": { "speaker": "苏婉儿", "line": "「灵泉的动静……比你想的更复杂。有人在动手脚。」", "protagonistResponse": "「……你知道是谁？」", "dramaticMeaning": "关键情报初露端倪，建立信息交换基础" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "moderate", "technique": ["information-reveal", "psychological-tension"], "mood": "审慎·求证", "wordCountTarget": 400 },
      "factionActivity": [
        { "faction": "苏婉儿情报网", "action": "监控灵泉异常", "powerDelta": "+5%情报优势" },
        { "faction": "执法堂", "action": "内部权力暗斗", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H004"],
      "transitionToNext": "苏婉儿话锋一转，要求陈守一也亮出底牌"
    },
    {
      "sceneId": "B5-4",
      "beatId": "B5-3",
      "location": "破屋内·深夜",
      "sceneType": "dialogue",
      "event": "信任博弈开始：双方试探底线，陈守一要求先见诚意",
      "protagonistReaction": "目光平静却暗藏锋芒，绝不先交底牌",
      "keyDialogue": { "speaker": "陈守一", "line": "「空口无凭。你说有人动手脚——证据呢？」", "protagonistResponse": "「我也有东西要确认。」", "dramaticMeaning": "试探与伪装的博弈，信息交换的第一道门槛" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "tense", "technique": ["verbal-sparring", "subtext"], "mood": "对峙·谨慎", "wordCountTarget": 380 },
      "factionActivity": [{ "faction": "苏婉儿", "action": "在信任边缘试探", "powerDelta": 0 }],
      "hooksTouched": ["H002", "H005"],
      "transitionToNext": "苏婉儿从怀中取出一样东西作为诚意证明"
    },
    {
      "sceneId": "B5-5",
      "beatId": "B5-3",
      "location": "破屋内·深夜",
      "sceneType": "revelation",
      "event": "灵气衰减真相初揭：灵脉枯竭非天灾，人为抽取痕迹明显",
      "protagonistReaction": "瞳孔微缩，心中震惊却强压情绪，继续追问",
      "keyDialogue": { "speaker": "苏婉儿", "line": "「看这里——灵脉走向的记录。三天前，有人用禁术抽取灵气。」", "protagonistResponse": "「……执法堂？」", "dramaticMeaning": "真相碎片首次揭示，多方势力暗流初现" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "revealing", "technique": ["evidence-presentation", "dramatic-pause"], "mood": "震惊·深思", "wordCountTarget": 420 },
      "factionActivity": [
        { "faction": "幕后势力", "action": "抽取灵气证据初现", "powerDelta": 0 },
        { "faction": "执法堂", "action": "涉嫌参与被暗示", "powerDelta": "-10%公信力" }
      ],
      "hooksTouched": ["H001", "H004"],
      "transitionToNext": "陈守一决定亮出天机簿残页的部分信息作为回应"
    },
    {
      "sceneId": "B5-6",
      "beatId": "B5-3",
      "location": "破屋内·深夜",
      "sceneType": "dialogue",
      "event": "信任白热化：信息交换完成，陈守一确认苏婉儿可合作",
      "protagonistReaction": "终于放下部分戒心，开始坦诚交流",
      "keyDialogue": { "speaker": "陈守一", "line": "「这东西……它能感应灵泉的异动。刚才的震颤，就是证明。」", "protagonistResponse": "「我们需要联手。」", "dramaticMeaning": "双方达成初步合作意向，真相交换完成" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "climactic", "technique": ["mutual-revelation", "rapport-building"], "mood": "紧绷·释然", "wordCountTarget": 350 },
      "factionActivity": [
        { "faction": "陈守一", "action": "亮出天机簿残页部分信息", "powerDelta": "+5%情报共享" },
        { "faction": "苏婉儿", "action": "提供额外线索作为回报", "powerDelta": "+5%信任度" }
      ],
      "hooksTouched": ["H002", "H003"],
      "transitionToNext": "苏婉儿开始讲述往事，话锋一转——"
    },
    {
      "sceneId": "B5-7",
      "beatId": "B5-4",
      "location": "破屋内·深夜",
      "sceneType": "reflection",
      "event": "往事浮现：苏婉儿道出伤疤来历——三年前秘境之行的代价",
      "protagonistReaction": "沉默倾听，目光落在苏婉儿颈间若隐若现的伤疤上",
      "keyDialogue": { "speaker": "苏婉儿", "line": "「这道疤……是三年前留下的。那次秘境探险，我们折了三个同伴。」", "protagonistResponse": "「……秘境在哪？」", "dramaticMeaning": "伤疤来历初解，旧日伤痕与当前危局形成呼应" },
      "povCharacter": "苏婉儿",
      "pacing": { "speed": "contemplative", "technique": ["flashback-technique", "emotional-reveal"], "mood": "沉重·追忆", "wordCountTarget": 400 },
      "factionActivity": [
        { "faction": "苏婉儿", "action": "回忆往事，袒露过去", "powerDelta": 0 },
        { "faction": "执法堂", "action": "可能与秘境有关联", "powerDelta": 0 }
      ],
      "hooksTouched": ["H002", "H004"],
      "transitionToNext": "苏婉儿透露秘境线索与老槐树方向有关"
    },
    {
      "sceneId": "B5-8",
      "beatId": "B5-4",
      "location": "破屋内·深夜",
      "sceneType": "transition",
      "event": "苏婉儿离去：夜深必须离开，留下约定与承诺",
      "protagonistReaction": "目送她消失在夜色中，心中五味杂陈",
      "keyDialogue": { "speaker": "苏婉儿", "line": "「三天之内，我会再来。小心执法堂——他们已经注意到你了。」", "protagonistResponse": "「……保重。」", "dramaticMeaning": "离别时刻，信任初建却危机仍在" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "bittersweet", "technique": ["departure-ritual", "lonely-reflection"], "mood": "怅然·警醒", "wordCountTarget": 320 },
      "factionActivity": [
        { "faction": "苏婉儿", "action": "离开破屋，消失在夜色中", "powerDelta": "+10%信任基础" },
        { "faction": "执法堂", "action": "标记效应显现，监视升级", "powerDelta": "+5%威胁感知" }
      ],
      "hooksTouched": ["H002", "H005"],
      "transitionToNext": "门扉合上，陈守一独坐黑暗中，思绪万千"
    },
    {
      "sceneId": "B5-9",
      "beatId": "B5-5",
      "location": "破屋内·黎明前",
      "sceneType": "reflection",
      "event": "三日倒计时压力陡增：主角独自面对时间紧迫感",
      "protagonistReaction": "握紧天机簿残页，感受其微微温热，脑中飞速盘算",
      "keyDialogue": { "speaker": "无（独白）", "line": "「三天……只有三天。」", "protagonistResponse": "「灵泉那边，等不了太久。」", "dramaticMeaning": "压力具象化，时间紧迫感扑面而来" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "introspective", "technique": ["internal-monologue", "time-pressure"], "mood": "焦灼·决断", "wordCountTarget": 280 },
      "factionActivity": [{ "faction": "执法堂", "action": "标记效应持续发酵", "powerDelta": "+5%威胁" }],
      "hooksTouched": ["H001", "H003"],
      "transitionToNext": "窗外天色微明，主角目光投向小路尽头"
    },
    {
      "sceneId": "B5-10",
      "beatId": "B5-5",
      "location": "破屋外·晨曦微露",
      "sceneType": "transition",
      "event": "小路尽头方向确认：老槐树方向成为下一步行动目标",
      "protagonistReaction": "推门而出，冷风扑面，远处老槐树轮廓在晨雾中若隐若现",
      "keyDialogue": { "speaker": "无（独白）", "line": "「苏婉儿说的那条路……就在老槐树后面。」", "protagonistResponse": "「得趁执法堂动手之前，先去看看。」", "dramaticMeaning": "路线明确，下章秘境探险伏笔埋下" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "forward-moving", "technique": ["scene-composition", "foreshadowing"], "mood": "决然·期待", "wordCountTarget": 320 },
      "factionActivity": [
        { "faction": "执法堂", "action": "多势力角逐正式开始", "powerDelta": "+10%威胁感知" },
        { "faction": "幕后势力", "action": "灵气抽取行动持续", "powerDelta": "+5%紧迫性" }
      ],
      "hooksTouched": ["H001", "H002", "H004", "H005"],
      "transitionToNext": "晨光中，陈守一迈步走向老槐树方向——多势力角逐的序幕正式拉开"
    }
  ],
  "summary": {
    "totalScenes": 10,
    "totalWordCountTarget": 3400,
    "beatCoverage": {
      "B5-1": ["B5-1"],
      "B5-2": ["B5-2", "B5-3"],
      "B5-3": ["B5-4", "B5-5", "B5-6"],
      "B5-4": ["B5-7", "B5-8"],
      "B5-5": ["B5-9", "B5-10"]
    },
    "costGainSummary": {
      "cost": ["秘密暴露风险升级", "苏婉儿离去、真相碎片仍残缺", "三日倒计时压力陡增"],
      "gain": ["关键情报获取", "伤疤来历初解、路线明确", "老槐树方向确认"]
    },
    "factionDynamics": {
      "青云门执法堂": "标记效应显现，监视升级",
      "苏婉儿": "信任初建，情报网络支持",
      "幕后势力": "灵气抽取行动持续进行",
      "陈守一": "获得关键盟友与前进方向"
    },
    "hooksActivated": ["H001灵泉异动", "H002苏婉儿信任线", "H003天机簿秘密", "H004灵气衰减真相", "H005执法堂标记"]
  }
}
```