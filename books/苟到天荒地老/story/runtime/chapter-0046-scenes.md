
# 第46章 ScenePlan

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "山涧石屋·入夜",
      "sceneType": "revelation",
      "event": "苏婉儿揭示父亲失踪案与三十年前三人组的关联，递出残缺地图",
      "protagonistReaction": "陈守一瞳孔骤缩，指尖微颤接过地图，脑中两条线索轰然交汇",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": ""我父亲失踪前最后接触的三人，与三十年前共同探索上古遗迹的那三人——是同一批人。"",
        "protagonistResponse": ""灵泉里的石台……和他们探索的遗迹是同一个？"",
        "dramaticMeaning": "伏笔交汇，真相浮现关键线索"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "medium",
        "technique": ["dialogue-driven", "revelation-pause"],
        "mood": "震动·紧绷",
        "wordCountTarget": 320
      },
      "factionActivity": [
        { "faction": "苏婉儿", "action": "主动揭示家族秘密", "powerDelta": 0 }
      ],
      "hooksTouched": ["H061_长老与父亲关系"],
      "transitionToNext": "陈守一要求查看地图细节"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "山涧石屋·烛光下",
      "sceneType": "revelation",
      "event": "苏婉儿展开地图残片，指出与灵泉石台位置完全吻合；揭示三人身份——周执事、李长老、被逐出宗门弟子",
      "protagonistReaction": "陈守一死死盯着地图某处，五指攥紧桌沿，青筋暴起",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": ""三十年前那场探索之后，这三人命运各异——周执事平步青云，李长老闭门不出，还有一个被逐出宗门，从此下落不明。"",
        "protagonistResponse": ""被逐出宗门的是谁？现在何处？"",
        "dramaticMeaning": "敌人身份逐渐明朗，线索收束指向明确目标"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["information-dump", "strategic-pause"],
        "mood": "沉思·压抑",
        "wordCountTarget": 380
      },
      "factionActivity": [
        { "faction": "周执事势力", "action": "作为嫌疑人浮出水面", "powerDelta": "威胁+1" }
      ],
      "hooksTouched": ["H061_长老与父亲关系", "H062_石台传送门"],
      "transitionToNext": "陈守一沉默良久，追问石台与遗迹的关系"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "山涧石屋·深夜",
      "sceneType": "reflection",
      "event": "陈守一权衡利弊，决定利用禁制期限三天主动布局；提出联系孙师兄履行交易换取助力",
      "protagonistReaction": "陈守一缓缓起身，扶着墙壁，眼中闪过决然",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": ""三天。我只有三天。与其坐等演武场被人围杀，不如主动破局——孙师兄欠我人情，我需要他还。"",
        "protagonistResponse": ""但监视……"",
        "dramaticMeaning": "主角首次展现主动进攻姿态，不再被动挨打"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "deliberate",
        "technique": ["inner-monologue", "decision-anchoring"],
        "mood": "决绝·筹谋",
        "wordCountTarget": 520
      },
      "factionActivity": [
        { "faction": "陈守一", "action": "制定主动出击策略", "powerDelta": "+1（主动权）" }
      ],
      "hooksTouched": ["H063_周执事追杀"],
      "transitionToNext": "苏婉儿同意配合，提出暗中传话的方案"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "山涧石屋·角落低语",
      "sceneType": "dialogue",
      "event": "陈守一与苏婉儿商议暗号、时机、传话方式；明确代价——欠更多人情、冒监视暴露风险",
      "protagonistReaction": "陈守一压低声音，目光在苏婉儿脸上停留片刻后点头",
      "keyDialogue": {
        "speaker": "苏婉儿",
        "line": ""明日我去取水时'偶遇'他的人——你确定他能信？"",
        "protagonistResponse": ""他贪婪，但更怕死。只要利益够大，他会来。"",
        "dramaticMeaning": "盟友间建立信任，同时暗示交易的风险代价"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["whisper-dialogue", "tension-build"],
        "mood": "谨慎·暗流",
        "wordCountTarget": 480
      },
      "factionActivity": [
        { "faction": "苏婉儿", "action": "同意暗中传话", "powerDelta": "+1（协助）" },
        { "faction": "孙师兄", "action": "即将被联系", "powerDelta": 0 }
      ],
      "hooksTouched": [],
      "transitionToNext": "两人约定暗号，苏婉儿起身假装休息，陈守一闭目假寐"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "山涧石屋·后半夜",
      "sceneType": "reflection",
      "event": "苏婉儿离开后，陈守一察觉身体衰败——发间枯灰、眼窝凹陷、灵力微弱；铜环反哺缓慢但持续生效",
      "protagonistReaction": "陈守一借着月光看见自己倒影，手不由自主地摸向发间，触感粗糙如枯草",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": "（内心）\"铜环在修，可我还有多少时间……\"",
        "protagonistResponse": null,
        "dramaticMeaning": "身体代价具象化，主角陷入时间紧迫的绝境"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["sensory-detail", "inner-voice"],
        "mood": "颓败·焦灼",
        "wordCountTarget": 420
      },
      "factionActivity": [
        { "faction": "陈守一", "action": "身体持续衰败", "powerDelta": "-2（状态下降）" }
      ],
      "hooksTouched": [],
      "transitionToNext": "陈守一猛然睁眼，感知到屋外有两道若有若无的气息"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "山涧石屋·暗处监视",
      "sceneType": "action",
      "event": "陈守一发现周执事的监视网——窗外五十步外灌木丛后有两人呼吸；两人装作休息，实则警戒",
      "protagonistReaction": "陈守一心跳如擂鼓，但眼皮未抬，只将右手悄悄压在铜环上",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": "（呼吸绵长平稳，与熟睡无异）",
        "protagonistResponse": null,
        "dramaticMeaning": "主角以退为进，在监视下隐藏实力与意图"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["tension-suspense", "hidden-action"],
        "mood": "警觉·危机",
        "wordCountTarget": 380
      },
      "factionActivity": [
        { "faction": "周执事势力", "action": "布置监视网盯梢", "powerDelta": "+1（监控）" }
      ],
      "hooksTouched": ["H063_周执事追杀"],
      "transitionToNext": "陈守一确认监视范围后闭目，脑中飞速推演明日计划"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "山涧石屋·黎明前",
      "sceneType": "reflection",
      "event": "陈守一盘点困境与机遇：三天期限逼近、周执事监视收紧、演武场悬而未决——但铜环持续修复、苏婉儿地图关键、孙师兄交易可能破局",
      "protagonistReaction": "陈守一半睁眼，唇角扯出一丝冷意：\"三面围堵，总有一处是活路。\"",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": "（极轻声音）\"三天……够了。"",
        "protagonistResponse": null,
        "dramaticMeaning": "困境与机遇并存，主角选择相信自己能杀出血路"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "deliberate",
        "technique": ["inner-summation", "hook-foreshadow"],
        "mood": "沉稳·暗蓄",
        "wordCountTarget": 450
      },
      "factionActivity": [
        { "faction": "陈守一", "action": "完成战略盘点", "powerDelta": 0 },
        { "faction": "周执事势力", "action": "监视持续收紧", "powerDelta": "+1（压力）" },
        { "faction": "孙师兄", "action": "待触发交易", "powerDelta": 0 }
      ],
      "hooksTouched": ["H061_长老与父亲关系", "H062_石台传送门", "H063_周执事追杀"],
      "transitionToNext": "窗外传来第一声鸟鸣，天际泛白——三日倒计时开始"
    }
  ],
  "chapterMeta": {
    "chapterNumber": 46,
    "chapterType": "payoff",
    "totalScenes": 7,
    "wordCountEstimate": 3200,
    "beatCoverage": {
      "B1": "1 scene (100%)",
      "B2": "1 scene (100%)",
      "B3": "2 scenes (100%)",
      "B4": "2 scenes (100%)",
      "B5": "1 scene (100%)"
    },
    "sceneTypeDistribution": {
      "revelation": 2,
      "reflection": 2,
      "dialogue": 1,
      "action": 1,
      "mixed": 1
    },
    "keyTransitions": [
      "B1→B2: 地图细节承接",
      "B2→B3: 信息推断促成决策",
      "B3→B4: 商议结束转入实际观察",
      "B4→B5: 夜尽天明，三日倒计时开启"
    ],
    "hooksFullyAddressed": ["H061", "H062", "H063"],
    "factionDynamics": {
      "gains": ["苏婉儿协助+1", "陈守一主动权+1", "孙师兄交易筹码"],
      "losses": ["陈守一状态-2", "周执事监控+1"],
      "netDelta": "局势收紧但主角获得破局可能"
    }
  }
}
```

## ScenePlan 说明

| 节拍 | 场景数 | 字数分配 | 场景类型 |
|------|--------|----------|----------|
| B1 悬念引入 | 1 | 320字 | revelation |
| B2 局势升级 | 1 | 380字 | revelation |
| B3 冲突爆发 | 2 | 520+480=1000字 | reflection + dialogue |
| B4 小高潮 | 2 | 420+380=800字 | reflection + action |
| B5 章末转折 | 1 | 450字 | reflection |
| **合计** | **7** | **~2950字** | — |

### 关键设计

1. **B3拆为2场景**：策略制定（主动姿态）+ 暗号商议（风险代价），将"冲突爆发"的戏剧张力分层释放

2. **B4拆为2场景**：身体衰败（代价具象）+ 监视发现（危机升级），形成"小高潮"的叠加效应

3. **章末场景**：盘点困境（代价面）与机遇（收获面），明确三条伏笔线（H061/H062/H063）均已触及

4. **铜环代价**：在B4-1具象化为"发间枯灰、眼窝凹陷"，与B5的"修复但需时"形成呼应