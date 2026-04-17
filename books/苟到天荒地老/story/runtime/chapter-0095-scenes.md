```json
{
  "chapterInfo": {
    "chapter": 95,
    "type": "payoff",
    "targetWords": 3000,
    "wordRange": [2400, 3900],
    "notes": "节拍表提供不完整（仅B1-B2），B3-B6基于Payoff章标准结构推断"
  },
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "镇外官道·老槐树下",
      "sceneType": "revelation",
      "event": "沈炼截住主角，告知三年前旧事另有隐情，青鸾随侍在侧",
      "protagonistReaction": "握紧茶盏的手指微微发白，面上却波澜不惊",
      "keyDialogue": {
        "speaker": "沈炼",
        "line": "……三年了，有些事你必须知道真相。",
        "protagonistResponse": "……你说。",
        "dramaticMeaning": "悬念钩子抛出，旧势力线重新激活"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow→accelerating",
        "technique": ["paused-dialogue", "memory-flash"],
        "mood": "沉郁·暗流涌动",
        "wordCountTarget": 300
      },
      "factionActivity": [
        {"faction": "旧势力（沈炼系）", "action": "主动接触主角，传递关键信息", "powerDelta": 0}
      ],
      "hooksTouched": ["H001", "H003"],
      "transitionToNext": "沈炼留下一个信物后消失在人群中"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "回春堂后院",
      "sceneType": "revelation",
      "event": "主角返回时发现收养的孩子精神萎靡，目光空洞似被抽离魂魄",
      "protagonistReaction": "蹲下身轻抚孩子额头，指尖触及刺骨冰凉",
      "keyDialogue": {
        "speaker": "孩子",
        "line": "……有人在梦里跟我说话……说我是……",
        "protagonistResponse": "（沉默，将孩子抱入怀中）",
        "dramaticMeaning": "伏笔人物命运与主线勾连，新势力介入迹象"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow",
        "technique": ["sensory-detail", "inner-monologue"],
        "mood": "揪心·不祥预感",
        "wordCountTarget": 350
      },
      "factionActivity": [
        {"faction": "未知势力", "action": "通过某种手段影响孩子精神状态", "powerDelta": "+1"}
      ],
      "hooksTouched": ["H002", "H004"],
      "transitionToNext": "主角察觉孩子身上有微弱的灵力波动"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "回春堂内室",
      "sceneType": "revelation",
      "event": "主角翻阅沈炼留下的手札，发现孩子与当年灭门惨案的关联证据",
      "protagonistReaction": "手札滑落，呼吸骤停——原来一切早有预谋",
      "keyDialogue": {
        "speaker": "主角（独白）",
        "line": "所以当年那场火……是为了这个孩子？",
        "protagonistResponse": null,
        "dramaticMeaning": "核心真相开始揭露，多条伏笔收束"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "accelerating",
        "technique": ["flashback", "revelation-trigger"],
        "mood": "震惊·碎片拼合",
        "wordCountTarget": 400
      },
      "factionActivity": [
        {"faction": "主角", "action": "获得关键情报，认知升级", "powerDelta": "+1"}
      ],
      "hooksTouched": ["H001", "H002", "H003"],
      "transitionToNext": "窗外传来异响，有人在监视回春堂"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "回春堂院墙外·暗巷",
      "sceneType": "action",
      "event": "主角追踪监视者，却发现对方是青云门执法堂的人——旧敌重逢",
      "protagonistReaction": "侧身闪入阴影，右手已按上腰间短刃，心跳如擂鼓",
      "keyDialogue": {
        "speaker": "青云门执法者",
        "line": "……果然在这里。追了三年，今日该结账了。",
        "protagonistResponse": "……我与青云门早已两清。",
        "dramaticMeaning": "新冲突爆发，旧势力（青云门）再度介入"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "action-verbs"],
        "mood": "危机·剑拔弩张",
        "wordCountTarget": 400
      },
      "factionActivity": [
        {"faction": "青云门执法堂", "action": "锁定主角位置，准备围捕", "powerDelta": "+2"},
        {"faction": "主角", "action": "陷入被动防御", "powerDelta": "-1"}
      ],
      "hooksTouched": ["H001"],
      "transitionToNext": "青云门弟子发出信号，援兵将至"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "回春堂院内",
      "sceneType": "action",
      "event": "主角被迫应战，利用地形与青云门弟子周旋，同时保护身后的孩子",
      "protagonistReaction": "嘴角沁出血丝却咬牙不退，将孩子护在身后",
      "keyDialogue": {
        "speaker": "主角",
        "line": "……要战便战，但要伤这孩子，先踏过我的尸体。",
        "protagonistResponse": null,
        "dramaticMeaning": "以攻代守的宣言，冲突白热化"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "urgent→critical",
        "technique": ["climactic-action", "parallel-editing"],
        "mood": "惨烈·背水一战",
        "wordCountTarget": 450
      },
      "factionActivity": [
        {"faction": "青云门执法堂", "action": "围攻主角", "powerDelta": 0},
        {"faction": "主角", "action": "负伤周旋，为孩子争取时间", "powerDelta": "-2"}
      ],
      "hooksTouched": ["H004"],
      "transitionToNext": "就在主角力竭之际，一道青影掠过战场"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "回春堂院内",
      "sceneType": "revelation",
      "event": "青鸾突然出现救下主角，并揭露孩子的真实身份——她是当年被灭门的沈家遗孤",
      "protagonistReaction": "瞳孔剧震，手中的短刃垂落——一切都说得通了",
      "keyDialogue": {
        "speaker": "青鸾",
        "line": "沈家血脉不能断绝，这是沈炼用命换来的孩子。",
        "protagonistResponse": "……所以当年沈家灭门，是青云门所为？",
        "dramaticMeaning": "核心真相完全揭露，势力格局重塑"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow",
        "technique": ["revelation-pause", "emotional-beat"],
        "mood": "震惊·真相大白",
        "wordCountTarget": 400
      },
      "factionActivity": [
        {"faction": "旧势力（沈炼系）", "action": "青鸾出手保护主角与孩子", "powerDelta": "+3"},
        {"faction": "青云门执法堂", "action": "被迫撤退", "powerDelta": "-2"}
      ],
      "hooksTouched": ["H001", "H002", "H003", "H004"],
      "transitionToNext": "青鸾留下一个锦囊，再次消失在夜色中"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "回春堂密室",
      "sceneType": "reflection",
      "event": "主角独自消化真相，在孩子熟睡后与沈炼留下的手札对坐，权衡利弊",
      "protagonistReaction": "手指摩挲着泛黄的纸页，眉心拧成川字",
      "keyDialogue": {
        "speaker": "主角（独白）",
        "line": "保护这孩子，便是与青云门为敌；可若放弃……我与那些人何异？",
        "protagonistResponse": null,
        "dramaticMeaning": "内心抉择，道德困境呈现"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow",
        "technique": ["inner-monologue", "decision-point"],
        "mood": "沉凝·两难抉择",
        "wordCountTarget": 350
      },
      "factionActivity": [
        {"faction": "主角", "action": "面临道路抉择", "powerDelta": 0}
      ],
      "hooksTouched": ["H003"],
      "transitionToNext": "孩子梦中呢喃出一个名字——主角终于下定决心"
    },
    {
     