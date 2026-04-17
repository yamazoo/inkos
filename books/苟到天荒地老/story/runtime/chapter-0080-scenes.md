```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "暗道深处",
      "sceneType": "action",
      "event": "陈守一在暗道中艰难前行，身体已达极限",
      "protagonistReaction": "七窍渗血、四肢无力、浑身颤抖，却仍咬牙向前，眉心金痕微微发热",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "身体……已经到极限了……",
        "protagonistResponse": "脚步不停，扶着潮湿的石壁继续前行",
        "dramaticMeaning": "身体与意志的对抗，为后续真相冲击埋下伏笔"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["long-sentences", "sensory-detail", "internal-focus"],
        "mood": "虚弱·坚持",
        "wordCountTarget": 300
      },
      "factionActivity": [],
      "hooksTouched": [],
      "transitionToNext": "暗道尽头出现微光"
    },
    {
      "sceneId": "B1-2",
      "beatId": "B1",
      "location": "暗道尽头",
      "sceneType": "action",
      "event": "暗道尽头出现若有若无的微光，幽冥兽嘶吼声渐远",
      "protagonistReaction": "心跳如擂鼓，目光紧盯那丝微光，脚步不由自主加快",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "是出口？还是……另一条岔路？",
        "protagonistResponse": "扶住石壁稳住身形，凝神观察微光来源",
        "dramaticMeaning": "悬念引入：微光是希望还是陷阱？"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "suspenseful",
        "technique": ["short-sentences", "contrast", "light-dark-imagery"],
        "mood": "希望·未知",
        "wordCountTarget": 360
      },
      "factionActivity": [{ "faction": "幽冥兽", "action": "嘶吼声远去", "powerDelta": -1 }],
      "hooksTouched": ["H001"],
      "transitionToNext": "陈守一继续前行，开始消化信息流"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "暗道中段",
      "sceneType": "reflection",
      "event": "陈守一消化守夜者第八代传来的信息流，因果反噬真相浮现",
      "protagonistReaction": "脚步放缓，眉头紧锁，瞳孔中倒映着因果线的虚影",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "每平衡一年……消耗一年寿元？失衡时双倍反噬？",
        "protagonistResponse": "身体一僵，扶着石壁的手骤然收紧",
        "dramaticMeaning": "真相初露：因果反噬的规则"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "measured",
        "technique": ["internal-monologue", "revelation-pacing", "flashback-triggered"],
        "mood": "震惊·困惑",
        "wordCountTarget": 450
      },
      "factionActivity": [],
      "hooksTouched": ["H120"],
      "transitionToNext": "主角开始意识到母亲的死与此有关"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "暗道拐角",
      "sceneType": "revelation",
      "event": "主角意识到母亲英年早逝与因果反噬有关",
      "protagonistReaction": "浑身发冷，指甲深深掐入掌心，泪水在眼眶中打转",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "娘……她的死，不只是因为封印……",
        "protagonistResponse": "蹲下身，额头抵着冰冷的石壁，肩膀微微颤抖",
        "dramaticMeaning": "因果反噬与母亲之死的关联初现"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["emotional-pause", "flashback-fragment", "sensory-memory"],
        "mood": "悲痛·追忆",
        "wordCountTarget": 420
      },
      "factionActivity": [],
      "hooksTouched": ["H120", "H033"],
      "transitionToNext": "主角强忍悲痛继续前行，意识深入因果线迷雾"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "暗道深处/因果线空间",
      "sceneType": "revelation",
      "event": "末法时代完整真相揭露——三百年前人类献祭修行界未来封印幽冥界",
      "protagonistReaction": "意识被拉入因果线，看到三百年前的献祭场景，瞳孔中倒映着灵气消散的画面",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "三百年前……他们用整个修行界的未来，换取了幽冥界的封印……",
        "protagonistResponse": "双膝跪地，双手撑地，浑身颤抖",
        "dramaticMeaning": "末法真相核心回收：末法时代是人类的选择"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "dramatic",
        "technique": ["vision-sequence", "historical-revelation", "epic-scale"],
        "mood": "震撼·悲怆",
        "wordCountTarget": 500
      },
      "factionActivity": [{ "faction": "冥族", "action": "三百年前被封印", "powerDelta": 0 }],
      "hooksTouched": ["H120", "H050"],
      "transitionToNext": "陈守一在因果线中看到冥将"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "因果线空间/冥将意识",
      "sceneType": "revelation",
      "event": "冥将目的深化——第二条路会让浩劫重演，冥族只知道吞噬与毁灭",
      "protagonistReaction": "意识被冥将的意志冲击，头痛欲裂，却强撑着没有退却",
      "keyDialogue": {
        "speaker": "冥将（因果线中）",
        "line": ""第二条路是死路。冥族不懂修复，只懂吞噬。封印一旦崩溃，浩劫将重演。"",
        "protagonistResponse": "咬紧牙关，目光坚定："那就走第三条路。"",
        "dramaticMeaning": "冥将否定第二条路，揭示冥族本性"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "intense",
        "technique": ["dialogue-heavy", "antagonist-perspective", "ideological-clash"],
        "mood": "对峙·坚定",
        "wordCountTarget": 400
      },
      "factionActivity": [{ "faction": "冥族", "action": "冥将试图说服主角", "powerDelta": 0 }],
      "hooksTouched": ["H120", "H025"],
      "transitionToNext": "陈守一看到母亲在因果线中的身影"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "因果线空间/母亲身影",
      "sceneType": "revelation",
      "event": "陈守一在因果线中看到母亲的牺牲，看到自己即将承受的命运",
      "protagonistReaction": "泪水无声滑落，双手颤抖着想要触碰那道身影却无法触及",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "娘……原来您一直在这里……看着我……",
        "protagonistResponse": "跪在因果线中，对着那道模糊的身影深深叩首",
        "dramaticMeaning": "母子在因果线中的隔空相遇"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "emotional",
        "technique": ["spectral-visitation", "parent-child-reunion", "sacrifice-foreshadow"],
        "mood": "悲痛·理解",
        "wordCountTarget": 450
      },
      "factionActivity": [],
      "hooksTouched": ["H033", "H120"],
      "transitionToNext": "身体极限压迫，意识被拉回现实"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "暗道深处（回归现实）",
      "sceneType": "revelation",
      "event": "因果反噬完整揭露——母亲是因果反噬的第一位受害者，用四十三年维持封印耗尽寿元",
      "protagonistReaction": "猛然睁开眼，剧烈咳嗽，七窍再次渗血，却目光坚定",
      "keyDialogue": {
        "speaker": "陈守一（低声）",
        "line": "因果反噬……娘是第一个承受的人……她替我……挡了四十三年的反噬……",
        "protagonistResponse": "身体颤抖，却缓缓站直，目光中悲恸与坚定并存",
        "dramaticMeaning": "母亲牺牲完整回收：因果反噬第一位受害者"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "revelatory",
        "technique": ["flashback-integration", "truth-unfolding", "emotional-peak"],
        "mood": "悲恸·明悟",
        "wordCountTarget": 450
      },
      "factionActivity": [],
      "hooksTouched": ["H033", "H120"],
      "transitionToNext": "主角彻底理解第三条路的完整代价"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "暗道深处",
      "sceneType": "reflection",
      "event": "陈守一彻底理解第三条路（成为活的锁）的完整代价：因果与寿元双重消耗",
      "protagonistReaction": "闭上眼睛，深吸一口气，再睁眼时目光清明而坚定",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "因果消耗寿元，寿元反哺因果。我将成为活的锁……直到油尽灯枯。",
        "protagonistResponse": "对着虚空深深叩首，额头触及冰冷的石地",
        "dramaticMeaning": "使命确立：第三条路的代价完整揭示"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "solemn",
        "technique": ["determination-solidify", "ritual-gesture", "resolution-statement"],
        "mood": "坚定·使命感",
        "wordCountTarget": 420
      },
      "factionActivity": [],
      "hooksTouched": ["H120", "H025"],
      "transitionToNext": "道心在悲痛中重塑完成"
    },
    {
      "sceneId": "B4-3",
      "beatId": "B4",
      "location": "暗道深处",
      "sceneType": "reflection",
      "event": "陈守一道心重塑完成，叩首祭奠母亲",
      "protagonistReaction": "三叩首后缓缓站起，擦去脸上血泪混合物，目光如炬",
      "keyDialogue": {
        "speaker": "陈守一（低声）",
        "line": "娘，孩儿不孝，来迟了。但您的路，孩儿会继续走下去。",
        "protagonistResponse": "转身，向着微光的方向继续前行，步伐比之前更加坚定",
        "dramaticMeaning": "情感弧线完成闭环：使命与亲情的统一"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "cathartic",
        "technique": ["ritual-completion", "emotional-release", "forward-motion"],
        "mood": "释然·决然",
        "wordCountTarget": 320
      },
      "factionActivity": [],
      "hooksTouched": ["H033"],
      "transitionToNext": "暗道尽头出现岔路"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "暗道尽头",
      "sceneType": "action",
      "event": "暗道尽头出现两条岔路——一条似有人声传来，另一条有微弱灵气波动",
      "protagonistReaction": "身体已达极限，扶住岔路石壁，喘息声粗重，瞳孔却紧盯两条路",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "两条路……时间不多了，身体撑不住了……",
        "protagonistResponse": "竖起耳朵仔细辨认两条路的声响",
        "dramaticMeaning": "章末转折：选择困难与时间压力"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["binary-choice", "sensory-description", "cliffhanger-setup"],
        "mood": "抉择·紧迫",
        "wordCountTarget": 380
      },
      "factionActivity": [
        { "faction": "赵猛/三聚居点", "action": "人声从左路传来", "powerDelta": 0 },
        { "faction": "废墟入口", "action": "灵气波动从右路传来", "powerDelta": 0 }
      ],
      "hooksTouched": ["H040", "H055"],
      "transitionToNext": "主角必须做出选择"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "暗道岔路口",
      "sceneType": "action",
      "event": "陈守一做出选择，身体极限与时间压力并存",
      "protagonistReaction": "身体摇晃，鲜血从嘴角溢出，却咬牙做出决断",
      "keyDialogue": {
        "speaker": "陈守一（虚弱但坚定）",
        "line": "先去……有人声的地方……确认……赵猛他们的安全……",
        "protagonistResponse": "强撑着身体倒向左侧岔路，脚步踉跄却义无反顾",
        "dramaticMeaning": "章末转折完成：代价与机遇并存，新篇章开启"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "decisive",
        "technique": ["final-choice", "open-ending", "suspense-maintained"],
        "mood": "决断·未知",
        "wordCountTarget": 380
      },
      "factionActivity": [
        { "faction": "赵猛/三聚居点", "action": "可能是主角下一站", "powerDelta": 0 },
        { "faction": "废墟入口", "action": "另一条可能的线索", "powerDelta": 0 }
      ],
      "hooksTouched": ["H040", "H055", "H120"],
      "transitionToNext": "主角踏入左侧岔路，身影消失在黑暗与人声交织处"
    }
  ],
  "summary": {
    "totalScenes": 12,
    "targetWordCount": 3000,
    "estimatedWordCount": 2950,
    "beatDistribution": {
      "B1": "2 scenes (660 words)",
      "B2": "2 scenes (870 words)",
     