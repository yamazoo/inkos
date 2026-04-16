```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "杂役区住处巷口，夜归时分",
      "sceneType": "revelation",
      "event": "监视者现身窥探，金丝缠预警后对方退走",
      "protagonistReaction": "陈守一指尖按住左臂伤疤，感受金丝缠余温，心中暗忖其感应原理",
      "keyDialogue": { "speaker": "无对白", "line": "", "protagonistResponse": "无声对峙", "dramaticMeaning": "能力初显，威胁具象化" },
      "povCharacter": "陈守一",
      "pacing": { "speed": "deliberate", "technique": ["sensory-detail", "inner-monologue"], "mood": "警觉·暗流", "wordCountTarget": 380 },
      "factionActivity": [
        { "faction": "周平势力", "action": "监视者窥探主角住处", "powerDelta": "+1" },
        { "faction": "陈守一", "action": "金丝缠预警威胁", "powerDelta": "+1" }
      ],
      "hooksTouched": ["H001", "H003"],
      "transitionToNext": "主角确认金丝缠有预警之能，为后续令牌验证埋下伏笔"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "城中茶摊，翌日",
      "sceneType": "revelation",
      "event": "孙师兄验证令牌与金丝缠纹路吻合，透露三十年前实验内幕",
      "protagonistReaction": "陈守一解开绷带露出伤疤，目光紧盯两份纹路比对，脑中飞速推演",
      "keyDialogue": { 
        "speaker": "孙师兄", 
        "line": "「三十年前，有七十三人参与那场实验。活下来的，不超过五个。」", 
        "protagonistResponse": "「这份名单……能给我吗？」", 
        "dramaticMeaning": "真相碎片揭露，生存者寥寥" 
      },
      "povCharacter": "陈守一",
      "pacing": { "speed": "measured", "technique": ["dialogue-heavy", "information-reveal"], "mood": "紧张·求索", "wordCountTarget": 420 },
      "factionActivity": [
        { "faction": "孙师兄", "action": "提供关键情报与名单", "powerDelta": "+1" },
        { "faction": "陈守一", "action": "获得实验者名单", "powerDelta": "+2" }
      ],
      "hooksTouched": ["H002", "H004"],
      "transitionToNext": "孙师兄警告主角已身处漩涡，暗示各方势力即将有所动作"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "茶摊外巷口，令牌交易后",
      "sceneType": "dialogue",
      "event": "苏婉儿截住主角，塞予纸条暗示金丝缠秘密",
      "protagonistReaction": "陈守一接过纸条，目光与苏婉儿短暂交汇，揣测其用意",
      "keyDialogue": { 
        "speaker": "苏婉儿", 
        "line": "「有些东西，不止一双眼睛在看。」", 
        "protagonistResponse": "「苏姑娘这是何意？」", 
        "dramaticMeaning": "暗示金丝缠的特殊性，第三方势力介入" 
      },
      "povCharacter": "陈守一",
      "pacing": { "speed": "quick", "technique": ["ellipsis", "charged-silence"], "mood": "疑惑·玄机", "wordCountTarget": 380 },
      "factionActivity": [
        { "faction": "苏婉儿", "action": "向主角传递暗示", "powerDelta": 0 },
        { "faction": "未知势力", "action": "通过苏婉儿试探主角", "powerDelta": "+1" }
      ],
      "hooksTouched": ["H001", "H005"],
      "transitionToNext": "苏婉儿消失在人群中，主角攥紧纸条陷入沉思"
    },
    {
      "sceneId": "B2-3",
      "beatId": "B2",
      "location": "杂役区角落，返回途中",
      "sceneType": "reflection",
      "event": "主角对照名单，发现陈老之名与自己的关联",
      "protagonistReaction": "陈守一借月光细读名单，指尖停在第三行，神色复杂",
      "keyDialogue": { 
        "speaker": "陈守一（内心）", 
        "line": "「陈老……三十年前……我究竟是谁？」", 
        "protagonistResponse": "沉默良久，将名单藏入衣襟", 
        "dramaticMeaning": "身份之谜加深，自我追溯的渴望" 
      },
      "povCharacter": "陈守一",
      "pacing": { "speed": "slow", "technique": ["contemplation", "fade-montage"], "mood": "迷惘·自省", "wordCountTarget": 320 },
      "factionActivity": [
        { "faction": "陈守一", "action": "确认陈老与自己存在关联", "powerDelta": "+1" }
      ],
      "hooksTouched": ["H002", "H006"],
      "transitionToNext": "远处传来更鼓声，主角收起心绪，意识到时间紧迫"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "杂役区，周平住处附近",
      "sceneType": "action",
      "event": "主角面临两难抉择：交出令牌情报换取安全，或冒险隐瞒",
      "protagonistReaction": "陈守一站在岔路口，左手下意识抚过金丝缠，瞳孔微缩",
      "keyDialogue": { 
        "speaker": "周平手下", 
        "line": "「陈守一，周爷有请。」", 
        "protagonistResponse": "「我这就来。」", 
        "dramaticMeaning": "被动入局，无从回避" 
      },
      "povCharacter": "陈守一",
      "pacing": { "speed": "urgent", "technique": ["short-sentences", "tension-mounting"], "mood": "压迫·危机", "wordCountTarget": 400 },
      "factionActivity": [
        { "faction": "周平势力", "action": "传召主角问话", "powerDelta": "+2" },
        { "faction": "陈守一", "action": "被迫入局", "powerDelta": "-1" }
      ],
      "hooksTouched": ["H001", "H003"],
      "transitionToNext": "主角被带往周平住处，局势一触即发"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "周平住处厅堂",
      "sceneType": "dialogue",
      "event": "周平逼问令牌下落，主角陷入言语角力",
      "protagonistReaction": "陈守一面色如常，唯有袖中左手微微攥紧",
      "keyDialogue": { 
        "speaker": "周平", 
        "line": "「孙师兄给了你什么？从实招来。」", 
        "protagonistResponse": "「不过是一壶茶，几句陈年旧事罢了。」", 
        "dramaticMeaning": "以退为进，虚实难辨" 
      },
      "povCharacter": "陈守一",
      "pacing": { "speed": "tense", "technique": ["power-dialogue", "subtext"], "mood": "对峙·惊险", "wordCountTarget": 450 },
      "factionActivity": [
        { "faction": "周平势力", "action": "逼问主角情报", "powerDelta": "+1" },
        { "faction": "陈守一", "action": "虚与委蛇", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H003", "H007"],
      "transitionToNext": "周平冷笑，命人搜身，主角命悬一线之际——"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "周平住处厅堂，搜身之际",
      "sceneType": "action",
      "event": "关键人物（孙师兄/苏婉儿/意外势力）介入，关键人物倒向主角",
      "protagonistReaction": "陈守一眸光微闪，趁乱将名单塞入口中咽下",
      "keyDialogue": { 
        "speaker": "孙师兄", 
        "line": "「周平，你的手伸得太长了。」", 
        "protagonistResponse": "无声点头，心中大石落地", 
        "dramaticMeaning": "外援介入，转危为安" 
      },
      "povCharacter": "陈守一",
      "pacing": { "speed": "rapid", "technique": ["climactic-action", "pov-stabilize"], "mood": "逆转·释放", "wordCountTarget": 430 },
      "factionActivity": [
        { "faction": "孙师兄势力", "action": "出面保下主角", "powerDelta": "+2" },
        { "faction": "周平势力", "action": "被迫收手", "powerDelta": "-1" },
        { "faction": "陈守一", "action": "获得关键盟友", "powerDelta": "+2" }
      ],
      "hooksTouched": ["H003", "H007"],
      "transitionToNext": "周平面色铁青却无可奈何，主角借势离开"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "杂役区巷口，暮色降临",
      "sceneType": "revelation",
      "event": "主角脱身后，新势力现身，带来新困境与新机遇",
      "protagonistReaction": "陈守一刚松一口气，忽见巷尾立着一道青衫身影，手持折扇",
      "keyDialogue": { 
        "speaker": "青衫人", 
        "line": "「陈公子，令牌之事，可愿与我做一桩交易？」", 
        "protagonistResponse": "「阁下是？」", 
        "dramaticMeaning": "新的选择摆在面前，变数陡增" 
      },
      "povCharacter": "陈守一",
      "pacing": { "speed": "suspenseful", "technique": ["cliffhanger", "open-ending"], "mood": "悬念·期待", "wordCountTarget": 420 },
      "factionActivity": [
        { "faction": "未知势力", "action": "主动接触主角", "powerDelta": "+1" },
        { "faction": "陈守一", "action": "面临新选择", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H005", "H007"],
      "transitionToNext": "青衫人笑而不答，折扇轻摇，将一张名帖塞入主角手中"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "住处内，夜深",
      "sceneType": "reflection",
      "event": "主角审视名帖与金丝缠，意识到局面已超出掌控",
      "protagonistReaction": "陈守一独坐床沿，将名帖翻来覆去，指腹摩挲金丝缠纹路",
      "keyDialogue": { 
        "speaker": "陈守一（内心）", 
        "line": "「棋局越大，入局越深……可我，还有退路吗？」", 
        "protagonistResponse": "苦笑一声，将名帖与名单一同收入枕下", 
        "dramaticMeaning": "被动入局后的清醒认知" 
      },
      "povCharacter": "陈守一",
      "pacing": { "speed": "contemplative", "technique": ["ending-reversal", "foreshadowing"], "mood": "迷惘·决意", "wordCountTarget": 380 },
      "factionActivity": [
        { "faction": "陈守一", "action": "收下名帖，陷入沉思", "powerDelta": 0 }
      ],
      "hooksTouched": ["H002", "H006"],
      "transitionToNext": "窗外忽有夜枭掠过，主角抬眼望月，神色坚定——新的博弈即将开始"
    }
  ],
  "sceneSummary": {
    "totalScenes": 9,
    "beatDistribution": {
      "B1": { "scenes": 1, "wordCount": 380, "占比": "12.7%" },
      "B2": { "scenes": 3, "wordCount": 1120, "占比": "37.3%" },
      "B3": { "scenes": 2, "wordCount": 850, "占比": "28.3%" },
      "B4": { "scenes": 1, "wordCount": 430, "占比": "14.3%" },
      "B5": { "scenes": 2, "wordCount": 800, "占比": "26.7%" }
    },
    "totalWordCount": 3580,
    "wordCountStatus": "符合目标（2700-3900字区间）",
    "sceneTypeBreakdown": {
      "revelation": 3,
      "dialogue": 2,
      "action": 2,
      "reflection": 2
    }
  }
}
```