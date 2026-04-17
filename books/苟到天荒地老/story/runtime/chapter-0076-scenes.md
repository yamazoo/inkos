# 第76章 ScenePlan

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "废墟战场·幽冥兽扑击点",
      "sceneType": "action",
      "event": "幽冥兽异变扑来，四人被冲击波震散，周沉铜牌自动激活",
      "protagonistReaction": "陈守一被气浪掀飞，左肩撞上断壁，耳中嗡鸣不断",
      "keyDialogue": {
        "speaker": "周沉",
        "line": "\"趴下！\"",
        "protagonistResponse": "陈守一本能俯身，铜牌金光从周沉怀中炸开，凝成半透明光罩",
        "dramaticMeaning": "危机时刻的被动保护，暗示铜牌与周沉的羁绊"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "explosive",
        "technique": ["fragmented-sentences", "sensory-focus", "rapid-pov-switches"],
        "mood": "混沌·压迫·命悬一线",
        "wordCountTarget": 300
      },
      "factionActivity": [
        {"faction": "周沉", "action": "铜牌激活护住众人", "powerDelta": 1},
        {"faction": "幽冥兽", "action": "异变扑击，分裂四人", "powerDelta": 0}
      ],
      "hooksTouched": ["H004"],
      "transitionToNext": "金光散尽，幽冥兽停在场中——它身躯正中那道裂痕，正与陈守一眉心金痕遥相呼应"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "废墟战场·周沉铜牌光罩内",
      "sceneType": "action",
      "event": "赵猛断后受伤，周沉边战边解释铜牌来历，陈守一眉心金痕锁定幽冥兽弱点",
      "protagonistReaction": "陈守一眉心金痕灼热刺痛，视野中那道裂痕被金痕'钉'住，无法移开目光",
      "keyDialogue": {
        "speaker": "周沉",
        "line": "\"三百年的东西，专门克制冥将投影。\"",
        "protagonistResponse": "陈守一咬牙按住眉心，金痕热度像烙铁",
        "dramaticMeaning": "揭示铜牌组织传承，暗示陈守一与冥将投影的关联"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["parallel-action", "interrupted-dialogue", "sensory-escalation"],
        "mood": "紧张·被迫分心·被锁定",
        "wordCountTarget": 450
      },
      "factionActivity": [
        {"faction": "赵猛", "action": "断后受伤", "powerDelta": -1},
        {"faction": "周沉", "action": "边战边解释铜牌来历", "powerDelta": 0},
        {"faction": "青鸾", "action": "战斗中注意到陈守一眉心异常", "powerDelta": 0}
      ],
      "hooksTouched": ["H004", "H005"],
      "transitionToNext": "青鸾一记青羽剑气逼退幽冥兽，余光扫过陈守一捂额的姿势，眼神微变"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "废墟战场·青鸾与陈守一之间",
      "sceneType": "revelation",
      "event": "青鸾察觉陈守一眉心金痕异常，战斗中出现短暂视线交汇",
      "protagonistReaction": "陈守一感受到青鸾目光，想遮掩却来不及——眉心金痕正在自行发光",
      "keyDialogue": {
        "speaker": "青鸾",
        "line": "\"你的额头——\"",
        "protagonistResponse": "陈守一摇头，\"不知道，但它能'看到'那东西的弱点。\"",
        "dramaticMeaning": "青鸾开始怀疑陈守一的真实身份，为后续冲突埋线"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "measured",
        "technique": ["tension-understatement", "glances-as-action"],
        "mood": "警觉·被窥视·无法隐瞒",
        "wordCountTarget": 200
      },
      "factionActivity": [
        {"faction": "青鸾", "action": "察觉陈守一眉心异常", "powerDelta": 0}
      ],
      "hooksTouched": ["H005"],
      "transitionToNext": "青鸾欲言又止，幽冥兽再次扑来，战斗节奏被打断"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "废墟战场·幽冥兽与周沉交锋处",
      "sceneType": "action",
      "event": "周沉被幽冥兽利爪贯穿胸膛，铜牌碎裂，露出内部组织信物",
      "protagonistReaction": "陈守一瞳孔骤缩，'周叔'二字卡在喉头喊不出来",
      "keyDialogue": {
        "speaker": "周沉",
        "line": "\"……别过来。\"",
        "protagonistResponse": "陈守一迈出的脚僵在半空，指甲掐入掌心",
        "dramaticMeaning": "保护者倒下的冲击，组织信物暴露暗示周沉真实身份"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "violent",
        "technique": ["slow-motion", "sound-muffling", "visceral-detail"],
        "mood": "震惊·无力·眼睁睁看",
        "wordCountTarget": 350
      },
      "factionActivity": [
        {"faction": "周沉", "action": "被贯穿重伤，铜牌碎裂", "powerDelta": -3},
        {"faction": "幽冥兽", "action": "重创周沉", "powerDelta": 0}
      ],
      "hooksTouched": ["H004"],
      "transitionToNext": "碎裂的铜牌中央，一枚刻有'正本清源'四字的玉牌滚落尘土"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "废墟战场·周沉重伤处",
      "sceneType": "revelation",
      "event": "周沉临终道出大劫真相：封印消耗灵气、力量上限的由来、三百年前封印被破坏",
      "protagonistReaction": "陈守一跪在周沉身旁，听着每一个字，拳头攥紧又松开",
      "keyDialogue": {
        "speaker": "周沉",
        "line": "\"……上古大能将灵气封进两界通道，灵气稀薄是封印的代价。炼气期成常态，筑基期成传说——都是这封印的副作用。\"",
        "protagonistResponse": "陈守一声音发抖，\"那……三百年前——\"",
        "dramaticMeaning": "真相一：揭示灵气稀薄的历史成因"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "weighted",
        "technique": ["long-breath-dialogue", "pause-structures", "repetition-for-emphasis"],
        "mood": "悲恸·真相的重量",
        "wordCountTarget": 450
      },
      "factionActivity": [
        {"faction": "周沉", "action": "临终揭露组织三百年使命", "powerDelta": 0}
      ],
      "hooksTouched": ["H001", "H004"],
      "transitionToNext": "周沉剧烈咳嗽，鲜血染红衣襟，但仍死死盯着陈守一——"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "废墟战场·周沉重伤处",
      "sceneType": "revelation",
      "event": "守夜者遗言补完：'她'是守夜者女儿，三百年前被献祭成为封印第二道锁",
      "protagonistReaction": "陈守一脑海中闪过母亲的脸，以及那道从未听她提起过的金痕来源",
      "keyDialogue": {
        "speaker": "周沉",
        "line": "\"'她'是守夜者的女儿……三百年前被献祭，成为封印的第二道锁。周某等了三百年，等一个能替代'她'的人——\"",
        "protagonistResponse": "\"等陈守一的母亲？还是……\"周沉没有回答，但那双浑浊的眼看向陈守一眉心",
        "dramaticMeaning": "核心真相：揭示守夜者三百年的牺牲与等待，真相直指陈守一自身"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "unfolding",
        "technique": ["fragmented-revelation", "implication-heavy", "silence-as-climax"],
        "mood": "真相冲击·身世之谜",
        "wordCountTarget": 400
      },
      "factionActivity": [
        {"faction": "守夜者", "action": "通过周沉传达遗言", "powerDelta": 0},
        {"faction": "周沉", "action": "生命最后一刻完成使命", "powerDelta": -2}
      ],
      "hooksTouched": ["H001", "H003", "H004"],
      "transitionToNext": "周沉的手从陈守一眉心滑落，气息彻底断绝。'正本清源'玉牌被陈守一攥入掌中"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "废墟战场·陈守一与周沉遗体",
      "sceneType": "action",
      "event": "周沉确认死亡，陈守一承受金痕反噬，青鸾为护陈守一被击飞重伤",
      "protagonistReaction": "陈守一眉心像被钢针贯穿，双膝跪地，青鸾的身影挡在面前——然后倒飞出去",
      "keyDialogue": {
        "speaker": "青鸾",
        "line": "\"……走！\"",
        "protagonistResponse": "陈守一想去扶她，却被金痕反噬疼得眼前发黑",
        "dramaticMeaning": "代价的高昂：保护者接连倒下，真相的重量化为肉体的折磨"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "staccato",
        "technique": ["pain-as-focus", "time-dilation", "sensory-loss"],
        "mood": "剧痛·自责·被迫行动",
        "wordCountTarget": 350
      },
      "factionActivity": [
        {"faction": "陈守一", "action": "金痕反噬", "powerDelta": -1},
        {"faction": "青鸾", "action": "为护陈守一重伤", "powerDelta": -2},
        {"faction": "幽冥兽", "action": "锁定陈守一眉心攻击", "powerDelta": 0}
      ],
      "hooksTouched": ["H005"],
      "transitionToNext": "赵猛杀回来一斧劈开幽冥兽对陈守一的追击，怒吼着催促撤退"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "废墟战场·撤退途中",
      "sceneType": "reflection",
      "event": "灵洲大陆因果共振，大劫真相完整揭示，陈守一理解封印是双刃剑",
      "protagonistReaction": "陈守一边跑边消化方才的信息——封印阻止幽冥界入侵，却也在慢性杀死这个世界",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": "\"所以……封印不能开，也不能一直封着。\"",
        "protagonistResponse": "脚下不停，掌中'正本清源'玉牌硌得生疼",
        "dramaticMeaning": "收获：真相完整，任务明确——寻找第三条路"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "internal-pulse",
        "technique": ["thought-interrupt", "running-as-metaphor", "revelation-synthesis"],
        "mood": "沉重·清醒·使命确立",
        "wordCountTarget": 250
      },
      "factionActivity": [
        {"faction": "灵洲大陆", "action": "因果共振，天地异象", "powerDelta": 0}
      ],
      "hooksTouched": ["H001", "H003"],
      "transitionToNext": "前方雾气中隐约浮现一道结界的轮廓——聚居点入口就在眼前"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "聚居点入口·结界前",
      "sceneType": "reflection",
      "event": "守夜者寿元耗尽确认死亡，聚居点入口结界崩解",
      "protagonistReaction": "陈守一感受到眉心金痕的共鸣彻底消失——那是守夜者最后的联系断了",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": "\"……前辈。\"",
        "protagonistResponse": "声音很轻，消散在结界的嗡鸣中",
        "dramaticMeaning": "失去精神导师，但获得行动的方向"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "decay",
        "technique": ["absence-as-presence", "emotional-withholding"],
        "mood": "哀恸·空洞·告一段落",
        "wordCountTarget": 200
      },
      "factionActivity": [
        {"faction": "守夜者", "action": "寿元耗尽", "powerDelta": -1},
        {"faction": "聚居点结界", "action": "崩解中", "powerDelta": -1}
      ],
