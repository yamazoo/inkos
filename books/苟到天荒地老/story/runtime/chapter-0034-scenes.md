```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "城墙外破庙",
      "sceneType": "revelation",
      "event": "陈守一被铜环微光和执法堂监视惊醒，彻夜未眠后黎明降临",
      "protagonistReaction": "蜷缩角落，呼吸压至极低，心跳如擂鼓",
      "keyDialogue": { "speaker": "陈守一", "line": "「不能等了。」", "protagonistResponse": "内心自语，攥紧铜环", "dramaticMeaning": "黎明前的焦虑与决心" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "slow", "technique": ["long-sentences", "sensory-detail"], "mood": "警觉·压抑", "wordCountTarget": 350 },
      "factionActivity": [],
      "hooksTouched": [],
      "transitionToNext": "晨光中铜环持续微颤"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "破庙外灌木丛→演武场茶摊",
      "sceneType": "action",
      "event": "执法堂监视延伸；四方角帽现身灌木丛；灰袍人再送纸条",
      "protagonistReaction": "目光在监视者与纸条间来回，心沉如石",
      "keyDialogue": { "speaker": "灰袍人", "line": "「陈旧之物。」", "protagonistResponse": "接过纸条，无声点头", "dramaticMeaning": "信息传递与危机叠加" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "moderate", "technique": ["parallel-action", "tension-build"], "mood": "警觉·压迫", "wordCountTarget": 450 },
      "factionActivity": [
        { "faction": "执法堂", "action": "监视范围扩大至破庙周边", "powerDelta": 0 },
        { "faction": "四方角帽", "action": "潜伏灌木丛监视", "powerDelta": 0 },
        { "faction": "灰袍人", "action": "传递纸条后消失", "powerDelta": 0 }
      ],
      "hooksTouched": [],
      "transitionToNext": "纸条上\"陈旧之物\"四字令主角思绪翻涌"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "破庙角落",
      "sceneType": "revelation",
      "event": "铜环裂纹扩大测试；三件钥匙共鸣确认",
      "protagonistReaction": "瞳孔微缩，手指微颤，呼吸急促",
      "keyDialogue": { "speaker": "陈守一", "line": "「果然......」", "protagonistResponse": "将铜牌贴近铜环，见证裂纹透出微光", "dramaticMeaning": "验证猜想——铜牌与铜环同源" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "slow", "technique": ["short-sentences", "close-detail"], "mood": "紧张·期待", "wordCountTarget": 350 },
      "factionActivity": [],
      "hooksTouched": ["H046"],
      "transitionToNext": "金丝缠隐隐吸收共鸣能量，铜环比昨日更烫"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "破庙角落",
      "sceneType": "reflection",
      "event": "陈老\"欠债\"三层含义分析；三件钥匙体系完整确认",
      "protagonistReaction": "心跳加速，额角渗汗，手指无意识摩挲三件钥匙",
      "keyDialogue": { "speaker": "陈守一", "line": "「欠债......原来是这个意思。」", "protagonistResponse": "将铜牌、铜环、锈钥匙并排摆开", "dramaticMeaning": "陈老三层含义：欠宗门、欠同道、欠本心；三件钥匙都来自陈老" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "slow", "technique": ["inner-monologue", "flashback"], "mood": "恍然·沉重", "wordCountTarget": 350 },
      "factionActivity": [],
      "hooksTouched": ["H035"],
      "transitionToNext": "原定\"前胜后让\"策略彻底失效，但获得关键认知"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "破庙角落",
      "sceneType": "action",
      "event": "金丝缠吸收共鸣能量；铜环失控征兆初现",
      "protagonistReaction": "手腕一阵刺痛，铜环温度异常攀升",
      "keyDialogue": { "speaker": "陈守一", "line": "「不好——」", "protagonistResponse": "甩开铜牌，强压铜环热度", "dramaticMeaning": "共鸣测试付出代价：三件钥匙共鸣引发铜环失控征兆" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "urgent", "technique": ["short-sentences", "action-verbs"], "mood": "惊惶·克制", "wordCountTarget": 350 },
      "factionActivity": [],
      "hooksTouched": [],
      "cost": "铜环共鸣测试后温度异常攀升",
      "gain": "确认三件钥匙同源体系；推断陈老\"欠债\"三层含义",
      "transitionToNext": "铜环比昨日更烫，收好钥匙准备行动"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "演武场边角",
      "sceneType": "action",
      "event": "演武场方向突发骚动；神秘人物现身；气氛骤然紧张",
      "protagonistReaction": "心跳如擂鼓，手心冷汗，却强作镇定",
      "keyDialogue": { "speaker": "陈守一", "line": "「......」", "protagonistResponse": "转身欲离开，余光锁定骚动方向", "dramaticMeaning": "骚动转移注意力，但主角意识到自己也被盯上" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "urgent", "technique": ["parallel-action", "sensory-detail"], "mood": "紧张·心跳加速", "wordCountTarget": 300 },
      "factionActivity": [
        { "faction": "执法堂", "action": "监视者逼近至二十丈", "powerDelta": 0 },
        { "faction": "神秘势力", "action": "神秘人物现身演武场", "powerDelta": 0 }
      ],
      "hooksTouched": [],
      "transitionToNext": "主角发现监视者\"只盯不追\"的规律，决定脱身"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "演武场→城墙暗角",
      "sceneType": "action",
      "event": "主角借骚动脱身；监视者\"只盯不追\"规律确认",
      "protagonistReaction": "脚步不停却心跳渐稳，余光确认监视者止步",
      "keyDialogue": { "speaker": "陈守一", "line": "「......果然。」", "protagonistResponse": "加快步伐，心底却一沉——被盯上无法脱身", "dramaticMeaning": "发现弱点，却也意识到自己已入局" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "moderate", "technique": ["action-verbs", "tension-release"], "mood": "警觉·思索", "wordCountTarget": 200 },
      "factionActivity": [
        { "faction": "执法堂", "action": "监视者止步二十丈外", "powerDelta": 0 }
      ],
      "hooksTouched": ["H040"],
      "transitionToNext": "回到破庙，铜环比离开时更烫"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "城墙暗角",
      "sceneType": "revelation",
      "event": "铜环剧烈发烫；裂纹透出强光；苏婉儿破空而至",
      "protagonistReaction": "心跳几乎停滞，瞳孔倒映铜环强光与破空身影",
      "keyDialogue": { "speaker": "苏婉儿", "line": "「约定......提前。」", "protagonistResponse": "「你怎么提前了？」", "dramaticMeaning": "后天约定被打破，苏婉儿带来紧急消息" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "urgent", "technique": ["short-sentences", "sensory-detail"], "mood": "震惊·期待", "wordCountTarget": 300 },
      "factionActivity": [
        { "faction": "苏婉儿", "action": "破空而至，提前现身", "powerDelta": 1 }
      ],
      "hooksTouched": ["H046", "H047"],
      "transitionToNext": "铜环热度稍减但未消，两人向城东疾行"
    },
    {
      "sceneId": "B6-1",
      "beatId": "B6",
      "location": "城墙暗角→城东方向",
      "sceneType": "reflection",
      "event": "全面回收伏笔：陈老欠债+铜环裂纹+执法堂监视+三件钥匙",
      "protagonistReaction": "思绪翻涌，将所有线索串联",
      "keyDialogue": { "speaker": "陈守一", "line": "「所以......都是陈老布的局？」", "protagonistResponse": "与苏婉儿对视，目光复杂", "dramaticMeaning": "线索串联：陈老欠债三层、铜环来源、执法堂意图、三件钥匙同源" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "slow", "technique": ["flashback", "inner-monologue"], "mood": "恍然·沉重", "wordCountTarget": 250 },
      "factionActivity": [
        { "faction": "执法堂", "action": "监视网络暴露", "powerDelta": -1 },
        { "faction": "幕后势力", "action": "铜环相关方入场", "powerDelta": 1 }
      ],
      "hooksTouched": ["H035", "H046", "H040", "H047"],
      "transitionToNext": "晨光渐明，铜环余温未退，局势彻底改变"
    },
    {
      "sceneId": "B6-2",
      "beatId": "B6",
      "location": "城东废墟暗道",
      "sceneType": "dialogue",
      "event": "苏婉儿揭示新线索：\"陈旧之物\"与铜环失控有关",
      "protagonistReaction": "面色凝重，手指无意识按在铜环上",
      "keyDialogue": { "speaker": "苏婉儿", "line": "「有人盯上铜环了——不止一方。」", "protagonistResponse": "「我该