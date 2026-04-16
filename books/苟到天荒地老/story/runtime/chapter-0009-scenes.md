```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "地窖深处黑暗甬道",
      "sceneType": "revelation",
      "event": "主角惊醒，发现幽冥眼睛数量远超预期",
      "protagonistReaction": "呼吸骤停，背脊僵直，心跳声如擂鼓",
      "keyDialogue": null,
      "povCharacter": "主角",
      "pacing": {
        "speed": "sudden",
        "technique": ["brevity", "fragmented-perception", "sensory-intensification"],
        "mood": "惊骇·窒息",
        "wordCountTarget": 180
      },
      "factionActivity": [],
      "hooksTouched": ["H015"],
      "transitionToNext": "残纸与金丝缠同时发出微弱光芒"
    },
    {
      "sceneId": "B1-2",
      "beatId": "B1",
      "location": "地窖深处黑暗甬道",
      "sceneType": "revelation",
      "event": "残纸与金丝缠产生共鸣，光芒交织",
      "protagonistReaction": "左臂金丝缠微微发烫，胸口残纸震颤，两者如同心脏般同步跳动",
      "keyDialogue": {
        "speaker": "未知",
        "line": "（共振嗡鸣声，无语言）",
        "protagonistResponse": "「这是……在呼应什么？」",
        "dramaticMeaning": "伏笔H014正式推进，暗示两物同源"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "rising",
        "technique": ["sensory-details", "inner-monologue"],
        "mood": "迷惘·警觉",
        "wordCountTarget": 150
      },
      "factionActivity": [],
      "hooksTouched": ["H014"],
      "transitionToNext": "主角强迫自己冷静，试图分析局势"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "地窖深处黑暗甬道",
      "sceneType": "action",
      "event": "主角后退三步，背脊撞墙——退路已被封死",
      "protagonistReaction": "瞳孔骤缩，呼吸变粗，丹田空空如也",
      "keyDialogue": null,
      "povCharacter": "主角",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "action-verbs", "physical-reactions"],
        "mood": "绝望·压迫",
        "wordCountTarget": 200
      },
      "factionActivity": [
        {
          "faction": "幽冥生物",
          "action": "缓慢收紧包围圈",
          "powerDelta": 0
        }
      ],
      "hooksTouched": ["H015", "H019"],
      "transitionToNext": "主角摸索墙壁，发现异常裂缝"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "地窖墙壁裂缝处",
      "sceneType": "revelation",
      "event": "发现墙壁裂缝形如\"门\"字，边缘有干涸旧血迹",
      "protagonistReaction": "指尖触到干涸血迹，心中一凛——这痕迹至少有十年",
      "keyDialogue": null,
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow",
        "technique": ["tactile-memory", "deduction"],
        "mood": "疑惑·探究",
        "wordCountTarget": 280
      },
      "factionActivity": [],
      "hooksTouched": ["H016", "H019"],
      "transitionToNext": "判断这是地窖建造者刻意留下的\"生门\""
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "地窖深处黑暗甬道",
      "sceneType": "action",
      "event": "幽冥生物突然扑出，主角本能格挡",
      "protagonistReaction": "左臂抬起格挡，金丝缠剧烈发烫，眼前一黑",
      "keyDialogue": null,
      "protagonistResponse": "「不——！」",
      "dramaticMeaning": "被迫激活底牌的瞬间"
    },
    "povCharacter": "主角",
    "pacing": {
      "speed": "explosive",
      "technique": ["instinctive-action", "sensory-overload"],
      "mood": "恐惧·失控",
      "wordCountTarget": 200
    },
    "factionActivity": [
      {
        "faction": "幽冥生物",
        "action": "主动发起攻击",
        "powerDelta": 1
      }
    ],
    "hooksTouched": ["H015"],
    "transitionToNext": "金丝缠与黑铁令牌纹路剧烈共振"
  },
  {
    "sceneId": "B3-2",
    "beatId": "B3",
    "location": "地窖深处黑暗甬道",
    "sceneType": "action",
    "event": "黑铁令牌纹路激活，残纸轰鸣，灵力被近乎抽空",
    "protagonistReaction": "经脉如被烈火灼烧，意识模糊，几乎握不住令牌",
    "keyDialogue": null,
    "povCharacter": "主角",
    "pacing": {
      "speed": "intense",
      "technique": ["pain-description", "power-surge", "fragmented-thought"],
      "mood": "剧痛·崩溃边缘",
      "wordCountTarget": 350
    },
    "factionActivity": [
      {
        "faction": "林师兄实验残留",
        "action": "幽冥接引痕迹被激活，侵蚀主角经脉",
        "powerDelta": 1
      }
    ],
    "hooksTouched": ["H014", "H018"],
    "transitionToNext": "残纸涌出温和灵力，墙壁裂缝自动扩大"
  },
  {
    "sceneId": "B3-3",
    "beatId": "B3",
    "location": "地窖墙壁裂缝处",
    "sceneType": "revelation",
    "event": "残纸力量驱散幽冥生物，主角发现裂缝外透进微光",
    "protagonistReaction": "剧痛中看到一线光明，拼命向裂缝挪动",
    "keyDialogue": null,
    "povCharacter": "主角",
    "pacing": {
      "speed": "relief-then-urgency",
      "technique": ["contrast", "desperate-hope"],
      "mood": "痛苦中见希望",
      "wordCountTarget": 380
    },
    "factionActivity": [
      {
        "faction": "幽冥生物",
        "action": "被残纸灵力短暂驱散",
        "powerDelta": -1
      }
    ],
    "hooksTouched": ["H013", "H016"],
    "transitionToNext": "主角扑向裂缝，正要钻出"
  },
  {
    "sceneId": "B4-1",
    "beatId": "B4",
    "location": "地窖墙壁裂缝处",
    "sceneType": "action",
    "event": "主角扑向裂缝，四方角帽破墙而入",
    "protagonistReaction": "浑身僵硬，以为是幽冥援军——却见那熟悉的四方角帽",
    "keyDialogue": {
      "speaker": "主角",
      "line": "「是你——」",
      "protagonistResponse": null,
      "dramaticMeaning": "伏笔H012正式登场"
    },
    "povCharacter": "主角",
    "pacing": {
      "speed": "sudden-stop",
      "technique": ["dramatic-entrance", "tension-inversion"],
      "mood": "震惊·错愕",
      "wordCountTarget": 250
    },
    "factionActivity": [
      {
        "faction": "四方角帽",
        "action": "破墙而入，战力震慑幽冥生物",
        "powerDelta": 1
      }
    ],
    "hooksTouched": ["H012"],
    "transitionToNext": "四方角帽开口揭露身份"
  },
  {
    "sceneId": "B4-2",
    "beatId": "B4",
    "location": "地窖墙壁裂缝处",
    "sceneType": "dialogue",
    "event": "四方角帽揭露\"守陵人\"身份，解释放行原因",
    "protagonistReaction": "经脉剧痛，意识模糊，却死死记住每一句话",
    "keyDialogue": {
      "speaker": "四方角帽",
      "line": "「三十年了，林师兄的东西还在生效。」",
      "protagonistResponse": "「林师兄……是谁？」",
      "dramaticMeaning": "H012闭合，H010深化，确认主角与实验关联"
    },
    "povCharacter": "主角",
    "pacing": {
      "speed": "slow-revelation",
      "technique": ["dialogue-driven", "tension-release"],
      "mood": "痛苦中求真相",
      "wordCountTarget": 320
    },
    "factionActivity": [
      {
        "faction": "四方角帽",
        "action": "阻止幽冥生物，守护主角片刻",
        "powerDelta": 0
      }
    ],
    "hooksTouched": ["H012", "H010"],
    "transitionToNext": "四方角帽示意裂缝是出口"
  },
  {
    "sceneId": "B4-3",
    "beatId": "B4",
    "location": "地窖墙壁裂缝处",
    "sceneType": "transition",
    "event": "主角钻入裂缝，四方角帽未阻拦",
    "protagonistReaction": "经脉灼烧，意识飘忽，却知道自己暂时安全",
    "keyDialogue": {
      "speaker": "四方角帽",
      "line": "「去吧。我们的职责只是确认遗迹还在。」",
      "protagonistResponse": "「……多谢。」",
      "dramaticMeaning": "守陵人职责明确，暗示更多秘密"
    },
    "povCharacter": "主角",
    "pacing": {
      "speed": "gradual-relief",
      "technique": ["physical-decline", "psychological-resolve"],
      "mood": "虚弱·庆幸",
      "wordCountTarget": 220
    },
    "factionActivity": [
      {
        "faction": "四方角帽",
        "action": "目送主角离开，转而面对幽冥生物",
        "powerDelta": 0
      }
    ],
    "hooksTouched": ["H012"],
    "transitionToNext": "主角钻入裂缝，金丝缠与残纸同时沉寂"
  },
  {
    "sceneId": "B5-1",
    "beatId": "B5",
    "location": "裂缝狭窄通道",
    "sceneType": "reflection",
    "event": "金丝缠与残纸同时沉寂，灵力彻底枯竭",
    "protagonistReaction": "浑身如坠冰窟，丹田空空，连手指都抬不起来",
    "keyDialogue": null,
    "povCharacter": "主角",
    "pacing": {
      "speed": "slow-decline",
      "technique": ["internal-sensation", "power-loss"],
      "mood": "空虚·无力",
      "wordCountTarget": 180
    },
    "factionActivity": [],
    "hooksTouched": ["H014"],
    "transitionToNext": "裂缝外传来脚步声"
  },
  {
    "sceneId": "B5-2",
    "beatId": "B5",
    "location": "裂缝出口/地窖外围",
    "sceneType": "action",
    "event": "新势力（宗门护法/巡逻队）被异动惊动，向地窖方向赶来",
    "protagonistReaction": "勉强抬头，看到远处火光闪动，心生警惕",
    "keyDialogue": null,
    "povCharacter": "主角",
    "pacing": {
      "speed": "rising-tension",
      "technique": ["environmental-cues", "distant-sounds"],
      "mood": "警惕·观望",
      "wordCountTarget": 200
    },
    "factionActivity": [
      {
        "faction": "宗门巡逻",
        "action": "被幽冥异动惊动，向地窖方向赶来",
        "powerDelta": 1
      }
    ],
    "hooksTouched": [],
    "transitionToNext": "同时，四方角帽身影消失，幽冥气息卷土重来"
  },
  {
    "sceneId": "B5-3",
    "beatId": "B5",
    "location": "裂缝出口/地窖外围",
    "sceneType": "action",
    "event": "四方角帽消失，幽冥气息卷土重来；裂缝外确为出口",
    "protagonistReaction": "咬牙向前挪动——无论如何，先离开这里",
    "keyDialogue": null,
    "povCharacter": "主角",
    "pacing": {
      "speed": "urgent-escape",
      "technique": ["dual-pressure", "desperate-action"],
      "mood": "危机四伏",
      "wordCountTarget": 220
    },
    "factionActivity": [
      {
        "faction": "四方角帽",
        "action": "悄然离去，消失于黑暗中",
        "powerDelta": 0
      },
      {
        "faction": "幽冥生物",
        "action": "气息卷土重来，比之前更浓",
        "powerDelta": 1
      }
    ],
    "hooksTouched": ["H015"],
    "transitionToNext": "苏婉儿通过某种方式感知到主角的危险"
  },
  {
    "sceneId": "B5-4",
    "beatId": "B5",
    "location": "苏婉儿所在（闪回/感知）",
    "sceneType": "revelation",
    "event": "苏婉儿通过金丝缠/残纸共鸣，感知到主角危险",
    "protagonistReaction": "（此场景从苏婉儿视角）手中金丝缠突然剧烈发烫，心口一紧",
    "keyDialogue": {
      "speaker": "苏婉儿（内心）",
      "line": "「守一……出事了。」",
      "protagonistResponse": null,
      "dramaticMeaning": "支线收束，暗示苏婉儿即将行动"
    },
    "povCharacter": "苏婉儿",
    "pacing": {
      "speed": "sudden-alert",
      "technique": ["perspective-shift", "empathic-connection"],
      "mood": "担忧·决断",
      "wordCountTarget": 150
    },
    "factionActivity": [
      {
        "faction": "苏婉儿",
        "action": "感知异常，准备采取行动",
        "powerDelta": 0
      }
    ],
    "hooksTouched": ["H014"],
    "transitionToNext": "主角爬出裂缝，危机与转机并存——新章节悬念开启"
  }
}
```

**场景规划总结**：
- **总场景数**：13个
- **节拍1**：2个场景（幽冥眼睛发现→金丝缠残纸共振）
- **节拍2**：2个场景（退路被封→发现生门痕迹）
- **节拍3**：3个场景（生物扑出→底牌激活→发现微光出口）
- **节拍4**：3个场景（四方角帽登场→揭露身份→主角离开）
- **节拍5**：3个场景（底牌沉寂→新势力赶来→苏婉儿感知）

**字数分配**（总计约3030字）：
- B1：330字
- B2：480字
- B3：930字
- B4：790字
- B5：750字

**伏