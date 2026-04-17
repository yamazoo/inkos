

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "秦无涯小屋",
      "sceneType": "revelation",
      "event": "秦无涯点燃油灯，目光望向窗外黑雾，以低沉语气暗示桥的真相即将揭露",
      "protagonistReaction": "主角屏息凝神，手指不自觉地摩挲袖中玉佩，压抑着翻涌的情绪",
      "keyDialogue": {
        "speaker": "秦无涯",
        "line": ""你既然能找到这里，想必已经知道那座桥的存在了。"",
        "protagonistResponse": ""……是。我需要知道真相。"",
        "dramaticMeaning": "承接上章悬念钩，正式开启真相揭露"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow",
        "technique": ["ambient-description", "internal-monologue"],
        "mood": "凝重·肃穆",
        "wordCountTarget": 300
      },
      "factionActivity": [
        { "faction": "秦无涯", "action": "点燃油灯，准备揭露秘密", "powerDelta": 0 }
      ],
      "hooksTouched": ["H150", "H152"],
      "transitionToNext": "秦无涯沉默片刻，从怀中取出一枚泛黄玉简"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "秦无涯小屋·油灯昏黄",
      "sceneType": "revelation",
      "event": "秦无涯以'二十年前，我和师兄一起去过那个地方'开场，讲述他和青鸾师父在祭坛深处的经历",
      "protagonistReaction": "主角瞳孔微缩，想起青鸾师父临终前的嘱托，心头涌起复杂情绪",
      "keyDialogue": {
        "speaker": "秦无涯",
        "line": ""二十年前，我和师兄一同踏入祭坛深处。那是我这辈子做过的最后悔的决定。"",
        "protagonistResponse": ""……青鸾的师父？那个……师兄？"",
        "dramaticMeaning": "连接青鸾师父支线，揭示秦无涯与青鸾的隐秘关联"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "measured",
        "technique": ["flashback-fragment", "tension-building"],
        "mood": "沉重·追忆",
        "wordCountTarget": 450
      },
      "factionActivity": [
        { "faction": "秦无涯", "action": "回忆二十年前的经历", "powerDelta": 0 }
      ],
      "hooksTouched": ["H150", "H153"],
      "transitionToNext": "秦无涯正要继续，角落传来青鸾的一声低吟"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "秦无涯小屋·角落",
      "sceneType": "reflection",
      "event": "青鸾在昏迷中发出低吟，陈守一下意识握紧玉佩，目光在青鸾与秦无涯之间来回",
      "protagonistReaction": "主角看向青鸾苍白的面容，心中一紧——她身上的黑纹蔓延得比昨日更快了",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": ""她身上的东西……和那座桥有关？"",
        "protagonistResponse": "主角沉默，只是握紧了青鸾冰凉的手",
        "dramaticMeaning": "建立青鸾病情与桥的关联，为后续恶化埋下伏笔"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow",
        "technique": ["emotional-pause", "foreshadowing"],
        "mood": "焦虑·无奈",
        "wordCountTarget": 200
      },
      "factionActivity": [
        { "faction": "陈守一", "action": "担忧地观察青鸾", "powerDelta": 0 }
      ],
      "hooksTouched": ["H139"],
      "transitionToNext": "秦无涯点头，示意主角继续听下去"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "秦无涯小屋·油灯前",
      "sceneType": "revelation",
      "event": "秦无涯揭露核心真相：桥不是通道，而是'镇界之桥'，隔绝人冥两界；末法时代是维持桥稳定的代价",
      "protagonistReaction": "主角如遭雷击，脑中飞速回想过往所有关于末法时代的猜测，尽数被推翻",
      "keyDialogue": {
        "speaker": "秦无涯",
        "line": ""那座桥不是用来通行的——它是用来封印的。镇界之桥，隔绝人间与冥界。末法时代的来临，正是因为维持这座桥需要消耗天地灵气。"",
        "protagonistResponse": ""……所以末法时代不是天灾，是……人为？"",
        "dramaticMeaning": "颠覆性真相揭露，重新定义末法时代的本质"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "dramatic-pause",
        "technique": ["revelation-pause", "conceptual-impact"],
        "mood": "震惊·颠覆",
        "wordCountTarget": 500
      },
      "factionActivity": [
        { "faction": "秦无涯", "action": "完整揭露桥的本质", "powerDelta": 0 }
      ],
      "hooksTouched": ["H150", "H153"],
      "transitionToNext": "秦无涯顿了顿，目光变得幽深"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "秦无涯小屋·油灯前",
      "sceneType": "revelation",
      "event": "秦无涯揭露支撑点的本质：所有支撑点都是自愿走上桥、用神魂镇住裂隙的人；这是大劫的核心秘密",
      "protagonistReaction": "主角感到一阵彻骨寒意——原来那些传说中的'飞升者'，从未真正离去",
      "keyDialogue": {
        "speaker": "秦无涯",
        "line": ""支撑点不是选择，是献祭。每一个自愿走上桥的人，都要将自己的神魂永远钉在裂隙之上，以一己之力镇住两界通道。末法时代之所以还能维持，正是因为有他们在。"",
        "protagonistResponse": ""……那些人现在还在？"",
        "dramaticMeaning": "揭示'飞升'真相——实为永恒的牺牲"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "measured",
        "technique": ["conceptual-breakdown", "emotional-weight"],
        "mood": "悲怆·沉重",
        "wordCountTarget": 550
      },
      "factionActivity": [
        { "faction": "秦无涯", "action": "揭露支撑点献祭本质", "powerDelta": 0 }
      ],
      "hooksTouched": ["H150", "H153"],
      "transitionToNext": "秦无涯闭上眼，声音沙哑"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "秦无涯小屋·阴影中",
      "sceneType": "revelation",
      "event": "秦无涯揭露师兄替他承受桥的反噬而死——这是他活下来的真正代价；他背负着二十年的愧疚",
      "protagonistReaction": "主角终于明白为何秦无涯能活到现在——不是幸运，是有人替他死了",
      "keyDialogue": {
        "speaker": "秦无涯",
        "line": ""当年师兄看到了比我更深的东西。他选择独自承担桥的反噬……只留下一句话：'替我看着这世道，别让它彻底烂下去。'他死的时候，笑着的。"",
        "protagonistResponse": ""……所以青鸾师父，是他的……"主角声音艰涩",
        "dramaticMeaning": "揭示秦无涯与青鸾师父的血脉/师承关系，完成情感闭环"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "emotional-surge",
        "technique": ["guilt-revelation", "backstory-disclosure"],
        "mood": "哀恸·愧疚",
        "wordCountTarget": 450
      },
      "factionActivity": [
        { "faction": "秦无涯", "action": "揭露师兄之死的真相", "powerDelta": -10 }
      ],
      "hooksTouched": ["H153", "H150"],
      "transitionToNext": "角落里传来青鸾一声撕心裂肺的呻吟"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "秦无涯小屋·角落草席旁",
      "sceneType": "action",
      "event": "青鸾侵蚀急剧恶化，黑纹从锁骨蔓延至心口以下；秦无涯诊断后神色凝重——侵蚀已入心脉",
      "protagonistReaction": "主角冲至青鸾身边，看着那狰狞的黑纹已越过心口，浑身如坠冰窟",
      "keyDialogue": {
        "speaker": "秦无涯",
        "line": ""来不及了。冥族的侵蚀一旦入心……"他没有说完，但意思已经很明白了",
        "protagonistResponse": ""不——一定有办法！"主角握住青鸾的手，那只手已冰凉得不像活人",
        "dramaticMeaning": "青鸾病情恶化，制造紧迫感与情感高潮"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "urgent",
        "technique": ["crisis-escalation", "emotional-desperation"],
        "mood": "绝望·焦灼",
        "wordCountTarget": 300
      },
      "factionActivity": [
        { "faction": "冥族", "action": "侵蚀加速，已入青鸾心脉", "powerDelta": +15 }
      ],
      "hooksTouched": ["H139"],
      "transitionToNext": "窗外忽然传来一声低沉咆哮"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "秦无涯小屋·窗边",
      "sceneType": "action",
      "event": "窗外黑雾深处传来低沉咆哮；秦无涯神色骤变——那头逃跑的分身不是分身，是信使",
      "protagonistReaction": "主角猛然抬头看向窗外，那咆哮声中带着令人胆寒的威压——那是冥将级别的气息",
      "keyDialogue": {
        "speaker": "秦无涯",
        "line": ""不好——它不是分身，是信使。冥将已经知道这里了。"",
        "protagonistResponse": ""信使？你的意思是——"主角瞳孔紧缩",
        "dramaticMeaning": "危机正式升级，冥将即将介入"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "explosive",
        "technique": ["sudden-threat", "pacing-acceleration"],
        "mood": "惊惧·危机",
        "wordCountTarget": 300
      },
      "factionActivity": [
        { "faction": "冥族", "action": "信使已归，冥将即将亲至", "powerDelta": +20 }
      ],
      "hooksTouched": ["H139", "H155"],
      "transitionToNext": "秦无涯看向主角，眼中闪过复杂神色"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "秦无涯小屋·油灯摇曳",
      "sceneType": "revelation",
      "event": "秦无涯透露三百年前的'前车之鉴'——有高人曾在大劫中试图反抗，最终魂飞魄散；这是警告，也是无奈",
      "protagonistReaction": "主角沉默，心中却燃起一股不甘——难道这大劫真的无解？",
      "keyDialogue": {
        "speaker": "秦无涯",
        "line": ""三百年前，有一位证道境的大能曾试图破坏那座桥。他失败了，魂飞魄散，连转世的机会都没有。从那以后，再没人敢动那座桥的念头。"",
        "protagonistResponse": ""……你是说，反抗只有死路一条？"",
        "dramaticMeaning": "揭示前人反抗的代价，为主角的选择埋下伏笔"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "ominous",
        "technique": ["historical-example", "warning-tone"],
        "mood": "沉重·不甘",
        "wordCountTarget": 250
      },
      "factionActivity": [
        { "faction": "秦无涯", "action": "警告主角不要重蹈覆辙", "powerDelta": 0 }
      ],
      "hooksTouched": ["H156"],
      "transitionToNext": "窗外咆哮声渐近，黑雾开始吞噬小屋周围的最后一点光亮"
    }
  ]
}
```