# Graph Report - E:/workspace/inkos/packages  (2026-04-08)

## Corpus Check
- 274 files ¡¤ ~202,692 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1245 nodes ¡¤ 1787 edges ¡¤ 199 communities detected
- Extraction: 63% EXTRACTED ¡¤ 37% INFERRED ¡¤ 0% AMBIGUOUS ¡¤ INFERRED: 662 edges (avg confidence: 0.5)
- Token cost: 0 input ¡¤ 0 output

## God Nodes (most connected - your core abstractions)
1. `PipelineRunner` - 70 edges
2. `PlannerAgent` - 40 edges
3. `StateManager` - 32 edges
4. `WriterAgent` - 28 edges
5. `MemoryDB` - 23 edges
6. `Scheduler` - 22 edges
7. `buildWriterSystemPrompt()` - 21 edges
8. `ComposerAgent` - 16 edges
9. `localize()` - 15 edges
10. `ArchitectAgent` - 14 edges

## Surprising Connections (you probably didn't know these)
- `useSSE hook` --feeds_data_to--> `deriveBookActivity selector`  [INFERRED]
  packages/studio/src/hooks/useSSE.ts ¡ú packages/studio/src/store/useBookActivity.ts
- `useApi hook` --implements--> `StudioRun contract`  [INFERRED]
  packages/studio/src/api/useApi.ts ¡ú packages/studio/src/shared/contracts.ts
- `useTheme hook` --semantically_similar_to--> `bookStore atom`  [INFERRED] [semantically similar]
  packages/studio/src/theme/useTheme.ts ¡ú packages/studio/src/store/index.ts
- `useStudioLog hook` --writes_to--> `bookStore atom`  [INFERRED]
  packages/studio/src/hooks/useStudioLog.ts ¡ú packages/studio/src/store/index.ts
- `useSSE hook` --writes_to--> `pipelineStore atom`  [INFERRED]
  packages/studio/src/hooks/useSSE.ts ¡ú packages/studio/src/store/index.ts

## Hyperedges (group relationships)
- **SSE-derived book activity chain** ¡ª use_sse_useSSE, use_sse_SSEMessage, use_sse_STUDIO_SSE_EVENTS, use_book_activity_deriveBookActivity, use_book_activity_useBookActivity, store_bookStore [EXTRACTED 0.90]
- **Typed API client layer** ¡ª use_api_fetchJson, use_api_buildApiUrl, use_api_useApi, shared_contracts_StudioRun, api_contract_WriteChapter, api_contract_ReviseChapter, api_contract_GetBookStatus [EXTRACTED 0.90]
- **Theme preference resolution chain** ¡ª use_theme_Theme, use_theme_useTheme, theme_darkTheme, theme_lightTheme, app_App [EXTRACTED 0.85]

## Communities

### Community 0 - "Analytics & Dashboard"
Cohesion: 0.03
Nodes (23): App(), deriveActiveBookId(), handleCreate(), waitForBookReady(), handleSave(), saveProjectConfig(), handleCreate(), handleEdit() (+15 more)

### Community 1 - "Pipeline Runner"
Cohesion: 0.08
Nodes (1): PipelineRunner

### Community 2 - "UI Components"
Cohesion: 0.06
Nodes (2): findProjectRoot(), loadConfig()

### Community 3 - "Planner Agent"
Cohesion: 0.12
Nodes (1): PlannerAgent

### Community 4 - "State Manager"
Cohesion: 0.12
Nodes (1): StateManager

### Community 5 - "Writer Agent"
Cohesion: 0.14
Nodes (1): WriterAgent

### Community 6 - "LLM Provider"
Cohesion: 0.14
Nodes (25): agentMessagesToAnthropic(), agentMessagesToOpenAIChat(), agentMessagesToResponsesInput(), chatCompletion(), chatCompletionAnthropic(), chatCompletionAnthropicSync(), chatCompletionOpenAIChat(), chatCompletionOpenAIChatSync() (+17 more)

