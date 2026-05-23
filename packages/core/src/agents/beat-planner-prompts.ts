import type { ChapterType } from "../models/input-governance.js";
import type { BeatPlannerInput } from "../models/input-governance.js";

// ---------------------------------------------------------------------------
// Fanqie Pacing Template (reverse-engineered from 5 bestseller novels)
// ---------------------------------------------------------------------------

interface PacingBeat {
  chapter: number;
  type: string;
  intensity: string;
  note: string;
}

const PACING_BEATS: PacingBeat[] = [
  { chapter: 1, type: "emotional_hook", intensity: "high", note: "极度苦难开场：孤儿、贫穷、被欺辱。5/5 books必有。" },
  { chapter: 2, type: "golden_finger_reveal", intensity: "high", note: "金手指揭示！天大机缘降临。最迟不超过Ch3。" },
  { chapter: 3, type: "golden_finger_deepening", intensity: "medium", note: "金手指深化或身份暗示。展示能力细节。" },
  { chapter: 4, type: "small_payoff", intensity: "medium", note: "第一次小规模打脸或小爽点。让读者尝到甜头。" },
  { chapter: 5, type: "world_expansion", intensity: "medium", note: "世界观初步展开或紧张感铺垫。" },
  { chapter: 6, type: "major_face_slap", intensity: "high", note: "第一次重大爽点：大规模打脸、以弱胜强。5/5 books在Ch5-8内交付。" },
  { chapter: 7, type: "weak_defeats_strong", intensity: "medium-high", note: "延续Ch6的高潮或获取资源奖励。" },
  { chapter: 8, type: "transition", intensity: "low-medium", note: "过渡章节，为下一轮大高潮铺垫。" },
  { chapter: 9, type: "power_gain", intensity: "medium-high", note: "金手指能力升级或重大悬念揭示。" },
  { chapter: 10, type: "world_expansion", intensity: "high", note: "世界观重大扩展。5/5 books在Ch10必有世界扩展。" },
  { chapter: 11, type: "setup", intensity: "low-medium", note: "过渡章，建立新任务或挑战。为Ch15-17大高潮铺垫。" },
  { chapter: 12, type: "training", intensity: "medium", note: "修炼、学习、技能提升。金手指深化使用。" },
  { chapter: 13, type: "conflict_setup", intensity: "medium", note: "冲突铺垫，引入新的对手或障碍。" },
  { chapter: 14, type: "escalation", intensity: "medium-high", note: "矛盾升级，小规模战斗或对抗。" },
  { chapter: 15, type: "power_breakthrough", intensity: "high", note: "重大突破！5/5 books在Ch15-17内完成第一次重大突破。" },
  { chapter: 16, type: "breakthrough_payoff", intensity: "high", note: "突破后的爽感延续。展示新实力。" },
  { chapter: 17, type: "reward_or_expansion", intensity: "medium-high", note: "突破奖励或世界扩展。第一个高潮群的收尾。" },
  { chapter: 18, type: "transition", intensity: "low-medium", note: "过渡章节，恢复节奏。为第二波大高潮铺垫。" },
  { chapter: 19, type: "escalation", intensity: "medium-high", note: "第二波矛盾升级。" },
  { chapter: 20, type: "climax", intensity: "high", note: "第二波大高潮或重大悬念揭示。Ch20必须设置强钩子。" },
  { chapter: 21, type: "new_arc_setup", intensity: "low-medium", note: "新阶段开始。引入新环境、新目标、新敌人。" },
  { chapter: 22, type: "training", intensity: "medium", note: "新阶段的修炼/技能获取。" },
  { chapter: 23, type: "resource_gathering", intensity: "medium", note: "资源获取：狩猎、交易、探索。" },
  { chapter: 24, type: "power_breakthrough", intensity: "high", note: "新阶段首次重大突破。" },
  { chapter: 25, type: "combat", intensity: "high", note: "实战检验：与新敌人首次交锋。" },
  { chapter: 26, type: "loot_gain", intensity: "medium-high", note: "战斗后的奖励：资源、身份、地位提升。" },
  { chapter: 27, type: "world_expansion", intensity: "medium", note: "世界观扩展：揭示更大的权力结构。" },
  { chapter: 28, type: "transition", intensity: "low-medium", note: "过渡章节，处理新信息，规划下一步。" },
  { chapter: 29, type: "conflict_setup", intensity: "medium", note: "新的冲突铺垫，引入更高层次的敌人。" },
  { chapter: 30, type: "power_breakthrough", intensity: "high", note: "再次突破：境界/技能/身份的质变。" },
  { chapter: 31, type: "world_expansion", intensity: "medium-high", note: "重大世界观扩展：政治格局、派系冲突。" },
  { chapter: 32, type: "mentor_arc", intensity: "medium", note: "导师角色深化：揭示真实动机或背景。" },
  { chapter: 33, type: "escalation", intensity: "medium", note: "冲突升级，敌人更强或威胁更大。" },
  { chapter: 34, type: "power_breakthrough", intensity: "high", note: "重大突破：技能精通或新能力解锁。" },
  { chapter: 35, type: "face_slap", intensity: "medium-high", note: "打脸时刻：展示新实力震慑敌人。" },
  { chapter: 36, type: "loot_gain", intensity: "medium", note: "资源获取：通过战斗或探索获得重要物资。" },
  { chapter: 37, type: "combat_setup", intensity: "medium", note: "重大战斗铺垫：敌人正式宣战或危机逼近。" },
  { chapter: 38, type: "combat", intensity: "high", note: "重大战斗：与强敌正面交锋。" },
  { chapter: 39, type: "face_slap", intensity: "high", note: "打脸高潮：碾压敌人，展示绝对实力差距。" },
  { chapter: 40, type: "loot_gain", intensity: "medium-high", note: "战斗后的丰厚奖励。" },
  { chapter: 41, type: "transition", intensity: "low-medium", note: "过渡章节，消化战斗成果，为下一阶段铺垫。" },
  { chapter: 42, type: "world_expansion", intensity: "medium", note: "世界观扩展：新的势力或规则揭示。" },
  { chapter: 43, type: "conflict_setup", intensity: "medium", note: "新冲突引入，更大规模的威胁。" },
  { chapter: 44, type: "training", intensity: "medium", note: "针对性修炼，为即将到来的战斗做准备。" },
  { chapter: 45, type: "power_breakthrough", intensity: "high", note: "重大突破：进入新境界或解锁新能力。" },
  { chapter: 46, type: "combat", intensity: "high", note: "突破后的实战检验。" },
  { chapter: 47, type: "resource_gathering", intensity: "medium-high", note: "重要资源获取，为下一阶段做准备。" },
  { chapter: 48, type: "world_expansion", intensity: "medium-high", note: "世界观重大扩展：新领土/敌人/盟友。" },
  { chapter: 49, type: "face_slap", intensity: "high", note: "打脸高潮：碾压之前的敌人或挑衅者。" },
  { chapter: 50, type: "climax", intensity: "high", note: "阶段性大高潮：重大胜利、身份揭示、或悬念设置。" },
];

