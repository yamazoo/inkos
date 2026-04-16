

# 第6章 ScenePlan（场景级大纲）

## 场景规划总览

| 节拍 | 场景数 | 类型分布 | 目标字数 |
|------|--------|----------|----------|
| B1 悬念引入 | 1 | reflection | 380 |
| B2 局势升级 | 1 | dialogue + revelation | 550 |
| B3 冲突爆发 | 2 | action + revelation | 880 |
| B4 小高潮 | 2 | action + transition | 760 |
| B5 章末悬念 | 1 | reflection + setup | 430 |
| **合计** | **7** | — | **3000** |

---

## 场景详情

### B1-1：余烬未冷

```json
{
  "sceneId": "B1-1",
  "beatId": "B1",
  "location": "破屋角落",
  "sceneType": "reflection",
  "event": "陈守一蜷在破屋角落消化目睹赵海被吞噬的冲击，翻看遗信揣摩线索，天机簿残页发热",
  "protagonistReaction": "指尖摩挲信纸折痕，心跳如擂鼓，目光却异常平静地盯着灵泉方向",
  "keyDialogue": null,
  "povCharacter": "陈守一",
  "pacing": {
    "speed": "slow",
    "technique": ["long-sentences", "sensory-details", "inner-monologue"],
    "mood": "压抑·警觉·余悸",
    "wordCountTarget": 380
  },
  "factionActivity": [],
  "hooksTouched": ["H002"],
  "mustInclude": "赵海之死的余波；天机簿残页发热；灵泉闷响比晨曦更沉",
  "transitionToNext": "苏婉儿推门而入，打破沉默"
}
```

---

### B2-1：暗线交汇

```json
{
  "sceneId": "B2-1",
  "beatId": "B2",
  "location": "破屋内",
  "sceneType": "dialogue + revelation",
  "event": "苏婉儿传达林师兄三则情报，瞥见伤疤神情剧变，透露周平-赵海-陈老三势力暗线",
  "protagonistReaction": "听到「体质」二字时瞳孔微缩，看到苏婉儿表情骤变时握紧了袖口",
  "keyDialogue": {
    "speaker": "苏婉儿",
    "line": "「林师兄说，你身上的东西比灵泉更重要。」",
    "protagonistResponse": "「……什么东西？」",
    "dramaticMeaning": "身份谜团加深；苏婉儿态度转变伏笔"
  },
  "povCharacter": "陈守一",
  "pacing": {
    "speed": "moderate",
    "technique": ["dialogue-heavy", "tension-pauses", "facial-micro-expressions"],
    "mood": "紧张·疑惑·暗流",
    "wordCountTarget": 550
  },
  "factionActivity": [
    { "faction": "苏婉儿", "action": "传达林师兄情报，态度倒向主角", "powerDelta": 1 }
  ],
  "hooksTouched": ["H001", "H003", "H004"],
  "mustInclude": "林师兄关注体质；「比灵泉更重要」；周平身份；伤疤触发情绪",
  "transitionToNext": "苏婉儿离开后，地面传来更沉闷的震动"
}
```

---

### B3-1：风暴前兆

```json
{
  "sceneId": "B3-1",
  "beatId": "B3",
  "location": "破屋内",
  "sceneType": "action",
  "event": "灵泉方向闷响骤沉，天机簿残页开始微弱震颤，陈守一感到胸口一股压迫感涌起",
  "protagonistReaction": "猛地按住胸口，感觉体内灵气开始不受控地向残页涌去",
  "keyDialogue": null,
  "povCharacter": "陈守一",
  "pacing": {
    "speed": "accelerating",
    "technique": ["short-sentences", "physical-sensations", "environmental-escalation"],
    "mood": "压迫·失控·恐惧",
    "wordCountTarget": 420
  },
  "factionActivity": [],
  "hooksTouched": ["H006"],
  "mustInclude": "灵泉异变前兆；天机簿残页震颤；灵气开始失控",
  "transitionToNext": "墙壁裂纹蔓延，地面震动加剧——真正的爆发降临"
}
```

### B3-2：吞噬之力

