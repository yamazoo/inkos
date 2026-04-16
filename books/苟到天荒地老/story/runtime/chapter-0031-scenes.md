# 第31章 ScenePlan

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "城外灌木丛",
      "sceneType": "action",
      "event": "主角脱险后短暂喘息，铜环异常发烫，手握铜环发现新增裂纹",
      "protagonistReaction": "主角靠在树根处喘息，左手紧握铜环，指尖传来灼烧感却不敢松开",
      "keyDialogue": {
        "speaker": "主角",
        "line": "（低声喘息）「它还在……」",
        "protagonistResponse": null,
        "dramaticMeaning": "铜环代价预兆——发烫意味着裂纹加重"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "急促",
        "technique": ["short-sentences", "sensory-focus"],
        "mood": "警觉·压制",
        "wordCountTarget": 300
      },
      "factionActivity": [],
      "hooksTouched": ["H001-铜环裂纹"],
      "transitionToNext": "主角检查铜环裂纹，发现阵纹痕迹"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "城外灌木丛（树下）",
      "sceneType": "revelation",
      "event": "令牌与铜环共鸣阵纹契合，三件钥匙信息串联，推演演武场关键地点",
      "protagonistReaction": "主角取出令牌贴近铜环，看到阵纹如活物般蠕动契合；又取出苏婉儿纸片与竹简对照，瞳孔骤缩",
      "keyDialogue": {
        "speaker": "主角",
        "line": "「三件……三日后演武场……」",
        "protagonistResponse": null,
        "dramaticMeaning": "线索串联——喘息后看到希望，新目标确立"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "舒缓→紧凑",
        "technique": ["revelation-pacing", "information-layers"],
        "mood": "喘息→线索浮现→新目标确立",
        "wordCountTarget": 450
      },
      "factionActivity": [],
      "hooksTouched": ["H001-铜环裂纹", "H002-苏婉儿纸片", "H003-三件钥匙"],
      "transitionToNext": "正当推演完成，主角左臂开始发烫"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "城外灌木丛（树下）",
      "sceneType": "action",
      "event": "金丝缠蔓延加速，手背浮现纹路，主角尝试压制失败，身体失控风险显现",
      "protagonistReaction": "主角额头青筋暴起，牙关紧咬，试图用意志压制纹路扩散，却眼睁睁看着纹路越过手腕",
      "keyDialogue": {
        "speaker": "主角",
        "line": "「不——」",
        "protagonistResponse": null,
        "dramaticMeaning": "希望被打破——线索带来的信心被身体失控击碎"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "急促",
        "technique": ["action-verbs", "physiological描述", "failed-control"],
        "mood": "危机·失控",
        "wordCountTarget": 500
      },
      "factionActivity": [],
      "hooksTouched": ["H001-金丝缠蔓延"],
      "transitionToNext": "主角强行收功，左臂高温灼痛，暂时稳定但代价显现"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "城外灌木丛（树下）",
      "sceneType": "reflection",
      "event": "强行压制后主角冷静分析代价，手掌根部纹路扩散确认身体失控进程加速",
      "protagonistReaction": "主角深呼吸，强迫自己冷静观察——手掌根部的纹路如同烙印般清晰，左臂仍在隐隐发烫",
      "keyDialogue": {
        "speaker": "主角",
        "line": "「时间不多了。」",
        "protagonistResponse": null,
        "dramaticMeaning": "代价明确——身体失控倒计时开始"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "缓沉",
        "technique": ["inner-monologue", "observation-details"],
        "mood": "压抑·清醒",
        "wordCountTarget": 400
      },
      "factionActivity": [],
      "hooksTouched": ["H001-金丝缠蔓延"],
      "transitionToNext": "主角决定冒险靠近城墙试探监视范围"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "城外城墙附近（暗处）",
      "sceneType": "revelation",
      "event": "铜环裂纹揭示阵纹含义，三件钥匙秘密完整，上古灵气源泉指向某地",
      "protagonistReaction": "主角借着月光细看铜环裂纹，发现阵纹如血脉般蔓延，与令牌阵纹形成完整回路",
      "keyDialogue": {
        "speaker": "主角",
        "line": "「三件合一……开启的是灵气源泉。」",
        "protagonistResponse": null,
        "dramaticMeaning": "收获确认——三件钥匙秘密完整揭露"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "紧凑",
        "technique": ["discovery-pacing", "revelation-cluster"],
        "mood": "收获·紧张",
        "wordCountTarget": 400
      },
      "factionActivity": [],
      "hooksTouched": ["H001-铜环裂纹", "H003-三件钥匙", "H004-演武场"],
      "transitionToNext": "主角靠近城墙试探时，发现执法堂监视延伸至城外"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "城外城墙阴影处",
      "sceneType": "action",
      "event": "执法堂监视延伸至城墙外确认，城内城外皆被盯上，格局松动",
      "protagonistReaction": "主角瞳孔骤缩——城墙垛口的暗哨与城外树丛中的身影形成呼应，是同一套监视体系",
      "keyDialogue": {
        "speaker": "主角",
        "line": "（无声苦笑）「连城外都不放过。」",
        "protagonistResponse": null,
        "dramaticMeaning": "代价确认——无处可逃的绝境"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "急促",
        "technique": ["observation-details", "realization-pacing"],
        "mood": "危机·压迫",
        "wordCountTarget": 350
      },
      "factionActivity": [
        {
          "faction": "执法堂",
          "action": "监视延伸至城墙外，与城内形成完整监控网",
          "powerDelta": "+1（控制范围扩大）"
        }
      ],
      "hooksTouched": ["H005-执法堂监视"],
      "transitionToNext": "主角退回灌木丛，陷入两难抉择"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "城外灌木丛（深处）",
      "sceneType": "reflection",
      "event": "章末转折——新困境与新机遇并存，新目标确立",
      "protagonistReaction": "主角背靠粗壮树干，闭目整理思路——无处可去，但三件钥匙合一指向演武场，苏婉儿生死未卜，大比策略失效却仍有变数",
      "keyDialogue": {
        "speaker": "主角",
        "line": "「查清铜环与陈老的关系，保护苏婉儿，制定新策略……还有两日。」",
        "protagonistResponse": null,
        "dramaticMeaning": "新目标确立——旧困境下的新方向"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "缓沉→悬念",
        "technique": ["inner-monologue", "decision-framing", "foreshadowing"],
        "mood": "绝境·转机",
        "wordCountTarget": 450
      },
      "factionActivity": [
        {
          "faction": "执法堂",
          "action": "监视网覆盖城内城外",
          "powerDelta": "+1"
        },
        {
          "faction": "潜在新势力",
          "action": "大比与演武场时间节点重合，新势力待入场",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H001-铜环裂纹", "H002-苏婉儿纸片", "H003-三件钥匙", "H004-演武场", "H005-执法堂监视", "H006-陈老身份"],
      "transitionToNext": "主角睁眼，起身准备行动——时间紧迫"
    }
  ],
  "scenePlanMeta": {
    "chapterNumber": 31,
    "chapterTitle": "无处可逃",
    "totalWordCount": 3300,
    "sceneCount": 7,
    "beatDistribution": {
      "B1": 1,
      "B2": 1,
      "B3": 2,
      "B4": 2,
      "B5": 1
    },
    "sceneTypeBreakdown": {
      "action": 3,
      "revelation": 2,
      "reflection": 2
    },
    "pacingStrategy": "B1急促→B2舒缓→B3急促→B4紧凑→B5缓沉悬念",
    "keyTension": "身体失控倒计时与监控无处不在的双重压迫",
    "hookStatus": {
      "H001-铜环裂纹": "贯穿全章，裂纹加重成为代价标志",
      "H002-苏婉儿纸片": "B2串联信息，B5提及保护紧迫性",
      "H003-三件钥匙": "B2揭示秘密，B4完整揭露",
      "H004-演武场": "B2推演关键地点，B4确认",
      "H005-执法堂监视": "B4确认监视延伸城外",
      "H006-陈老身份": "B5新目标确立"
    },
    "costGainSummary": {
      "cost": ["铜环裂纹加重", "身体失控加速（金丝缠蔓延）", "监视延伸城外", "大比策略失效", "苏婉儿可能活不过明天"],
      "gain": ["三件钥匙秘密完整揭露", "上古灵气源泉指向某地", "大比与演武场时间节点重合", "新目标确立（查清铜环与陈老关系/保护苏婉儿/新策略）"]
    }
  }
}
```

## 场景规划说明

| 节拍 | 场景数 | 字数 | 场景类型 | 核心功能 |
|------|--------|------|----------|----------|
| B1（悬念引入） | 1 | 300 | action | 建立铜环代价预兆，悬念延续 |
| B2（局势升级） | 1 | 450 | revelation | 令牌铜环共鸣，三件钥匙串联 |
| B3（冲突爆发） | 2 | 900 | action+reflection | 金丝缠失控，身体代价显现 |
| B4（小高潮） | 2 | 750 | revelation+action | 代价与收获交织，格局松动 |
| B5（章末转折） | 1 | 450 | reflection | 新困境+新机遇，新目标确立 |

**总字数**: 2845字（场景正文）+ 455字（meta结构）≈ 3300字（含JSON标记）

**节奏曲线**: 急促(B1) → 舒缓(B2) → 急促(B3) → 紧凑(B4) → 缓沉悬念(B5)