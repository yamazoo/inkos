# 第3章 ScenePlan 场景级大纲

## 场景数量规划

| 节拍 | 场景数 | 目标字数 | 场景ID |
|------|--------|----------|--------|
| B1 悬念引入 | 1 | 450字 | B1-1 |
| B2 局势升级 | 3 | 1050字 | B2-1, B2-2, B2-3 |
| B3 冲突爆发 | 2 | 600字 | B3-1, B3-2 |
| B4 小高潮 | 1 | 450字 | B4-1 |
| B5 章末转折 | 2 | 450字 | B5-1, B5-2 |
| **合计** | **9** | **3000字** | — |

---

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "破屋外·窗前·月色稀薄",
      "sceneType": "action",
      "event": "陈守一因左臂灵气麻痹难以入眠，窗外三丈处出现刻意压低脚步的身影",
      "protagonistReaction": "陈守一握紧枕下柴刀，屏息观察，月光下身影停住不动，腰间悬有执法堂制式令牌",
      "keyDialogue": null,
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow-build",
        "technique": ["sensory-detail", "tension-pointing", "visual-focal"],
        "mood": "警觉·压迫·绝境延续",
        "wordCountTarget": 450
      },
      "factionActivity": [
        {
          "faction": "执法堂",
          "action": "身份不明者于破屋外监视",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H004_执法堂调查", "H002_中年男子"],
      "transitionToNext": "来者原地不动，双方僵持——中年男子自报身份，步入破屋"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "破屋内",
      "sceneType": "dialogue",
      "event": "中年男子自报身份——执法堂外勤，姓周；点出陈守一三天前的行踪",
      "protagonistReaction": "陈守一握柴刀的手微微颤抖，但面色尽量保持镇定，脑中飞速盘算如何应对",
      "keyDialogue": {
        "speaker": "周姓男子",
        "line": "「三天前的夜里，你一个人去了灵泉谷外围。」",
        "protagonistResponse": "陈守一沉默，目光微垂",
        "dramaticMeaning": "表明身份暴露，点明对方掌握情报"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "measured",
        "technique": ["dialogue-driven", "internal-monologue"],
        "mood": "紧张·试探·心理博弈",
        "wordCountTarget": 350
      },
      "factionActivity": [
        {
          "faction": "执法堂",
          "action": "周姓男子点破主角行踪，展示情报优势",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H004_执法堂调查", "H002_中年男子"],
      "transitionToNext": "周姓男子话锋一转——揭露虫卵栽赃的真相"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "破屋内",
      "sceneType": "revelation",
      "event": "揭露虫卵栽赃真相：枯叶螟虫卵是人为放置，目的是引出灵泉关联者；确认主角能感知灵泉异常波动，推断会推演术",
      "protagonistReaction": "陈守一心跳如擂鼓，指节泛白——枯叶螟虫卵果然是陷阱，而自己的底牌正被一张张揭开",
      "keyDialogue": {
        "speaker": "周姓男子",
        "line": "「枯叶螟虫卵是有人故意放的，就是为了引出能感知灵泉异常的人。」",
        "protagonistResponse": "陈守一：「……你们已经知道多少？」",
        "dramaticMeaning": "真相揭露——主角从被调查者升级为被锁定目标"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "steady",
        "technique": ["revelation-pacing", "emotional-punch"],
        "mood": "震惊·真相落地·危机升级",
        "wordCountTarget": 350
      },
      "factionActivity": [
        {
          "faction": "执法堂",
          "action": "揭露虫卵栽赃真相，确认主角感知能力",
          "powerDelta": "+1（掌握关键情报）"
        },
        {
          "faction": "未知势力",
          "action": "栽赃者身份未明，目的指向灵泉",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H007_枯叶螟栽赃", "H003_灵泉异常", "H004_执法堂调查"],
      "transitionToNext": "周姓男子继续给出关键信息——三日后灵泉变故、老槐树指引、今夜不上报"
    },
    {
      "sceneId": "B2-3",
      "beatId": "B2",
      "location": "破屋内",
      "sceneType": "dialogue",
      "event": "给出三大关键信息：三日后灵泉将有变故；后山老槐树下有重要东西等着主角；今夜之事不会上报",
      "protagonistReaction": "陈守一感到一股复杂的情绪涌上——危机之中似乎透出一丝微光，老槐树的指引是机遇还是陷阱？",
      "keyDialogue": {
        "speaker": "周姓男子",
        "line": "「三日后灵泉会有变故。后山老槐树下有东西等着你。今夜的事，我不上报。」",
        "protagonistResponse": "陈守一：「……你想要什么？」",
        "dramaticMeaning": "交易达成——主角被迫卷入，但获得喘息空间与明确指引"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "deliberate",
        "technique": ["weighted-dialogue", "symbolic-detail"],
        "mood": "复杂·微光·转折点",
        "wordCountTarget": 350
      },
      "factionActivity": [
        {
          "faction": "执法堂",
          "action": "与主角达成秘密交易，暂时保护其不被正式追查",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H001_三日之期", "H002_中年男子", "H003_灵泉异常"],
      "transitionToNext": "周姓男子起身准备离开——冲突正式爆发，陈守一必须回应关于感知能力的问题"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "破屋内",
      "sceneType": "dialogue",
      "event": "周姓男子直接点破陈守一的感知能力'不寻常'，要求他亲口承认",
      "protagonistReaction": "陈守一内心剧烈挣扎——承认意味着彻底暴露，否认可能失去这根救命稻草",
      "keyDialogue": {
        "speaker": "周姓男子",
        "line": "「你的感知能力不是普通的敏锐，对吗？」",
        "protagonistResponse": "陈守一沉默良久，低声道：「……我能感知到一些别人感知不到的。」",
        "dramaticMeaning": "被迫半承认——保留天机簿秘密，但承认感知能力存在"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "tension-peak",
        "technique": ["psychological-close-up", "dialogue-pause"],
        "mood": "挣扎·抉择·被迫承认",
        "wordCountTarget": 300
      },
      "factionActivity": [
        {
          "faction": "执法堂",
          "action": "确认主角感知能力，获取关键情报",
          "powerDelta": "+1"
        }
      ],
      "hooksTouched": ["H004_执法堂调查", "H008_天机簿共鸣"],
      "transitionToNext": "周姓男子似有所察但未深究，承诺不上报今夜之事——冲突暂缓"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "破屋内门口",
      "sceneType": "reflection",
      "event": "中年男子离开，陈守一站在门口目送其背影消失在夜色中，意识到自己已彻底失去'不冒头'的资格",
      "protagonistReaction": "陈守一握紧拳头又松开——被标记、被卷入，但他别无选择，只能抓住老槐树这根救命稻草",
      "keyDialogue": {
        "speaker": "周姓男子（离去时）",
        "line": "「三天后的夜里，老槐树下见。」",
        "protagonistResponse": "陈守一没有回答，只是目送他离去",
        "dramaticMeaning": "章内冲突落幕——主角被迫卷入灵泉变故的漩涡，多方势力角逐正式开始"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "aftermath",
        "technique": ["reflection-pause", "futures-implication"],
        "mood": "沉重·无奈·决心暗生",
        "wordCountTarget": 300
      },
      "factionActivity": [
        {
          "faction": "执法堂",
          "action": "周姓男子离开，约定三日后再见",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H001_三日之期", "H002_中年男子", "threat-执法堂与主角"],
      "transitionToNext": "陈守一返回破屋，发现异常——有第三方监视者潜入过"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "破屋内",
      "sceneType": "action",
      "event": "陈守一返回屋内发现异常：被褥被动过、柴刀角度偏移、窗台碎石被动过——第三方监视者趁对峙时潜入翻动",
      "protagonistReaction": "陈守一后背发凉——执法堂的人刚走，另一双眼睛就已经盯上了他；这个人是谁？比执法堂更老练的手法意味着什么？",
      "keyDialogue": {
        "speaker": "陈守一（内心独白）",
        "line": "「执法堂的人刚走，他们就进来了……这些人一直在暗处。」",
        "protagonistResponse": null,
        "dramaticMeaning": "威胁升级——从'被执法堂找上门'升级为'还有第三方在暗处盯着'的更深恐惧"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "sudden-panic",
        "technique": ["discovery-scene", "environmental-clue", "ominous-reveal"],
        "mood": "恐惧·警觉·危机深化",
        "wordCountTarget": 450
      },
      "factionActivity": [
        {
          "faction": "未知势力",
          "action": "趁执法堂与主角对峙时潜入翻动，手法老练",
          "powerDelta": 0
        },
        {
          "faction": "执法堂",
          "action": "周姓男子离开后未能察觉第三方存在",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H005_破屋监视者", "mystery-中年男子真相", "threat-执法堂与主角"],
      "transitionToNext": "陈守一将柴刀放回枕下，强压不安等待天明——章末转折即将到来"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "破屋内",
      "sceneType": "action",
      "event": "灵泉方向传来低沉闷响，地面微微震颤；体内天机簿残页疑似与这声响产生某种共鸣——一阵刺痛袭来",
      "protagonistReaction": "陈守一捂住左臂，脸色骤变——这痛感与天机簿残页的共鸣让他意识到灵泉与天机簿之间存在某种神秘关联",
      "keyDialogue": null,
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "ominous-slow",
        "technique": ["physical-sensation", "environmental-sign", "mystical-echo"],
        "mood": "震惊·代价降临·威胁迫近",
        "wordCountTarget": 225
      },
      "factionActivity": [
        {
          "faction": "灵泉",
          "action": "传来低沉闷响，与天机簿产生共鸣",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H003_灵泉异常", "H008_天机簿共鸣", "H001_三日之期"],
      "transitionToNext": "代价已承受——接下来是老槐树之约带来的收获与微光"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "破屋外·夜色中",
      "sceneType": "reflection",
      "event": "陈守一站在破屋门口，望着灵泉方向渐消的闷响与远处若有若无的窥视气息；脑中浮现老槐树之约与周姓男子的承诺",
      "protagonistReaction": "陈守一深吸一口气，将左臂的刺痛压下——三日后，灵泉有变故，但老槐树下有东西等着他，这是机遇还是陷阱？他必须去",
      "keyDialogue": {
        "speaker": "陈守一（内心独白）",
        "line": "「三日……我还有三日。」",
        "protagonistResponse": null,
        "dramaticMeaning": "章末定格——代价与收获并存，绝境中仍有希望；多方势力蠢蠢欲动，悬念留至下章"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "closing",
        "technique": ["scene-freeze", "foreshadowing", "emotional-resonance"],
        "mood": "沉重·坚定·悬念留存",
        "wordCountTarget": 225
      },
      "factionActivity": [
        {
          "faction": "执法堂",
          "action": "周姓男子承诺不上报，暂时提供保护",
          "powerDelta": 0
        },
        {
          "faction": "未知势力",
          "action": "远处仍有气息窥视，身份目的未明",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H001_三日之期", "H002_中年男子", "H005_破屋监视者", "mystery-中年男子真相"],
      "transitionToNext": "章节结束——陈守一回屋等待天明，三日后的抉择已不可避免"
    }
  ]
}
```

---

## 场景节奏分布图

```
B1-1 (450字)  ████████████████████████████████████  悬念引入
                  ↓
B2-1 (350字) 