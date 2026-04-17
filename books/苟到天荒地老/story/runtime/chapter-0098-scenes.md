```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "石桥·黎明时分",
      "sceneType": "reflection",
      "event": "陈守一抱着孩子于桥头等待，湿透衣衫冰冷，身体虚弱但精神紧绷，黎明前的短暂宁静暗藏危机",
      "protagonistReaction": "陈守一抱紧怀中孩子，目光扫视来路，指节因用力而泛白，身体止不住颤抖",
      "keyDialogue": { 
        "speaker": "陈守一", 
        "line": "（低声）别怕，天快亮了。", 
        "protagonistResponse": "（心中默念）他们会来的。", 
        "dramaticMeaning": "脆弱中的坚持，为后续汇合蓄力" 
      },
      "povCharacter": "陈守一",
      "pacing": { 
        "speed": "slow", 
        "technique": ["weather-description", "internal-monologue"], 
        "mood": "孤寂·紧绷", 
        "wordCountTarget": 280 
      },
      "factionActivity": [
        { "faction": "未知势力", "action": "追踪者暂时失联", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001"],
      "transitionToNext": "远处传来脚步声，陈守一猛然抬头"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "石桥·桥面",
      "sceneType": "revelation",
      "event": "沈炼背着青鸾赶到，四人汇合，沈炼揭露三源归一仪式完整信息：需要支撑点分担桥重，且必须亲眼见过冥族",
      "protagonistReaction": "沈炼将青鸾轻轻放下，声音沙哑而急促，陈守一握住孩子的手示意安静",
      "keyDialogue": { 
        "speaker": "沈炼", 
        "line": ""仪式需要足够多的支撑点分担桥的重量。所有支撑点，必须亲眼见过冥族。"", 
        "protagonistResponse": "（沈炼看向青鸾）她师父……还有一位前辈，秦无涯。", 
        "dramaticMeaning": "信息共享推进，引入关键人物秦无涯" 
      },
      "povCharacter": "陈守一",
      "pacing": { 
        "speed": "moderate", 
        "technique": ["dialogue-heavy", "information-reveal"], 
        "mood": "紧张·期待", 
        "wordCountTarget": 420 
      },
      "factionActivity": [
        { "faction": "四人小队", "action": "汇合完成，信息共享", "powerDelta": 1 }
      ],
      "hooksTouched": ["H001", "H002"],
      "transitionToNext": "青鸾微弱咳嗽，暗示其掌握更多关键信息"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "石桥·桥面",
      "sceneType": "revelation",
      "event": "沈炼继续揭露三百年前献祭真相：壁画女人身份（始祖/自愿走上桥/神魂镇裂隙）、仪式代价（承载者以生命消散于天地间）",
      "protagonistReaction": "陈守一瞳孔骤缩，怀中的孩子似感应到什么，扯动她的衣襟",
      "keyDialogue": { 
        "speaker": "沈炼", 
        "line": ""三百年前，有人自愿走上那座桥。神魂碎裂，填补裂隙。承载者……会以生命消散于天地间。"", 
        "protagonistResponse": "（陈守一声音发颤）消散于天地间……什么意思？", 
        "dramaticMeaning": "核心代价揭露，仪式残酷性浮出水面" 
      },
      "povCharacter": "陈守一",
      "pacing": { 
        "speed": "slow", 
        "technique": ["pauses", "dramatic-reveals"], 
        "mood": "震惊·悲凉", 
        "wordCountTarget": 480 
      },
      "factionActivity": [
        { "faction": "四人小队", "action": "共同聆听真相", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H003"],
      "transitionToNext": "沈炼目光转向陈守一怀中的孩子，欲言又止"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "石桥·桥面",
      "sceneType": "revelation",
      "event": "沈炼揭露支撑点决定性条件（必须亲眼见过冥族），以及陈守一血脉源自壁画女人的真相，母亲遗言深层含义浮现",
      "protagonistReaction": "陈守一浑身僵硬，泪水无声滑落，孩子的小手覆上她的脸颊",
      "keyDialogue": { 
        "speaker": "沈炼", 
        "line": ""壁画上的女人……是你的先祖。而你怀里的孩子，继承着她的血脉。"", 
        "protagonistResponse": "（陈守一低喃）所以娘说'替我告诉她'……是这个意思吗？", 
        "dramaticMeaning": "血脉羁绊与使命传承的悲情揭示" 
      },
      "povCharacter": "陈守一",
      "pacing": { 
        "speed": "slow", 
        "technique": ["emotional-dialogue", "flashback-touch"], 
        "mood": "悲痛·顿悟", 
        "wordCountTarget": 450 
      },
      "factionActivity": [
        { "faction": "壁画女人血脉", "action": "真相揭露", "powerDelta": 1 }
      ],
      "hooksTouched": ["H001", "H003"],
      "transitionToNext": "陈守一与孩子对视，做出关键决定"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "石桥·桥面",
      "sceneType": "revelation",
      "event": "青鸾短暂清醒，揭露秦无涯完整信息：临渊城/二十年前唯一走在青鸾师父前面的人/见过比师父更深的景象/活得更久",
      "protagonistReaction": "青鸾艰难睁眼，声音断断续续但清晰，沈炼扶住她的肩，陈守一屏息聆听",
      "keyDialogue": { 
        "speaker": "青鸾", 
        "line": ""秦无涯……临渊城……他走在师父前面二十年……见过更深的景象……他活着。"", 
        "protagonistResponse": "（沈炼追问）他还活着？在哪里？", 
        "dramaticMeaning": "关键盟友现身，见过冥族者浮出水面" 
      },
      "povCharacter": "沈炼",
      "pacing": { 
        "speed": "urgent", 
        "technique": ["staccato-speech", "tension-build"], 
        "mood": "激动·希望", 
        "wordCountTarget": 380 
      },
      "factionActivity": [
        { "faction": "四人小队", "action": "获得关键线索", "powerDelta": 1 }
      ],
      "hooksTouched": ["H001", "H002"],
      "transitionToNext": "青鸾再次陷入昏迷，但信息已足够"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "石桥·桥面",
      "sceneType": "dialogue",
      "event": "陈守一与孩子达成共识：告诉人们真相，让他们自己选择。使命确认，抉择时刻",
      "protagonistReaction": "陈守一擦干眼泪，目光坚定，与孩子的手紧紧相握",
      "keyDialogue": { 
        "speaker": "陈守一", 
        "line": ""我们不替他们做决定。告诉他们真相，让他们自己选。"", 
        "protagonistResponse": "（孩子点头）这才是娘想看到的。", 
        "dramaticMeaning": "核心决定确立，使命升华" 
      },
      "povCharacter": "陈守一",
      "pacing": { 
        "speed": "moderate", 
        "technique": ["declaration", "rhetorical-balance"], 
        "mood": "坚定·释然", 
        "wordCountTarget": 320 
      },
      "factionActivity": [
        { "faction": "四人小队", "action": "共识达成，方向明确", "powerDelta": 1 }
      ],
      "hooksTouched": ["H001"],
      "transitionToNext": "晨曦初现，新的旅程即将开始——但危机随之而来"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "石桥·桥面至两岸",
      "sceneType": "action",
      "event": "镇冥石碎片效力彻底消失，三双幽蓝眼睛再次锁定石桥。临渊城/秦无涯/三日路程的新机遇同时浮现",
      "protagonistReaction": "陈守一怀中镇冥石碎片骤然黯淡，沈炼猛然拔刀，孩子指向东方",
      "keyDialogue": { 
        "speaker": "孩子", 
        "line": ""他们又来了。往东走，三天。"", 
        "protagonistResponse": "（沈炼沉声）临渊城。走！", 
        "dramaticMeaning": "绝境与希望并存，章末转折悬念拉满" 
      },
      "povCharacter": "陈守一",
      "pacing": { 
        "speed": "urgent", 
        "technique": ["short-sentences", "action-chase"], 
        "mood": "危机·决断", 
        "wordCountTarget": 380 
      },
      "factionActivity": [
        { "faction": "冥族", "action": "再次锁定目标", "powerDelta": 1 },
        { "faction": "四人小队", "action": "紧急撤离", "powerDelta": -1 }
      ],
      "hooksTouched": ["H001", "H002"],
      "transitionToNext": "四人向东方疾奔，幽蓝目光紧追不舍，新篇章开启"
    }
  ],
  "summary": {
    "totalScenes": 7,
    "targetWords": 3000,
    "estimatedWords": 2708,
    "beatDistribution": {
      "B1": { "scenes": 1, "words": 280, "ratio": "9.3%" },
      "B2": { "scenes": 1, "words": 420, "ratio": "14.0%" },
      "B3": { "scenes": 2, "words": 930, "ratio": "31.0%" },
      "B4": { "scenes": 2, "words": 700, "ratio": "23.3%" },
      "B5": { "scenes": 1, "words": 380, "ratio": "12.7%" }
    },
    "payoffElements": [
      "三源归一仪式完整条件",
      "壁画女人完整身份与牺牲",
      "承载者代价（生命消散）",
      "秦无涯关键信息浮出水面",
      "血脉传承与使命确认"
    ],
    "hooksResolved": ["H001", "H002", "H003"],
    "newHooksSet": ["临渊城追逃", "秦无涯会面", "冥族再次锁定"]
  }
}
```