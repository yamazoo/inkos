# ScenePlan — 第40章节拍拆解

## 场景拆分逻辑

| 节拍 | 场景数 | 字数分配 | 场景类型分布 |
|:---:|:---:|---:|:---:|
| B1 悬念引入 | 2 | 300字 | action / reflection |
| B2 局势升级 | 2 | 450字 | action / revelation |
| B3 冲突爆发 | 4 | 1050字 | dialogue / action / revelation |
| B4 小高潮 | 2 | 600字 | revelation / transition |
| B5 章末转折 | 2 | 600字 | action / revelation |
| **合计** | **12** | **3000字** | — |

---

## 完整ScenePlan JSON

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "演武场侧门→青云镇街道",
      "sceneType": "action",
      "event": "四方角帽押送陈守一离开演武场，沉默中走向执法堂",
      "protagonistReaction": "陈守一被拖下擂台，左臂金丝缠蔓延至小臂中段，右肩铁爪伤口渗血，后颈弯月印记隐隐发热。他攥紧令牌碎片，感受擂台外的空气——没有欢呼，没有嘲讽，只有四方角帽无声的脚步。",
      "keyDialogue": {
        "speaker": "四方角帽甲",
        "line": "（沉默不语）",
        "protagonistResponse": "（目光扫过两侧暗巷，心跳如擂鼓，脑中飞速盘算）",
        "dramaticMeaning": "沉默本身即信号——他们不打算让陈守一活太久"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["atmospheric-details", "internal-monologue"],
        "mood": "压抑·警觉",
        "wordCountTarget": 280
      },
      "factionActivity": [
        { "faction": "四方角帽", "action": "执行押送任务，两人一前一后步伐无声", "powerDelta": 0 },
        { "faction": "青云门弟子", "action": "远远观望，无人上前", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001"],
      "transitionToNext": "夜色中街道空旷，押送队伍拐入执法堂方向"
    },
    {
      "sceneId": "B1-2",
      "beatId": "B1",
      "location": "青云镇主街→执法堂侧巷",
      "sceneType": "reflection",
      "event": "陈守一在押送途中观察路线，感受铜环枯竭与身体极限",
      "protagonistReaction": "街道空旷得诡异，连平日巡逻的青云门弟子都不见踪影。陈守一感知丹田枯竭、铜环裂纹蛛网状碎裂、左臂金丝缠彻底废掉——旧伤未愈，新力未生。'活着就有希望'的信念仍在，但希望的光芒越来越微弱。",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": "（心中默念）'活着就有希望'……令牌还在。",
        "protagonistResponse": "（攥紧令牌碎片，感知它在微微发热）",
        "dramaticMeaning": "信念与绝境的拉扯——陈守一在极限状态下仍不放弃"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "slow",
        "technique": ["sensory-details", "psychological-depth"],
        "mood": "警觉·盘算",
        "wordCountTarget": 320
      },
      "factionActivity": [
        { "faction": "四方角帽", "action": "脚步无声，气氛紧张", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H004"],
      "transitionToNext": "执法堂的轮廓出现在前方，押送队伍转向后院偏僻方向"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "执法堂正门→后院方向",
      "sceneType": "action",
      "event": "陈守一被押入执法堂，却未前往审讯室或牢房，而是走向后院偏僻暗室",
      "protagonistReaction": "执法堂正门高悬'明镜高悬'匾额，四方角帽却绕道后院。陈守一目光扫过——院中巡逻密度远超平日，三步一岗，五步一哨。有人在低声交谈，提到'周执事'、'灭口'。",
      "keyDialogue": {
        "speaker": "四方角帽乙（低声）",
        "line": "'……周执事说今夜必须办妥。那个炼气五层已经带走了。'",
        "protagonistResponse": "（瞳孔微缩——炼气五层是被灭口带走的，不是押送）",
        "dramaticMeaning": "执法堂内部异动，陈守一发现第一个破绽"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["tension-building", "observation-details"],
        "mood": "警觉·压抑",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "加强巡逻，气氛紧张，戒备炼气五层灭口者", "powerDelta": "内部暗流" },
        { "faction": "四方角帽", "action": "执行押送任务，绕道后院", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001", "H005"],
      "transitionToNext": "四方角帽在一扇锈迹斑斑的铁门前停下，门后是执法堂后院偏僻暗室"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "执法堂后院廊道",
      "sceneType": "revelation",
      "event": "陈守一感知令牌碎片微弱共鸣，三件钥匙体系仍有呼应",
      "protagonistReaction": "在巡逻间隙，陈守一感知到令牌碎片微微发热——它在指向某个方向，隐约与铜环、后颈印记呼应。三件钥匙体系仍在共鸣，只是比擂台上更微弱。这是黑暗中第一丝光亮。",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": "（心中震动）三件钥匙……还在回应我。",
        "protagonistResponse": "（强压心中激动，面色不变，暗中攥紧令牌碎片）",
        "dramaticMeaning": "三件钥匙体系确认存在，陈老线索浮出水面"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["mystery-buildup", "subtle-hope"],
        "mood": "警觉·微弱希望",
        "wordCountTarget": 400
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "内部戒备，似乎在防备其他势力介入", "powerDelta": "势力暗流" }
      ],
      "hooksTouched": ["H001", "H003", "H004"],
      "transitionToNext": "四方角帽推开铁门，将陈守一押入暗室"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "执法堂后院暗室",
      "sceneType": "action",
      "event": "四方角帽将陈守一押入暗室，门在身后沉重合上",
      "protagonistReaction": "暗室幽暗逼仄，空气中弥漫着陈旧的血腥味。四方角帽将陈守一推倒在角落，铁链声哗啦作响，手腕脚踝被锁住。陈守一环顾四周——墙壁斑驳，角落有干涸暗渍，窗户被封死。这里不是审讯室，是行刑室。",
      "keyDialogue": {
        "speaker": "四方角帽甲",
        "line": "'周执事马上到。'",
        "protagonistResponse": "（目光平静，心中冷笑——'马上'，说明他们早有预谋）",
        "dramaticMeaning": "暗室的氛围揭示结局——陈守一已被判死刑"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["atmospheric-trap", "foreshadowing"],
        "mood": "绝境·压抑",
        "wordCountTarget": 280
      },
      "factionActivity": [
        { "faction": "四方角帽", "action": "将陈守一锁入暗室，等待周执事", "powerDelta": 0 }
      ],
      "hooksTouched": ["H001"],
      "transitionToNext": "铁门再次打开，一道身影踏入暗室——周执事登场"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "执法堂后院暗室",
      "sceneType": "dialogue",
      "event": "周执事现身暗室，冷笑宣告陈守一必死无疑",
      "protagonistReaction": "周执事踏入暗室，油灯照亮一张阴鸷的面孔。他打量陈守一的目光如同审视死人。陈守一抬起头，目光平静——恐惧无用，挣扎无用，唯有冷静方能寻得一线生机。",
      "keyDialogue": {
        "speaker": "周执事",
        "line": "'陈守一，炼气三层，却能战胜炼气五层。你的金丝缠、你的后颈印记、你身上那些不该存在的东西……都是证据。'",
        "protagonistResponse": "（目光平静，沉默以对，心中却在飞速运转——周执事知道的太多了）",
        "dramaticMeaning": "周执事对陈守一的底牌了如指掌，揭示背后有人操控"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["power-dynamic", "dialogue-tension"],
        "mood": "压迫·冷静",
        "wordCountTarget": 320
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "周执事主导栽赃计划，四方角帽执行", "powerDelta": "周执事势力巩固" }
      ],
      "hooksTouched": ["H001", "H005"],
      "transitionToNext": "周执事冷笑一声，揭示栽赃计划的完整全貌"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "执法堂后院暗室",
      "sceneType": "revelation",
      "event": "周执事揭露'使用禁术'的栽赃全貌，令牌碎片的真正来源",
      "protagonistReaction": "周执事得意地揭露真相——那块令牌碎片是他亲手放在陈守一身上的。'使用禁术'的罪名已坐实，四方角帽灭口了唯一可能作证的炼气五层。陈守一心脏猛然一跳——他知道太多，这意味着什么？",
      "keyDialogue": {
        "speaker": "周执事",
        "line": "'你以为那块令牌碎片能救你？那是我亲手放在他身上的东西。等明日公告发出，你就是'畏罪自尽'的禁术使用者。'",
        "protagonistResponse": "（瞳孔微缩——令牌碎片是栽赃的证据，但也是三件钥匙之一）",
        "dramaticMeaning": "栽赃计划完整揭露，陈守一陷入绝境，但周执事的得意暴露破绽"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["revelation-block", "dramatic-irony"],
        "mood": "震惊·绝境",
        "wordCountTarget": 380
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "周执事主导灭口与栽赃，权力欲望暴露", "powerDelta": "周执事独断" }
      ],
      "hooksTouched": ["H001", "H003", "H004"],
      "transitionToNext": "周执事等待陈守一的反应——这将是最后的反驳机会"
    },
    {
      "sceneId": "B3-4",
      "beatId": "B3",
      "location": "执法堂后院暗室",
      "sceneType": "dialogue",
      "event": "陈守一冷静反驳，指出周执事栽赃的致命破绽",
      "protagonistReaction": "陈守一忽然笑了——不是绝望的笑，是洞悉破绽后的冷笑。他指出：栽赃需要证人、需要物证、需要程序。四方角帽灭口炼气五层，恰恰说明有人看到了不该看的东西。'周执事，你杀得完吗？'",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": "'证人死了，物证是你放的，程序……周执事打算直接处决？青云门的规矩，几时轮到执法堂一手遮天？'",
        "protagonistResponse": "（暗中攥紧令牌碎片，感知它与铜环、后颈印记的共鸣在加强）",
        "dramaticMeaning": "陈守一在绝境中找到一线生机——周执事的破绽在于程序不正义"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "urgent",
        "technique": ["verbal-sparring", "psychological-counterattack"],
        "mood": "绝地反击·压迫",
        "wordCountTarget": 370
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "周执事被反驳激怒，但不得不承认程序破绽", "powerDelta": "周执事威信受损" }
      ],
      "hooksTouched": ["H001", "H005"],
      "transitionToNext": "周执事脸色阴沉，命四方角帽将陈守一关入更深的暗室"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "执法堂后院暗室深处",
      "sceneType": "revelation",
      "event": "三件钥匙同时共鸣，陈守一感知令牌碎片指向后山陈老方向",
      "protagonistReaction": "令牌碎片猛然发热，铜环裂纹渗出微光，后颈印记灼热刺痛——三件钥匙同时共鸣。陈守一瞳孔骤缩——令牌碎片指向的方向，隐约是后山方向，与陈老所在位置重合。",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": "（心中震动）三件钥匙……指向后山。",
        "protagonistResponse": "（感知共鸣，确认三件钥匙体系指向陈老）",
        "dramaticMeaning":