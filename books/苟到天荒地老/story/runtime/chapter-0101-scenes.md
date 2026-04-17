

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "晨雾弥漫的草地出口",
      "sceneType": "action",
      "event": "四人从地道狼狈爬出，冥将本体在雾气中显现",
      "protagonistReaction": "陈守一的心脏猛然收紧，指节发白，但没有出声",
      "keyDialogue": [
        { "speaker": "冥将", "line": "（无声注视）", "protagonistResponse": null, "dramaticMeaning": "威压的沉默比任何话语更具压迫感" },
        { "speaker": "秦无涯", "line": "它不急……它在等我们做出选择。", "protagonistResponse": "（四人屏息）", "dramaticMeaning": "揭示冥将作为\"等待者\"的本质" }
      ],
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow-build",
        "technique": ["long-descriptions", "atmospheric-details", "short-sentences-ending"],
        "mood": "绝望·窒息·威压",
        "wordCountTarget": 300
      },
      "factionActivity": [
        { "faction": "冥将", "action": "本体显现，静静注视四人", "powerDelta": 10 }
      ],
      "hooksTouched": ["H157_冥将亲至"],
      "transitionToNext": "秦无涯低声说出关键信息"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "晨雾草地",
      "sceneType": "revelation",
      "event": "秦无涯完整揭露身份——师兄的师弟，二十年唯一幸存者",
      "protagonistReaction": "陈守一握紧玉佩，声音沙哑追问师兄留下的东西",
      "keyDialogue": [
        { "speaker": "秦无涯", "line": "我是师兄的师弟。这二十年，我活着，就是为了等你来。", "protagonistResponse": "（震惊）", "dramaticMeaning": "身份确认，建立关键盟友关系" },
        { "speaker": "秦无涯", "line": "师兄在出口外三里处埋了一样东西。那东西……本来是留给桥的。但如果你能在三天内找到它，或许……", "protagonistResponse": "（屏息等待）", "dramaticMeaning": "抛出希望与悬念" }
      ],
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "measured",
        "technique": ["dialogue-driven", "information-drip", "emotional-pause"],
        "mood": "紧张·希望萌生·追问",
        "wordCountTarget": 450
      },
      "factionActivity": [
        { "faction": "青云门残余", "action": "沈炼和短暂清醒的青鸾注视秦无涯", "powerDelta": 0 }
      ],
      "hooksTouched": ["H150_秦无涯", "H158_师兄留下的东西"],
      "transitionToNext": "沈炼扶起陈守一，四人开始移动"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "晨雾草地与雾气边缘",
      "sceneType": "revelation",
      "event": "冥将后退保持距离，秦无涯解释冥将的\"等待\"策略",
      "protagonistReaction": "陈守一皱眉思索，目光在冥将与秦无涯之间来回",
      "keyDialogue": [
        { "speaker": "秦无涯", "line": "它在等。等三源合一者做出选择——无论你选什么，对它都有利。", "protagonistResponse": "（咬牙）", "dramaticMeaning": "揭示冥将的真正目的不是追杀，而是操控" }
      ],
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "tense",
        "technique": ["strategic-analysis", "tension-building", "foreshadowing"],
        "mood": "思索·压力·宿命感",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "冥将", "action": "缓缓后退，保持\"恰到好处\"的距离", "powerDelta": 0 }
      ],
      "hooksTouched": ["H157_冥将亲至"],
      "transitionToNext": "引出两难选择的呈现"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "晨雾草地",
      "sceneType": "dialogue",
      "event": "艰难抉择呈现——返回桥还是前往师兄遗物",
      "protagonistReaction": "陈守一的呼吸变得粗重，沈炼搀扶他的手紧了紧",
      "keyDialogue": [
        { "speaker": "秦无涯", "line": "你面前有两条路。回桥——但桥三天后会崩塌。取师兄留下的东西——但冥将正在那里等你。", "protagonistResponse": "（沉默）", "dramaticMeaning": "两难困境的具体化" }
      ],
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "heavy",
        "technique": ["pause-and-weight", "internal-monologue", "environmental-stasis"],
        "mood": "沉重·抉择·窒息",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "四人小队", "action": "沈炼搀扶陈守一，青鸾短暂清醒看向秦无涯", "powerDelta": 0 }
      ],
      "hooksTouched": ["H146_桥需要更多支撑", "H158_师兄留下的东西"],
      "transitionToNext": "陈守一做出决定"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "晨雾草地",
      "sceneType": "action",
      "event": "陈守一做出决定——前往师兄遗物所在",
      "protagonistReaction": "陈守一缓缓站起，目光坚定，声音沙哑却有力",
      "keyDialogue": [
        { "speaker": "陈守一", "line": "带我去师兄留下的地方。", "protagonistResponse": null, "dramaticMeaning": "主角主动选择\"未知的第三条路\"，势力格局因此倾斜" }
      ],
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "punchy",
        "technique": ["short-sentences", "declarative-dialogue", "transition-momentum"],
        "mood": "决断·希望与危机并存",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "四人小队", "action": "一致行动，开始向三里外山谷移动", "powerDelta": 0 }
      ],
      "hooksTouched": ["H158_师兄留下的东西"],
      "transitionToNext": "秦无涯带路前往山谷，途中揭露代价"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "通往山谷的小径",
      "sceneType": "revelation",
      "event": "代价显现——师兄遗物不是武器，而是带有残酷时限的选择",
      "protagonistReaction": "陈守一的脚步一顿，心沉了下去",
      "keyDialogue": [
        { "speaker": "秦无涯", "line": "师兄把它分成两份。一份在这里，一份在桥上。取走这份，桥上的那份就会失效——三天后，桥会崩塌得更快。", "protagonistResponse": "（握紧玉佩）", "dramaticMeaning": "揭露代价的残酷性——无论怎么选都要付出" }
      ],
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow-reveal",
        "technique": ["revelation-pacing", "emotional-beat", "staccato-dialogue"],
        "mood": "震撼·两难·代价",
        "wordCountTarget": 400
      },
      "factionActivity": [
        { "faction": "四人小队", "action": "停下脚步，秦无涯揭露真相", "powerDelta": 0 }
      ],
      "hooksTouched": ["H158_师兄留下的东西", "H146_桥需要更多支撑"],
      "transitionToNext": "青鸾突然再次清醒，说出关键信息"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "通往山谷的小径",
      "sceneType": "revelation",
      "event": "青鸾再次清醒，以师兄声音揭露\"第三个选择\"与大劫真相线索",
      "protagonistReaction": "陈守一猛然抬头，瞳孔骤缩",
      "keyDialogue": [
        { "speaker": "青鸾（师兄之声）", "line": "……还有第三个选择。在那之前，你需要知道大劫的完整真相——为什么桥会存在，为什么必须有献祭。", "protagonistResponse": "（屏息倾听）", "dramaticMeaning": "新机遇浮现——第三条路的存在" },
        { "speaker": "青鸾（师兄之声）", "line": "你以为血脉只是巧合吗？", "protagonistResponse": "（内心震动）", "dramaticMeaning": "伏笔钩子——血脉与大劫的关联" }
      ],
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "dramatic-pause",
        "technique": ["voice-change", "revelation-cliff", "emotional-impact"],
        "mood": "震撼·希望·悬念",
        "wordCountTarget": 500
      },
      "factionActivity": [
        { "faction": "秦无涯", "action": "关键行动——确认青鸾/师兄的话，等待主角反应", "powerDelta": 5 }
      ],
      "hooksTouched": ["H151_三源归一三条件", "H147_壁画女人身份", "H159_大劫完整真相"],
      "transitionToNext": "冥将察觉意图，开始逼近"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "山谷入口",
      "sceneType": "action",
      "event": "冥将开始逼近，时间紧迫，秦无涯催促最终决定",
      "protagonistReaction": "陈守一深吸一口气，看向玉佩，做出最终选择",
      "keyDialogue": [
        { "speaker": "秦无涯", "line": "时间不多了——必须在冥将抵达前做出最终决定：是取走师兄的遗物，还是放弃另寻他路。", "protagonistResponse": "（目光坚定）", "dramaticMeaning": "新困境——时间压力下的最终抉择" },
        { "speaker": "青鸾（师兄之声）", "line": "你以为血脉只是巧合吗？", "protagonistResponse": "（内心翻涌）", "dramaticMeaning": "新伏笔钩子——血脉与桥的漏洞直接相关" }
      ],
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["chase-tension", "time-pressure", "cliffhanger-ending"],
        "mood": "紧迫·悬念·新起点",
        "wordCountTarget": 450
      },
      "factionActivity": [
        { "faction": "冥将", "action": "察觉四人意图，开始缓缓逼近", "powerDelta": 5 }
      ],
      "hooksTouched": ["H159_大劫完整真相", "H151_三源归一三条件", "H157_冥将亲至"],
      "transitionToNext": "陈守一做出选择——（留待下章）"
    }
  ],
  "chapterSummary": {
    "chapterNumber": 101,
    "chapterType": "回收章",
    "keyRecalls": ["师兄遗留物真相揭露", "冥将作为\"等待者\"的本质揭示", "血脉与大劫的关联暗示"],
    "newHooks": ["H159_大劫完整真相", "H151_三源归一血脉关联"],
    "totalWordCountTarget": 3150,
    "sceneDistribution": {
      "B1": { "scenes": 1, "words": 300 },
      "B2": { "scenes": 1, "words": 450 },
      "B3": { "scenes": 3, "words": 1050 },
      "B4": { "scenes": 2, "words": 900 },
      "B5": { "scenes": 1, "words": 450 }
    }
  }
}
```