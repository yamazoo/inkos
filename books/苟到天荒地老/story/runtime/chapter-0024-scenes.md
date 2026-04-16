```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "灵泉废墟西侧·地窖入口",
      "sceneType": "action",
      "event": "陈守一从三方围堵中脱身，借第四势力放行之机滑入地窖",
      "protagonistReaction": "膝盖撞上硬物，疼得倒抽冷气，但手仍死死攥着怀中物什",
      "keyDialogue": null,
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "rapid",
        "technique": ["short-sentences", "sensory-focus"],
        "mood": "紧张·压迫·解脱",
        "wordCountTarget": 380
      },
      "factionActivity": [
        { "faction": "第四势力（四方角帽）", "action": "放行陈守一", "powerDelta": 0 }
      ],
      "hooksTouched": ["H002第四势力放行意图"],
      "transitionToNext": "黑暗包裹，腥甜气息涌入鼻腔"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "地窖入口通道",
      "sceneType": "action",
      "event": "陈守一摸黑前行，发现人工凿刻痕迹与暗格",
      "protagonistReaction": "手指沿石壁摸索，心跳加速但呼吸刻意放缓",
      "keyDialogue": null,
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "measured",
        "technique": ["sensory-detail", "tension-building"],
        "mood": "警觉·探索",
        "wordCountTarget": 350
      },
      "factionActivity": [],
      "hooksTouched": ["H017黑铁令牌伏笔"],
      "transitionToNext": "手指触到凹陷处，感知到异物"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "地窖入口通道·暗格处",
      "sceneType": "revelation",
      "event": "发现黑铁令牌与小册子，令牌纹路与金丝缠几乎一模一样；残纸与金丝缠突然共振",
      "protagonistReaction": "手指颤抖着摩挲令牌纹路，脑中轰然作响——这个纹路他太熟悉了",
      "keyDialogue": { "speaker": "陈守一内心", "line": "「林记……」", "protagonistResponse": "喃喃念出小册子边角的字迹", "dramaticMeaning": "确认关联：林师兄实验与地窖的直接联系" },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["revelation-pacing", "flashback-hint"],
        "mood": "震撼·困惑",
        "wordCountTarget": 420
      },
      "factionActivity": [],
      "hooksTouched": ["H010林师兄", "H014金丝缠与残纸关联", "H017黑铁令牌", "H018幽冥接引实验"],
      "transitionToNext": "共振消退后，陈守一将令牌和小册子塞入怀中，继续向地窖深处摸去"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "地窖深处·通道中段",
      "sceneType": "action",
      "event": "地窖深处亮起幽暗微光，大量眼睛出现——不是一双，是二三十双",
      "protagonistReaction": "浑身僵住，瞳孔骤缩，瞳孔倒映出那些悬在半空的眼睛",
      "keyDialogue": { "speaker": "陈守一", "line": "「——！」", "protagonistResponse": "声音卡在喉咙里，一个字都发不出", "dramaticMeaning": "纯粹的恐惧与震惊" },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "sensory-overload"],
        "mood": "恐怖·窒息",
        "wordCountTarget": 500
      },
      "factionActivity": [],
      "hooksTouched": [],
      "transitionToNext": "那些眼睛一眨不眨地盯着他，像是在确认什么"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "地窖深处·通道中段",
      "sceneType": "action",
      "event": "眼睛封死前方通道，腥甜气息更浓更急，幽冥存在确认陈守一的存在",
      "protagonistReaction": "后背紧贴冰冷石壁，呼吸几乎停滞，心跳如擂鼓但不敢有丝毫动作",
      "keyDialogue": null,
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "tense",
        "technique": ["slow-motion", "internal-focus"],
        "mood": "压抑·危机",
        "wordCountTarget": 450
      },
      "factionActivity": [],
      "hooksTouched": [],
      "transitionToNext": "前路被封死，后路亦有追兵——陈守一意识到自己被困在了中间"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "地窖深处·通道中段",
      "sceneType": "reflection",
      "event": "陈守一做出关键决定——不能退，只能继续深入",
      "protagonistReaction": "后背的冷汗湿透衣衫，但目光反而冷静下来——退是死路，往前或许还有一线生机",
      "keyDialogue": { "speaker": "陈守一内心", "line": "「不能退……不能停……」", "protagonistResponse": "无声地重复告诫自己", "dramaticMeaning": "角色做出生死抉择的关键时刻" },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["internal-monologue", "decision-pause"],
        "mood": "决绝·冷静",
        "wordCountTarget": 380
      },
      "factionActivity": [],
      "hooksTouched": [],
      "transitionToNext": "压低身形，贴着石壁缓缓向地窖更深处移动"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "地窖深处·向核心区域移动中",
      "sceneType": "revelation",
      "event": "金丝缠剧烈发烫，与地窖深处某物产生共振；幽冥眼睛确认而非追击——这是筛选",
      "protagonistReaction": "左臂灼烧般的疼痛让他几乎咬碎牙齿，但不敢发出声音；那些眼睛没有追来，而是在确认他是否"它们要的东西"",
      "keyDialogue": { "speaker": "陈守一内心", "line": "「筛选……不是我被放过，是我在被挑选。」", "protagonistResponse": "脑中电光火石般闪过这个念头", "dramaticMeaning": "揭示第四势力放行的真正意图：不是保护，而是"投递"" },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "building",
        "technique": ["revelation-pacing", "sensory-intensification"],
        "mood": "痛苦·顿悟",
        "wordCountTarget": 520
      },
      "factionActivity": [
        { "faction": "幽冥存在", "action": "确认陈守一身份后停止追击", "powerDelta": 0 }
      ],
      "hooksTouched": ["H002第四势力放行意图", "H014金丝缠与残纸关联"],
      "transitionToNext": "拖着沉重的步伐继续深入地窖核心"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "地窖核心区域附近",
      "sceneType": "dialogue",
      "event": "头顶传来脚步声，有人从地面某处直接进入地窖；幽冥眼睛朝新入口涌去",
      "protagonistReaction": "浑身一僵，刚松下的那口气又提了起来；看到那些眼睛转向新的方向，心中不知是庆幸还是更深的恐惧",
      "keyDialogue": { "speaker": "神秘来客（四方角帽下属）", "line": "「陈守一，四方角帽让我带句话——'他不是我们要的，但有些东西已经盯上他了'。三天后，老地方见。」", "protagonistResponse": "僵在原地，不敢出声", "dramaticMeaning": "第四势力正式登场，揭示"筛选"真相：陈守一不是他们的目标，但他已被幽冥势力锁定" },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "suspenseful",
        "technique": ["dialogue-driven", "ambient-tension"],
        "mood": "震惊·困惑",
        "wordCountTarget": 480
      },
      "factionActivity": [
        { "faction": "第四势力（四方角帽）", "action": "派人传话并撤离", "powerDelta": 0 },
        { "faction": "幽冥存在", "action": "被新入口吸引，向该方向移动", "powerDelta": 0 }
      ],
      "hooksTouched": ["H002第四势力放行意图", "H001"],
      "transitionToNext": "脚步声远去，地窖重归死寂——但陈守一知道，危险才刚刚开始"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "地窖深处·暂时安全区域",
      "sceneType": "reflection",
      "event": "陈守一独自留在地窖中，消化四方角帽的话；金丝缠与怀中残纸的微弱共振再次出现",
      "protagonistReaction": "瘫坐在黑暗中，后背抵着冰冷的石壁，脑海中翻涌着无数念头——第四势力、幽冥、林记实验、金丝缠……这些线索像乱麻一样缠绕在一起",
      "keyDialogue": { "speaker": "陈守一内心", "line": "「它们盯上我了……从什么时候开始的？从金丝缠缠上的那一刻？还是更早？」", "protagonistResponse": "无力地靠在墙上，脑中飞速转动", "dramaticMeaning": "为下章埋下悬念：主角意识到自己早已被卷入更大的棋局" },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["reflection-pause", "foreshadowing"],
        "mood": "疲惫·沉思·不安",
        "wordCountTarget": 380
      },
      "factionActivity": [],
      "hooksTouched": ["H014金丝缠与残纸关联"],
      "transitionToNext": "地窖深处传来若有若无的呼唤，金丝缠的纹路再次微微发烫——他必须做出选择"
    }
  ],
  "chapterSummary": {
    "chapter": 24,
    "title": "节拍规划（伏笔回收章）",
    "totalScenes": 9,
    "targetWordCount": 3360,
    "beatDistribution": {
      "B1": { "scenes": 1, "words": 380, "percentage": "11%" },
      "B2": { "scenes": 2, "words": 770, "percentage": "23%" },
      "B3": { "scenes": 2, "words": 950, "percentage": "28%" },
      "B4": { "scenes": 2, "words": 900, "percentage": "27%" },
      "B5": { "scenes": 2, "words": 860, "percentage": "26%" }
    },
    "hooksResolved": [
      "H002第四势力放行意图",
      "H010林师兄关联",
      "H014金丝缠与残纸关联",
      "H017黑铁令牌",
      "H018幽冥接引实验"
    ],
    "hooksOpened": [
      "H001",
      "第四势力与幽冥的关系",
      "金丝缠的真正来源"
    ],
    "costGainAnalysis": {
      "cost": [
        "幽冥眼睛封锁退路",
        "幽冥气息侵蚀（体力消耗）",
        "被幽冥势力锁定为目标",
        "地窖被第三方监视"
      ],
      "gain": [
        "发现黑铁令牌（纹路与金丝缠一致）",
        "获得林记小册子碎片信息",
        "确认金丝缠与残纸共振机制",
        "第四势力正式接触并留下线索",
        "三天后老地方见面（新事件触发点）"
      ]
    }
  }
}
```