```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "演武场西侧廊道尽头",
      "sceneType": "revelation",
      "event": "四方角帽从阴影中现身，陈守一发现监视者级别与外围不同",
      "protagonistReaction": "心跳如擂鼓，但目光反而沉静下来",
      "keyDialogue": {
        "speaker": "四方角帽",
        "line": "「陈守一，周铁柱败了？」",
        "protagonistResponse": "主角不答，只是缓缓将左手背到身后",
        "dramaticMeaning": "执法堂正式人员登场，意味身份确认已不可避免"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["long-sentences", "sensory-details", "tension-building"],
        "mood": "压抑·危机迫近",
        "wordCountTarget": 180
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "四方角帽亲自逼近主角", "powerDelta": 1 }
      ],
      "hooksTouched": ["H040"],
      "transitionToNext": "监视者报出主角全名"
    },
    {
      "sceneId": "B1-2",
      "beatId": "B1",
      "location": "演武场西侧廊道尽头",
      "sceneType": "revelation",
      "event": "监视者报出主角全名与来历，监视者身份确认",
      "protagonistReaction": "左手在袖中微微颤抖，金丝缠开始升温",
      "keyDialogue": {
        "speaker": "四方角帽",
        "line": "「回春堂陈守一，师从陈老药庐——我说得可对？」",
        "protagonistResponse": "「阁下认错人了。」",
        "dramaticMeaning": "否认失败，身份已被锁定"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["dialogue-exchange", "inner-monologue"],
        "mood": "绝望·身份暴露",
        "wordCountTarget": 180
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "四方角帽确认主角身份", "powerDelta": 1 }
      ],
      "hooksTouched": ["H040", "H035"],
      "transitionToNext": "主角环顾四周，发现无路可退"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "演武场西侧廊道",
      "sceneType": "revelation",
      "event": "监视者逼近至二十丈，周铁柱后颈弯月印记线索浮现",
      "protagonistReaction": "左臂金丝缠开始灼烧，后颈隐隐发热",
      "keyDialogue": {
        "speaker": "四方角帽",
        "line": "「你那位周师兄，后颈的印记倒是显眼得很——可惜今晚过后，七十三人的名单又要少一个了。」",
        "protagonistResponse": "主角瞳孔微缩，后颈一阵刺痛",
        "dramaticMeaning": "七十三人追杀链条首次被提及，与主角体内异变产生呼应"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "physical-sensations", "dialogue-heavy"],
        "mood": "警觉·线索串联",
        "wordCountTarget": 270
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "监视者逼近至二十丈", "powerDelta": 1 },
        { "faction": "周执事势力", "action": "调动三人今晚行动", "powerDelta": 1 }
      ],
      "hooksTouched": ["H044", "H035"],
      "transitionToNext": "主角后颈的温热感愈发明显"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "演武场西侧廊道",
      "sceneType": "reflection",
      "event": "主角回忆陈老旧债，三十年期限与七十三人名单产生关联",
      "protagonistReaction": "脑中电光火石：同姓陈、三十年偿还、弯月印记——自己与陈老的关系绝非师徒那么简单",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "「三十年……七十三人……弯月……」",
        "protagonistResponse": "主角猛然抬头，左手颤抖更甚",
        "dramaticMeaning": "陈老欠债线索开始与主角身世产生关联"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["inner-thought", "flashback", "fragmented-memory"],
        "mood": "震惊·身世迷雾",
        "wordCountTarget": 270
      },
      "factionActivity": [
        { "faction": "周执事势力", "action": "周执事调动三人今晚行动确认", "powerDelta": 1 }
      ],
      "hooksTouched": ["H035", "H044"],
      "transitionToNext": "监视者不再废话，抬手出招"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "演武场西侧廊道尽头",
      "sceneType": "action",
      "event": "监视者试探性出手，陈守一以残余灵力格挡",
      "protagonistReaction": "以七八成灵力硬接一招，左臂剧痛难忍",
      "keyDialogue": {
        "speaker": "四方角帽",
        "line": "「炼气三层，还敢负隅顽抗？」",
        "protagonistResponse": "「……！」主角闷哼一声，后退半步",
        "dramaticMeaning": "实力差距明显，主角处于绝对劣势"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "very-urgent",
        "technique": ["short-sentences", "action-verbs", "physical-impact"],
        "mood": "危急·硬撑",
        "wordCountTarget": 260
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "监视者出手制住主角", "powerDelta": 1 }
      ],
      "hooksTouched": ["H040"],
      "transitionToNext": "金丝缠失控蔓延至小臂中段"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "演武场西侧廊道尽头",
      "sceneType": "action",
      "event": "左手金丝缠失控蔓延至小臂中段，铜环与金丝缠产生共鸣",
      "protagonistReaction": "铜环剧烈发烫，体温急剧上升，肩胛骨裂痕加剧",
      "keyDialogue": {
        "speaker": "陈守一（咬牙）",
        "line": "「不好——！」",
        "protagonistResponse": "左肩明显比右肩低半寸，剧痛传遍全身",
        "dramaticMeaning": "体内异物失控，身体即将崩溃"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "intense",
        "technique": ["body-horror", "sensory-overload", "rapid-cutting"],
        "mood": "崩溃边缘·异物觉醒",
        "wordCountTarget": 260
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "监视者观察主角异变", "powerDelta": 0 }
      ],
      "hooksTouched": ["H046"],
      "transitionToNext": "后颈淡金色光芒透出"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "演武场西侧廊道尽头",
      "sceneType": "revelation",
      "event": "陈守一体内沉睡灵力被激发，同源印记首次主动显现",
      "protagonistReaction": "后颈透出淡金色弯月形光芒，与周铁柱同源印记产生共鸣",
      "keyDialogue": {
        "speaker": "四方角帽（惊愕）",
        "line": "「这是——同源印记？！」",
        "protagonistResponse": "主角感到一股陌生力量从丹田涌出",
        "dramaticMeaning": "身份彻底确认：同源者无误"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "explosive",
        "technique": ["power-reveal", "dramatic-pause", "light-metaphor"],
        "mood": "觉醒·身份确认",
        "wordCountTarget": 270
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "确认主角为同源者", "powerDelta": 1 }
      ],
      "hooksTouched": ["H044"],
      "transitionToNext": "异变震退监视者"
    },
    {
      "sceneId": "B3-4",
      "beatId": "B3",
      "location": "演武场西侧廊道尽头",
      "sceneType": "action",
      "event": "异变爆发震退监视者，但未能完全脱身",
      "protagonistReaction": "监视者被暗金色光芒逼退三步，但立即稳住身形",
      "keyDialogue": {
        "speaker": "四方角帽",
        "line": "「同源印记觉醒……难怪周执事要亲自动手。你身上的东西，比我想象的更值钱。」",
        "protagonistResponse": "主角喘息未定，左手彻底失去知觉",
        "dramaticMeaning": "监视者确认同源者身份，准备上报"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "high-tension",
        "technique": ["aftermath", "dialogue-aftermath", "settling-dust"],
        "mood": "僵持·更大危机将至",
        "wordCountTarget": 260
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "监视者确认同源者身份，准备上报", "powerDelta": 1 },
        { "faction": "周执事势力", "action": "周执事提前下达灭口令", "powerDelta": 1 }
      ],
      "hooksTouched": ["H040", "H044"],
      "transitionToNext": "监视者死前发出暗号"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "演武场西侧廊道尽头",
      "sceneType": "reflection",
      "event": "金丝缠蔓延至手腕，左手彻底无法动弹；铜环裂纹扩大，淡青色光芒转为暗金色",
      "protagonistReaction": "左臂灼烧感、后颈温热、铜环滚烫、肩胛骨刺痛——身体多处到达极限",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "「左手废了……但这股力量，是什么？」",
        "protagonistResponse": "主角感到体内灵力紊乱，呼吸急促",
        "dramaticMeaning": "代价与收获同时显现：身体受损，但灵力被激发"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["body-scan", "pain-description", "acceptance"],
        "mood": "代价·身体崩溃边缘",
        "wordCountTarget": 300
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "监视者观察主角异变结果", "powerDelta": 0 }
      ],
      "hooksTouched": ["H046", "H044"],
      "transitionToNext": "铜牌与铜环产生微弱联系"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "演武场西侧廊道尽头",
      "sceneType": "revelation",
      "event": "三件钥匙共鸣：铜牌+铜环感知到令牌方向；陈老欠债线索完整浮现",
      "protagonistReaction": "脑中将陈老旧债、弯月印记、七十三人名单串联起来",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "「陈老……三十年前欠的债，七十三条命，都是因为我同源者？」",
        "protagonistResponse": "主角道心轻微动摇，但很快稳住",
        "dramaticMeaning": "身世之谜与陈老命运交织，悬念加深"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["revelation", "connection-making", "epiphany"],
        "mood": "收获·真相初现",
        "wordCountTarget": 300
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "监视者死前发出暗号", "powerDelta": 0 }
      ],
      "hooksTouched": ["H035", "H044", "H046"],
      "transitionToNext": "苏婉儿传讯的真实性得到验证"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "演武场西侧廊道尽头",
      "sceneType": "revelation",
      "event": "监视者死前发出信号，周执事确认陈守一位置；卫长老收到追杀信号",
      "protagonistReaction": "远处传来破空声——三人比预计更早动手",
      "keyDialogue": {
        "speaker": "四方角帽（临死前低声）",
        "line": "「……月圆……同源……灭口……」",
        "protagonistResponse": "主角脸色骤变，转身就跑",
        "dramaticMeaning": "新势力卫长老入场，危机全面升级"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["rapid-pace", "signal-metaphor", "impending-threat"],
        "mood": "新困境·更大危机",
        "wordCountTarget": 230
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "四方角帽死前发出暗号", "powerDelta": 0 },
        { "faction": "周执事势力", "action": "周执事确认陈守一位置", "powerDelta": 1 },
        { "faction": "卫长老", "action": "卫长老收到追杀信号，即将介入", "powerDelta": 1 }
      ],
      "hooksTouched": ["H040"],
      "transitionToNext": "铜环解锁新感知，隐约感知令牌方向"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "演武场西侧廊道尽头",
      "sceneType": "reflection",
      "event": "铜环异变解锁新感知，感知到令牌所在方向（陈老方向）；苏婉儿传讯真实性验证",
      "protagonistReaction": "铜环传来微弱指向感，后颈弯月印记隐隐发烫——陈老在东边",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "「令牌在东边……陈老，你到底给我留下了什么？」",
        "protagonistResponse": "主角咬牙向东方奔去",
        "dramaticMeaning": "新机遇明确：找到令牌，揭开身世谜团"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["sense-awakening", "direction-finding", "purpose-clarification"],
        "mood": "新机遇·希望与危险并存",
        "wordCountTarget": 220
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "执法堂全面介入追杀", "powerDelta": 2 },
        { "faction