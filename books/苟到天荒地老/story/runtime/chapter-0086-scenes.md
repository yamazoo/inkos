```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "暗道尽头出口",
      "sceneType": "revelation",
      "event": "暗道中微光渐显，冷风自缝隙涌入，暗示出口将近。沈炼辨认方向，指出前方是赤水镇外围的古祭坛遗址——献祭图纸所载三源同源之物第一件的所在。",
      "protagonistReaction": "陈守一脚步放缓，心跳加速，既有即将抵达目标的期待，也有对未知真相的隐隐不安",
      "keyDialogue": {
        "speaker": "沈炼",
        "line": ""前面就是了……赤水祭坛。三百年前人类选择献祭的地方。"",
        "protagonistResponse": ""……我们到了。"",
        "dramaticMeaning": "从逃亡过渡到探索，期待与不安交织"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "measured",
        "technique": ["sensory-detail", "internal-monologue"],
        "mood": "期待·不安·临界",
        "wordCountTarget": 300
      },
      "factionActivity": [],
      "hooksTouched": ["H001", "H006"],
      "transitionToNext": "踏出暗道，石室全貌映入眼帘"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "地下石室（古祭坛核心）",
      "sceneType": "revelation",
      "event": "暗道尽头扩大为巨大的地下石室。墙壁密密麻麻刻满与献祭图纸完全吻合的符文。沈炼驻足讲解这是三百年前献祭的核心祭坛，今已荒废。石室中央一座断裂的石台，台上残留三源同源之物之一的气息——但位置空置，东西不在。",
      "protagonistReaction": "陈守一目光扫过石壁上的符文，与怀中图纸逐行对照，心一点点沉下去",
      "keyDialogue": {
        "speaker": "沈炼",
        "line": ""东西被人取走了。能在守夜者眼皮底下做到的……不会是普通人。"",
        "protagonistResponse": ""或者说——守夜者里有人不想让它继续待在这里。"",
        "dramaticMeaning": "线索浮现，但伴随更大的谜团；祭坛的荒废与符文的精准形成诡异对比"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["environmental-description", "dialogue-driven"],
        "mood": "压抑·诡异·迷雾",
        "wordCountTarget": 450
      },
      "factionActivity": [
        { "faction": "守夜者", "action": "沈炼透露祭坛管理现状", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H002", "H006"],
      "transitionToNext": "陈守一展开献祭图纸，决定在石室中对照解读"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "地下石室（古祭坛核心）",
      "sceneType": "revelation",
      "event": "陈守一在石室中展开献祭图纸，沈炼结合二十年守护期间的见闻与守夜者第八代临终遗言，开始系统揭露末法真相——三百年前，幽冥界裂缝扩张至无法封印的规模，人类面临灭亡危机。",
      "protagonistReaction": "陈守一手指微微发抖，死死盯着图纸上的符文，脑中飞速回想曾祖母延缓三年的往事",
      "keyDialogue": {
        "speaker": "沈炼",
        "line": ""你知道三百年前，幽冥界的裂缝大到了什么地步？大到所有封印手段全部失效。"",
        "protagonistResponse": ""所以他们……做了什么？"",
        "dramaticMeaning": "真相的冰山一角；石碑上密密麻麻的名字开始有了不同的含义"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "building",
        "technique": ["dialogue-heavy", "flashback-fragment"],
        "mood": "紧张·震撼·积累",
        "wordCountTarget": 500
      },
      "factionActivity": [],
      "hooksTouched": ["H003", "H004"],
      "transitionToNext": "沈炼说出最关键的真相——人类不是被迫接受献祭，而是主动选择"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "地下石室（古祭坛核心）",
      "sceneType": "revelation",
      "event": "真相完整揭露。三百年前人类面临灭亡，不是被动等待献祭，而是主动选择——用修行界的未来换取幽冥界的封印。金丹成传说、筑基成神话、炼气期修士活不过五十，这些末法时代的代价皆是人类自己造成。守夜者的真正使命也随之浮出水面：曾祖母延缓三年、母亲守夜三十年——她们守的不是封印，而是守这个选择不再重演。母亲遗言完整揭露：\"若我不渡，无人渡\"——她知道真相，却依然选择继承使命。",
      "protagonistReaction": "陈守一双膝发软，靠住石壁，手中图纸滑落在地，眼眶发红却说不出一句话",
      "keyDialogue": {
        "speaker": "沈炼",
        "line": ""你母亲知道。她从一开始就知道这不是封印，而是抉择。但她还是接过了这个位置。"",
        "protagonistResponse": ""……所以曾祖母延缓的三年，母亲守的三十年——不是为了别人。是为了确保这个决定由清醒的人做出，而不是绝望中的人类再选一次。"",
        "dramaticMeaning": "全文核心真相；陈守一的认知体系被彻底重构；母亲的形象从被动牺牲升格为主动担当"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "halted",
        "technique": ["long-sentences", "philosophical-reflection", "emotional-pause"],
        "mood": "震惊·崩溃·重塑",
        "wordCountTarget": 550
      },
      "factionActivity": [
        { "faction": "守夜者", "action": "沈炼揭露第八代遗言完整内容", "powerDelta": "info-revealed" }
      ],
      "hooksTouched": ["H001", "H002", "H003", "H004", "H005"],
      "transitionToNext": "片刻沉默后，沈炼补充组织阴谋——献祭一次不够？"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "地下石室（古祭坛核心）",
      "sceneType": "revelation",
      "event": "沈炼补充组织阴谋：组织认为\"献祭一次不够，再献祭一次引入幽冥力量，可一劳永逸解决灵气稀薄\"——他们要重演三百年前的选择，只是这次目的不同。组织对三源同源之物的追逐，正是为此做准备。",
      "protagonistReaction": "陈守一从震惊中猛然抬头，目光重新凝聚起锐利——悲恸尚未消化，但理智已经开始运转",
      "keyDialogue": {
        "speaker": "沈炼",
        "line": ""他们想要的不是打破封印——他们想要再来一次献祭，把幽冥界的力量引入人间，从中获取力量。"",
        "protagonistResponse": ""所以同源之物不是钥匙，是……锁？"",
        "dramaticMeaning": "组织阴谋的终极目的浮出水面；陈守一开始从被动接收转向主动理解"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "sharp",
        "technique": ["short-exchanges", "conceptual-leap"],
        "mood": "惊觉·锐利·重构",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "组织", "action": "阴谋完整揭露：二次献祭计划", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H006"],
      "transitionToNext": "石室陷入短暂的沉默，各人消化信息"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "地下石室（古祭坛核心）",
      "sceneType": "reflection",
      "event": "真相的冲击抵达峰值。三百年前是主动选择而非被迫——这比被迫献祭更令人绝望，因为这意味着人类不是受害者，而是自己的刽子手。陈守一道心动摇，信念体系遭受末知冲击。沈炼静静等待，给他消化的时间。",
      "protagonistReaction": "陈守一蹲坐在断裂的石台旁，双手捕住头发，肩膀微微颤抖——不是恐惧，是认知的根基在重新铸造",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": ""我曾以为……我的家族在守护一个封印，一个被迫的牺牲。我以为母亲是被命运选中的悲剧。"",
        "protagonistResponse": ""但她不是。她是清醒地走进这个命运的。"",
        "dramaticMeaning": "认知框架的彻底翻转；悲痛的性质从怨尤转为敬畏；陈守一与母亲的隔空对话"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "very-slow",
        "technique": ["internal-monologue", "emotional-freeze"],
        "mood": "崩溃·重铸·静默",
        "wordCountTarget": 400
      },
      "factionActivity": [],
      "hooksTouched": ["H002", "H003", "H004"],
      "transitionToNext": "赵猛抱着周沉的遗体加入对话，将个体悲恸与历史真相交织"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "地下石室（古祭坛核心）",
      "sceneType": "reflection",
      "event": "赵猛抱着周沉的遗体听闻真相，悲恸加剧——周沉的父亲可能就是当年献祭的执行者之一。沈炼指向石室墙壁上密密麻麻的符文，那些不是普通的装饰，而是三百年前所有参与献祭者的名字与誓言。个体的悲痛与历史的沉重在此交汇。陈守一缓缓站起身，目光落在那些名字上——包括他自己的血脉。",
      "protagonistReaction": "陈守一走至石壁前，手指触上一个熟悉的名字——曾祖母的丈夫，陈家先祖，也是当年献祭的签署者之一",
      "keyDialogue": {
        "speaker": "赵猛",
        "line": ""周沉死的时候说……他爹留了东西给他，让他别走那条路。原来是这个意思。"",
        "protagonistResponse": ""……他选择了一条不同的路。而我们，得继续走下去。"",
        "dramaticMeaning": "个体悲恸与历史真相的共鸣；周沉之死的终极意义揭晓；赵猛从悲痛中找到了继续前行的支点"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["cross-character-perspective", "symbolic-detail"],
        "mood": "悲痛·和解·坚定",
        "wordCountTarget": 350
      },
      "factionActivity": [],
      "hooksTouched": ["H004", "H005"],
      "transitionToNext": "石室深处突然传来异响，气氛骤变——章末转折启动"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "地下石室深处",
      "sceneType": "action",
      "event": "石室深处突然传来异响——祭坛中有东西在等，暗道尽头传来动静。沈炼脸色骤变，示意众人戒备。与此同时，石室另一侧的裂缝中透出一丝与献祭图纸记载完全吻合的气息——第一件同源之物虽不在原位，但其线索指向了祭坛更深处。",
      "protagonistReaction": "陈守一猛然从情绪中抽离，目光锐利地锁定声音来源，右手已按上剑柄",
      "keyDialogue": {
        "speaker": "沈炼",
        "line": ""不对——这里不该有别人。能进来的路，只有我知道。"",
        "protagonistResponse": ""那就说明——有人从里面出来的。"",
        "dramaticMeaning": "章末悬念：未知的敌人或盟友即将登场；新势力浮出水面；节奏从情感爆发急转入紧张对峙"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "action-verbs", "sensory-immediacy"],
        "mood": "警觉·压迫·悬念",
        "wordCountTarget": 450
      },
      "factionActivity": [
        { "faction": "未知", "action": "祭坛深处传来动静", "powerDelta": "unknown-threat" }
      ],
      "hooksTouched": ["H001", "H006"],
      "transitionToNext": "悬念落幕：暗处身影浮现，下章将揭晓来者身份"
    }
  ]
}
```