/** Look up pacing beat for a specific chapter (1-50). Returns undefined if chapter > 50. */
function getPacingBeat(chapterNumber: number): PacingBeat | undefined {
  return PACING_BEATS.find(b => b.chapter === chapterNumber);
}

/** Get the arc segment a chapter belongs to. */
function getPacingArc(chapterNumber: number): "ch1_10" | "ch11_20" | "ch21_50" | null {
  if (chapterNumber >= 1 && chapterNumber <= 10) return "ch1_10";
  if (chapterNumber >= 11 && chapterNumber <= 20) return "ch11_20";
  if (chapterNumber >= 21 && chapterNumber <= 50) return "ch21_50";
  return null;
}

const PACING_ARC_GUIDANCE: Record<string, { zh: string; en: string }> = {
  ch1_10: {
    zh: `### Ch1-10 节奏要求（前10章锁住读者）
- **主导节奏**: 2章铺垫→1章爆发
- **高强度爽点**: 前10章至少3个，中+高强度占比≥60%
- **禁止**: 连续3章以上低强度
- **关键窗口**: Ch5-8必须有第一次重大打脸，Ch10必须有世界观扩展
- **金手指**: 必须在Ch1-3内揭示（推荐Ch1-2）`,
    en: `### Ch1-10 Rhythm Requirements (lock readers in first 10 chapters)
- **Dominant rhythm**: 2 chapters setup → 1 chapter explosion
- **High intensity**: At least 3 high-intensity beats in first 10 chapters; medium+ ≥60%
- **Forbidden**: 3+ consecutive low-intensity chapters
- **Key windows**: Major face-slap by Ch5-8, world expansion at Ch10
- **Golden finger**: Must reveal by Ch1-3 (recommended Ch1-2)`,
  },
  ch11_20: {
    zh: `### Ch11-20 节奏要求（第一波高潮群）
- **主导节奏**: 3章铺垫→2章高潮→1章过渡
- **关键窗口**: Ch15-17必须有重大突破，Ch18-20必须有第二波世界扩展
- **金手指深化**: 每2-3章必须展示新用法或升级
- **情感刷新**: 每5-7章刷新读者情感（复仇/同情/盟友）
- **Ch20铁律**: 必须设置强钩子驱动读者进入下一阶段`,
    en: `### Ch11-20 Rhythm Requirements (first climax cluster)
- **Dominant rhythm**: 3 chapters setup → 2 chapters climax → 1 chapter transition
- **Key windows**: Major breakthrough at Ch15-17, second world expansion at Ch18-20
- **Golden finger deepening**: Every 2-3 chapters must show new usage or upgrade
- **Emotional refresh**: Every 5-7 chapters (revenge/sympathy/ally)
- **Ch20 iron rule**: Must set strong cliffhanger for next arc`,
  },
  ch21_50: {
    zh: `### Ch21-50 节奏要求（三峰分布模式）
- **主导节奏**: 5章铺垫→3章高潮→2章过渡
- **突破窗口**: Ch24-26（首次）、Ch34-36（二次）、Ch45-47（三次），间隔约10章
- **打脸窗口**: Ch37-40（首次重大打脸）、Ch47-50（第二次重大打脸）
- **世界扩展波**: Ch31-33（政治格局）、Ch41-43（隐藏势力）、Ch48-50（新领土）
- **资源循环**: 每8-12章完成一个（狩猎→出售→升级）
- **情感刷新**: 每7-10章（盟友支持/系统性压迫/复仇动机）
- **敌人升级**: 本地恶霸→武馆→区域势力→隐藏势力
- **强度分布**: Ch21-30低→中→高，Ch31-40中→高→高，Ch41-50低→中→高`,
    en: `### Ch21-50 Rhythm Requirements (triple-peak distribution)
- **Dominant rhythm**: 5 chapters setup → 3 chapters climax → 2 chapters transition
- **Breakthrough windows**: Ch24-26 (first), Ch34-36 (second), Ch45-47 (third), ~10 chapter intervals
- **Face-slap windows**: Ch37-40 (first major), Ch47-50 (second major)
- **World expansion waves**: Ch31-33 (political), Ch41-43 (hidden forces), Ch48-50 (new territory)
- **Resource cycle**: Every 8-12 chapters (hunt → sell → upgrade)
- **Emotional refresh**: Every 7-10 chapters (ally support / systemic oppression / revenge motivation)
- **Enemy escalation**: Local bully → martial school → regional power → hidden faction
- **Intensity distribution**: Ch21-30 low→med→high, Ch31-40 med→high→high, Ch41-50 low→med→high`,
  },
};