```json
{
  "sceneId": "B3-2",
  "beatId": "B3",
  "location": "破屋内",
  "sceneType": "revelation + action",
  "event": "灵泉异变全面爆发，天机簿残页剧烈震颤，地底闷雷滚滚，破屋墙壁出现裂纹；陈守一感受到与杀死赵海同源的「吞噬之力」",
  "protagonistReaction": "身体僵直，冷汗浸透后背，意识到自己与赵海之死存在某种可怕的关联",
  "keyDialogue": {
    "speaker": "（内心）",
    "line": "「这股力量……和那天夜里一样。」",
    "protagonistResponse": null,
    "dramaticMeaning": "身份暴露风险飙升；世界观伏笔H006灵气衰减呈现"
  },
  "povCharacter": "陈守一",
  "pacing": {
    "speed": "urgent",
    "technique": ["short-sentences", "action-verbs", "environmental-chaos", "internal-revelation"],
    "mood": "剧变·恐惧·关联",
    "wordCountTarget": 460
  },
  "factionActivity": [],
  "hooksTouched": ["H006"],
  "mustInclude": "灵泉异变失控；吞噬之力与赵海之死同源；空气中游离灵气比两年前更稀薄且加速衰减",
  "transitionToNext": "灵气波动引发外界注意——周平和陈老同时察觉到异动源头"
}
```

---

### B4-1：三方窥伺

```json
{
  "sceneId": "B4-1",
  "beatId": "B4",
  "location": "灵草园边缘（周平视角）/ 暗处（陈老视角）",
  "sceneType": "action",
  "event": "周平巡视灵田时察觉灵气异常，脸色骤变；陈老在暗处窥视，眉头紧皱，两人都锁定异动源头",
  "protagonistReaction": "（POV切换至周平/陈老）感知到那股异动后立即行动",
  "keyDialogue": {
    "speaker": "周平",
    "line": "「这波动……是从那边来的。」",
    "dramaticMeaning": "三方势力重新评估主角价值"
  },
  "povCharacter": "周平/陈老（POV切换）",
  "pacing": {
    "speed": "urgent",
    "technique": ["parallel-action", "multiple-pov", "tension-escalation"],
    "mood": "警觉·锁定·逼近",
    "wordCountTarget": 380
  },
  "factionActivity": [
    { "faction": "周平", "action": "察觉灵气异常，锁定异动源头", "powerDelta": 0 },
    { "faction": "陈老", "action": "确认异动方向，开始行动", "powerDelta": 0 }
  ],
  "hooksTouched": [],
  "mustInclude": "周平/陈老同时察觉；三方势力重新评估主角价值",
  "transitionToNext": "苏婉儿脸色苍白返回破屋"
}
```

### B4-2：紧急撤离

```json
{
  "sceneId": "B4-2",
  "beatId": "B4",
  "location": "破屋内",
  "sceneType": "transition + revelation",
  "event": "苏婉儿紧急返回催促转移，留下关键情报后离去；陈守一体质共鸣确认与灵泉关联",
  "protagonistReaction": "咬牙点头，心中却掀起惊涛骇浪——体内残页与灵泉竟存在关联",
  "keyDialogue": {
    "speaker": "苏婉儿",
    "line": "「林师兄说，你体内的东西……会自己找到答案。」",
    "protagonistResponse": "「什么答案？」",
    "dramaticMeaning": "天机簿残页自主意识/觉醒机制伏笔；苏婉儿明确站在主角一方"
  },
  "povCharacter": "陈守一",
  "pacing": {
    "speed": "urgent",
    "technique": ["short-dialogue", "emotional-tension", "revelation-pacing"],
    "mood": "紧迫·震撼·新知",
    "wordCountTarget": 380
  },
  "factionActivity": [
    { "faction": "苏婉儿", "action": "明确倒向主角，提供关键情报后撤离", "powerDelta": 1 }
  ],
  "hooksTouched": ["H001", "H005"],
  "mustInclude": "苏婉儿倒向主角；残页「会自己找到答案」；确认体内残页与灵泉关联",
  "transitionToNext": "异变平息后，陈守一陷入更深的困境与更复杂的机遇"
}
```

---

### B5-1：风暴之眼

