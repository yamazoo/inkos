```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "山谷外草地",
      "sceneType": "action/dialogue",
      "event": "星夜低沉，主角立于夜风中，远处黑雾如潮水般翻涌逼近",
      "protagonistReaction": "主角身体紧绷但目光平静，警惕地注视黑雾动向",
      "keyDialogue": { 
        "speaker": "黑雾中的低语", 
        "line": "……找到你了……", 
        "protagonistResponse": "主角下意识后退半步",
        "dramaticMeaning": "暗示冥界存在正在追踪主角，真相即将浮出水面"
      },
      "povCharacter": "主角",
      "pacing": { 
        "speed": "slow-building", 
        "technique": ["environmental-description", "tension-suspense"], 
        "mood": "压抑·危机四伏",
        "wordCountTarget": 300 
      },
      "factionActivity": [{ "faction": "冥界", "action": "黑雾逼近山谷", "powerDelta": 1 }],
      "hooksTouched": ["H001-冥界追踪"],
      "transitionToNext": "主角感知到黑雾中的威胁，急速撤向山谷深处"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "山谷裂隙深处",
      "sceneType": "revelation",
      "event": "主角发现前代修士遗迹与遗骸，残留意识初次现身",
      "protagonistReaction": "主角心跳加速但保持镇定，屏息观察",
      "keyDialogue": { 
        "speaker": "残魂", 
        "line": "\"你不该来这里……\"", 
        "protagonistResponse": "\"前辈，我是来寻找答案的。\"",
        "dramaticMeaning": "残魂警告暗含危险，同时暗示此地藏有重大秘密"
      },
      "povCharacter": "主角",
      "pacing": { 
        "speed": "moderate", 
        "technique": ["discovery-pause", "dialogue-exchange"], 
        "mood": "紧张·探索",
        "wordCountTarget": 350 
      },
      "factionActivity": [{ "faction": "旧势力", "action": "暗中监视主角行踪", "powerDelta": 0 }],
      "hooksTouched": ["H002-身份谜团"],
      "transitionToNext": "主角执意追问，残魂开始透露信息"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "遗迹核心",
      "sceneType": "dialogue/flashback",
      "event": "残魂在消散前透露关键信息碎片——关于冥将与主角身份的联系",
      "protagonistReaction": "主角紧追不舍，恐惧与决心交织",
      "keyDialogue": { 
        "speaker": "残魂", 
        "line": "\"……它在找你……你是……\"", 
        "protagonistResponse": "\"我是什么？告诉我！\"",
        "dramaticMeaning": "信息碎片揭示冥将与主角身份的关联，真相初现端倪"
      },
      "povCharacter": "主角",
      "pacing": { 
        "speed": "urgent", 
        "technique": ["short-dialogue", "emotion-intensification"], 
        "mood": "急迫·震撼",
        "wordCountTarget": 300 
      },
      "factionActivity": [{ "faction": "旧势力", "action": "主角行踪暴露", "powerDelta": -1 }],
      "hooksTouched": ["H001-冥界追踪", "H002-身份谜团"],
      "transitionToNext": "残魂话音未落便消散于天地间，主角独留遗迹，真相仍在迷雾中"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "识海深处/遗迹核心",
      "sceneType": "reflection/flashback",
      "event": "主角陷入沉思，将碎片化的信息拼凑整理，真相轮廓渐显",
      "protagonistReaction": "主角闭目凝神，记忆如潮水般涌来",
      "keyDialogue": { 
        "speaker": "记忆回响", 
        "line": "\"……血脉……传承……\"", 
        "protagonistResponse": "主角猛然睁眼，满脸不可置信",
        "dramaticMeaning": "记忆碎片暗示主角身份与某段隐秘历史相关"
      },
      "povCharacter": "主角",
      "pacing": { 
        "speed": "slow", 
        "technique": ["inner-monologue", "flashback-fragment"], 
        "mood": "沉思·真相逼近",
        "wordCountTarget": 350 
      },
      "factionActivity": [{ "faction": "势力关系网", "action": "开始断裂重组", "powerDelta": -2 }],
      "hooksTouched": ["H002-身份谜团"],
      "transitionToNext": "就在主角即将理清头绪之际，外部威胁打断思绪"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "识海深处",
      "sceneType": "revelation/flashback",
      "event": "核心真相揭露——主角与冥将之间的血脉或灵魂联系",
      "protagonistReaction": "主角如遭雷击，真相冲击使其几近崩溃边缘",
      "keyDialogue": { 
        "speaker": "记忆深处的声音", 
        "line": "\"……你终于来了……继承者……\"", 
        "protagonistResponse": "主角跪倒在地，双手抱头",
        "dramaticMeaning": "核心真相彻底颠覆主角认知，继承者身份浮出水面"
      },
      "povCharacter": "主角",
      "pacing": { 
        "speed": "dramatic", 
        "technique": ["revelation-pause", "emotion-burst"], 
        "mood": "震撼·崩溃边缘",
        "wordCountTarget": 400 
      },
      "factionActivity": [{ "faction": "势力关系网", "action": "彻底断裂", "powerDelta": -3 }],
      "hooksTouched": ["H002-身份谜团", "H003-冥将秘密"],
      "transitionToNext": "真相冲击过于强烈，主角意识陷入混乱"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "识海空间",
      "sceneType": "action/revelation",
      "event": "冥将意识侵入识海，主角被迫与心魔/冥将幻象对峙",
      "protagonistReaction": "主角意识被拖入深渊，恐惧与抗争并存",
      "keyDialogue": { 
        "speaker": "冥将幻象", 
        "line": "\"你以为你是谁？……你不过是我的……\"", 
        "protagonistResponse": "\"我是我自己！\"",
        "dramaticMeaning": "主角在意识层面与冥将进行对抗，确立自我认同"
      },
      "povCharacter": "主角",
      "pacing": { 
        "speed": "intense", 
        "technique": ["action-verbs", "short-sentences", "inner-conflict"], 
        "mood": "生死·对决",
        "wordCountTarget": 400 
      },
      "factionActivity": [{ "faction": "冥界", "action": "意识侵蚀主角", "powerDelta": 1 }],
      "hooksTouched": ["H001-冥界追踪", "H003-冥将秘密"],
      "transitionToNext": "主角勉强挣脱幻象，但意识已遭受侵蚀"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "识海边界/遗迹核心",
      "sceneType": "reflection/transition",
      "event": "主角意识回归现实，却发现时间所剩无几，身体因渡劫消耗极度虚弱",
      "protagonistReaction": "主角挣扎着站起，满身虚汗却眼神坚定",
      "keyDialogue": { 
        "speaker": "主角（自言自语）", 
        "line": "\"还有……多少时间？\"", 
        "protagonistResponse": "望向遗迹出口，微光隐约可见",
        "dramaticMeaning": "时间紧迫感加剧，主角必须在虚弱状态下做出抉择"
      },
      "povCharacter": "主角",
      "pacing": { 
        "speed": "tense", 
        "technique": ["ticking-clock", "physical-exhaustion"], 
        "mood": "紧迫·疲惫",
        "wordCountTarget": 350 
      },
      "factionActivity": [{ "faction": "格局", "action": "重置中", "powerDelta": 0 }],
      "hooksTouched": ["H002-身份谜团", "H003-冥将秘密"],
      "transitionToNext": "就在此时，遗迹外传来异响——有人来了"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "山谷外/遗迹出口",
      "sceneType": "action/dialogue",
      "event