// Anti-patterns to warn about based on chapter number
const PACING_ANTI_PATTERNS: Array<{ range: [number, number]; pattern: string; zh: string; en: string }> = [
  { range: [1, 3], pattern: "delayed_golden_finger", zh: "金手指延迟到Ch4以后！5/5 books在Ch3内揭示。", en: "Golden finger delayed past Ch3! All 5 books reveal by Ch3." },
  { range: [1, 10], pattern: "no_emotional_hook", zh: "开篇缺乏情感共鸣。5/5 books以极端苦难开场。", en: "Opening lacks emotional hook. All 5 books open with extreme suffering." },
  { range: [5, 8], pattern: "missing_major_payoff_by_ch6", zh: "Ch6前无重大爽点！锁住读者的关键时刻。", en: "No major payoff by Ch6! Critical reader-locking moment." },
  { range: [15, 17], pattern: "missing_climax_by_ch17", zh: "Ch15-17无重大突破！第一波高潮群必须交付。", en: "No major breakthrough at Ch15-17! First climax cluster must deliver." },
  { range: [24, 26], pattern: "missing_power_breakthrough_ch24_26", zh: "Ch24-26无新阶段首次突破！读者期待第一个10章有一次重大突破。", en: "No breakthrough at Ch24-26! Readers expect first major breakthrough in new arc." },
  { range: [37, 40], pattern: "missing_face_slap_ch37_40", zh: "Ch37-40无重大打脸高潮！这是锁住中期读者的关键时刻。", en: "No major face-slap at Ch37-40! Critical for retaining mid-arc readers." },
  { range: [45, 47], pattern: "missing_third_breakthrough_ch45_47", zh: "Ch45-47无第三次重大突破！第50章前必须有一次质变。", en: "No third breakthrough at Ch45-47! Must have transformation before Ch50." },
  { range: [49, 50], pattern: "weak_ch50_climax", zh: "Ch50无阶段性大高潮！必须设置强钩子驱动读者继续。", en: "No stage climax at Ch50! Must set strong hook for continuation." },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COMBAT_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 势力影响 | 要求 |
|---|---|---|---|---|---|
| 悬念引入 | 10% | — | — | 主角暗处观察 | 自然引出悬念 |
| 局势升级 | 15% | — | — | 主角行踪暴露 | 冲突预兆 |
| 冲突爆发 | 35%+ | — | — | 主角主动出击 | 战斗展开，主视角清晰 |
| 小高潮 | 15% | 势均力敌→轻伤；险胜→心境波动；碾压局→暴露底牌 | 战胜方获战利品/情报 | 势力格局变化 | — |
| 章末悬念 | 10% | 代价显现 | 额外收获/新目标浮现 | 新势力入场 | 代价+收获构成转折 |
| 回收伏笔 | 可选 | — | 伏笔回收 | — | — |`;

const UPGRADE_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 势力影响 | 要求 |
|---|---|---|---|---|---|
| 悬念引入 | 10% | — | 困境/瓶颈呈现 | 主角资源匮乏 | — |
| 局势升级 | 20% | 寻找契机暴露需求 | 发现突破方向/机缘 | 主角行动引发关注 | — |
| 冲突爆发 | 25% | 心魔/外界干扰 | — | 突破动静惊动敌友 | — |
| 小高潮 | 30%+ | 突破有隐患（根基不稳/心魔残留） | 境界提升/新能力解锁 | 势力格局因主角突破而松动 | 感官细节≥3维 |
| 章末悬念 | 15% | 新困境（代价） | 新机遇（收获） | 新势力介入或旧敌趁虚 | 代价+收获构成转折 |`;

const SCHEME_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 势力影响 | 要求 |
|---|---|---|---|---|---|
| 悬念引入 | 15% | — | 阴谋/阴谋者入场 | 幕后势力浮出水面 | — |
| 局势升级 | 35%+ | 触怒潜在盟友 | 情报获取/识破敌人 | 主角行动触动多方利益 | — |
| 冲突爆发 | 20% | 阴谋部分暴露/陷入被动 | 主角做出关键决定 | 局势因主角决定而倾斜 | — |
| 小高潮 | 10% | 决定带来风险 | 掌握主动权/获得信任 | 关键盟友/势力倒向主角 | — |
| 章末悬念 | 15%+ | 新困境 | 新盟友/新线索 | 势力格局因新变量而变 | 代价+收获构成转折 |`;

const PAYOFF_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 势力影响 | 要求 |
|---|---|---|---|---|---|
| 悬念引入 | 10% | — | 上章钩子入场 | 旧势力再现 | — |
| 局势升级 | 15% | — | 伏笔相关人物/场景入场 | 新势力介入伏笔线 | — |
| 冲突爆发 | 35% | 回收触发连锁反应 | — | 势力关系网因回收而断裂/重塑 | — |
| 小高潮 | 25%+ | 复仇引新敌/真相带来牺牲 | 复仇成功/真相大白/宝物到手 | 主角或盟友付出代价，格局重置 | — |
| 章末悬念 | 15% | 新困境 | 新目标/新机遇 | 代价触发新势力入场 | 代价+收获构成转折 |`;

const TRANSITION_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 势力影响 | 要求 |
|---|---|---|---|---|---|
| 悬念引入 | 15% | — | 承接上章余波 | 平静中暗流涌动 | — |
| 局势升级 | 25% | 暴露弱点 | 关系网铺设/关键信息 | 弱点暴露引发势力关注 | — |
| 冲突爆发 | 20% | 日常冲突 | 误会解开/关系深化 | 势力关系微妙变化 | — |
| 小高潮 | 15% | 和好/误会加深 | 情感升温/意外帮助 | 意外介入的第三方势力 | — |
| 章末悬念 | 20%+ | 意外事件打断平静 | 下章大事件预告 | 意外势力打断平静 | 代价+收获构成转折 |`;

const TRIBULATION_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 势力影响 | 要求 |
|---|---|---|---|---|---|
| 悬念引入 | 15% | — | 劫云聚集/天象异变 | 天象异变引发各方关注 | — |
| 局势升级 | 20% | 道心动摇 | 埋因果伏笔/坚定道心 | 渡劫动静惊动远近势力 | — |
| 冲突爆发 | 30% | 天雷/心魔/外魔三劫连发 | — | 渡劫期主角极度虚弱，势力格局出现真空 | — |
| 小高潮 | 25%+ | 渡劫后极度虚弱 | 道心稳固/天雷淬体/天道认可 | 旧敌趁虚而入，护道势力出手 | 感官细节≥4维 |
| 章末悬念 | 15% | 虚弱期被旧敌/天罚追击 | 护道之物/新机缘显现 | 新势力借机入场 | 代价+收获构成转折 |`;

const ENLIGHTENMENT_BEATS = `| 节拍名称 | 默认占比 | 代价 | 收获 | 势力影响 | 要求 |
|---|---|---|---|---|---|
| 悬念引入 | 15% | — | 修行瓶颈/心境动摇 | 主角修炼状态引发势力关注 | — |
| 局势升级 | 20% | 外出寻机缘暴露行踪 | 偶遇古修遗迹/前辈遗泽 | 主角失踪引发各方搜寻 | — |
| 冲突爆发 | 25% | 悟道中心魔/幻境试炼 | — | 悟道动静引发势力觊觎 | — |
| 小高潮 | 30%+ | 感悟引动旧因果反噬 | 道心提升/新法则感悟/与天道共鸣 | 因果反噬牵动多方势力 | 感官细节≥4维 |
| 章末悬念 | 15% | 新道引动天地异象/旧因果纠缠 | 新能力解锁 | 天地异象引发势力格局震荡 | 代价+收获构成转折 |`;

const BEAT_TABLES: Record<ChapterType, string> = {
  combat: COMBAT_BEATS,
  upgrade: UPGRADE_BEATS,
  scheme: SCHEME_BEATS,
  payoff: PAYOFF_BEATS,
  transition: TRANSITION_BEATS,
  tribulation: TRIBULATION_BEATS,
  enlightenment: ENLIGHTENMENT_BEATS,
};

// ---------------------------------------------------------------------------
// English beat tables
// ---------------------------------------------------------------------------

const EN_COMBAT_BEATS = `| Beat | Default % | Cost | Gain | Faction Impact | Requirement |
|---|---|---|---|---|---|
| Hook Intro | 10% | — | — | Protagonist observes from shadows | Naturally introduce the hook |
| Escalation | 15% | — | — | Protagonist's location exposed | Conflict brewing |
| Conflict Explosion | 35%+ | — | — | Protagonist takes initiative | Battle unfolds, clear POV |
| Mini Climax | 15% | Even match→minor injury; close win→mood swing; stomp→reveals trump card | Victor gains spoils/info | Faction landscape shifts | — |
| Chapter Cliffhanger | 10% | Cost manifests | Extra gain / new goal emerges | New faction enters | Cost + Gain form the turning point |
| Payoff (optional) | — | — | Hook payoff | — | — |`;

const EN_UPGRADE_BEATS = `| Beat | Default % | Cost | Gain | Faction Impact | Requirement |
|---|---|---|---|---|---|
| Hook Intro | 10% | — | Dilemma/bottleneck presented | Protagonist's resources depleted | — |
| Escalation | 20% | Search exposes need | Breakthrough direction/discovery found | Protagonist's actions draw attention | — |
| Conflict Explosion | 25% | Inner demon / external interference | — | Breakthrough stirs enemies and allies | — |
| Mini Climax | 30%+ | Breakthrough carries hidden cost (unstable foundation / residual demon) | Cultivation level up / new ability unlocked | Breakthrough destabilizes faction balance | Sensory details ≥3 dimensions |
| Chapter Cliffhanger | 15% | New dilemma (cost) | New opportunity (gain) | New faction moves in / old rival seizes chance | Cost + Gain form the turning point |`;

const EN_SCHEME_BEATS = `| Beat | Default % | Cost | Gain | Faction Impact | Requirement |
|---|---|---|---|---|---|
| Hook Intro | 15% | — | Conspiracy/conspirator enters | Hidden factions surface | — |
| Escalation | 35%+ | Offends potential ally | Intel gathered / enemy identified | Protagonist's moves affect multiple interests | — |
| Conflict Explosion | 20% | Partial exposure / caught off-guard | Protagonist makes key decision | Situation tilts from protagonist's decision | — |
| Mini Climax | 10% | Decision brings risk | Gains initiative / earns trust | Key ally/faction aligns with protagonist | — |
| Chapter Cliffhanger | 15%+ | New dilemma | New ally / new clue | New variable shifts faction balance | Cost + Gain form the turning point |`;

const EN_PAYOFF_BEATS = `| Beat | Default % | Cost | Gain | Faction Impact | Requirement |
|---|---|---|---|---|---|
| Hook Intro | 10% | — | Previous chapter hook enters | Old faction resurfaces | — |
| Escalation | 15% | — | Hook-related character/scene enters | New faction intervenes in payoff thread | — |
| Conflict Explosion | 35% | Payoff triggers chain reaction | — | Faction network reshapes from payoff | — |
| Mini Climax | 25%+ | Revenge creates new enemy / truth requires sacrifice | Revenge success / truth revealed / treasure obtained | Protagonist or allies pay cost; balance resets | — |
| Chapter Cliffhanger | 15% | New dilemma | New goal / new opportunity | Cost draws new faction in | Cost + Gain form the turning point |`;

const EN_TRANSITION_BEATS = `| Beat | Default % | Cost | Gain | Faction Impact | Requirement |
|---|---|---|---|---|---|
| Hook Intro | 15% | — | Pick up previous chapter's aftermath | Undercurrents beneath the calm | — |
| Escalation | 25% | Weakness exposed | Relationship network laid out / key intel | Weakness draws faction attention | — |
| Conflict Explosion | 20% | Daily conflict | Misunderstanding cleared / bond deepens | Faction relationships subtly shift | — |
| Mini Climax | 15% | Reconciliation / misunderstanding deepens | Emotional warmth / unexpected help | Unexpected third-party intervenes | — |
| Chapter Cliffhanger | 20%+ | Unexpected event disrupts peace | Next chapter's big event teased | Unexpected faction disrupts peace | Cost + Gain form the turning point |`;

const EN_TRIBULATION_BEATS = `| Beat | Default % | Cost | Gain | Faction Impact | Requirement |
|---|---|---|---|---|---|
| Hook Intro | 15% | — | Tribulation clouds gather / celestial signs | Celestial signs alert nearby factions | — |
| Escalation | 20% | Dao heart wavers | Plant causal hook / solidify Dao heart | Tribulation draws faction attention | — |
| Conflict Explosion | 30% | Heavenly thunder / inner demon / outer demon triple strike | — | Weak state creates power vacuum | — |
| Mini Climax | 25%+ | Extremely weakened post-tribulation | Dao heart stabilized / heavenly thunder tempered body / heavenly认可 | Old enemies strike; guardian faction intervenes | Sensory details ≥4 dimensions |
| Chapter Cliffhanger | 15% | Old enemies / heavenly punishment pursue in weakened state | Guardian artifact / new opportunity emerges | New faction seizes the moment | Cost + Gain form the turning point |`;

const EN_ENLIGHTENMENT_BEATS = `| Beat | Default % | Cost | Gain | Faction Impact | Requirement |
|---|---|---|---|---|---|
| Hook Intro | 15% | — | Cultivation bottleneck / mood unstable | Protagonist's cultivation state draws faction interest | — |
| Escalation | 20% | Journey reveals location | Encounter ancient cultivator ruin / predecessor's legacy | Protagonist's disappearance triggers faction search | — |
| Conflict Explosion | 25% | Inner demon / illusion trial during enlightenment | — | Enlightenment stirs faction covetousness | — |
| Mini Climax | 30%+ | Enlightenment triggers old karma backlash | Dao heart elevated / new law comprehension / resonates with heaven | Karma backlash implicates multiple factions | Sensory details ≥4 dimensions |
| Chapter Cliffhanger | 15% | New path triggers celestial phenomenon / old karma entangles | New ability unlocked | Celestial phenomenon shifts faction landscape | Cost + Gain form the turning point |`;

const EN_BEAT_TABLES: Record<ChapterType, string> = {
  combat: EN_COMBAT_BEATS,
  upgrade: EN_UPGRADE_BEATS,
  scheme: EN_SCHEME_BEATS,
  payoff: EN_PAYOFF_BEATS,
  transition: EN_TRANSITION_BEATS,
  tribulation: EN_TRIBULATION_BEATS,
  enlightenment: EN_ENLIGHTENMENT_BEATS,
};

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

function buildSystemPromptZh(): string {
  return `你是一个网文（玄幻/仙侠）章节节拍规划器。

## 核心职责

根据章节意图和全局状态，为当前章节规划节拍（Beat Sheet）。

## 核心规则

1. **自动检测章类**：根据待推进伏笔、情感弧线、卷纲节点、全局状态等上下文，按优先级自动匹配章类
2. **应用正确模板**：7种章类各有专属节拍模板，严格按模板占比规划
3. **章末转折铁律**：每章必须有 代价+收获，格式为：
   - 新困境（代价）+ 新机遇（收获）
4. **衔接上章**：节拍1（悬念引入）必须自然承接上章结尾的情绪与节奏
5. **遵守mustAvoid**：mustAvoid中的元素严禁出现在本章
6. **避免重复**：不要重复近期章节结尾的场景类型（战斗/升级/布局等），也不要重复时间锚点（连续夜晚收尾、连续清晨开头），保持结构和时间多样性
7. **字数容差**：目标字数±10%，节拍占比在合理范围内微调
8. **章尾外部锚点**：最后一段必须包含外部锚点（具体动作/对话/环境细节）。禁止以纯心理活动、情绪声明或模糊预告收尾。节拍5（章末转折）的输出本身应是外部事件

## 章类自动检测（按优先级）

1. pendingHooks 含"渡劫"/"天劫"/"飞升" → tribulation（渡劫章）
2. emotionalArcs 含"道心" → enlightenment（悟道章）
3. 卷纲节点含"战斗"/"大比"/"秘境" → combat（战斗章）
4. 卷纲节点含"布局"/"谋划"/"阴谋" → scheme（布局章）
5. 全局状态有待回收伏笔 → payoff（回收章）
6. pendingHooks 含"突破"/"升级" → upgrade（升级章）
7. 前3章有≥2章是战斗/升级 → transition（过渡章）
8. Default → combat（战斗章）

## 节拍模板

### 战斗章（combat）

${COMBAT_BEATS}

### 升级章（upgrade）

${UPGRADE_BEATS}

### 布局章（scheme）

${SCHEME_BEATS}

### 回收章（payoff）

${PAYOFF_BEATS}

### 过渡章（transition）

${TRANSITION_BEATS}

### 渡劫章（tribulation）

${TRIBULATION_BEATS}

### 悟道章（enlightenment）

${ENLIGHTENMENT_BEATS}

## 番茄爆款节奏模板（来自5本爆款书逆向工程）

以下节奏要求基于对番茄平台5本爆款玄幻/仙侠小说前50章的逆向工程分析（凡骨、聚宝仙盆、从箭术开始修行、凡人仙葫、没钱修什么仙）。节拍规划必须遵守这些窗口要求。

${PACING_ARC_GUIDANCE.ch1_10.zh}

${PACING_ARC_GUIDANCE.ch11_20.zh}

${PACING_ARC_GUIDANCE.ch21_50.zh}

## 输出格式

直接输出 Markdown 节拍表（不含 JSON 包装）：

\`\`\`markdown
# 第{章号}章 节拍规划

**章类**: {检测到的章类}
**目标字数**: {target}字（±10%）

## 节拍表

{节拍表}

## 节拍说明

- **节拍1（悬念引入）**: {承接上章结尾}
- **节拍2（局势升级）**: {说明}
- **节拍3（冲突爆发）**: {说明}
- **节拍4（小高潮）**: {代价} → {收获}
- **节拍5（章末转折）**: {代价} + {收获}
- **{回收伏笔（若有）}**: {说明}

## 伏笔推进

- 待推进伏笔: {来自pendingHooks的钩子列表}
- 本章推进: {推进的伏笔id及推进方式}
- 新伏笔: {若有则列出}
\`\`\`

**重要**：
- 小高潮和章末转折必须包含代价（cost）和收获（gain）两要素
- 章末转折的代价必须是新困境，收获必须是新机遇，两者缺一不可
- 节拍说明要具体（场景/人物/情绪），不要泛泛而谈`;
}

function buildSystemPromptEn(): string {
  return `You are a web novel (fantasy/xianxia) chapter beat planner.

## Core Responsibilities

Based on chapter intent and global state, plan the beat sheet for the current chapter.

## Core Rules

1. **Auto-detect chapter type**: Match chapter type automatically by priority using pending hooks, emotional arcs, volume outline nodes, and global state
2. **Apply correct template**: 7 chapter types each have exclusive beat templates; strictly follow template proportions
3. **Chapter-ending turning point rule (铁律)**: Every chapter must have Cost + Gain, format:
   - New dilemma (cost) + New opportunity (gain)
4. **Connect to previous chapter**: Beat 1 (Hook Intro) must naturally follow the tone and rhythm of the previous chapter's ending
5. **Respect mustAvoid**: Elements in mustAvoid must NOT appear in this chapter
6. **Avoid repetition**: Do not repeat recent chapter-ending scene types (combat/upgrade/scheme etc.) or time-of-day anchors (consecutive night endings, consecutive dawn openings); maintain structural and temporal diversity
7. **Word count tolerance**: Target ±10%, beat proportions may be slightly adjusted within reason

## Chapter Type Detection (by priority)

1. pendingHooks contains "渡劫"/"天劫"/"飞升" → tribulation
2. emotionalArcs contains "道心" → enlightenment
3. Volume outline node contains "战斗"/"大比"/"秘境" → combat
4. Volume outline node contains "布局"/"谋划"/"阴谋" → scheme
5. Global state has pending hooks to pay off → payoff
6. pendingHooks contains "突破"/"升级" → upgrade
7. Previous 3 chapters have ≥2 that are combat/upgrade → transition
8. Default → combat

## Beat Templates

### Combat Chapter (combat)

${EN_COMBAT_BEATS}

### Upgrade Chapter (upgrade)

${EN_UPGRADE_BEATS}

### Scheme Chapter (scheme)

${EN_SCHEME_BEATS}

### Payoff Chapter (payoff)

${EN_PAYOFF_BEATS}

### Transition Chapter (transition)

${EN_TRANSITION_BEATS}

### Tribulation Chapter (tribulation)

${EN_TRIBULATION_BEATS}

### Enlightenment Chapter (enlightenment)

${EN_ENLIGHTENMENT_BEATS}

## Fanqie Bestseller Pacing Template (reverse-engineered from 5 hit novels)

These pacing requirements are based on reverse-engineering the first 50 chapters of 5 bestselling xuanhuan/xianxia novels on the Fanqie platform. Beat planning must follow these window requirements.

${PACING_ARC_GUIDANCE.ch1_10.en}

${PACING_ARC_GUIDANCE.ch11_20.en}

${PACING_ARC_GUIDANCE.ch21_50.en}

## Output Format

Output Markdown beat sheet directly (no JSON wrapper):

\`\`\`markdown
# Chapter {N} Beat Sheet

**Chapter Type**: {detected type}
**Target Word Count**: {target} words (±10%)

## Beat Table

{beat table}

## Beat Notes

- **Beat 1 (Hook Intro)**: {connect to previous chapter ending}
- **Beat 2 (Escalation)**: {description}
- **Beat 3 (Conflict Explosion)**: {description}
- **Beat 4 (Mini Climax)**: {cost} → {gain}
- **Beat 5 (Chapter Cliffhanger)**: {cost} + {gain}
- **{Payoff (if any)}**: {description}

## Hook Advancement

- Hooks to advance: {from pendingHooks list}
- Advanced this chapter: {hook id and method}
- New hooks: {if any}
\`\`\`

**Important**:
- Beat 4 (Mini Climax) and Beat 5 (Chapter Cliffhanger) must each include both cost and gain
- The chapter cliffhanger's cost must be a new dilemma, and gain must be a new opportunity; both are mandatory
- Beat notes should be specific (scene/character/emotion), not vague`;
}

// ---------------------------------------------------------------------------
// User prompt
// ---------------------------------------------------------------------------

function buildUserPromptZh(input: BeatPlannerInput): string {
  const lines: string[] = [];
  const intent = input.intent;

  lines.push(`# 第${input.chapterNumber}章 节拍规划请求`);
  lines.push("");

  // Inject pacing template guidance based on chapter number
  const pacingBeat = getPacingBeat(input.chapterNumber);
  if (pacingBeat) {
    lines.push("## 番茄爆款节奏模板要求（本章）");
    lines.push(`- **推荐节拍类型**: ${pacingBeat.type}`);
    lines.push(`- **推荐强度**: ${pacingBeat.intensity}`);
    lines.push(`- **节奏指导**: ${pacingBeat.note}`);
    lines.push("");
  }

  // Inject anti-pattern warnings
  const relevantWarnings = PACING_ANTI_PATTERNS.filter(
    w => input.chapterNumber >= w.range[0] && input.chapterNumber <= w.range[1]
  );
  if (relevantWarnings.length > 0) {
    lines.push("## ⚠️ 节奏反模式警告（本章范围内）");
    for (const w of relevantWarnings) {
      lines.push(`- **${w.pattern}**: ${w.zh}`);
    }
    lines.push("");
  }

  lines.push("## 章节目标");
  lines.push(intent.goal);
  lines.push("");

  if (intent.outlineNode) {
    lines.push("## 卷纲节点");
    lines.push(intent.outlineNode);
    lines.push("");
  }

  if (intent.mustKeep.length > 0) {
    lines.push("## 必须保留（mustKeep）");
    for (const item of intent.mustKeep) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (intent.mustAvoid.length > 0) {
    lines.push("## 禁止出现（mustAvoid）");
    for (const item of intent.mustAvoid) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (input.lastChapterEnding) {
    lines.push("## 上章结尾（lastChapterEnding）");
    lines.push(input.lastChapterEnding);
    lines.push("");
  }

  if (input.recentEndings.length > 0) {
    lines.push("## 近期章节结尾（recentEndings）");
    for (let i = 0; i < input.recentEndings.length; i++) {
      lines.push(`### 近${i + 1}章`);
      lines.push(input.recentEndings[i]);
    }
    lines.push("");
  }

  if (input.pendingHooks.length > 0) {
    lines.push("## 待推进伏笔（pendingHooks）");
    for (const hook of input.pendingHooks) {
      lines.push(`- **${hook.hookId}** [${hook.type}] [${hook.status}]: ${hook.expectedPayoff}`);
      if (hook.notes) lines.push(`  注: ${hook.notes}`);
    }
    lines.push("");
  }

  lines.push("## 全局状态摘要（currentState）");
  lines.push(input.currentState);
  lines.push("");

  if (input.emotionalArcs) {
    lines.push("## 情感弧线（emotionalArcs）");
    lines.push(input.emotionalArcs);
    lines.push("");
  }

  if (input.genreChapterTypes.length > 0) {
    lines.push("## 题材章类类型（genreChapterTypes）");
    lines.push(input.genreChapterTypes.join(" / "));
    lines.push("");
  }

  if (input.factionLedgerContext) {
    lines.push("## 当前势力状态（来自 FactionLedger）");
    lines.push(`主角当前暴露风险: ${input.factionLedgerContext.exposureRisk}/100`);
    lines.push(`主角人脉/声望: ${input.factionLedgerContext.socialCapital}/100`);
    lines.push(`主要势力: ${input.factionLedgerContext.keyFactions.join("、")}`);
    lines.push("");
  }

  lines.push(`## 目标字数\n- 最低: ${input.wordCount.min}\n- 目标: ${input.wordCount.target}\n- 最高: ${input.wordCount.max}`);
  lines.push("");

  return lines.join("\n");
}

function buildUserPromptEn(input: BeatPlannerInput): string {
  const lines: string[] = [];
  const intent = input.intent;

  lines.push(`# Chapter ${input.chapterNumber} Beat Planning Request`);
  lines.push("");

  // Inject pacing template guidance based on chapter number
  const pacingBeat = getPacingBeat(input.chapterNumber);
  if (pacingBeat) {
    lines.push("## Fanqie Bestseller Pacing Template (this chapter)");
    lines.push(`- **Recommended beat type**: ${pacingBeat.type}`);
    lines.push(`- **Recommended intensity**: ${pacingBeat.intensity}`);
    lines.push(`- **Pacing guidance**: ${pacingBeat.note}`);
    lines.push("");
  }

  // Inject anti-pattern warnings
  const relevantWarnings = PACING_ANTI_PATTERNS.filter(
    w => input.chapterNumber >= w.range[0] && input.chapterNumber <= w.range[1]
  );
  if (relevantWarnings.length > 0) {
    lines.push("## ⚠️ Pacing Anti-Pattern Warnings (this chapter range)");
    for (const w of relevantWarnings) {
      lines.push(`- **${w.pattern}**: ${w.en}`);
    }
    lines.push("");
  }

  lines.push("## Chapter Goal");
  lines.push(intent.goal);
  lines.push("");

  if (intent.outlineNode) {
    lines.push("## Volume Outline Node");
    lines.push(intent.outlineNode);
    lines.push("");
  }

  if (intent.mustKeep.length > 0) {
    lines.push("## Must Keep");
    for (const item of intent.mustKeep) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (intent.mustAvoid.length > 0) {
    lines.push("## Must Avoid");
    for (const item of intent.mustAvoid) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (input.lastChapterEnding) {
    lines.push("## Previous Chapter Ending (lastChapterEnding)");
    lines.push(input.lastChapterEnding);
    lines.push("");
  }

  if (input.recentEndings.length > 0) {
    lines.push("## Recent Chapter Endings (recentEndings)");
    for (let i = 0; i < input.recentEndings.length; i++) {
      lines.push(`### ${i + 1} chapter(s) ago`);
      lines.push(input.recentEndings[i]);
    }
    lines.push("");
  }

  if (input.pendingHooks.length > 0) {
    lines.push("## Pending Hooks (pendingHooks)");
    for (const hook of input.pendingHooks) {
      lines.push(`- **${hook.hookId}** [${hook.type}] [${hook.status}]: ${hook.expectedPayoff}`);
      if (hook.notes) lines.push(`  Note: ${hook.notes}`);
    }
    lines.push("");
  }

  lines.push("## Global State Summary (currentState)");
  lines.push(input.currentState);
  lines.push("");

  if (input.emotionalArcs) {
    lines.push("## Emotional Arcs (emotionalArcs)");
    lines.push(input.emotionalArcs);
    lines.push("");
  }

  if (input.genreChapterTypes.length > 0) {
    lines.push("## Genre Chapter Types (genreChapterTypes)");
    lines.push(input.genreChapterTypes.join(" / "));
    lines.push("");
  }

  if (input.factionLedgerContext) {
    lines.push("## Current Faction Status (from FactionLedger)");
    lines.push(`Protagonist exposure risk: ${input.factionLedgerContext.exposureRisk}/100`);
    lines.push(`Protagonist social capital: ${input.factionLedgerContext.socialCapital}/100`);
    lines.push(`Key factions: ${input.factionLedgerContext.keyFactions.join(", ")}`);
    lines.push("");
  }

  lines.push(`## Target Word Count\n- Minimum: ${input.wordCount.min}\n- Target: ${input.wordCount.target}\n- Maximum: ${input.wordCount.max}`);
  lines.push("");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function buildBeatPlannerSystemPrompt(language: "zh" | "en"): string {
  return language === "en" ? buildSystemPromptEn() : buildSystemPromptZh();
}

export function buildBeatPlannerUserPrompt(input: BeatPlannerInput, language: "zh" | "en"): string {
  return language === "en" ? buildUserPromptEn(input) : buildUserPromptZh(input);
}

/** Get pacing beat recommendation for a specific chapter (1-50). */
export function getPacingBeatForChapter(chapterNumber: number): PacingBeat | undefined {
  return getPacingBeat(chapterNumber);
}

/** Get the pacing arc segment for a chapter. */
export function getPacingArcSegment(chapterNumber: number): "ch1_10" | "ch11_20" | "ch21_50" | null {
  return getPacingArc(chapterNumber);
}

/** Get all pacing beats (for analysis/tooling). */
export function getAllPacingBeats(): readonly PacingBeat[] {
  return PACING_BEATS;
}

/** Get anti-pattern warnings relevant to a chapter. */
export function getPacingAntiPatterns(chapterNumber: number): Array<{ pattern: string; zh: string; en: string }> {
  return PACING_ANTI_PATTERNS
    .filter(w => chapterNumber >= w.range[0] && chapterNumber <= w.range[1])
    .map(({ pattern, zh, en }) => ({ pattern, zh, en }));
}
