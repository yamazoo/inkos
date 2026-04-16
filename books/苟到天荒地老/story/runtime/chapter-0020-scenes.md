

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "废弃地窖入口",
      "sceneType": "action",
      "event": "陈守一逃入地窖，四方角帽传话者目送放行",
      "protagonistReaction": "心跳如擂鼓，却感到一股诡异的从容——对方眼中只有确认，没有杀意",
      "keyDialogue": {
        "speaker": "四方角帽传话者",
        "line": "「去。」",
        "protagonistResponse": "主角侧身钻入地窖入口，余光中那顶四方角帽在月色下纹丝不动",
        "dramaticMeaning": "放行而非追杀——第四势力目的不是灭口，而是确认身份"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "sensory-focus"],
        "mood": "紧绷·疑惑",
        "wordCountTarget": 150
      },
      "factionActivity": [
        { "faction": "四方角帽第四势力", "action": "目送陈守一进入地窖，选择放行", "powerDelta": 0 },
        { "faction": "周平手下", "action": "被四方角帽逼退，未能追入地窖", "powerDelta": -1 }
      ],
      "hooksTouched": ["H012"],
      "transitionToNext": "地窖深处亮起幽光"
    },
    {
      "sceneId": "B1-2",
      "beatId": "B1",
      "location": "地窖深处",
      "sceneType": "revelation",
      "event": "陈守一在地窖深处发现大量幽暗眼睛，正对着藏身方向",
      "protagonistReaction": "后背紧贴冰冷石壁，呼吸压到最低，手中金丝缠剧烈发烫",
      "keyDialogue": {
        "speaker": "环境音",
        "line": "「嘶——」地窖深处传来细碎的摩擦声，像无数双眼睛同时眨动",
        "protagonistResponse": "主角屏息，指尖触及金丝缠的灼热，却不敢发出半点声响",
        "dramaticMeaning": "幽冥威胁直接呈现，与金丝缠产生关联——H015/H019推进"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["long-pauses", "darkness-imagery", "suspense-build"],
        "mood": "恐惧·压迫",
        "wordCountTarget": 150
      },
      "factionActivity": [
        { "faction": "幽冥生物", "action": "在地窖深处亮起眼睛，缓慢逼近", "powerDelta": 0 }
      ],
      "hooksTouched": ["H015", "H019"],
      "transitionToNext": "主角被迫继续深入，发现人工痕迹"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "地窖甬道",
      "sceneType": "revelation",
      "event": "陈守一发现地窖墙壁有凿刻痕迹——非天然坍塌，而是人工建造",
      "protagonistReaction": "手指摩挲墙壁纹路，心底发寒：这里被人刻意隐藏着什么",
      "keyDialogue": {
        "speaker": "环境音",
        "line": "「叮——」主角指尖碰到一处凹陷，竟然是刻意留下的暗格",
        "protagonistResponse": "主角强迫自己冷静，手指探入暗格，触到冰凉金属",
        "dramaticMeaning": "地窖是刻意建造的藏匿点——H016推进，伏笔收网"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "deliberate",
        "technique": ["sensory-detail", "discovery-moment"],
        "mood": "紧张·发现",
        "wordCountTarget": 200
      },
      "factionActivity": [
        { "faction": "未知建造者", "action": "建造地窖并藏匿物品", "powerDelta": 0 }
      ],
      "hooksTouched": ["H016"],
      "transitionToNext": "暗格中取出小册子与黑铁令牌"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "地窖暗格处",
      "sceneType": "revelation",
      "event": "暗格中小册子记载林记实验内容，黑铁令牌与金丝缠纹路完全吻合",
      "protagonistReaction": "瞳孔骤缩——册子上写着「第七次实验」「经脉走向与幽冥接引」「纹路转移成功」",
      "keyDialogue": {
        "speaker": "小册子文字",
        "line": "「金丝缠纹路与黑铁令牌纹路吻合度：九成七。第七次实验，经脉接引成功，纹路转移成功。」",
        "protagonistResponse": "主角猛地扯开衣领，金丝缠在黑暗中泛着微光——与令牌上的纹路，几乎一模一样",
        "dramaticMeaning": "重大揭示：金丝缠是林记实验产物，纹路被转移到主角身上——H010/H014/H017/H018推进"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "intense",
        "technique": ["revelation-pacing", "parallel-imagery"],
        "mood": "震惊·真相初露",
        "wordCountTarget": 250
      },
      "factionActivity": [
        { "faction": "林记/林师兄", "action": "三十年前进行幽冥接引实验", "powerDelta": 0 }
      ],
      "hooksTouched": ["H010", "H014", "H017", "H018"],
      "transitionToNext": "金丝缠突然剧烈发烫，残纸与之产生共振"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "地窖深处",
      "sceneType": "action",
      "event": "金丝缠突然剧烈发烫，残纸与之共振，幽冥眼睛开始逼近",
      "protagonistReaction": "剧痛从胸口蔓延至四肢，金丝缠仿佛活过来的烙铁，灵力却空空如也",
      "keyDialogue": {
        "speaker": "环境音",
        "line": "「嘶嘶嘶——」黑暗中，十几双幽绿的眼睛缓缓移动，朝着主角藏身的方向围拢",
        "protagonistResponse": "主角咬紧牙关想要调动灵力，丹田却像干涸的枯井——逃不掉了",
        "dramaticMeaning": "主角陷入绝境：灵力枯竭+幽冥逼近+金丝缠失控——H013/H015推进"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "intense",
        "technique": ["rapid-shifts", "sensory-overload"],
        "mood": "绝望·失控",
        "wordCountTarget": 250
      },
      "factionActivity": [
        { "faction": "幽冥生物", "action": "十余双眼睛缓慢逼近主角", "powerDelta": 0 },
        { "faction": "金丝缠/残纸", "action": "产生剧烈共振，主角剧痛", "powerDelta": 0 }
      ],
      "hooksTouched": ["H013", "H015"],
      "transitionToNext": "腥甜气息浓烈到令人作呕"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "地窖深处",
      "sceneType": "action",
      "event": "腥甜气息浓烈到令人作呕，幽冥生物距离主角不足三丈",
      "protagonistReaction": "主角强忍呕吐冲动，握紧小册子的手微微颤抖——答案就在眼前，却可能死在这里",
      "keyDialogue": {
        "speaker": "环境音",
        "line": "「呼——」腥甜气息如实质般包裹主角，最近的眼睛距离他不足三丈，泛着幽绿微光",
        "protagonistResponse": "主角后背紧贴石壁，金丝缠的灼热与幽冥的逼近同时撕扯着他",
        "dramaticMeaning": "多重压力叠加：身体痛苦+精神恐惧+无路可退"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow-creep",
        "technique": ["tension-build", "proximity-detail"],
        "mood": "窒息·绝境",
        "wordCountTarget": 250
      },
      "factionActivity": [
        { "faction": "幽冥生物", "action": "距离主角不足三丈，形成包围", "powerDelta": 0 }
      ],
      "hooksTouched": ["H015", "H019"],
      "transitionToNext": "主角回忆周平手下被四方角帽逼退"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "地窖入口（闪回）",
      "sceneType": "reflection",
      "event": "周平手下被四方角帽逼退，四方角帽选择放行——为何？",
      "protagonistReaction": "主角脑海中闪过四方角帽的眼神——那不是追杀者的眼神，而是确认猎物的眼神",
      "keyDialogue": {
        "speaker": "主角内心",
        "line": "「他们放我进来……不是要杀我？」",
        "protagonistResponse": "主角死死盯着逼近的幽冥生物，又想起地窖入口那顶纹丝不动的四方角帽",
        "dramaticMeaning": "第四势力目的成谜——他们要主角进入这里做什么？H012深化"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "reflective",
        "technique": ["flashback", "internal-monologue"],
        "mood": "困惑·后怕",
        "wordCountTarget": 200
      },
      "factionActivity": [
        { "faction": "四方角帽第四势力", "action": "逼退周平手下，放行陈守一进入地窖", "powerDelta": 0 },
        { "faction": "周平手下", "action": "察觉四方角帽放行异常，没有追入地窖", "powerDelta": 0 }
      ],
      "hooksTouched": ["H012"],
      "transitionToNext": "主角灵力枯竭，无法战斗，幽冥生物即将触及"
    },
    {
      "sceneId": "B3-4",
      "beatId": "B3",
      "location": "地窖深处",
      "sceneType": "action",
      "event": "主角灵力枯竭无法战斗，最近的幽冥生物伸出触须，残纸突然剧烈涌动",
      "protagonistReaction": "主角想要挣扎，身体却像被抽空——就在触须即将触及的瞬间，胸口残纸猛地一跳",
      "keyDialogue": {
        "speaker": "环境音",
        "line": "「嗡——」残纸在胸口剧烈震颤，爆发出刺目白光，与金丝缠的灼热形成对抗",
        "protagonistResponse": "主角瞪大眼睛：残纸……又动了？",
        "dramaticMeaning": "绝境转折——残纸第三次涌动，代价即将显现——H013深化"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "explosive",
        "technique": ["contrast-cut", "action-pause"],
        "mood": "绝望转希望·悬念",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "幽冥生物", "action": "触须即将触及主角", "powerDelta": 0 },
        { "faction": "残纸", "action": "剧烈涌动，释放力量", "powerDelta": +1 }
      ],
      "hooksTouched": ["H013"],
      "transitionToNext": "残纸力量压制金丝缠灼热，幽冥生物短暂退却"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "地窖深处",
      "sceneType": "action",
      "event": "残纸力量涌动压制金丝缠灼热，幽冥生物被迫退却，主角获得喘息",
      "protagonistReaction": "主角强忍剧痛跪倒在地，金丝缠与残纸的力量在体内激烈交锋，汗水与血丝从眼角渗出",
      "keyDialogue": {
        "speaker": "环境音",
        "line": "「嘶——」幽冥生物发出刺耳嘶鸣，十几双眼睛同时闭上，黑暗中传来退却的摩擦声",
        "protagonistResponse": "主角大口喘息，双手死死按住胸口——残纸的力量正在迅速消退",
        "dramaticMeaning": "危机暂缓，但代价显现：残纸消耗大量精神力——H013代价"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "dramatic-peak",
        "technique": ["intense-action", "physical-detail"],
        "mood": "痛苦·暂时脱险",
        "wordCountTarget": 400
      },
      "factionActivity": [
        { "faction": "残纸", "action": "释放力量压制金丝缠灼热，消耗大量精神力", "powerDelta": -1 },
        { "faction": "幽冥生物", "action": "暂时退却，但未离开地窖", "powerDelta": 0 }
      ],
      "hooksTouched": ["H013", "H015", "H019"],
      "transitionToNext": "主角低头查看金丝缠，发现纹路更加清晰"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "地窖深处",
      "sceneType": "revelation",
      "event": "主角低头查看金丝缠，纹路更加清晰——与令牌完全吻合，真相初步揭露",
      "protagonistReaction": "主角颤抖着举起令牌与金丝缠对比，瞳孔震颤：这不是巧合，是刻意植入",
      "keyDialogue": {
        "speaker": "小册子内容",
        "line": "「纹路转移成功。受试者经脉已与幽冥接引位点吻合，可进行第七次幽