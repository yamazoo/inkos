```json
{
  "scenes": [
    {
      "sceneId": "B1-1",
      "beatId": "B1",
      "location": "灵田晨雾",
      "sceneType": "reflection",
      "event": "主角天未亮便出门，独自穿行于灵田之间，晨露打湿裤脚，开始一日劳作",
      "protagonistReaction": "主角目光低垂，脚步无声，像一道融入雾气的影子，心跳平稳得像计算过的呼吸",
      "keyDialogue": null,
      "povCharacter": "主角",
      "pacing": {
        "speed": "slow",
        "technique": ["sensory-details", "internal-monologue"],
        "mood": "压抑·克制",
        "wordCountTarget": 320
      },
      "factionActivity": [],
      "hooksTouched": [],
      "transitionToNext": "主角抵达自己的灵田，开始锄禾劳作"
    },
    {
      "sceneId": "B1-2",
      "beatId": "B1",
      "location": "西坡薄田",
      "sceneType": "action",
      "event": "主角在灵气贫瘠的薄田中锄禾，泥土干裂如龟甲，锄头柄上的磨痕记录着无数个这样的清晨",
      "protagonistReaction": "主角挥锄的动作精准而机械，汗珠沿着下颌滑落，心中默默计算着今日还需完成的劳作量",
      "keyDialogue": null,
      "povCharacter": "主角",
      "pacing": {
        "speed": "steady",
        "technique": ["action-verbs", "environmental-details"],
        "mood": "平静·暗涌",
        "wordCountTarget": 280
      },
      "factionActivity": [],
      "hooksTouched": ["tribulation-early"],
      "transitionToNext": "日头渐高，主角擦汗时瞥见远处同门陆续出门"
    },
    {
      "sceneId": "B2-1",
      "beatId": "B2",
      "location": "灵植夫院前",
      "sceneType": "dialogue",
      "event": "灵植夫分派今日任务，主角被单独安排照料西坡"死田"，理由是"你手脚勤快，别人去是浪费"",
      "protagonistReaction": "主角接过木牌时指节微微收紧，面上却无任何波澜，只低声应了一个"是"",
      "keyDialogue": {
        "speaker": "灵植夫",
        "line": "「西坡那块，旁人去了也是白搭，你去正好。」",
        "protagonistResponse": "「是。」",
        "dramaticMeaning": "边缘化以勤勉为名，主角处境愈发艰难"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "moderate",
        "technique": ["dialogue", "facial-details"],
        "mood": "隐忍·压迫",
        "wordCountTarget": 400
      },
      "factionActivity": [
        { "faction": "灵植夫", "action": "分派任务明显不公", "powerDelta": 0 }
      ],
      "hooksTouched": [],
      "transitionToNext": "主角转身离去时，听见身后同门的窃窃私语"
    },
    {
      "sceneId": "B2-2",
      "beatId": "B2",
      "location": "田埂柳荫下",
      "sceneType": "revelation",
      "event": "主角在田埂边歇脚时，偶然听见两名同期杂役闲聊，提及祖辈传说中"上古灵气取之不尽"，以及近年来灵气愈发稀薄的异常",
      "protagonistReaction": "主角捧着水囊的手悬在半空，耳朵却竖得笔直，心底某根弦被轻轻拨动",
      "keyDialogue": {
        "speaker": "杂役甲",
        "line": "「我爷爷的爷爷说，早先灵气多得往外冒，根本不用省着使。」",
        "protagonistResponse": "（主角沉默饮水）",
        "dramaticMeaning": "关键信息植入：灵气衰减设定，以闲聊方式自然呈现"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "relaxed",
        "technique": ["overheard-conversation", "information-reveal"],
        "mood": "平静·暗藏波澜",
        "wordCountTarget": 420
      },
      "factionActivity": [],
      "hooksTouched": ["tribulation-early"],
      "transitionToNext": "主角放下水囊起身，目光扫过自己那片死气沉沉的薄田"
    },
    {
      "sceneId": "B3-1",
      "beatId": "B3",
      "location": "西坡薄田中央",
      "sceneType": "action",
      "event": "虫害突发，大片灵禾叶片出现枯黄萎缩迹象。主角面色如常，实则眼底闪过一丝锐利，不动声色地从田埂边取来草灰和泥巴",
      "protagonistReaction": "主角心跳骤然加速，但手上动作愈发沉稳，将土法材料混合后沿着田垄均匀撒布",
      "keyDialogue": null,
      "povCharacter": "主角",
      "pacing": {
        "speed": "urgent",
        "technique": ["short-sentences", "action-verbs"],
        "mood": "紧张·压制",
        "wordCountTarget": 380
      },
      "factionActivity": [],
      "hooksTouched": ["tribulation-early"],
      "transitionToNext": "远处传来脚步声，有人正朝这边走来"
    },
    {
      "sceneId": "B3-2",
      "beatId": "B3",
      "location": "薄田边缘小径",
      "sceneType": "revelation",
      "event": "同期杂役小路路过，瞥见主角撒草灰的动作异常熟练，与普通乡下手法颇有出入，面露疑惑",
      "protagonistReaction": "主角察觉目光，手上动作瞬间变得"笨拙"几分，笑着解释是乡下土方子",
      "keyDialogue": {
        "speaker": "小路",
        "line": "「这手法……倒不像寻常庄户人家。」",
        "protagonistResponse": "「乡下土方子，见笑。」",
        "dramaticMeaning": "蛛丝马迹被察觉，误会暂时解开但隐患埋下"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "tension-release",
        "technique": ["dialogue", "suspicion-subtlety"],
        "mood": "警觉·试探",
        "wordCountTarget": 340
      },
      "factionActivity": [
        { "faction": "同期杂役", "action": "察觉主角动作异常", "powerDelta": 0 }
      ],
      "hooksTouched": [],
      "transitionToNext": "小路带着若有所思的神情离开，主角独自留在田中"
    },
    {
      "sceneId": "B4-1",
      "beatId": "B4",
      "location": "西坡薄田",
      "sceneType": "dialogue",
      "event": "管事例行巡查，发现本该贫瘠的薄田长势竟出奇地好，面色阴沉地唤来主角盘问",
      "protagonistReaction": "主角垂手立于田埂，脊背挺直，目光恭敬却不躲闪，在管事的逼视下从容应对",
      "keyDialogue": {
        "speaker": "管事",
        "line": "「这田里的灵禾，怎么比东边的好田还精神？」",
        "protagonistResponse": "「回管事，运气好，这块地底子虽薄，许是前几日露水足。」",
        "dramaticMeaning": "主角以"运气"搪塞，管事虽未深究却记住了这张脸"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "confrontational",
        "technique": ["dialogue", "power-dynamics"],
        "mood": "紧绷·对峙",
        "wordCountTarget": 420
      },
      "factionActivity": [
        { "faction": "管事", "action": "盘问主角灵田异常", "powerDelta": -5 }
      ],
      "hooksTouched": [],
      "transitionToNext": "管事冷哼一声正欲离去，小路突然开口"
    },
    {
      "sceneId": "B4-2",
      "beatId": "B4",
      "location": "西坡薄田",
      "sceneType": "dialogue",
      "event": "小路适时开口，称自己曾见主角天未亮便下地，还从家里带了草灰来沤肥，言辞间替主角开脱",
      "protagonistReaction": "主角微微侧目看向小路，心中泛起一丝意外与警觉并存的复杂情绪",
      "keyDialogue": {
        "speaker": "小路",
        "line": "「我亲眼见的，他比谁都勤快，这收成是他熬出来的。」",
        "protagonistResponse": "「多谢小路哥美言。」（主角拱手）",
        "dramaticMeaning": "意外帮助建立初步人际连接，小路消息灵通特质初显"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "resolution",
        "technique": ["dialogue", "relationship-shift"],
        "mood": "微妙·暖意",
        "wordCountTarget": 320
      },
      "factionActivity": [
        { "faction": "同期杂役小路", "action": "替主角解围", "powerDelta": 5 }
      ],
      "hooksTouched": [],
      "transitionToNext": "管事甩袖离去，主角与小路对视一眼，各自散去"
    },
    {
      "sceneId": "B5-1",
      "beatId": "B5",
      "location": "归途山道",
      "sceneType": "action",
      "event": "黄昏时分主角收工归途，瞥见前方两名执法弟子押着一名陌生杂役匆匆而过，杂役脸上有淤青，罪名含糊不清",
      "protagonistReaction": "主角脚步不自觉放轻，心跳却骤然擂响，下意识将草帽压低，贴着山壁缓步前行",
      "keyDialogue": {
        "speaker": "执法弟子",
        "line": "「灵气异常的案子，走吧。」",
        "protagonistResponse": "（主角屏息贴壁，目送其远去）",
        "dramaticMeaning": "意外事件打断平静，灵气异常的案子浮出水面"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "urgent",
        "technique": ["environmental", "tension-building"],
        "mood": "紧张·不安",
        "wordCountTarget": 350
      },
      "factionActivity": [
        { "faction": "执法堂", "action": "逮捕涉嫌灵气异常的杂役", "powerDelta": 0 }
      ],
      "hooksTouched": ["tribulation-early"],
      "transitionToNext": "执法弟子远去后，主角加快脚步返回住处"
    },
    {
      "sceneId": "B5-2",
      "beatId": "B5",
      "location": "主角破屋",
      "sceneType": "revelation",
      "event": "主角推开破屋木门，习惯性摸向门闩时发现铜锈气味异常浓重，门闩位置微微偏移。仔细查看，门角残留半截不属于主角的灰色布料纤维",
      "protagonistReaction": "主角瞳孔微缩，屏息立于门内，指尖拂过布料纤维时感受到一丝若有若无的药香——这是灵植夫院特有的气息",
      "keyDialogue": {
        "speaker": "主角（内心独白）",
        "line": "「……来过了。」（无声）",
        "protagonistResponse": null,
        "dramaticMeaning": "监视者身份非普通杂役，新势力介入的明确信号"
      },
      "povCharacter": "主角",
      "pacing": {
        "speed": "suspense",
        "technique": ["sensory-details", "revelation"],
        "mood": "警觉·危机",
        "wordCountTarget": 380
      },
      "factionActivity": [
        { "faction": "未知势力", "action": "搜查主角住处", "powerDelta": -10 }
      ],
      "hooksTouched": ["tribulation-early"],
      "transitionToNext": "主角将布料收好，转身检查屋内是否还有其他异常痕迹"
    }
  ],
  "metadata": {
    "chapterType": "transition",
    "targetWords": 3000,
    "minWords": 2400,
    "maxWords": 3900,
    "totalScenes": 10,
    "wordCountByScene": {
      "B1": 600,
      "B2": 820,
      "B3": 720,
      "B4": 740,
      "B5": 730
    },
    "costsAndGains": {
      "B5": {
        "cost": "主角住处被监视，安全空间受到威胁（未知势力介入）",
        "gain": "发现监视者线索（灵植夫院特有的药香布料），为下章展开执法堂调查或其他势力觊觎埋线"
      }
    }
  }
}
```