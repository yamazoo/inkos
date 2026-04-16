

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "聚居点边缘小屋",
      "sceneType": "revelation",
      "event": "陈守一从噩梦中惊醒，发现守夜者已在屋内等候，告知其母在彼岸留下了遗泽",
      "protagonistReaction": "陈守一浑身冷汗浸湿衣背，但意识迅速清醒，目光警惕地扫过屋内阴影",
      "keyDialogue": {
        "speaker": "守夜者",
        "line": ""你母亲在彼岸留下了东西。但在那之前，你需要先通过一个考验。"",
        "protagonistResponse": "陈守一挣扎着坐起身，嗓音沙哑："……什么考验？"",
        "dramaticMeaning": "守夜者正式登场，暗示母亲身份与彼岸存在关联"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["morning-light-description", "sensory-details"],
        "mood": "迷茫·警觉",
        "wordCountTarget": 300
      },
      "factionActivity": [
        { "faction": "守夜者", "action": "等待陈守一苏醒并传递信息", "powerDelta": "+1" }
      ],
      "hooksTouched": ["H097_守夜者"],
      "transitionToNext": "守夜者开始讲述三百年前的往事"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "聚居点边缘小屋",
      "sceneType": "revelation",
      "event": "守夜者讲述三百年前救下陈守一母亲的往事，揭示三源合一能封印幽冥界裂缝",
      "protagonistReaction": "陈守一心跳加速，三源合一——正是那日在山洞中无意间达成的事，他强压震惊继续聆听",
      "keyDialogue": {
        "speaker": "守夜者",
        "line": ""三百年前，我在彼岸边缘发现了她——只剩一口气。她说发现了三源合一的秘密，能封印那道裂缝。"",
        "protagonistResponse": ""封印裂缝……幽冥界的裂缝？"陈守一紧握双拳，指节泛白",
        "dramaticMeaning": "揭示守夜者与母亲的渊源，以及三源合一的终极使命"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "measured",
        "technique": ["flashback-framing", "tension-build"],
        "mood": "紧张·震撼",
        "wordCountTarget": 450
      },
      "factionActivity": [
        { "faction": "守夜者", "action": "讲述过去，揭示关键信息", "powerDelta": 0 }
      ],
      "hooksTouched": ["H097_守夜者", "H102_守夜者与母亲的关系", "H103_幽冥界裂缝"],
      "transitionToNext": "屋外突然传来嘈杂脚步声和呼喊声"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "聚居点入口",
      "sceneType": "action",
      "event": "赵猛带人围堵聚居点入口，指控陈守一是幽冥界探子，害死其弟",
      "protagonistReaction": "陈守一脸色骤变，身形摇晃，守夜者挡在他身前，怒目直视赵猛",
      "keyDialogue": {
        "speaker": "赵猛",
        "line": ""我弟弟三天前死在东面山谷的黑雾里！你是幽冥界的探子，今天必须给个说法！"",
        "protagonistResponse": "陈守一强撑着站稳，声音发颤："我没有……我不知道你弟弟……"",
        "dramaticMeaning": "赵猛敌意爆发，陈守一身处绝境，守夜者挺身护卫"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["shouting-dialogue", "crowd-tension"],
        "mood": "对峙·压迫",
        "wordCountTarget": 400
      },
      "factionActivity": [
        { "faction": "赵猛势力", "action": "围堵聚居点入口逼问陈守一", "powerDelta": "+2" },
        { "faction": "守夜者", "action": "挺身挡在陈守一面前", "powerDelta": 0 }
      ],
      "hooksTouched": ["H098_幽冥界痕迹", "H100_赵猛弟弟之死"],
      "transitionToNext": "对峙升级，赵猛逼近，守夜者暗示陈守一准备撤离"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "聚居点入口",
      "sceneType": "action",
      "event": "赵猛步步紧逼，陈守一无法自证清白，聚居点居民围观议论纷纷",
      "protagonistReaction": "陈守一被逼退至墙角，额头渗出冷汗，嘴唇颤抖却说不出话",
      "keyDialogue": {
        "speaker": "赵猛",
        "line": ""说不出来了吧？这几天黑雾越来越浓，我弟弟死的地方还有你的脚印！"",
        "protagonistResponse": "陈守一紧咬下唇，伤口渗血："那晚我根本不在东面山谷……"",
        "dramaticMeaning": "陈守一陷入百口莫辩的困境，矛盾不可调和"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "intense",
        "technique": ["close-up-dialogue", "crowd-murmur"],
        "mood": "窒息·绝望",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "赵猛势力", "action": "步步紧逼，围堵陈守一", "powerDelta": "+1" },
        { "faction": "聚居点居民", "action": "围观议论，信任动摇", "powerDelta": "-1" }
      ],
      "hooksTouched": ["H098_幽冥界痕迹"],
      "transitionToNext": "守夜者出手干预，出示母亲信物"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "聚居点入口",
      "sceneType": "revelation",
      "event": "守夜者出示弯月印记信物证明陈守一身份，赵猛拒不接受，东面山谷黑雾再次蔓延",
      "protagonistReaction": "陈守一低头看向自己胸口——金丝缠印记微微发烫，与守夜者手中信物遥相呼应",
      "keyDialogue": {
        "speaker": "守夜者",
        "line": ""这是她留给孩子的印记。弯月为记，三百年未曾消退。这孩子的身份，你赵猛说了不算！"",
        "protagonistResponse": "赵猛冷笑：\"鬼知道这印记是不是伪造！我只信我弟弟的血债！\"",
        "dramaticMeaning": "信物出现但不被承认，身份之谜与仇恨交织"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "dramatic",
        "technique": ["foreshadowing-light", "badge-resonance"],
        "mood": "悬念·危机",
        "wordCountTarget": 380
      },
      "factionActivity": [
        { "faction": "守夜者", "action": "出示弯月印记信物", "powerDelta": 0 },
        { "faction": "赵猛势力", "action": "拒绝承认，执意复仇", "powerDelta": "+1" },
        { "faction": "幽冥界", "action": "东面山谷黑雾再次蔓延", "powerDelta": "+1" }
      ],
      "hooksTouched": ["H095_岩石印记与母亲", "H098_幽冥界痕迹"],
      "transitionToNext": "远处传来尖叫，黑雾来袭"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "聚居点入口→后山方向",
      "sceneType": "action",
      "event": "东面山谷黑雾狂涌而来，守夜者大喝\"快走！\"指向后山，陈守一拔腿狂奔",
      "protagonistReaction": "陈守一心脏狂跳，双腿如灌铅，但守夜者的眼神让他知道——这是唯一的生路",
      "keyDialogue": {
        "speaker": "守夜者",
        "line": ""去！你母亲留下的秘境在后山！去见她！\"守夜者转身挡在黑雾与人群之间",
        "protagonistResponse": "陈守一咬紧牙关，发足狂奔，身后传来赵猛的怒吼："追！别让他跑了！"",
        "dramaticMeaning": "生路显现，陈守一被迫逃亡，命运转折点"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "furious",
        "technique": ["running-action", "chase-narration"],
        "mood": "逃亡·生死时速",
        "wordCountTarget": 320
      },
      "factionActivity": [
        { "faction": "守夜者", "action": "断后阻挡黑雾蔓延", "powerDelta": "-1" },
        { "faction": "赵猛势力", "action": "追赶陈守一", "powerDelta": "+1" },
        { "faction": "幽冥界", "action": "黑雾逼近聚居点", "powerDelta": "+2" }
      ],
      "hooksTouched": ["H098_幽冥界痕迹", "H101_母亲的九幽寒莲"],
      "transitionToNext": "陈守一拼命奔向聚居点后山"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "聚居点后山·山洞深处",
      "sceneType": "action",
      "event": "陈守一踉跄冲入山洞，洞深处一扇发光石门浮现，赵猛追至洞口外，黑雾蔓延至聚居点边缘",
      "protagonistReaction": "陈守一单膝跪地喘气，视线模糊间看到石门上刻着熟悉的弯月纹——与胸口印记一模一样",
      "keyDialogue": {
        "speaker": "赵猛（洞外）",
        "line": ""跑不了了！出来受死！"脚步声越来越近",
        "protagonistResponse": "陈守一强撑着站起，跌向石门，额头金痕与胸口金丝缠印记同时灼热发亮",
        "dramaticMeaning": "身份印记与秘境入口产生共鸣，逃亡与追杀的终极对峙"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "suspenseful",
        "technique": ["light-glow-description", "chase-tension"],
        "mood": "绝境·希望",
        "wordCountTarget": 380
      },
      "factionActivity": [
        { "faction": "赵猛势力", "action": "追至洞口，被石门光芒阻隔", "powerDelta": 0 },
        { "faction": "幽冥界", "action": "黑雾笼罩聚居点边缘", "powerDelta": "+1" }
      ],
      "hooksTouched": ["H094_眉心金痕的意义", "H095_岩石印记与母亲"],
      "transitionToNext": "石门轰然开启，陈守一踏入秘境"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "秘境入口",
      "sceneType": "revelation",
      "event": "陈守一踏入石门瞬间，眉心金痕与胸口印记同时绽放金芒，母亲残念显化，传递最后遗言后消散",
      "protagonistReaction": "陈守一双膝跪地，泪流满面，想要触碰那虚影，手却穿过虚无",
      "keyDialogue": {
        "speaker": "母亲残念（虚影）",
        "line": ""你做到了三源合一……但要封印那道裂缝，你的修为还远远不够。秘境中有九幽寒莲，能稳固你的根基。等你……\"残念开始透明、碎裂，最后一眼满是慈爱与不舍",
        "protagonistResponse": "陈守一泣不成声，伸出双手徒劳地抓向母亲消散的光点：\"娘！"",
        "dramaticMeaning": "母子以残念形式相见，母亲遗泽传承完成，情感最高潮"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "emotional",
        "technique": ["slow-motion", "light-dissolution", "emotional-silence"],
        "mood": "悲恸·传承",
        "wordCountTarget": 420
      },
      "factionActivity": [
        { "faction": "守夜者", "action": "在聚居点断后阻敌", "powerDelta": "-1" }
      ],
      "hooksTouched": ["H094_眉心金痕的意义", "H095_岩石印记与母亲", "H101_母亲的九幽寒莲", "H103_幽冥界裂缝"],
      "transitionToNext": "石门缓缓关闭，陈守一被困秘境，母亲残念彻底消散"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "秘境内部",
      "sceneType": "reflection",
      "event": "秘境试炼已开始，陈守一体内三源合一未稳固，生命力近乎耗尽的身体承受着巨大压力",
      "protagonistReaction": "陈守一面色惨白，盘坐在地感到体内灵气紊乱，三股力量相互排斥，几欲崩溃",
      "keyDialogue": {
        "speaker": "陈守一（内心独