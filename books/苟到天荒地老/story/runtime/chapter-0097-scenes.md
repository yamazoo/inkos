

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "三聚居点外围河岸",
      "sceneType": "action",
      "event": "陈守一怀抱孩子涉水渡河，黎明微光中艰难前行，两枚玉佩贴身滚烫",
      "protagonistReaction": "陈守一咬牙坚持，脚步沉重却不曾停顿，心中默念'再快一点'",
      "keyDialogue": {
        "speaker": "孩子",
        "line": "叔叔，你是不是很冷？你的手在抖。",
        "protagonistResponse": "没事，快到了，抱紧我。",
        "dramaticMeaning": "以孩子的纯真视角揭示陈守一的真实状态，为后续体力透支埋下伏笔"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "intense",
        "technique": ["short-sentences", "sensory-details", "internal-monologue"],
        "mood": "紧迫·黎明前的希望",
        "wordCountTarget": 380
      },
      "factionActivity": [],
      "hooksTouched": [],
      "transitionToNext": "天际泛起鱼肚白，远处石桥轮廓在晨曦中显现"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "三聚居点外围山道",
      "sceneType": "action",
      "event": "陈守一体力透支在黎明前的最后一程彻底暴露，经脉火烫冰浸交替，五脏被无形的手攥紧又松开",
      "protagonistReaction": "陈守一额角青筋暴起，冷汗与河水混在一起，膝盖几次打软却硬撑着没有跪倒",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "撑住，再撑一段……青鸾还等着，不能倒在这里。",
        "protagonistResponse": "",
        "dramaticMeaning": "揭示三源反噬的剧烈程度，暗示代价正在累积"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["physiological-detail", "fragmented-thoughts", "action-verbs"],
        "mood": "挣扎·极限边缘",
        "wordCountTarget": 420
      },
      "factionActivity": [],
      "hooksTouched": ["H137_三源归一仪式代价"],
      "transitionToNext": "石桥的轮廓在晨光中越来越清晰，桥头有人影等候"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "三聚居点石桥桥头",
      "sceneType": "reflection",
      "event": "陈守一踏上石桥，看清桥头等候的身影——沈炼已在寒风中守候多时",
      "protagonistReaction": "陈守一长舒一口气，紧绷的心弦终于松动几分，脚步却不自觉加快",
      "keyDialogue": {
        "speaker": "沈炼",
        "line": "你比预计的晚了半个时辰。我以为……",
        "protagonistResponse": "出了些意外。路上耽搁了。",
        "dramaticMeaning": "沈炼的担忧与陈守一的克制形成对比，暗示双方都在隐瞒某些事"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["environmental-description", "facial-expression", "dialogue-exchange"],
        "mood": "重逢·紧绷中的喘息",
        "wordCountTarget": 380
      },
      "factionActivity": [
        { "faction": "沈炼势力", "action": "在石桥等候陈守一", "powerDelta": 0 }
      ],
      "hooksTouched": [],
      "transitionToNext": "沈炼的目光落在陈守一背上的孩子身上，神色微变"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "石桥中央石台",
      "sceneType": "action",
      "event": "陈守一跟随沈炼来到桥中央石台，青鸾躺在石台上，侵蚀的黑纹已蔓延至锁骨以下，意识半昏迷",
      "protagonistReaction": "陈守一心头一紧，快步上前查看青鸾状况，手指搭上她的脉搏——气息紊乱，经脉如游丝",
      "keyDialogue": {
        "speaker": "沈炼",
        "line": "昨夜子时开始恶化。她一直在撑着，说你要来。",
        "protagonistResponse": "她的时间不多了。我带回来的东西……或许能救她。",
        "dramaticMeaning": "青鸾的坚守与陈守一的紧迫形成张力，揭示双方都在为彼此付出代价"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["close-observation", "emotional-restraint", "medical-detail"],
        "mood": "焦急·紧迫的汇合",
        "wordCountTarget": 450
      },
      "factionActivity": [
        { "faction": "沈炼势力", "action": "守护青鸾等待汇合", "powerDelta": 0 }
      ],
      "hooksTouched": ["H139_祭坛深处存在"],
      "transitionToNext": "陈守一从怀中取出两枚玉佩，放在青鸾身旁，玉佩突然发出微弱光芒"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "石桥中央石台",
      "sceneType": "revelation",
      "event": "三人正式会合，开始交换信息——陈守一的碎片记忆与沈炼二十年守墓的积淀终于拼凑完整",
      "protagonistReaction": "陈守一一边稳定青鸾的气息，一边断断续续讲述河底墓室、壁画、十七人的真相",
      "keyDialogue": {
        "speaker": "沈炼",
        "line": "所以三百年前那场浩劫，不是天灾，是人祸。那十七个人……是自愿走上桥的。",
        "protagonistResponse": "壁画上有句话——'以吾等之躯，镇万世之劫'。他们是第一批支撑点。",
        "dramaticMeaning": "真相的首次完整揭露，揭示三百年前人类主动选择了牺牲"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "deliberate",
        "technique": ["exposition", "flashback-integration", "overlapping-narratives"],
        "mood": "揭秘·真相拼凑",
        "wordCountTarget": 520
      },
      "factionActivity": [
        { "faction": "陈守一势力", "action": "带来关键真相碎片", "powerDelta": "+确认盟友" }
      ],
      "hooksTouched": ["H147_壁画女人身份", "H143_母亲玉佩碎片"],
      "transitionToNext": "石台上的青鸾突然睁开眼睛，目光涣散却清醒"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "石桥中央石台",
      "sceneType": "revelation",
      "event": "青鸾醒来，揭示仪式完整条件与代价——以生命为代价，神魂永镇；同时三人代价全面清算",
      "protagonistReaction": "陈守一面色凝重，青鸾的话让他意识到仪式的残酷远超想象——这不是一个人的牺牲，而是永世的囚禁",
      "keyDialogue": {
        "speaker": "青鸾",
        "line": "三源归一的代价……是要有人的神魂，永远留在桥下。不是死，是生不如死的'镇'。三百年来只有一个人成功过——第一个走上桥的女人。",
        "protagonistResponse": "……那个人，就是壁画上的女人？",
        "dramaticMeaning": "揭示仪式的终极代价，为后续选择埋下道德困境"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "dramatic",
        "technique": ["pause", "weighted-silence", "revelation-pacing"],
        "mood": "沉重·代价清算",
        "wordCountTarget": 580
      },
      "factionActivity": [
        { "faction": "沈炼势力", "action": "二十年守墓代价确认", "powerDelta": "-半生" }
      ],
      "hooksTouched": ["H137_三源归一仪式代价", "H146_桥需要更多支撑"],
      "transitionToNext": "青鸾点头，指向陈守一怀中的玉佩"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "石桥中央石台",
      "sceneType": "revelation",
      "event": "青鸾揭示桥的完整机制与仪式关键条件——需要亲眼见过冥族的人作为支撑点，而这样的人凤毛麟角",
      "protagonistReaction": "陈守一猛然意识到，这才是最致命的瓶颈——三百年前有十七人见过冥族，但如今……见过冥族的人，几乎都已死绝",
      "keyDialogue": {
        "speaker": "青鸾",
        "line": "支撑点不只是人数，而是亲眼见证过那场浩劫的人。他们必须见过冥族，必须记得那夜的恐惧……这种记忆，无法伪造，也无法传承。",
        "protagonistResponse": "你的侵蚀……是因为你见过？",
        "dramaticMeaning": "揭示青鸾二十年来的坚守代价，以及仪式对'见证者'的残酷要求"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "revelatory",
        "technique": ["staccato-dialogue", "realization-delayed", "cause-effect-chain"],
        "mood": "顿悟·真相浮现",
        "wordCountTarget": 550
      },
      "factionActivity": [],
      "hooksTouched": ["mystery-陈守一需要找到更多见过冥族的人作为支撑点"],
      "transitionToNext": "沈炼开口，说出一个尘封二十年的秘密"
    },
    {
      "sceneId": "B4-3",
      "beatId": "B4",
      "location": "石桥中央石台",
      "sceneType": "revelation",
      "event": "陈守一的血脉之谜揭开——玉佩主人正是三百年前第一个自愿走上桥的壁画女人，他的血脉源自她",
      "protagonistReaction": "陈守一握紧玉佩，脑中闪过母亲临终前的眼神，恍然大悟——她早就知道自己血脉的重量",
      "keyDialogue": {
        "speaker": "沈炼",
        "line": "这玉佩……是她的遗物。三百年来代代相传，到了你母亲手里。你以为她为什么把这东西留给你？",
        "protagonistResponse": "她知道……她一直都知道这一天会来。",
        "dramaticMeaning": "将个人血脉与三百年大义连接，陈守一的责任不再是选择，而是宿命"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "emotional-peak",
        "technique": ["flashback", "emotional-realization", "lineage-revelation"],
        "mood": "震动·血脉觉醒",
        "wordCountTarget": 480
      },
      "factionActivity": [],
      "hooksTouched": ["H143_母亲玉佩碎片", "H147_壁画女人身份"],
      "transitionToNext": "石桥突然震动，远处传来诡异的波动——分身正在逼近"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "石桥中央石台",
      "sceneType": "revelation",
      "event": "分身威胁再次浮现，陈守一等人必须立刻转移；同时新困境与新机遇并存——需要找到更多见过冥族的人",
      "protagonistReaction": "陈守一将孩子交给沈炼，目光扫过石桥、晨曦、身边的同伴，心中已有决断",
      "keyDialogue": {
        "speaker": "沈炼",
        "line": "它又来了。我们没有时间了。",
        "protagonistResponse": "那就边走边说。青鸾能动吗？",
        "dramaticMeaning": "紧迫感与决断力的结合，展现团队在绝境中的凝聚力"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "transitional",
        "technique": ["quick-decisions", "action-priority", "forward-momentum"],
        "mood": "紧迫·新起点",
        "wordCountTarget": 380
      },
      "factionActivity": [
        { "faction": "旧势力", "action": "分身追踪逼近", "powerDelta": "+威胁" }
      ],
      "hooksTouched": ["H139_祭坛深处存在"],
      "transitionToNext": "青鸾挣扎着坐起身，说出一个尘封的名字——二十年前，还有一个见过冥族的人"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "三聚居点外围山道",
      "sceneType": "action",
      "event": "四人正式组成核心团队，开始新的征程；青鸾透露另一个关键线索——二十年前还有幸存者",
      "protagonistReaction": "陈守一扶起青鸾，回头看了孩子一眼，目光坚定地迈向晨曦",
      "keyDialogue": {
        "speaker": "青鸾",
        "line": "当年我父亲带着我逃离祭坛时，还有一个人——他比我父亲走得更深，看得更多。他叫秦无涯，如果还活着……就在临渊城。",
        "protagonistResponse": "临渊城。三日路程。够了。",
        "dramaticMeaning": "为下一章的临渊城之行埋下伏笔，同时确认新任务目标"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "resolute",
        "technique": ["determination", "team-formation", "quest-update"],
        "mood": "希望·新的征程",
        "wordCountTarget": 420
      },
      "factionActivity": [
        { "faction": "陈守一势力", "action": "四人核心团队正式形成", "powerDelta": "+团队凝聚" }
      ],
      "hooksTouched": ["mystery-陈守一需要找到更多见过冥族的人作为支撑点"],
      "transitionToNext": "晨光洒满山道，四人身影渐行渐远，新的旅程正式开始"
    }
  ],
  "sceneSummary": {
    "totalScenes": 10,
    "totalWordCount": 4560,
    "beatCoverage": {
      "B1": { "scenes": 1, "wordCount": 380, "covered": true },
      "B2": { "scenes": 2, "wordCount": 800, "covered": true },
      "B3": { "scenes": 2, "wordCount": 970, "covered": true },
      "B4": { "scenes": 3, "wordCount": 1610, "covered": true },
      "B5": { "scenes": 2, "wordCount": 800, "covered": true }
    },
    "hooksFullyAddressed": [
      "H137_三源归一仪式代价",
      "H143_母亲玉佩碎片",
      "H146_桥需要更多支撑",
      "H147_壁画女人身份",
      "mystery-陈守一需要找到更多见过冥族的人作为支撑点"
    ],
    "hooksPartiallyAddressed": [
      "H139_祭坛深处存在"
    ],
    "costGainMapping": {
      "B4": {
        "cost": "陈守一三源反噬极限/青鸾侵蚀逼近心口/沈炼二十年耗尽",
        "gain": "末法真相完整拼图/三源归一仪式完整图景/四人命运线交汇"
      },
      "B5": {
        "cost": "仪式条件严苛（需亲眼见过冥族的人）/分身追踪威胁",
        "gain": "完整真相的说服资本/临渊城秦无涯