
```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "杂役区破屋",
      "sceneType": "action",
      "event": "小路急促示警，执法弟子破门而入",
      "protagonistReaction": "陈守一刚收好天机簿残页，心跳骤停但面色如常",
      "keyDialogue": {
        "speaker": "小路",
        "line": "「有人来了！脚步很急，是冲咱们这方向来的！」",
        "protagonistResponse": "陈守一迅速将残页藏入夹层，低声道「别慌」",
        "dramaticMeaning": "紧张情绪从思考延续到现实威胁"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "action-verbs"],
        "mood": "警觉·压迫",
        "wordCountTarget": 180
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "派遣两名弟子上门拿人", "powerDelta": 1 }
      ],
      "hooksTouched": ["H001"],
      "transitionToNext": "执法弟子以例行问话为由带人，小路被挡在门外"
    },
    {
      "sceneId": "B1-2",
      "beatId": "B1",
      "location": "执法堂廊道",
      "sceneType": "reflection",
      "event": "陈守一被押往深处，廊道灯火摇曳，气氛压抑",
      "protagonistReaction": "陈守一观察方向，意识到并非杂役区常见审讯处",
      "keyDialogue": {
        "speaker": "执法弟子A",
        "line": "「例行问话，配合就好。」",
        "protagonistResponse": "陈守一沉默点头，心中暗记廊道布局",
        "dramaticMeaning": "执法堂全面介入，暗示事态升级"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "deliberate",
        "technique": ["observation-details", "internal-monologue"],
        "mood": "压抑·不安",
        "wordCountTarget": 180
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "弟子押送陈守一前往核心区域", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001"],
      "transitionToNext": "审讯室门缓缓打开，室内烛火通明"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "执法堂审讯室",
      "sceneType": "revelation",
      "event": "苏婉儿正式登场，审讯室内景描写",
      "protagonistReaction": "陈守一目光扫过匾额\"天理昭昭\"，落在审讯者身上",
      "keyDialogue": {
        "speaker": "叙述者",
        "line": "苏婉儿年约二十五六，面容冷峻中带着审视，与中年男子的气质截然不同却又有某种说不清的相似",
        "protagonistResponse": "陈守一心头微动，将这份相似默默记下",
        "dramaticMeaning": "伏笔线交汇前兆，苏婉儿与中年男子关联浮现"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "measured",
        "technique": ["setting-details", "character-introduction"],
        "mood": "冷峻·审视",
        "wordCountTarget": 220
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "苏婉儿主持审讯", "powerDelta": 1 }
      ],
      "hooksTouched": ["H002"],
      "transitionToNext": "苏婉儿开口，审讯正式开始"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "执法堂审讯室",
      "sceneType": "dialogue",
      "event": "苏婉儿提问精准，陈守一感到被彻底看穿",
      "protagonistReaction": "陈守一后背微寒，意识到执法堂掌握的情报远超预期",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": "「虫卵从何而来？你如何发现那处隐蔽阵法？还有……你感知能力的来源。」",
        "protagonistResponse": "「回春堂采药时偶然所见。阵法是药理知识推断。至于感知……」",
        "dramaticMeaning": "审讯者掌握过多情报，陈守一失去\"不冒头\"的退路"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "deliberate",
        "technique": ["question-answer", "tension-building"],
        "mood": "紧绷·试探",
        "wordCountTarget": 230
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "苏婉儿审讯套话", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H002"],
      "transitionToNext": "苏婉儿提及\"三日后\"约定与\"老槐树\"，陈守一心头一震"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "执法堂审讯室",
      "sceneType": "action",
      "event": "苏婉儿话锋一转，要求检查陈守一身体",
      "protagonistReaction": "陈守一心中警铃大作，却无法拒绝这个\"合理\"要求",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": "「虫卵栽赃需确认来源。请卷起左袖。」",
        "protagonistResponse": "陈守一依言而行，指尖微微收紧",
        "dramaticMeaning": "平静湖面下暗流涌动，伤疤即将暴露"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "suspenseful",
        "technique": ["slow-motion", "anticipation"],
        "mood": "紧张·等待",
        "wordCountTarget": 270
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "苏婉儿主导检查", "powerDelta": 0 }
      ],
      "hooksTouched": ["H003"],
      "transitionToNext": "袄袖卷起，烛光下伤疤暴露"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "执法堂审讯室",
      "sceneType": "revelation",
      "event": "\"金丝缠\"伤疤暴露，苏婉儿瞳孔骤缩",
      "protagonistReaction": "陈守一感受到空气中骤变的气场，揣测苏婉儿反应",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": "「金丝缠。」",
        "protagonistResponse": "陈守一沉默，等待对方解释",
        "dramaticMeaning": "关键伏笔揭露——灵气外放者身份确认"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "staccato",
        "technique": ["short-exclamations", "frozen-moment"],
        "mood": "震惊·凝滞",
        "wordCountTarget": 270
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "苏婉儿情绪波动", "powerDelta": -0.5 }
      ],
      "hooksTouched": ["H003", "H004"],
      "transitionToNext": "苏婉儿表情经历复杂变化，追问陈守一来历"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "执法堂审讯室",
      "sceneType": "dialogue",
      "event": "苏婉儿追问\"金丝缠\"来历，语气不复冷硬",
      "protagonistReaction": "陈守一坦然以对，回答\"不知有记忆起就在杂役区\"",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": "「你从哪里来的？」",
        "protagonistResponse": "「不知道。有记忆起就在杂役区。」",
        "dramaticMeaning": "审讯者与被审者立场微妙互换"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "measured",
        "technique": ["dialogue-heavy", "emotional-shift"],
        "mood": "困惑·试探",
        "wordCountTarget": 270
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "苏婉儿态度软化", "powerDelta": -0.5 }
      ],
      "hooksTouched": ["H003", "H004"],
      "transitionToNext": "苏婉儿解释\"金丝缠\"含义——灵气外放失控痕迹"
    },
    {
      "sceneId": "B3-4",
      "beatId": "B3",
      "location": "执法堂审讯室",
      "sceneType": "revelation",
      "event": "苏婉儿揭示\"金丝缠\"真相——灵气利用率与外放者",
      "protagonistReaction": "陈守一听闻\"百年难遇\"，意识到自己处境更加危险",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": "「灵气利用率当世不足三成，能外放者……百年难遇一个。」",
        "protagonistResponse": "陈守一垂眸，将这句话与远古典籍记载的100%利用率暗相对照",
        "dramaticMeaning": "核心设定揭露：灵气衰减周期伏笔回收"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "deliberate",
        "technique": ["exposition", "foreshadowing-confirmation"],
        "mood": "沉重·觉醒",
        "wordCountTarget": 270
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "苏婉儿暴露内部认知", "powerDelta": 0 }
      ],
      "hooksTouched": ["H003", "H004", "H005"],
      "transitionToNext": "审讯室陷入更深沉默，苏婉儿情绪暗涌"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "执法堂审讯室",
      "sceneType": "action",
      "event": "苏婉儿情绪失控边缘，提及中年男子相关线索",
      "protagonistReaction": "陈守一敏锐捕捉到苏婉儿极力压抑的激动与哀伤",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": "「这伤疤……多久了？」",
        "protagonistResponse": "「不知。记事起便有。」",
        "dramaticMeaning": "苏婉儿与中年男子关联进一步确认——两人可能相识"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "emotional-surge",
        "technique": ["emotional-tags", "body-language"],
        "mood": "复杂·紧绷",
        "wordCountTarget": 250
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "苏婉儿情绪失控暴露弱点", "powerDelta": -1 }
      ],
      "hooksTouched": ["H002", "H003"],
      "transitionToNext": "苏婉儿强自镇定，转移话题提及老槐树"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "执法堂审讯室",
      "sceneType": "revelation",
      "event": "关键线索串联：老槐树成为苏婉儿与中年男子的交汇点",
      "protagonistReaction": "陈守一心中飞速运转——中年男子指引的方向，苏婉儿此刻提及的地点，两者重合",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": "「老槐树……你可知道那处？」",
        "protagonistResponse": "陈守一沉默片刻：「听杂役房的前辈提过。」",
        "dramaticMeaning": "多条伏笔线在审讯室交汇，情节复杂度升级"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "deliberate",
        "technique": ["revelation-confirmation", "mental-connection"],
        "mood": "恍然·警觉",
        "wordCountTarget": 250
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "内部情报流通，苏婉儿掌握线索", "powerDelta": 0 },
        { "faction": "执法堂", "action": "执法堂内部裂隙初现", "powerDelta": -0.5 }
      ],
      "hooksTouched": ["H001", "H002"],
      "transitionToNext": "审讯室气氛微妙变化，有人打破僵局或意外发生"
    },
    {
      "sceneId": "B4-3",
      "beatId": "B4",
      "location": "执法堂审讯室",
      "sceneType": "reflection",
      "event": "陈守一感知能力被完全掌握后，陷入更大漩涡的认知",
      "protagonistReaction": "陈守一意识到自己从\"普通杂役\"彻底蜕变为\"被关注对象\"",
      "keyDialogue": {
        "speaker": "叙述者",
        "line": "陈守一感知到苏婉儿身后廊道中，有另一道目光正注视着审讯室内的一切",
        "protagonistResponse": "他面色不变，心中却掀起惊涛骇浪",
        "dramaticMeaning": "陈守一陷入更大漩涡，但同时执法堂内部矛盾也浮出水面"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "internal-surge",
        "technique": ["perception-detail", "dramatic-irony"],
        "mood": "惊觉·暗流",
        "wordCountTarget": 250
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "未知第三方监视审讯", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H003"],
      "transitionToNext": "审讯被迫中断，意外访客或消息打断"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "执法堂审讯室",
      "sceneType": "action",
      "event": "灵泉方向传来低沉闷响，地面微微震颤",
      "protagonistReaction": "陈守一体内残页与灵泉异变产生共鸣感应",
      "keyDialogue": {
        "speaker": "叙述者",
        "line": "沉闷的声响从地底深处传来，仿佛有什么被封印已久的东西正在苏醒",
        "protagonistResponse": "陈守一按住胸口，感受到残页前所未有的躁动",
        "dramaticMeaning": "多线伏笔汇聚，灵泉变故前兆显现"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "dramatic",
        "technique": ["sensory-detail", "tension-shift"],
        "mood": "震颤·不安",
        "wordCountTarget": 180
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "灵泉异变引发警觉", "powerDelta": 0 },
        {