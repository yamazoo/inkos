```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "灵泉方向山道",
      "sceneType": "action",
      "event": "大长老裹挟陈守一疾行，夜空阴云聚拢，幽蓝光芒从山腹透出",
      "protagonistReaction": "脚步踉跄却坚定，三十年真相压得胸口发闷，心跳如擂鼓",
      "keyDialogue": {
        "speaker": "大长老",
        "line": ""撑住！封印撑不了多久了。"",
        "protagonistResponse": ""……我能行。"",
        "dramaticMeaning": "从悲痛到坚定的转变，暗示即将到来的危机"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "fast",
        "technique": ["short-sentences", "sensory-detail", "environmental-shift"],
        "mood": "紧迫·悲痛·坚定",
        "wordCountTarget": 300
      },
      "factionActivity": [
        { "faction": "大长老派系", "action": "紧急裹挟陈守一奔赴灵泉", "powerDelta": -1 },
        { "faction": "灰袍执行者", "action": "封锁灵泉周围", "powerDelta": 0 }
      ],
      "hooksTouched": ["H068_幽冥界薄弱节点"],
      "transitionToNext": "抵达灵泉核心入口，封印异象更加剧烈"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "灵泉核心入口",
      "sceneType": "revelation",
      "event": "大长老以灵力护住陈守一，揭示封印被外力提前触发的情报",
      "protagonistReaction": "目光在幽蓝光芒中沉凝，后颈弯月印记剧烈跳动",
      "keyDialogue": {
        "speaker": "大长老",
        "line": ""有人用特殊手段打开了缝隙。冥将正在苏醒，一旦完全挣脱，三十里方圆将化为死地。当年三人留下的铜环、玉牌……还有一件东西，是压制的关键。"",
        "protagonistResponse": ""是谁触发的封印？周执事？还是——"",
        "dramaticMeaning": "情报铺垫，暗示内鬼存在，敌人身份成谜"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["dialogue-heavy", "information-reveal", "tension-building"],
        "mood": "警觉·凝重",
        "wordCountTarget": 250
      },
      "factionActivity": [
        { "faction": "封印阵法", "action": "阵基出现裂痕，纹路剧烈闪烁", "powerDelta": -2 },
        { "faction": "远近修士", "action": "感知封印松动，开始骚动", "powerDelta": 0 }
      ],
      "hooksTouched": ["H068_幽冥界薄弱节点"],
      "transitionToNext": "陈守一体内力量开始共鸣，铜环灼烫"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "灵泉核心入口处",
      "sceneType": "reflection",
      "event": "陈守一体内三股力量自行共鸣——弯月印记、金丝缠印记、铜环同时反应",
      "protagonistReaction": "单膝跪地，手捂胸口，铜环在怀中灼烫如火炭，额角渗出冷汗",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": ""铜环在烫……父亲，你在里面吗？"",
        "protagonistResponse": "无（内心独白）",
        "dramaticMeaning": "血脉与父亲遗留的羁绊显现，暗示后续抉择的伏笔"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["internal-focus", "body-sensation", "mystical-resonance"],
        "mood": "痛苦·共鸣·疑惑",
        "wordCountTarget": 200
      },
      "factionActivity": [],
      "hooksTouched": ["H001_铜环身世谜团"],
      "transitionToNext": "大长老扶起陈守一，带其进入灵泉核心深处"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "灵泉核心深处",
      "sceneType": "action",
      "event": "冥将登场，庞大黑影挣脱束缚，幽蓝眼眸睁开，嘲讽陈守一的血脉",
      "protagonistReaction": "浑身僵硬，血液仿佛凝固，但目光死死盯住那道黑影",
      "keyDialogue": {
        "speaker": "冥将",
        "line": ""又是一个献祭者的血脉……三十年前你父亲的味道，我还记得。鲜美的生机，滚烫的灵魂——你们父子，还真是同样的愚蠢。"",
        "protagonistResponse": ""你——！"",
        "dramaticMeaning": "冥将登场揭示父亲献祭的真相，仇恨与悲痛交织"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "intense",
        "technique": ["dialogue-as-weapon", "horror-element", "contrast-light-dark"],
        "mood": "震惊·愤怒·压抑",
        "wordCountTarget": 300
      },
      "factionActivity": [
        { "faction": "冥将", "action": "挣脱封印束缚，展现筑基巅峰战力", "powerDelta": +1 }
      ],
      "hooksTouched": ["H068_幽冥界薄弱节点", "H001_铜环身世谜团"],
      "transitionToNext": "大长老出手迎战，结丹对筑基巅峰的激战开始"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "灵泉核心深处石台旁",
      "sceneType": "action",
      "event": "大长老与冥将三次交锋，被封印锁链削弱，袖口染血被迫退两步",
      "protagonistReaction": "攥紧铜环，指节泛白，想冲上去却被战斗余波震退",
      "keyDialogue": {
        "speaker": "大长老",
        "line": ""陈守一，退后！这东西借了封印之力——"（话音未落，被冥将一爪击退）",
        "protagonistResponse": ""大长老！"",
        "dramaticMeaning": "结丹期修士被压制，局势危急，主角必须做出抉择"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["action-verbs", "short-sentences", "combat-sound"],
        "mood": "焦急·无力·挣扎",
        "wordCountTarget": 300
      },
      "factionActivity": [
        { "faction": "大长老", "action": "结丹期修为被封印锁链削弱", "powerDelta": -1 },
        { "faction": "冥将", "action": "借封印之力压制大长老", "powerDelta": +1 }
      ],
      "hooksTouched": ["H068_幽冥界薄弱节点"],
      "transitionToNext": "铜环剧烈震颤，父亲神魂低语，陈守一做出抉择"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "灵泉核心石台封印阵眼前",
      "sceneType": "action",
      "event": "陈守一不顾大长老阻拦冲向石台，将铜环按入封印阵眼，三股力量强行压制冥将",
      "protagonistReaction": "不顾一切冲入阵眼，铜环嵌入瞬间浑身剧痛，发间枯灰蔓延",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": ""父亲……借我力量！"",
        "protagonistResponse": "铜环与封印共鸣，幽蓝光芒暴涨",
        "dramaticMeaning": "主角主动献祭自己换取压制冥将的机会"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "explosive",
        "technique": ["dramatic-pause", "sensory-overload", "sacrifice-imagery"],
        "mood": "决绝·剧痛·燃烧",
        "wordCountTarget": 450
      },
      "factionActivity": [
        { "faction": "冥将", "action": "被铜环与封印共鸣之力压制", "powerDelta": -3 },
        { "faction": "陈守一", "action": "以自身力量填补封印缺口", "powerDelta": -5 }
      ],
      "hooksTouched": ["H001_铜环身世谜团", "H068_幽冥界薄弱节点"],
      "transitionToNext": "代价显现——陈守一生命力急剧流失，冥将发出不甘咆哮"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "灵泉核心石台旁",
      "sceneType": "revelation",
      "event": "冥将被迫退回封印深处，临退前吐露关键信息——被逐出宗门的弟子是触发封印的凶手",
      "protagonistReaction": "跪倒在地，面色惨白，却死死盯着冥将消散的眼睑不肯闭目",
      "keyDialogue": {
        "speaker": "冥将",
        "line": ""你父亲用命换来的三十年，今夜被你们亲手葬送……三十年前那个被逐出的人，他打开了封印的缝隙。你们的'同源者'不止是封印的钥匙，也是锁链。血脉相承，宿命轮回……"（咆哮着退回黑暗）",
        "protagonistResponse": "（无声，瞳孔中倒映着冥将消散的黑影）",
        "dramaticMeaning": "关键情报揭示——被逐出弟子是内鬼，血脉是双刃剑"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "decelerating",
        "technique": ["final-words", "prophecy-echo", "silence-after-storm"],
        "mood": "震撼·虚脱·深思",
        "wordCountTarget": 300
      },
      "factionActivity": [
        { "faction": "冥将", "action": "暂时退回封印深处，三日内不会彻底崩溃", "powerDelta": -2 }
      ],
      "hooksTouched": ["H068_幽冥界薄弱节点", "H001_铜环身世谜团"],
      "transitionToNext": "代价全面显现——陈守一发间枯灰蔓延至半边脸颊"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "灵泉核心石台旁",
      "sceneType": "reflection",
      "event": "战斗结束，陈守一代价显现——灵力枯竭，生命力剧烈流失，面色苍白如纸",
      "protagonistReaction": "勉强支撑身体，却发现手指干枯如枯枝，眼窝深陷，半边头发已成灰白",
      "keyDialogue": {
        "speaker": "大长老",
        "line": ""守一！你……你这是……"（声音发颤，伸手探查陈守一的脉搏，面色骤变）",
        "protagonistResponse": ""三年……寿数……值得。"",
        "dramaticMeaning": "代价具象化，主角为压制冥将付出的代价沉重但坚定"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["body-horror", "emotional-restraint", "quiet-determination"],
        "mood": "虚弱·无悔·坚定",
        "wordCountTarget": 300
      },
      "factionActivity": [
        { "faction": "铜环", "action": "父亲神魂陷入沉寂，需要时间恢复", "powerDelta": -1 }
      ],
      "hooksTouched": ["H001_铜环身世谜团"],
      "transitionToNext": "大长老欲扶陈守一离开，阴影中传来苍老笑声"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "灵泉核心深处阴影处",
      "sceneType": "action",
      "event": "被逐出宗门的弟子现身，手持暗金器物，与铜环、玉牌同源，威胁陈守一",
      "protagonistReaction": "强撑着抬起头，瞳孔骤缩——那张苍老的脸，竟有几分熟悉",
      "keyDialogue": {
        "speaker": "被逐出弟子",
        "line": ""你父亲当年选的活路，今夜该换了。三十年前我被逐出宗门时发的誓，今夜该应验了。这件东西……与你怀中那枚，本是一对。当年他选了你娘，你却不知道另一枚去了哪里吧？"",
        "protagonistResponse": ""……你是谁？"",
        "dramaticMeaning": "旧敌现身，揭示更深的身世谜团，对立升级"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "suspenseful",
        "technique": ["revelation-drop", "identity-mystery", "confrontation-stance"],
        "mood": "震惊·警惕·危机",
        "wordCountTarget": 300
      },
      "factionActivity": [
        { "faction": "被逐出弟子", "action": "手持同源器物出现，正式与主角对立", "powerDelta": +2 }
      ],
      "hooksTouched": ["H001_铜环身世谜团"],
      "transitionToNext": "被逐出弟子激活手中器物，封印阵基出现新裂痕"
    },
    {
      "sceneId": "B5-2",
      "beat