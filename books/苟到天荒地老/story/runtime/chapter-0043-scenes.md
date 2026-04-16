
## ScenePlan - 第43章 场景规划

根据BeatSheet分析，本章为回收章（payoff），包含1个核心悬念（父亲最终命运）和3个伏笔回收（铜环、弯月印记、灵泉核心）。节拍3（冲突爆发）设计3个场景，其余节拍各1-2个场景。

```json
{
  "scenes": [
    {
      "sceneId": "B43-1",
      "beatId": "B3-1",
      "location": "灰雾空间·入口处",
      "sceneType": "action",
      "event": "主角被铜环灼烫惊醒，黑暗中传来不属于自己的脚步声，雾气深处浮现模糊身影",
      "protagonistReaction": "心跳如擂鼓但目光平静，手指悄悄触碰腰间铜环",
      "keyDialogue": {
        "speaker": "残魂（未现形）",
        "line": "……来者……何人……",
        "protagonistResponse": "（屏息，铜环无声震动作答）",
        "dramaticMeaning": "身份试探——残魂对闯入者的本能反应"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow→urgent",
        "technique": ["环境描写", "感官聚焦", "悬念铺设"],
        "mood": "警觉·压迫·未知",
        "wordCountTarget": 350
      },
      "factionActivity": [],
      "hooksTouched": ["H001"],
      "transitionToNext": "主角试探性向前迈步，铜环脉动更强"
    },
    {
      "sceneId": "B43-2",
      "beatId": "B3-2",
      "location": "灰雾空间·石板路",
      "sceneType": "revelation",
      "event": "主角沿石板路深入，铜环脉动指引方向；发现父亲脚印；雾气深处淡金色光点闪烁如窥视之眼",
      "protagonistReaction": "瞳孔微缩，蹲下细看脚印，确认与自己步幅一致后咬牙站起，目光更加坚定",
      "keyDialogue": {
        "speaker": "主角（内心）",
        "line": "这脚印……是父亲的。他三十年前走过这条路。",
        "protagonistResponse": "（握紧铜环，加快脚步）",
        "dramaticMeaning": "承上启下——确认父亲踪迹，将悬念具体化"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "medium",
        "technique": ["发现式叙事", "细节聚焦", "情绪递进"],
        "mood": "震撼·坚定·不安",
        "wordCountTarget": 400
      },
      "factionActivity": [
        { "faction": "铜环", "action": "裂纹处光芒从暗金转为明亮", "powerDelta": "+1" }
      ],
      "hooksTouched": ["H001"],
      "transitionToNext": "淡金色光点骤聚，残魂凝聚成形，精神攻击开始"
    },
    {
      "sceneId": "B43-3",
      "beatId": "B3-3",
      "location": "灰雾空间·执念凝聚区",
      "sceneType": "action",
      "event": "残魂由无数怨念凝聚成形，发出无声尖啸对主角识海发起第一波精神攻击——三十年前的惨叫与求饶画面碎片",
      "protagonistReaction": "眉心剧痛，眼前景象扭曲，但强撑不倒",
      "keyDialogue": {
        "speaker": "残魂",
        "line": "（无声尖啸）",
        "protagonistResponse": "（闷哼一声，单手扶额）",
        "dramaticMeaning": "初次交锋——精神层面的硬碰硬"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "very-fast",
        "technique": ["短句冲击", "画面闪切", "感官过载"],
        "mood": "剧痛·濒临崩溃·强撑",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "残魂", "action": "精神攻击命中", "powerDelta": "-1" }
      ],
      "hooksTouched": [],
      "transitionToNext": "铜环与金丝缠产生共鸣，勉强抵御住第一波攻击"
    },
    {
      "sceneId": "B43-4",
      "beatId": "B3-3",
      "location": "主角识海内部",
      "sceneType": "action",
      "event": "第二波精神攻击袭来——主角自己的恐惧记忆：虫卵栽赃、地窖藏身、赵海死亡的瞬间；耳边响起呢喃低语",
      "protagonistReaction": "识海剧烈震荡，单膝跪地，后颈弯月印记剧烈发热",
      "keyDialogue": {
        "speaker": "残魂",
        "line": "都是诱饵……活不下去的……你也一样……",
        "protagonistResponse": "（咬牙切齿）我不信……",
        "dramaticMeaning": "心理防线测试——用主角自己的恐惧击溃主角"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "extreme",
        "technique": ["呢喃叠化", "短句快切", "意识流"],
        "mood": "绝望·挣扎·意志对抗",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "残魂", "action": "混合攻击", "powerDelta": "-1" },
        { "faction": "主角", "action": "弯月印记抵抗", "powerDelta": "0" }
      ],
      "hooksTouched": [],
      "transitionToNext": "意识即将沦陷之际，铜环爆发强光"
    },
    {
      "sceneId": "B43-5",
      "beatId": "B3-3",
      "location": "灰雾空间·攻击核心区",
      "sceneType": "action",
      "event": "第三波攻击——混合父亲背影、母亲面容、婴儿等意象；主角感觉意识被拉扯向深渊，铜环在冰火两重天震荡",
      "protagonistReaction": "意识边缘岌岌可危，金丝缠微弱发光与残魂同源共鸣",
      "keyDialogue": {
        "speaker": "残魂",
        "line": "来……和我们一起……这里没有出路……",
        "protagonistResponse": "（铜环骤然滚烫，似在回应）",
        "dramaticMeaning": "最黑暗时刻——同源共鸣揭示残魂与主角的联系"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "extreme",
        "technique": ["意象轰炸", "感官剥离", "深渊感"],
        "mood": "沦陷边缘·最后挣扎",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "残魂", "action": "终极攻击", "powerDelta": "-1" },
        { "faction": "铜环", "action": "临界状态", "powerDelta": "-1" }
      ],
      "hooksTouched": [],
      "transitionToNext": "铜环爆发，父亲力量激活，形成淡金色薄膜隔绝攻击"
    },
    {
      "sceneId": "B43-6",
      "beatId": "B4",
      "location": "灰雾空间·攻击核心区",
      "sceneType": "revelation",
      "event": "铜环爆发强光与弯月印记共鸣，父亲的力量被激活形成保护薄膜；主角在识海中看见父亲最后的身影与选择",
      "protagonistReaction": "浑身一震，识海中浮现父亲背影