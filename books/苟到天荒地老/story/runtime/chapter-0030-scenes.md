

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "城外荒地岩石阴影",
      "sceneType": "reflection",
      "event": "主角在岩石阴影中短暂喘息，确认执法堂监视者位置（城墙暗处）",
      "protagonistReaction": "主角压低呼吸，手指紧握铜环，指节泛白",
      "keyDialogue": { "speaker": "主角", "line": "「……安全了。」", "protagonistResponse": "仅是心中默念，并未出声", "dramaticMeaning": "物理安全的短暂窗口与内心不安形成张力" },
      "povCharacter": "主角",
      "pacing": { "speed": "slow", "technique": ["sensory-detail", "breath-pacing"], "mood": "紧绷·劫后余生", "wordCountTarget": 380 },
      "factionActivity": [{ "faction": "执法堂", "action": "监视者隐于城墙暗处，位置确认", "powerDelta": 0 }],
      "hooksTouched": ["H002"],
      "transitionToNext": "夜风渐冷，主角取出铜环开始检查"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "城外荒地岩石阴影",
      "sceneType": "revelation",
      "event": "主角检查铜环，发现内壁完整阵纹，与令牌纹路完全一致",
      "protagonistReaction": "主角瞳孔微缩，指腹沿阵纹纹路缓缓划过，触感冰凉如触寒铁",
      "keyDialogue": { "speaker": "主角", "line": "「这纹路……和令牌一样。」", "protagonistResponse": "心中翻涌，却强压情绪继续查看", "dramaticMeaning": "铜环并非普通信物，而是与令牌成对的组件" },
      "povCharacter": "主角",
      "pacing": { "speed": "deliberate", "technique": ["tactile-description", "revelation-pause"], "mood": "惊疑·发现·确认", "wordCountTarget": 420 },
      "factionActivity": [],
      "hooksTouched": ["H003"],
      "transitionToNext": "天机簿残纸自行从袖口滑出"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "城外荒地岩石阴影",
      "sceneType": "revelation",
      "event": "天机簿残纸推演触发，发现陈老"欠债者"身份，铜环埋藏时间与三十年前实验吻合",
      "protagonistReaction": "主角以灵力催动天机簿，推演阵纹共鸣，数字浮现：三十年前",
      "keyDialogue": { "speaker": "天机簿（幻象）", "line": "「欠债者，清算。」", "protagonistResponse": "主角心中一凛，铜环与陈老的债务记录隐隐相合", "dramaticMeaning": "陈老并非普通债主，其债务与三十年前实验存在深层关联" },
      "povCharacter": "主角",
      "pacing": { "speed": "accelerating", "technique": ["revelation-chain", "number-emergence"], "mood": "追溯·迷雾渐散", "wordCountTarget": 440 },
      "factionActivity": [],
      "hooksTouched": ["H003", "H004"],
      "transitionToNext": "天机簿推演出模糊方位：城东某处，地下"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "城外荒地岩石阴影",
      "sceneType": "action",
      "event": "铜环阵纹突然激活，与天机簿产生共鸣，灵力波动向外扩散",
      "protagonistReaction": "主角手心传来灼烧感，铜环内壁阵纹亮起淡金色光芒",
      "keyDialogue": { "speaker": "铜环（自发反应）", "line": "（嗡鸣震动，无言自动）", "protagonistResponse": "主角本能想抛掷铜环，却无法松手", "dramaticMeaning": "铜环并非被动信物，其与天机簿存在双向共鸣机制" },
      "povCharacter": "主角",
      "pacing": { "speed": "urgent", "technique": ["short-sentences", "involuntary-action"], "mood": "失控·灵力震颤", "wordCountTarget": 400 },
      "factionActivity": [],
      "hooksTouched": ["H003"],
      "transitionToNext": "淡金色光芒中，天机簿浮现方位信息"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "城外荒地岩石阴影",
      "sceneType": "revelation",
      "event": "天机簿推演出模糊方位：城东某处地下，铜环确认为"钥匙"；主角确认苏婉儿生死不明",
      "protagonistReaction": "主角逐字辨读方位，心中一沉：苏婉儿最后纸条的"别追来"三个字在回忆中反复撕扯",
      "keyDialogue": { "speaker": "主角", "line": "「她留了后手……还是真的在警告我别靠近？」", "protagonistResponse": "铜环光芒渐敛，方位锁定城东某处地下建筑", "dramaticMeaning": "苏婉儿的生死成谜，她留下的纸条是警告还是暗号——线索断裂处，矛盾指向城东地下" },
      "povCharacter": "主角",
      "pacing": { "speed": "measured", "technique": ["memory-flash", "conclusion-drawing"], "mood": "沉重·求索·无依", "wordCountTarget": 450 },
      "factionActivity": [{ "faction": "苏婉儿势力", "action": "势力线断裂，生死不明", "powerDelta": -2 }],
      "hooksTouched": ["H005"],
      "transitionToNext": "主角将铜环收入袖中，起身决定下一步行动"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "城外荒地岩石阴影",
      "sceneType": "action",
      "event": "铜环激活阵纹，灵力波动向外扩散，可能暴露主角位置",
      "protagonistReaction": "主角将铜环紧握手心，感受灵力波动如涟漪向外扩散，心跳骤然加速",
      "keyDialogue": { "speaker": "主角", "line": "「……暴露了。」", "protagonistResponse": "立即以袖遮铜环，压制其光芒", "dramaticMeaning": "激活是获得信息的代价，但也打开了被察觉的风险窗口" },
      "povCharacter": "主角",
      "pacing": { "speed": "urgent", "technique": ["tension-escalation", "action-verbs", "short-sentences"], "mood": "危机·时间压迫", "wordCountTarget": 380 },
      "factionActivity": [],
      "hooksTouched": ["H001"],
      "transitionToNext": "主角警觉四望，确认周围动静"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "城外荒地岩石阴影→城东方向",
      "sceneType": "revelation",
      "event": "多方势力可能察觉异常；主角获得通往实验遗址的关键信息；金丝缠蔓延",
      "protagonistReaction": "主角金丝缠蔓延加剧，隐痛自脉门向小臂延伸，却强压不表露",
      "keyDialogue": { "speaker": "主角", "line": "「这（金丝缠）……又在扩了。」", "protagonistResponse": "咬牙将袖子拉低，遮住蔓延的金色纹路", "dramaticMeaning": "代价叠加：信息到手，金丝缠恶化，被察觉风险升高——三重压力同时逼近" },
      "povCharacter": "主角",
      "pacing": { "speed": "rising", "technique": ["layered-tension", "body-symptom", "multiple-threats"], "mood": "危机叠加·紧迫·多重困局", "wordCountTarget": 440 },
      "factionActivity": [{ "faction": "不明暗中势力", "action": "可能已察觉铜环灵力波动异常", "powerDelta": "+1（警戒状态）"}],
      "hooksTouched": ["H001", "H002"],
      "transitionToNext": "天边露白，主角必须在返回时限内做出抉择"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "城外荒地岩石阴影（黎明）",
      "sceneType": "reflection",
      "event": "大比与演武场约定时间重叠；铜环指向实验遗址；苏婉儿可能留有后手",
      "protagonistReaction": "主角心中快速权衡：返回则赶不上大比报名，不返则违反杂役令；铜环指向的地点与演武场方向……竟然顺路？",
      "keyDialogue": { "speaker": "主角", "line": "「演武场在城东，大比报名在城中心……铜环指向的，也在城东。」", "protagonistResponse": "唇角微抿，作出以演武场为掩护潜入城东的决定", "dramaticMeaning": "危机中隐藏机遇：时间重叠看似困局，实则提供了以合法身份接近目标地点的窗口" },
      "povCharacter": "主角",
      "pacing": { "speed": "deliberate", "technique": ["decision-weighing", "coincidence-realization"], "mood": "决断·危机即机遇", "wordCountTarget": 460 },
      "factionActivity": [],
      "hooksTouched": ["H001", "H003", "H005"],
      "transitionToNext": "晨曦初露，主角收拾心绪，借晨雾掩护返回城中"
    }
  ]
}
```