```json
{
  "sceneId": "B5-1",
  "beatId": "B5",
  "location": "破屋内（异变平息后）",
  "sceneType": "reflection + setup",
  "event": "异变平息，陈守一盘点新困境与新机遇；身份暴露风险升至40/100；三股势力同时锁定体质",
  "protagonistReaction": "瘫坐在地，却露出一个苦涩的笑——困境越大，机会也越大",
  "keyDialogue": null,
  "povCharacter": "陈守一",
  "pacing": {
    "speed": "slow",
    "technique": ["reflection", "internal-monologue", "foreshadowing"],
    "mood": "沉思·苦涩·暗含希望",
    "wordCountTarget": 430
  },
  "factionActivity": [
    { "faction": "林师兄", "action": "持续关注体质本身", "powerDelta": 0 },
    { "faction": "周平", "action": "察觉灵气异常指向灵草园深处", "powerDelta": 0 },
    { "faction": "陈老", "action": "确认异动源头在陈守一方向", "powerDelta": 0 }
  ],
  "hooksTouched": ["H001", "H005", "H006"],
  "mustInclude": "代价：暴露风险升至40/100；收获：苏婉儿倒戈 + 残页自主觉醒线索",
  "costAndGain": {
    "cost": "身份暴露风险从0/100升至40/100；三股势力同时锁定",
    "gain": "苏婉儿明确站队；天机簿残页「会自己找到答案」暗示自主意识"
  },
  "transitionToNext": "远处传来脚步声正在逼近——新势力入场或旧敌重新布局"
}
```

---

## 最终 ScenePlan JSON

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "破屋角落",
      "sceneType": "reflection",
      "event": "陈守一蜷在破屋角落消化目睹赵海被吞噬的冲击，翻看遗信揣摩线索，天机簿残页发热",
      "protagonistReaction": "指尖摩挲信纸折痕，心跳如擂鼓，目光却异常平静地盯着灵泉方向",
      "keyDialogue": null,
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["long-sentences", "sensory-details", "inner-monologue"],
        "mood": "压抑·警觉·余悸",
        "wordCountTarget": 380
      },
      "factionActivity": [],
      "hooksTouched": ["H002"],
      "mustInclude": "赵海之死的余波；天机簿残页发热；灵泉闷响比晨曦更沉",
      "transitionToNext": "苏婉儿推门而入，打破沉默"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "破屋内",
      "sceneType": "dialogue + revelation",
      "event": "苏婉儿传达林师兄三则情报，瞥见伤疤神情剧变，透露周平-赵海-陈老三势力暗线",
      "protagonistReaction": "听到「体质」二字时瞳孔微缩，看到苏婉儿表情骤变时握紧了袖口",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": "「林师兄说，你身上的东西比灵泉更重要。」",
        "protagonistResponse": "「……什么东西？」",
        "dramaticMeaning": "身份谜团加深；苏婉儿态度转变伏笔"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["dialogue-heavy", "tension-pauses", "facial-micro-expressions"],
        "mood": "紧张·疑惑·暗流",
        "wordCountTarget": 550
      },
      "factionActivity": [
        { "faction": "苏婉儿", "action": "传达林师兄情报，态度倒向主角", "powerDelta": 1 }
      ],
      "hooksTouched": ["H001", "H003", "H004"],
      "mustInclude": "林师兄关注体质；「比灵泉更重要」；周平身份；伤疤触发情绪",
      "transitionToNext": "苏婉儿离开后，地面传来更沉闷的震动"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "破屋内",
      "sceneType": "action",
      "event": "灵泉方向闷响骤沉，天机簿残页开始微弱震颤，陈守一感到胸口一股压迫感涌起",
      "protagonistReaction": "猛地按住胸口，感觉体内灵气开始不受控地向残页涌去",
      "keyDialogue": null,
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "accelerating",
        "technique": ["short-sentences", "physical-sensations", "environmental-escalation"],
        "mood": "压迫·失控·恐惧",
        "wordCountTarget": 420
      },
      "factionActivity": [],
      "hooksTouched": ["H006"],
      "mustInclude": "灵泉异变前兆；天机簿残页震颤；灵气开始失控",
      "transitionToNext": "墙壁裂纹蔓延，地面震动加剧——真正的爆发降临"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "破屋内",
      "sceneType": "revelation + action",
      "event": "灵泉异变全面爆发，天机簿残页剧烈震颤，地底闷雷滚滚，破屋墙壁出现裂纹；陈守一感受到与杀死赵海同源的「吞噬之力」",
      "protagonistReaction": "身体僵直，冷汗浸透后背，意识到自己与赵海之死存在某种可怕的关联",
      "keyDialogue": {
        "speaker": "（内心）",
        "line": "「这股力量……和那天夜里一样。」",
        "protagonistResponse": null,
        "dramaticMeaning": "身份暴露风险飙升；世界观伏笔H006灵气衰减呈现"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "action-verbs", "environmental-chaos", "internal-revelation"],
        "mood": "剧变·恐惧·关联",
        "wordCountTarget": 460
      },
      "factionActivity": [],
      "hooksTouched": ["H006"],
      "mustInclude": "灵泉异变失控；