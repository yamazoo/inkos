

```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "周记药铺后巷",
      "sceneType": "action",
      "event": "四方角帽现身，压制周平手下，确认主角身份后放行",
      "protagonistReaction": "主角屏息观察，不敢动弹，心中翻涌——他们是谁？为何而来？",
      "keyDialogue": [
        { "speaker": "四方角帽", "line": "「周家的事，青云门的事，与你们无关。」", "dramaticMeaning": "划定势力边界" },
        { "speaker": "周平手下甲", "line": "「你们——」", "dramaticMeaning": "惊疑，未说完便被压制" }
      ],
      "povCharacter": "主角",
      "pacing": { "speed": "urgent", "technique": ["short-sentences", "action-verbs"], "mood": "震惊·疑惑", "wordCountTarget": 400 },
      "factionActivity": [
        { "faction": "四方角帽", "action": "现身压制周平手下", "powerDelta": 0 },
        { "faction": "周平手下", "action": "被制住，无法追击", "powerDelta": -1 }
      ],
      "hooksTouched": ["H012"],
      "transitionToNext": "主角趁四方角帽与周平手下对峙之机，悄然向后退去"
    },
    {
      "sceneId": "B1-2",
      "beatId": "B1",
      "location": "周记药铺后院→地窖入口",
      "sceneType": "action",
      "event": "主角趁隙脱身，四方角帽目光扫过却未阻止，躲入地窖",
      "protagonistReaction": "主角心跳如擂鼓，脚步却稳而轻，如鬼魅般滑入地窖入口",
      "keyDialogue": [
        { "speaker": "主角（内心）", "line": "「他们认出了我……却不动手？为什么？」", "dramaticMeaning": "第四势力意图成谜" }
      ],
      "povCharacter": "主角",
      "pacing": { "speed": "rapid", "technique": ["fragmented-thoughts", "sensory-detail"], "mood": "紧张·劫后余生·新的不安", "wordCountTarget": 350 },
      "factionActivity": [
        { "faction": "四方角帽", "action": "目送主角离开，未加阻拦", "powerDelta": 0 },
        { "faction": "周平手下", "action": "挣脱后惊疑——他们为何放行？", "powerDelta": 0 }
      ],
      "hooksTouched": ["H012"],
      "transitionToNext": "地窖入口在身后合拢，黑暗与寂静包围主角"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "地窖入口台阶",
      "sceneType": "reflection",
      "event": "主角在地窖入口犹豫，体力消耗严重，金丝缠残留印记发烫",
      "protagonistReaction": "膝盖发软，不得不扶住墙壁；金丝缠印记处传来灼热感，似在警示什么",
      "keyDialogue": [
        { "speaker": "主角（内心）", "line": "「进去，还是不进去？进去是未知危险，不进去……身后还有追兵。」", "dramaticMeaning": "绝境中的抉择" }
      ],
      "povCharacter": "主角",
      "pacing": { "speed": "slow", "technique": ["breath-description", "internal-monologue"], "mood": "疲惫·警觉·犹豫", "wordCountTarget": 400 },
      "factionActivity": [
        { "faction": "周平手下", "action": "在地窖外徘徊，发现四方角帽放行异常，心生疑虑", "powerDelta": 0 }
      ],
      "hooksTouched": ["H015"],
      "transitionToNext": "金丝缠印记猛然一跳，主角感到一股来自地窖深处的牵引——它要他去"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "地窖入口",
      "sceneType": "action",
      "event": "主角最终选择踏入地窖，同时周平手下在外徘徊",
      "protagonistReaction": "深吸一口气，主角踏入黑暗，脚步尽量放轻；身后传来模糊的脚步声",
      "keyDialogue": [
        { "speaker": "主角（内心）", "line": "「金丝缠在指引我……这下面有什么？」", "dramaticMeaning": "金丝缠异常感应" }
      ],
      "povCharacter": "主角",
      "pacing": { "speed": "measured", "technique": ["tension-building", "sound-cues"], "mood": "紧张·探索", "wordCountTarget": 350 },
      "factionActivity": [
        { "faction": "周平手下", "action": "在入口外徘徊，似在犹豫是否追入", "powerDelta": 0 }
      ],
      "hooksTouched": [],
      "transitionToNext": "主角确认暂时安全藏身点——地窖深处有足够阴影可供躲藏"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "地窖通道",
      "sceneType": "action",
      "event": "深入地窖，发现人工建造痕迹——暗格、封存物品，非天然洞穴",
      "protagonistReaction": "主角脚步放缓，手抚过墙壁纹理——石砖砌成，排列整齐，绝非天然形成",
      "keyDialogue": [
        { "speaker": "主角（内心）", "line": "「这不是天然地窖……是有人刻意建造的。」", "dramaticMeaning": "人工痕迹揭示地窖用途" }
      ],
      "povCharacter": "主角",
      "pacing": { "speed": "slow", "technique": ["sensory-detail", "discovery-pacing"], "mood": "警惕·好奇", "wordCountTarget": 400 },
      "factionActivity": [],
      "hooksTouched": ["H016"],
      "transitionToNext": "主角发现墙壁上有一处微微凸起的暗格，伸手触碰"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "地窖暗格处",
      "sceneType": "revelation",
      "event": "黑铁令牌现身，纹路与金丝缠几乎一模一样",
      "protagonistReaction": "主角取出令牌，翻转间瞳孔骤缩——这纹路，他太熟悉了，正是金丝缠的图案",
      "keyDialogue": [
        { "speaker": "主角（内心）", "line": "「这令牌上的纹路……和金丝缠一模一样。」", "dramaticMeaning": "关联确认" },
        { "speaker": "主角（内心）", "line": "「林师兄……你到底留下了什么？」", "dramaticMeaning": "伏笔回收" }
      ],
      "povCharacter": "主角",
      "pacing": { "speed": "suspenseful", "technique": ["revelation-pacing", "close-up-focus"], "mood": "震惊·困惑", "wordCountTarget": 450 },
      "factionActivity": [],
      "hooksTouched": ["H014", "H017", "H010"],
      "transitionToNext": "主角将令牌收入怀中，继续向暗格深处探去"
    },
    {
      "sceneId": "B3-3",
      "beatId": "B3",
      "location": "地窖深处暗格",
      "sceneType": "revelation",
      "event": "小册子内容残破但可辨——\"林记\"、\"第七次实验\"、\"幽冥接引\"、\"纹路转移成功\"",
      "protagonistReaction": "主角翻开小册子，残页在手中颤抖——每个字都如重锤敲在心上",
      "keyDialogue": [
        { "speaker": "小册子（残文）", "line": "「……第七次实验……经脉走向与幽冥接引……纹路转移成功……」", "dramaticMeaning": "实验真相初露" },
        { "speaker": "主角（内心）", "line": "「幽冥接引……纹路转移……我是……实验体？」", "dramaticMeaning": "身份质疑" }
      ],
      "povCharacter": "主角",
      "pacing": { "speed": "slow", "technique": ["revelation-pacing", "internal-monologue"], "mood": "震惊·恐惧·否认", "wordCountTarget": 500 },
      "factionActivity": [],
      "hooksTouched": ["H010", "H018", "H020"],
      "transitionToNext": "就在此时，残纸猛然涌动，与金丝缠产生剧烈共振"
    },
    {
      "sceneId": "B3-4",
      "beatId": "B3",
      "location": "地窖深处",
      "sceneType": "action",
      "event": "残纸短暂力量涌动，与金丝缠产生共振，微光一闪即逝",
      "protagonistReaction": "主角感到胸口一阵温热，残纸与金丝缠同时泛起微光，似在呼应什么",
      "keyDialogue": [
        { "speaker": "主角（内心）", "line": "「残纸和金丝缠……它们在共振！」", "dramaticMeaning": "关联深化" }
      ],
      "povCharacter": "主角",
      "pacing": { "speed": "sudden", "technique": ["flash-reaction", "sensory-surge"], "mood": "惊讶·希望", "wordCountTarget": 300 },
      "factionActivity": [],
      "hooksTouched": ["H013", "H014"],
      "transitionToNext": "微光消散，主角还未来得及细想，地窖深处传来异响"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "地窖最深处",
      "sceneType": "action",
      "event": "地窖深处亮起大量幽暗的眼睛，泛着微光，正对着主角方向",
      "protagonistReaction": "主角僵在原地，那些眼睛——数量极多，泛着幽冷的光芒，正缓缓转向他",
      "keyDialogue": [
        { "speaker": "主角（内心）", "line": "「那些是……什么？」", "dramaticMeaning": "恐惧降临" }
      ],
      "povCharacter": "主角",
      "pacing": { "speed": "urgent", "technique": ["suspense-pacing", "sensory-horror"], "mood": "恐惧·绝望", "wordCountTarget": 450 },
      "factionActivity": [],
      "hooksTouched": ["H015", "H019"],
      "transitionToNext": "腥甜气息扑面而来，主角感到一股令人窒息的压迫感"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "地窖最深处",
      "sceneType": "action",
      "event": "幽冥气息更浓更急，主角确认金丝缠来源——林师兄实验，幽冥接引是关键",
      "protagonistReaction": "主角后背紧贴墙壁，屏住呼吸，大脑飞速运转——金丝缠、幽冥接引、纹路转移……一切都串联起来了",
      "keyDialogue": [
        { "speaker": "主角（内心）", "line": "「林师兄的实验……是要把我变成能连接幽冥的容器？」", "dramaticMeaning": "真相推断" }
      ],
      "povCharacter": "主角",
      "pacing": { "speed": "intense", "technique": ["rapid-thought", "sensory-escalation"], "mood": "恐惧·觉醒", "wordCountTarget": 450 },
      "factionActivity": [],
      "hooksTouched": ["H010", "H015", "H020"],
      "transitionToNext": "那些眼睛开始移动，正在逼近主角藏身之处"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "地窖深处藏身点",
      "sceneType": "action",
      "event": "主角灵力枯竭，残纸再次涌动（微弱但可感）",
      "protagonistReaction": "主角感到灵力近乎枯竭，但残纸传来微弱暖意，似在回应金丝缠的牵引",
      "keyDialogue": [
        { "speaker": "主角（内心）", "line": "「残纸……还有力量……它能指引我逃生吗？」", "dramaticMeaning": "新机遇显现" }
      ],
      "povCharacter": "主角",
      "pacing": { "speed": "measured", "technique": ["tension-hold", "hope-against-despair"], "mood": "绝望中微光", "wordCountTarget": 350 },
      "factionActivity": [],
      "hooksTouched": ["H013"],
      "transitionToNext": "主角集中精神感应残纸与金丝缠的共振，尝试定位可能的逃生路径"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "地窖深处",
      "sceneType": "action",
      "event": "新困境：幽冥眼睛开始移动，逼近主角；出口方向不确定安全",
      "protagonistReaction": "主角发现那些幽冥生物正在缓缓逼近，而来路方向传来隐约脚步声——追兵也来了",
      "keyDialogue": [
        { "speaker": "主角（内心）", "line": "「前有幽冥，后有追兵……还有别的路吗？」", "dramaticMeaning": "绝境困境" }
      ],
      "povCharacter": "主角",
      "pacing": { "speed": "urgent", "technique": ["夹击-描述", "short-sentences"], "mood": "绝望·紧迫", "wordCountTarget": 400 },
      "factionActivity": [
        { "faction": "周平手下", "action": "正在进入地窖搜索", "powerDelta": 0 },
        { "faction": "幽冥生物", "action": "正在逼近主角藏身点", "powerDelta": 0 }
      ],
      "hooksTouched": [],
      "transitionToNext": "就在此时，主角注意到地窖深处墙壁上有一道细微的缝隙——人工建造痕迹暗示可能有另一出口"
    },
    {
      "sceneId": "B5-3",
      "beatId": "B5",
      "location": "地窖深处墙壁缝隙",
      "sceneType": "revelation",
      "event": "新机遇：残纸与金丝缠共振，或能感应逃生路径；地窖深处可能存在另一出口",
      "protagonistReaction": "主角抚过墙壁，发现这道缝隙不是裂缝，而是刻意留下的——人工建造的痕迹指向一个隐蔽出口",
      "keyDialogue": [
        { "speaker": "主角（内心）", "line": "「这是……刻意留下的出口？林师兄早就预料到了这一天？」", "dramaticMeaning": "新希望" },
        { "speaker": "主角（内心）", "line": "「残纸在指引我……往这边走！」", "dramaticMeaning": "残纸共振指引" }
      ],
      "povCharacter": "主角",
      "pacing": { "speed": "suspenseful", "technique": ["discovery-pacing", "tension-resolution"], "mood": "希望·危险并存的紧迫感", "wordCountTarget": 400 },
      "factionActivity": [],
      "hooksTouched": ["H016", "H013"],
      "transitionToNext": "主角咬牙向缝隙移动，身后幽冥的压迫感越来越近"
    }
  ],
 