### Community 7 - "State Bootstrap"
Cohesion: 0.19
Nodes (26): appendWarning(), bootstrapStructuredStateFromMarkdown(), deduplicateSummaryRows(), loadDurableArtifactChapterNumbers(), loadJsonIfValid(), loadMarkdownBootstrapState(), loadMarkdownCurrentState(), loadMarkdownHooksState() (+18 more)

### Community 8 - "Memory DB"
Cohesion: 0.1
Nodes (1): MemoryDB

### Community 9 - "Studio API & UI"
Cohesion: 0.1
Nodes (24): GetBookStatus API contract, ReviseChapter API contract, WriteChapter API contract, App root component, BookHeader component, ChapterCard component, PipelineTrace component, usePatches hook (+16 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (1): Scheduler

### Community 11 - "Community 11"
Cohesion: 0.18
Nodes (21): buildAntiAIExamples(), buildBookRulesBody(), buildCharacterPsychologyMethod(), buildCoreRules(), buildCreativeOutputFormat(), buildEmotionalPacingMethod(), buildFullCastTracking(), buildGenreIntro() (+13 more)

### Community 12 - "Community 12"
Cohesion: 0.17
Nodes (19): analyzeLongSpanFatigue(), buildBigrams(), buildChapterTypeIssue(), buildEnglishVarianceBrief(), buildMoodIssue(), buildSentencePatternIssue(), buildTitleIssue(), chooseSceneObligation() (+11 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (12): extractQueryTerms(), extractTermsFromText(), openMemoryDB(), parseVolumeSummariesMarkdown(), readStructuredState(), retrieveMemorySelection(), selectRelevantFacts(), selectRelevantHooks() (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.19
Nodes (17): analyzeParagraphShape(), appendParagraphShapeWarnings(), capitalize(), detectDuplicateTitle(), detectParagraphLengthDrift(), detectParagraphShapeWarnings(), detectTitleCollapse(), extractChineseTitleQualifier() (+9 more)

### Community 15 - "Community 15"
Cohesion: 0.19
Nodes (16): buildGovernedCharacterMatrixWorkingSet(), buildGovernedHookWorkingSet(), buildKey(), collectGovernedCharacterNames(), collectHookAgendaIds(), containsCjk(), escapeRegExp(), extractCharacterCandidatesFromMatrix() (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (15): formatBookCreateCreated(), formatBookCreateCreating(), formatBookCreateFoundationReady(), formatBookCreateLocation(), formatBookCreateNextStep(), formatBookCreateResume(), formatImportCanonComplete(), formatImportCanonStart() (+7 more)

### Community 17 - "Community 17"
Cohesion: 0.19
Nodes (1): ComposerAgent

### Community 18 - "Community 18"
Cohesion: 0.21
Nodes (8): buildDimensionList(), buildDimensionNote(), containsChinese(), ContinuityAuditor, dimensionName(), formatFanficSeverityNote(), joinLocalized(), resolveGenreLabel()

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (3): MockPipelineRunner, MockScheduler, MockStateManager

### Community 20 - "Community 20"
Cohesion: 0.2
Nodes (1): ArchitectAgent

### Community 21 - "Community 21"
Cohesion: 0.2
Nodes (8): normalizeHookId(), parseChapterSummariesMarkdown(), parseCurrentStateFacts(), parseInteger(), parseMarkdownTableRows(), parsePendingHookRow(), parsePendingHooksMarkdown(), parseStrictChapterInteger()

### Community 22 - "Community 22"
Cohesion: 0.23
Nodes (1): RunStore

### Community 23 - "Community 23"
Cohesion: 0.27
Nodes (1): ChapterAnalyzerAgent

### Community 24 - "Community 24"
Cohesion: 0.26
Nodes (12): arbitrateRuntimeStateDeltaHooks(), buildCanonicalHookId(), createCanonicalHook(), extractChineseBigrams(), extractTerms(), isPureRestatement(), mergeCandidateIntoExistingHook(), normalizeText() (+4 more)

### Community 25 - "Community 25"
Cohesion: 0.2
Nodes (12): createStudioServer function, streamSSE helper, AgentTimeline component, agent_completed SSE event, agent_started SSE event, chapter_completed SSE event, chapter_started SSE event, error SSE event (+4 more)

### Community 26 - "Community 26"
Cohesion: 0.31
Nodes (1): LengthNormalizerAgent

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (4): extractBalancedJsonObject(), parseOrIssue(), StateValidatorAgent, validateRuntimeState()

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (1): OptimizePrompts

### Community 29 - "Community 29"
Cohesion: 0.33
Nodes (1): FoundationReviewerAgent

### Community 30 - "Community 30"
Cohesion: 0.27
Nodes (5): buildLengthSpec(), countChapterLength(), resolveLengthCountingMode(), scaleRangeDelta(), stripMarkdownMetadata()

### Community 31 - "Community 31"
Cohesion: 0.2
Nodes (1): FakeMemoryDB

### Community 32 - "Community 32"
Cohesion: 0.42
Nodes (8): defaultChapterTitle(), defaultHooksPlaceholder(), defaultLedgerPlaceholder(), defaultStatePlaceholder(), fallbackExtractContent(), fallbackExtractTitle(), parseCreativeOutput(), parseWriterOutput()

### Community 33 - "Community 33"
Cohesion: 0.25
Nodes (2): escapeTableCell(), renderCurrentStateProjection()

### Community 34 - "Community 34"
Cohesion: 0.39
Nodes (8): extractNames(), filterCharacterMatrix(), filterEmotionalArcs(), filterHooks(), filterSubplots(), filterSummaries(), filterTableRows(), isHeaderRow()

### Community 35 - "Community 35"
Cohesion: 0.29
Nodes (3): FanqieRadarSource, QidianRadarSource, TextRadarSource

### Community 36 - "Community 36"
Cohesion: 0.36
Nodes (5): buildStateDegradedIssues(), buildStateValidationFeedback(), parseStateDegradedReviewNote(), resolveStateDegradedBaseStatus(), retrySettlementAfterValidationFailure()

### Community 37 - "Community 37"
Cohesion: 0.43
Nodes (6): buildRuntimeStateArtifacts(), loadNarrativeMemorySeed(), loadRuntimeStateSnapshot(), loadSnapshotCurrentStateFacts(), readJson(), readJsonOrNull()

### Community 38 - "Community 38"
Cohesion: 0.43
Nodes (6): analyzeChapterCadence(), analyzeMoodPressure(), analyzeScenePressure(), analyzeTitlePressure(), extractTitleTokens(), isHighTensionMood()

### Community 39 - "Community 39"
Cohesion: 0.29
Nodes (2): createAnalyzedOutput(), createWriterOutput()

### Community 40 - "Community 40"
Cohesion: 0.29
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 0.43
Nodes (4): evaluateSqliteMemorySupport(), formatSqliteMemorySupportWarning(), hasNodeSqliteBuiltin(), parseNodeMajor()

### Community 42 - "Community 42"
Cohesion: 0.38
Nodes (2): formatRankingsForPrompt(), RadarAgent

### Community 43 - "Community 43"
Cohesion: 0.43
Nodes (1): ReviserAgent

### Community 44 - "Community 44"
Cohesion: 0.48
Nodes (5): listAvailableGenres(), readBookLanguage(), readBookRules(), readGenreProfile(), tryReadFile()

### Community 45 - "Community 45"
Cohesion: 0.48
Nodes (5): isInvalidPersistedIntentScalar(), loadPersistedPlan(), parseIntentSections(), readIntentList(), readIntentScalar()

### Community 46 - "Community 46"
Cohesion: 0.29
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 0.43
Nodes (4): computeAITellDensity(), computeWordCountAccuracy(), countMatches(), evaluateChapter()

### Community 48 - "Community 48"
Cohesion: 0.52
Nodes (6): applyCurrentStatePatch(), applyHookOps(), applyRuntimeStateDelta(), applySummaryDelta(), mergeDuplicateHookFamily(), preferRicherText()

### Community 49 - "Community 49"
Cohesion: 0.33
Nodes (2): normalizeStoredHook(), normalizeStoredHookStatus()

### Community 50 - "Community 50"
Cohesion: 0.43
Nodes (4): evaluateHookAdmission(), extractChineseBigrams(), extractTerms(), normalizeText()

### Community 51 - "Community 51"
Cohesion: 0.48
Nodes (5): describeHookLifecycle(), inferHookPayoffTiming(), normalizeHookPayoffTiming(), resolveHookPayoffTiming(), resolveHookPhase()

### Community 52 - "Community 52"
Cohesion: 0.6
Nodes (5): containsProgressManipulation(), executeAgentTool(), executeTool(), getSequentialWriteGuardError(), runAgentLoop()

### Community 53 - "Community 53"
Cohesion: 0.47
Nodes (1): ConsolidatorAgent

### Community 54 - "Community 54"
Cohesion: 0.33
Nodes (0): 

### Community 55 - "Community 55"
Cohesion: 0.4
Nodes (2): createValidationResult(), createValidationWarning()

### Community 56 - "Community 56"
Cohesion: 0.4
Nodes (2): buildStudioBookConfig(), normalizeStudioPlatform()

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (0): 

### Community 58 - "Community 58"
Cohesion: 0.6
Nodes (3): printCandidate(), printScoreBar(), printScores()

### Community 59 - "Community 59"
Cohesion: 0.5
Nodes (2): chat(), chatWithSearch()

### Community 60 - "Community 60"
Cohesion: 0.7
Nodes (4): detectAIContent(), detectCustom(), detectGPTZero(), detectOriginality()

### Community 61 - "Community 61"
Cohesion: 0.7
Nodes (4): buildReducedControlBlock(), parseRepairOutput(), readFileSafe(), repairChapterWithWriter()

### Community 62 - "Community 62"
Cohesion: 0.5
Nodes (2): detectAndRewrite(), recordHistory()

### Community 63 - "Community 63"
Cohesion: 0.6
Nodes (3): getLatestRun(), getOptimizationTrajectory(), readHistory()

### Community 64 - "Community 64"
Cohesion: 0.4
Nodes (0): 

### Community 65 - "Community 65"
Cohesion: 0.6
Nodes (3): analyzeHookHealth(), buildPressureDescription(), warning()

### Community 66 - "Community 66"
Cohesion: 0.5
Nodes (0): 

### Community 67 - "Community 67"
Cohesion: 0.5
Nodes (1): FanficCanonImporter

### Community 68 - "Community 68"
Cohesion: 0.5
Nodes (0): 

### Community 69 - "Community 69"
Cohesion: 0.83
Nodes (3): analyzeSensitiveWords(), escapeRegExp(), scanWords()

### Community 70 - "Community 70"
Cohesion: 0.67
Nodes (2): buildSettlerOutputFormat(), buildSettlerSystemPrompt()

### Community 71 - "Community 71"
Cohesion: 0.67
Nodes (2): applyOptimizedRun(), applyWriterParams()

### Community 72 - "Community 72"
Cohesion: 0.83
Nodes (3): inferFallbackTitle(), splitChapters(), stripTrailingLicense()

### Community 73 - "Community 73"
Cohesion: 0.83
Nodes (3): isApiKeyOptionalForEndpoint(), isPrivateIpv4(), loadProjectConfig()

### Community 74 - "Community 74"
Cohesion: 0.83
Nodes (3): buildGovernedMemoryEvidenceBlocks(), renderEvidenceBlock(), renderHookDebtBlock()

### Community 75 - "Community 75"
Cohesion: 0.67
Nodes (2): parseLocalFixPatches(), trimField()

### Community 76 - "Community 76"
Cohesion: 0.5
Nodes (0): 

### Community 77 - "Community 77"
Cohesion: 0.5
Nodes (0): 

### Community 78 - "Community 78"
Cohesion: 0.67
Nodes (2): parseSpotFixPatches(), trimField()

### Community 79 - "Community 79"
Cohesion: 0.5
Nodes (0): 

### Community 80 - "Community 80"
Cohesion: 0.5
Nodes (1): ApiError

### Community 81 - "Community 81"
Cohesion: 0.67
Nodes (2): createStudioServer(), startStudioServer()

### Community 82 - "Community 82"
Cohesion: 0.67
Nodes (0): 

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (2): firstAccessiblePath(), resolveStudioLaunch()

### Community 84 - "Community 84"
Cohesion: 0.67
Nodes (0): 

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (2): extractPackedPackageJson(), packPackage()

### Community 86 - "Community 86"
Cohesion: 0.67
Nodes (0): 

### Community 87 - "Community 87"
Cohesion: 1.0
Nodes (2): parseSettlerDeltaOutput(), stripCodeFence()

### Community 88 - "Community 88"
Cohesion: 0.67
Nodes (0): 

### Community 89 - "Community 89"
Cohesion: 0.67
Nodes (0): 

### Community 90 - "Community 90"
Cohesion: 0.67
Nodes (0): 

### Community 91 - "Community 91"
Cohesion: 1.0
Nodes (2): createAssessment(), createAuditResult()

### Community 92 - "Community 92"
Cohesion: 0.67
Nodes (0): 

### Community 93 - "Community 93"
Cohesion: 0.67
Nodes (0): 

### Community 94 - "Community 94"
Cohesion: 0.67
Nodes (0): 

### Community 95 - "Community 95"
Cohesion: 0.67
Nodes (0): 

### Community 96 - "Community 96"
Cohesion: 0.67
Nodes (0): 

### Community 97 - "Community 97"
Cohesion: 0.67
Nodes (0): 

### Community 98 - "Community 98"
Cohesion: 1.0
Nodes (0): 

### Community 99 - "Community 99"
Cohesion: 1.0
Nodes (0): 

### Community 100 - "Community 100"
Cohesion: 1.0
Nodes (0): 

### Community 101 - "Community 101"
Cohesion: 1.0
Nodes (0): 

### Community 102 - "Community 102"
Cohesion: 1.0
Nodes (0): 

### Community 103 - "Community 103"
Cohesion: 1.0
Nodes (0): 

### Community 104 - "Community 104"
Cohesion: 1.0
Nodes (0): 

### Community 105 - "Community 105"
Cohesion: 1.0
Nodes (0): 

### Community 106 - "Community 106"
Cohesion: 1.0
Nodes (0): 

### Community 107 - "Community 107"
Cohesion: 1.0
Nodes (0): 

### Community 108 - "Community 108"
Cohesion: 1.0
Nodes (0): 

### Community 109 - "Community 109"
Cohesion: 1.0
Nodes (0): 

### Community 110 - "Community 110"
Cohesion: 1.0
Nodes (0): 

### Community 111 - "Community 111"
Cohesion: 1.0
Nodes (0): 

### Community 112 - "Community 112"
Cohesion: 1.0
Nodes (0): 

### Community 113 - "Community 113"
Cohesion: 1.0
Nodes (0): 

### Community 114 - "Community 114"
Cohesion: 1.0
Nodes (0): 

### Community 115 - "Community 115"
Cohesion: 1.0
Nodes (0): 

### Community 116 - "Community 116"
Cohesion: 1.0
Nodes (0): 

### Community 117 - "Community 117"
Cohesion: 1.0
Nodes (0): 

### Community 118 - "Community 118"
Cohesion: 1.0
Nodes (0): 

### Community 119 - "Community 119"
Cohesion: 1.0
Nodes (0): 

### Community 120 - "Community 120"
Cohesion: 1.0
Nodes (0): 

### Community 121 - "Community 121"
Cohesion: 1.0
Nodes (0): 

### Community 122 - "Community 122"
Cohesion: 1.0
Nodes (0): 

### Community 123 - "Community 123"
Cohesion: 1.0
Nodes (0): 

### Community 124 - "Community 124"
Cohesion: 1.0
Nodes (0): 

### Community 125 - "Community 125"
Cohesion: 1.0
Nodes (0): 

### Community 126 - "Community 126"
Cohesion: 1.0
Nodes (0): 

### Community 127 - "Community 127"
Cohesion: 1.0
Nodes (0): 

### Community 128 - "Community 128"
Cohesion: 1.0
Nodes (0): 

### Community 129 - "Community 129"
Cohesion: 1.0
Nodes (0): 

### Community 130 - "Community 130"
Cohesion: 1.0
Nodes (0): 

### Community 131 - "Community 131"
Cohesion: 1.0
Nodes (0): 

### Community 132 - "Community 132"
Cohesion: 1.0
Nodes (0): 

### Community 133 - "Community 133"
Cohesion: 1.0
Nodes (0): 

### Community 134 - "Community 134"
Cohesion: 1.0
Nodes (0): 

### Community 135 - "Community 135"
Cohesion: 1.0
Nodes (0): 

### Community 136 - "Community 136"
Cohesion: 1.0
Nodes (0): 

### Community 137 - "Community 137"
Cohesion: 1.0
Nodes (0): 

### Community 138 - "Community 138"
Cohesion: 1.0
Nodes (0): 

### Community 139 - "Community 139"
Cohesion: 1.0
Nodes (0): 

### Community 140 - "Community 140"
Cohesion: 1.0
Nodes (0): 

### Community 141 - "Community 141"
Cohesion: 1.0
Nodes (0): 

### Community 142 - "Community 142"
Cohesion: 1.0
Nodes (0): 

### Community 143 - "Community 143"
Cohesion: 1.0
Nodes (0): 

### Community 144 - "Community 144"
Cohesion: 1.0
Nodes (0): 

### Community 145 - "Community 145"
Cohesion: 1.0
Nodes (0): 

### Community 146 - "Community 146"
Cohesion: 1.0
Nodes (0): 

### Community 147 - "Community 147"
Cohesion: 1.0
Nodes (0): 

### Community 148 - "Community 148"
Cohesion: 1.0
Nodes (0): 

### Community 149 - "Community 149"
Cohesion: 1.0
Nodes (0): 

### Community 150 - "Community 150"
Cohesion: 1.0
Nodes (0): 

### Community 151 - "Community 151"
Cohesion: 1.0
Nodes (0): 

### Community 152 - "Community 152"
Cohesion: 1.0
Nodes (0): 

### Community 153 - "Community 153"
Cohesion: 1.0
Nodes (0): 

### Community 154 - "Community 154"
Cohesion: 1.0
Nodes (0): 

### Community 155 - "Community 155"
Cohesion: 1.0
Nodes (0): 

### Community 156 - "Community 156"
Cohesion: 1.0
Nodes (0): 

### Community 157 - "Community 157"
Cohesion: 1.0
Nodes (0): 

### Community 158 - "Community 158"
Cohesion: 1.0
Nodes (0): 

### Community 159 - "Community 159"
Cohesion: 1.0
Nodes (0): 

### Community 160 - "Community 160"
Cohesion: 1.0
Nodes (0): 

### Community 161 - "Community 161"
Cohesion: 1.0
Nodes (0): 

### Community 162 - "Community 162"
Cohesion: 1.0
Nodes (0): 

### Community 163 - "Community 163"
Cohesion: 1.0
Nodes (0): 

### Community 164 - "Community 164"
Cohesion: 1.0
Nodes (0): 

### Community 165 - "Community 165"
Cohesion: 1.0
Nodes (0): 

### Community 166 - "Community 166"
Cohesion: 1.0
Nodes (0): 

### Community 167 - "Community 167"
Cohesion: 1.0
Nodes (0): 

### Community 168 - "Community 168"
Cohesion: 1.0
Nodes (0): 

### Community 169 - "Community 169"
Cohesion: 1.0
Nodes (0): 

### Community 170 - "Community 170"
Cohesion: 1.0
Nodes (0): 

### Community 171 - "Community 171"
Cohesion: 1.0
Nodes (0): 

### Community 172 - "Community 172"
Cohesion: 1.0
Nodes (0): 

### Community 173 - "Community 173"
Cohesion: 1.0
Nodes (0): 

### Community 174 - "Community 174"
Cohesion: 1.0
Nodes (0): 

### Community 175 - "Community 175"
Cohesion: 1.0
Nodes (0): 

### Community 176 - "Community 176"
Cohesion: 1.0
Nodes (0): 

### Community 177 - "Community 177"
Cohesion: 1.0
Nodes (0): 

### Community 178 - "Community 178"
Cohesion: 1.0
Nodes (0): 

### Community 179 - "Community 179"
Cohesion: 1.0
Nodes (0): 

### Community 180 - "Community 180"
Cohesion: 1.0
Nodes (0): 

### Community 181 - "Community 181"
Cohesion: 1.0
Nodes (0): 

### Community 182 - "Community 182"
Cohesion: 1.0
Nodes (0): 

### Community 183 - "Community 183"
Cohesion: 1.0
Nodes (0): 

### Community 184 - "Community 184"
Cohesion: 1.0
Nodes (0): 

### Community 185 - "Community 185"
Cohesion: 1.0
Nodes (0): 

### Community 186 - "Community 186"
Cohesion: 1.0
Nodes (0): 

### Community 187 - "Community 187"
Cohesion: 1.0
Nodes (0): 

### Community 188 - "Community 188"
Cohesion: 1.0
Nodes (0): 

### Community 189 - "Community 189"
Cohesion: 1.0
Nodes (0): 

### Community 190 - "Community 190"
Cohesion: 1.0
Nodes (0): 

### Community 191 - "Community 191"
Cohesion: 1.0
Nodes (0): 

### Community 192 - "Community 192"
Cohesion: 1.0
Nodes (0): 

### Community 193 - "Community 193"
Cohesion: 1.0
Nodes (0): 

### Community 194 - "Community 194"
Cohesion: 1.0
Nodes (0): 

### Community 195 - "Community 195"
Cohesion: 1.0
Nodes (0): 

### Community 196 - "Community 196"
Cohesion: 1.0
Nodes (0): 

### Community 197 - "Community 197"
Cohesion: 1.0
Nodes (0): 

### Community 198 - "Community 198"
Cohesion: 1.0
Nodes (1): STUDIO_SSE_EVENTS constant

## Knowledge Gaps
- **18 isolated node(s):** `StudioRun contract`, `STUDIO_SSE_EVENTS constant`, `fetchJson utility`, `buildApiUrl utility`, `useBookActivity hook` (+13 more)
  These have ¡Ü1 connection - possible missing edges or undocumented components.
- **Thin community `Community 98`** (2 nodes): `eval.ts`, `computeChapterScore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 99`** (2 nodes): `export.ts`, `exportEpub()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 100`** (2 nodes): `fanfic.ts`, `readSourceMaterial()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 101`** (2 nodes): `init.ts`, `hasGlobalConfig()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (2 nodes): `review.ts`, `parseBookAndChapter()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 103`** (2 nodes): `ai-tells.ts`, `analyzeAITells()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 104`** (2 nodes): `detection-insights.ts`, `analyzeDetectionInsights()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 105`** (2 nodes): `fanfic-dimensions.ts`, `getFanficDimensionConfig()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 106`** (2 nodes): `settler-parser.ts`, `parseSettlementOutput()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 107`** (2 nodes): `style-analyzer.ts`, `analyzeStyle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 108`** (2 nodes): `book-rules.ts`, `parseBookRules()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (2 nodes): `genre-profile.ts`, `parseGenreProfile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 110`** (2 nodes): `feishu.ts`, `sendFeishu()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 111`** (2 nodes): `telegram.ts`, `sendTelegram()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 112`** (2 nodes): `webhook.ts`, `sendWebhook()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 113`** (2 nodes): `wechat-work.ts`, `sendWechatWork()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 114`** (2 nodes): `chapter-persistence.ts`, `persistChapterArtifacts()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 115`** (2 nodes): `chapter-review-cycle.ts`, `runChapterReviewCycle()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 116`** (2 nodes): `chapter-truth-validation.ts`, `validateChapterTruthPersistence()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 117`** (2 nodes): `cadence-policy.ts`, `resolveCadencePressure()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 118`** (2 nodes): `hook-policy.ts`, `resolveHookVisibilityWindow()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 119`** (2 nodes): `audit-parse.test.ts`, `extractBalancedJson()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 120`** (2 nodes): `hook-agenda.test.ts`, `createHook()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 121`** (2 nodes): `length-normalizer.test.ts`, `createAgent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 122`** (2 nodes): `memory-retrieval.test.ts`, `constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 123`** (2 nodes): `post-write-validator.test.ts`, `findRule()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 124`** (2 nodes): `provider.test.ts`, `captureError()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 125`** (2 nodes): `scheduler.test.ts`, `createConfig()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 126`** (2 nodes): `writer-parser.test.ts`, `callParseOutput()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 127`** (2 nodes): `writer.test.ts`, `createCaptureLogger()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 128`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 129`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 130`** (1 nodes): `audit.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 131`** (1 nodes): `book.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 132`** (1 nodes): `compose.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 133`** (1 nodes): `consolidate.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 134`** (1 nodes): `daemon.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 135`** (1 nodes): `doctor.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 136`** (1 nodes): `draft.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 137`** (1 nodes): `genre.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 138`** (1 nodes): `import.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 139`** (1 nodes): `plan.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 140`** (1 nodes): `revise.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 141`** (1 nodes): `status.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 142`** (1 nodes): `style.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 143`** (1 nodes): `update.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 144`** (1 nodes): `write.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 145`** (1 nodes): `analytics.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 146`** (1 nodes): `daemon.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 147`** (1 nodes): `localization.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 148`** (1 nodes): `progress-text.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 149`** (1 nodes): `runtime-requirements.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 150`** (1 nodes): `studio-runtime.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 151`** (1 nodes): `studio.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 152`** (1 nodes): `chapter.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 153`** (1 nodes): `detection.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 154`** (1 nodes): `input-governance.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 155`** (1 nodes): `length-governance.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 156`** (1 nodes): `project.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 157`** (1 nodes): `runtime-state.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 158`** (1 nodes): `state.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 159`** (1 nodes): `style-profile.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 160`** (1 nodes): `parameter-space.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 161`** (1 nodes): `ai-tells.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 162`** (1 nodes): `architect.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 163`** (1 nodes): `cadence-policy.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 164`** (1 nodes): `chapter-analyzer.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 165`** (1 nodes): `chapter-cadence.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 166`** (1 nodes): `chapter-splitter.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 167`** (1 nodes): `composer.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 168`** (1 nodes): `config-loader.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 169`** (1 nodes): `consolidator.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 170`** (1 nodes): `context-filter.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 171`** (1 nodes): `continuity.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 172`** (1 nodes): `detection-insights.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 173`** (1 nodes): `detection-runner.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 174`** (1 nodes): `detector.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 175`** (1 nodes): `fanfic-dimensions.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 176`** (1 nodes): `fanfic-models.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 177`** (1 nodes): `governed-working-set.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 178`** (1 nodes): `hook-policy.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 179`** (1 nodes): `length-metrics.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 180`** (1 nodes): `local-fix-patches.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 181`** (1 nodes): `logger.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 182`** (1 nodes): `models.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 183`** (1 nodes): `persisted-governed-plan.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 184`** (1 nodes): `pipeline-agent.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 185`** (1 nodes): `planner.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 186`** (1 nodes): `runtime-state-store.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 187`** (1 nodes): `sensitive-words.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 188`** (1 nodes): `settler-delta-parser.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 189`** (1 nodes): `state-projections.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 190`** (1 nodes): `state-reducer.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 191`** (1 nodes): `state-validator-agent.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 192`** (1 nodes): `state-validator.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 193`** (1 nodes): `style-analyzer.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 194`** (1 nodes): `webhook.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 195`** (1 nodes): `writer-prompts.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 196`** (1 nodes): `writer-repair.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 197`** (1 nodes): `contracts.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 198`** (1 nodes): `STUDIO_SSE_EVENTS constant`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What connects `StudioRun contract`, `STUDIO_SSE_EVENTS constant`, `fetchJson utility` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Analytics & Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.03 - nodes in this community are weakly interconnected._
- **Should `Pipeline Runner` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Planner Agent` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `State Manager` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Writer Agent` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._