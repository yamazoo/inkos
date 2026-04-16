## 第37章 ScenePlan

根据BeatSheet，将5个节拍拆解为**7个场景**，目标总字数3000字（平均每场景约430字）。

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "内门小径·晨曦微露",
      "sceneType": "action",
      "event": "四方角帽押送陈守一穿过外门小径，围观杂役窃窃私语",
      "protagonistReaction": "心跳如擂鼓但目光平静，假装配合实则盘算令牌碎片",
      "keyDialogue": {
        "speaker": "四方角帽",
        "line": "「少耍花招。」",
        "protagonistResponse": "主角目光平静，微微颔首示弱"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "moderate",
        "technique": ["contrast", "environmental-details"],
        "mood": "紧张·压抑·暗流涌动",
        "wordCountTarget": 420
      },
      "factionActivity": [
        {"faction": "四方角帽", "action": "押送主角至执法堂", "powerDelta": 0}
      ],
      "hooksTouched": ["H036"],
      "transitionToNext": "铜环突然发出细微震动——裂纹扩大"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "内门小径·押送途中",
      "sceneType": "revelation",
      "event": "铜环裂纹蛛网状碎裂扩大，震动感消失，主角意识到短时间内无法动用",
      "protagonistReaction": "内心一沉，压抑绝望感，冷静观察四周寻找生机",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "「底牌……没了。」",
        "protagonistResponse": "垂下眼睫，不动声色"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "decelerating",
        "technique": ["inner-monologue", "sensory-deprivation"],
        "mood": "绝望·冷静·压抑",
        "wordCountTarget": 380
      },
      "factionActivity": [
        {"faction": "四方角帽", "action": "察觉异常但未停步", "powerDelta": 0}
      ],
      "hooksTouched": ["H046"],
      "transitionToNext": "后颈印记、铜牌、令牌碎片突然同时发热——三钥共鸣"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "内门小径·押送途中",
      "sceneType": "revelation",
      "event": "后颈印记、铜牌、令牌碎片三件钥匙共鸣，令牌碎片指向陈老方向",
      "protagonistReaction": "内心震动，瞳孔骤然收缩——陈老与自己的关联？",
      "keyDialogue": {
        "speaker": "陈守一（内心）",
        "line": "「陈老……令牌碎片指向他……这不可能是巧合。」",
        "protagonistResponse": "强压震惊，低眉顺眼掩饰异样"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "sudden-surge",
        "technique": ["sensory-flash", "revelation-trigger"],
        "mood": "震惊·意外·迷雾初现",
        "wordCountTarget": 400
      },
      "factionActivity": [
        {"faction": "四方角帽", "action": "未察觉主角异常", "powerDelta": 0}
      ],
      "hooksTouched": ["H045", "H047"],
      "transitionToNext": "执法堂阴暗审讯室的轮廓在前方显现"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "执法堂·阴暗审讯室",
      "sceneType": "dialogue",
      "event": "四方角帽将陈守一推进铁椅，周执事现身，冷笑质问关于陈老之事",
      "protagonistReaction": "被逼入绝境但仍保持表面镇定，内心飞速盘算",
      "keyDialogue": {
        "speaker": "周执事",
        "line": "「陈守一？和陈老什么关系？从实招来。」",
        "protagonistResponse": "「回执事，弟子确实姓陈，但与陈老素无往来。」",
        "dramaticMeaning": "身份试探——栽赃陷阱的第一步"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "tense",
        "technique": ["power-dialogue", "environmental-trap"],
        "mood": "阴冷·压迫·步步惊心",
        "wordCountTarget": 430
      },
      "factionActivity": [
        {"faction": "执法堂", "action": "周执事主导审讯", "powerDelta": 1}
      ],
      "hooksTouched": ["H036"],
      "transitionToNext": "周执事冷笑，命人将搜出的令牌碎片呈上——栽赃正式开始"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "执法堂·阴暗审讯室",
      "sceneType": "action",
      "event": "周执事出示令牌碎片栽赃——禁术金丝缠证据确凿，令牌碎片成关键证据",
      "protagonistReaction": "攥紧令牌碎片——「半个'令'字……这是栽赃道具，也是反制筹码」",
      "keyDialogue": {
        "speaker": "周执事",
        "line": "「炼气三层，胆敢使用禁术金丝缠——证据确凿，还有何话说？」",
        "protagonistResponse": "主角沉默，目光落在令牌碎片上，嘴角微微上扬",
        "dramaticMeaning": "危机中的转机——主角发现反制可能"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "escalating",
        "technique": ["confrontation", "evidence-reveal"],
        "mood": "绝境·对抗·暗流汹涌",
        "wordCountTarget": 450
      },
      "factionActivity": [
        {"faction": "执法堂", "action": "周执事布局曝光", "powerDelta": 0}
      ],
      "hooksTouched": ["H036", "H045"],
      "transitionToNext": "主角陷入彻底绝境——铜环碎裂、底牌尽失"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "执法堂·阴暗审讯室",
      "sceneType": "revelation",
      "event": "铜环彻底碎裂，主角底牌尽失；令牌碎片真相揭露——三件钥匙指向陈老",
      "protagonistReaction": "陷入彻底绝望，却在最后一刻冷静下来——冷静外表下的内心翻涌",
      "keyDialogue": {
        "speaker": "周执事",
        "line": "「没有底牌了吧？那就乖乖认罪——」",
        "protagonistResponse": "主角突然平静开口：「执事可知这令牌背面刻的是什么？」",
        "dramaticMeaning": "绝境反击——令牌反制的前奏"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "climactic",
        "technique": ["dramatic-irony", "inner-storm"],
        "mood": "绝望边缘·最后一搏·张力拉满",
        "wordCountTarget": 480
      },
      "factionActivity": [
        {"faction": "执法堂", "action": "周执事威胁灭口", "powerDelta": 1},
        {"faction": "陈守一", "action": "令牌反制要挟", "powerDelta": -1}
      ],
      "hooksTouched": ["H046", "H047"],
      "transitionToNext": "令牌碎片亮出——周执事脸色骤变"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "执法堂·阴暗审讯室",
      "sceneType": "action",
      "event": "令牌碎片反制——主角揭露令牌背面刻文，陈老失踪当夜执法堂参与接应",
      "protagonistReaction": "最后一搏，迸发全部意志，将令牌碎片反制作为要挟",
      "keyDialogue": {
        "speaker": "陈守一",
        "line": "「这令牌背面刻的是——陈老失踪当夜，执法堂接应的信物。」",
        "protagonistResponse": "主角将令牌碎片握在掌心，指节泛白",
        "dramaticMeaning": "高潮爆发——双方势力均衡被打破"
      },
      "povCharacter": "陈守一",
      "pacing": {
        "speed": "climax",
        "technique": ["revelation-climax", "power-shift"],
        "mood": "生死对峙·格局震荡·一触即发",
        "wordCountTarget": 440
      },
      "factionActivity": [
        {"faction": "执法堂", "action": "周执事布局曝光，审讯室陷入死寂", "powerDelta": -1},
        {"faction": "陈守一", "action": "令牌反制成功", "powerDelta": 1}
      ],
      "hooksTouched": ["H045", "H047"],
      "transitionToNext": "苏婉儿失踪（H036）——有人打断审讯"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "执法堂·阴暗审讯室",
      "sceneType": "revelation