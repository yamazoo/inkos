```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "执法堂暗室·行刑石床",
      "sceneType": "reflection",
      "event": "陈守一在黑暗中苏醒，感知自身状态与周围环境",
      "protagonistReaction": "后颈印记光芒消散，铜环陷入死寂，唯有胸口令牌碎片微微发热",
      "keyDialogue": { "speaker": "陈守一", "line": "……", "protagonistResponse": "无声，专注于感知", "dramaticMeaning": "沉默中建立紧张感" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "slow", "technique": ["descriptive-prose", "sensory-focus"], "mood": "虚弱·警觉", "wordCountTarget": 280 },
      "factionActivity": [],
      "hooksTouched": ["H002"],
      "transitionToNext": "主角目光扫过暗室，发现纸团就在脚边"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "执法堂暗室·行刑石床",
      "sceneType": "revelation",
      "event": "走廊传来巡逻人员的脚步声，低声交谈中暴露执法堂内部裂痕",
      "protagonistReaction": "陈守一屏息凝神，将仅存感知延伸至门外，捕捉关键信息",
      "keyDialogue": { "speaker": "巡逻人员A", "line": ""……灭口……禁术……"", "protagonistResponse": "心跳加速，但保持静止", "dramaticMeaning": "执法堂内部有人知道"畏罪自尽"是假的" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "moderate", "technique": ["dialogue-reveal", "tension-building"], "mood": "紧张·机会", "wordCountTarget": 320 },
      "factionActivity": [
        { "faction": "执法堂", "action": "巡逻人员低声议论主角处置方案", "powerDelta": -5 }
      ],
      "hooksTouched": ["H001"],
      "transitionToNext": "脚步声远去后，主角开始串联线索：三下节奏、铁门敲击声、令牌碎片回应"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "执法堂暗室·行刑石床",
      "sceneType": "reflection",
      "event": "陈守一在脑中串联线索碎片，意识到执法堂内部有人暗中帮助",
      "protagonistReaction": "嘴角微微上扬——擂台下感知到的三下节奏、铁门外的敲门声、令牌碎片的回应，这些碎片之间存在联系",
      "keyDialogue": { "speaker": "陈守一（内心）", "line": ""钥匙开门，人心开门……"", "protagonistResponse": "借脚尖将纸团勾至手中", "dramaticMeaning": "纸团来自执法堂内部的盟友" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "slow", "technique": ["internal-monologue", "revelation-setup"], "mood": "思索·希望", "wordCountTarget": 180 },
      "factionActivity": [
        { "faction": "暗处势力", "action": "持续监视暗室动静", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H003"],
      "transitionToNext": "主角借幽暗灵力展开纸团"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "执法堂暗室·行刑石床",
      "sceneType": "revelation",
      "event": "纸团内容揭示：后山老槐、子时三刻、三下敲门、弯月符号",
      "protagonistReaction": "陈守一的呼吸骤然急促——纸团上的字迹歪斜潦草，像是在极度紧张中匆忙写就；落款的弯月形符号与后颈印记形状一致",
      "keyDialogue": { "speaker": "陈守一（读纸团）", "line": ""后山老槐。子时三刻。敲门三下。"", "protagonistResponse": "瞳孔微缩", "dramaticMeaning": "来自三十年前实验幸存者的警告" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "moderate", "technique": ["text-reveal", "dramatic-pause"], "mood": "震惊·关键", "wordCountTarget": 380 },
      "factionActivity": [
        { "faction": "暗处势力", "action": "确认主角仍持有纸团", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H002", "H003"],
      "transitionToNext": "主角继续分析纸团其他内容"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "执法堂暗室·行刑石床",
      "sceneType": "reflection",
      "event": "纸团深层分析：人心开门、周执事可信度、逃脱路径",
      "protagonistReaction": "陈守一反复咀嚼纸团内容——\"钥匙开门，人心开门\"不只是指实物钥匙，也指人心中的钥匙；\"别信周执事的话\"意味着暗室揭露的栽赃计划中有部分是假的",
      "keyDialogue": { "speaker": "陈守一（内心）", "line": ""铜环沉默、锁链禁锢……但我没有被搜身。"", "protagonistResponse": "目光一凝，视线落在锁链上", "dramaticMeaning": "盟友故意留下的破绽" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "slow", "technique": ["analysis", "cause-effect"], "mood": "冷静·分析", "wordCountTarget": 280 },
      "factionActivity": [
        { "faction": "执法堂", "action": "内部裂痕正式暴露——有人故意不搜身", "powerDelta": -8 }
      ],
      "hooksTouched": ["H001", "H002"],
      "transitionToNext": "主角开始仔细检查锁链结构"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "执法堂暗室·行刑石床",
      "sceneType": "action",
      "event": "检查锁链结构，发现十年前制式锁链的弱点——机关隐藏在链条接口处",
      "protagonistReaction": "陈守一用拇指摩挲锁链接口，指腹传来微弱的凹陷感——锁链制式是十年前的，而现在的执法堂已换过三代标准；接口处有极细微的刻痕，像是某种记号",
      "keyDialogue": { "speaker": "陈守一（内心）", "line": ""十年前的制式……被人动过手脚。"", "protagonistResponse": "右肩伤口剧痛，但嘴角微扬", "dramaticMeaning": "逃脱路径初步显现" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "urgent", "technique": ["action-focus", "discovery-pace"], "mood": "痛楚·希望", "wordCountTarget": 320 },
      "factionActivity": [],
      "hooksTouched": ["H001"],
      "transitionToNext": "主角开始尝试用发现的方法开启锁链"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "执法堂暗室·行刑石床",
      "sceneType": "action",
      "event": "锁链开启机关暴露——需以灵力脉冲触发，但主角灵力近乎枯竭",
      "protagonistReaction": "陈守一凝神于指尖，调动体内残余灵力；右肩伤口渗出鲜血，但锁链接口的刻痕开始微微发光——机关被激活",
      "keyDialogue": { "speaker": "陈守一（喘息）", "line": ""还有……最后一丝……"", "protagonistResponse": "咬紧牙关，灵力脉冲骤然释放", "dramaticMeaning": "孤注一掷" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "urgent", "technique": ["short-sentences", "physical-strain"], "mood": "极限·紧张", "wordCountTarget": 280 },
      "factionActivity": [],
      "hooksTouched": ["H002"],
      "transitionToNext": "锁链应声而开，但主角也因灵力耗尽而脱力"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "执法堂暗室·行刑石床",
      "sceneType": "reflection",
      "event": "评估行动时机窗口——子时三刻距现在不足一个时辰，但伤势严重",
      "protagonistReaction": "陈守一跌坐在地，锁链滑落在旁；他快速估算：走廊巡逻间隔约半刻钟，从暗室到后山老槐约需两刻钟——但右肩伤口仍在流血，左臂几近麻木",
      "keyDialogue": { "speaker": "陈守一（内心）", "line": ""窗口极短，但这是唯一的机会。"", "protagonistResponse": "强撑着站起，目光落在木门上", "dramaticMeaning": "伤势成为最大拖累" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "moderate", "technique": ["tactical-analysis", "urgency-building"], "mood": "紧迫·决断", "wordCountTarget": 240 },
      "factionActivity": [
        { "faction": "暗处势力", "action": "蠢蠢欲动，等待主角暴露", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001"],
      "transitionToNext": "主角开始准备行动"
    },
    {
      "sceneId": "B4-3",
      "beatId": "B4",
      "location": "执法堂暗室·木门",
      "sceneType": "action",
      "event": "老式木门检查——门锁早已朽烂，轻轻一推便可开启",
      "protagonistReaction": "陈守一将耳朵贴在木门上屏息片刻——走廊无人；他用指尖轻抠门缝，腐朽的门锁应声松动；多年未曾使用的门轴发出低沉的吱呀声",
      "keyDialogue": { "speaker": "陈守一（内心）", "line": ""他们想让我活着走出这扇门。"", "protagonistResponse": "侧身挤出门缝", "dramaticMeaning": "暗室布局的破绽" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "urgent", "technique": ["action-verbs", "stealth-movement"], "mood": "警觉·机会", "wordCountTarget": 180 },
      "factionActivity": [],
      "hooksTouched": ["H001"],
      "transitionToNext": "主角踏入走廊，朝后山方向潜行"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "执法堂后山·山道",
      "sceneType": "action",
      "event": "陈守一沿山道潜行，却在转角处遭遇不明势力的拦截",
      "protagonistReaction": "陈守一刚转过山道，三道黑影从树丛中闪出——不是执法堂的制式服装，是第三方势力；他们并未立即动手，而是以合围之势将主角逼至崖边",
      "keyDialogue": { "speaker": "不明势力领头者", "line": ""陈公子，我们等你很久了。"", "protagonistResponse": "后背抵住崖壁，右手暗暗摸向胸口令牌碎片", "dramaticMeaning": "多方势力已盯上主角" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "slow", "technique": ["standoff", "tension-peak"], "mood": "危机·悬念", "wordCountTarget": 320 },
      "cost": "陈守一陷入三方势力的包围圈，退无可退",
      "gain": "第三势力的出现证明铜环与钥匙的价值远超想象——主角成为各方争夺的关键",
      "factionActivity": [
        { "faction": "第三势力", "action": "拦截主角于后山山道", "powerDelta": 10 },
        { "faction": "执法堂", "action": "尚未察觉主角逃脱", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H003"],
      "transitionToNext": "领头者伸出手，示意主角交出某样东西——"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "执法堂后山·崖边",
      "sceneType": "revelation",
      "event": "第三势力道出真相——他们要的不是钥匙，而是铜环中的记忆",
      "protagonistReaction": "领头者的话如冰水浇下：\"铜环里的东西，比那三把钥匙重要十倍。三十年前的实验……你后颈的印记，是唯一的钥匙。\"陈守一心头一震——后颈印记不只是标记，更是某种解锁工具",
      "keyDialogue": { "speaker": "第三势力领头者", "line": ""弯月印记不是枷锁，是钥匙。我们等了三十年。"", "protagonistResponse": "瞳孔骤缩，左手下意识捂住后颈", "dramaticMeaning": "弯月印记的真正用途被揭示" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "slow", "technique": ["dialogue-heavy", "revelation"], "mood": "震惊·新局", "wordCountTarget": 380 },
      "cost": "主角成为多方势力争夺的目标，铜环与印记的价值远超想象，处境更加凶险",
      "gain": "获知弯月印记的真正用途——印记是开启某种记忆或秘藏的关键，比钥匙本身更重要",
      "factionActivity": [
        { "faction": "第三势力", "action": "揭示印记真相，企图招揽/控制主角", "powerDelta": 15 },
        { "faction": "执法堂", "action": "未知主角已逃脱", "powerDelta": -5 },
        { "faction": "暗处势力", "action": "正在赶来", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H002", "H003"],
      "transitionToNext": "领头者递来一块令牌——"
    }
  ],
  "chapterMeta": {
    "chapterNumber": 41,
    "chapterTitle": "节拍规划",
    "chapterType": "回收章（payoff）",
    "targetWords": 3000,
    "wordCountRange": { "min": 2400, "max": 3900 },
    "actualSceneCount": 11,
    "actualWordCount": 3780,
    "beatCoverage": {
      "B1": { "covered": true, "scenes": ["B1-1"], "wordCount": 280 },
      "B2": { "covered": true, "scenes": ["B2-1", "B2-2"], "wordCount": 500 },
      "B3": { "covered": true, "scenes": ["B3-1", "B3-2", "B3-3"], "wordCount": 980 },
      "B4": { "covered": true, "scenes": ["B4-1", "B4-2", "B4-3"], "wordCount": 700 },
      "B5": { "covered": true, "scenes": ["B5-1", "B5-2"], "wordCount": 700, "includesCostGain": true }
    }
  }
}
```