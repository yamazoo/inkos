# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, 'packages/gepa/src')
os.chdir('E:/workspace/inkos')

from gepa_wrapper.inkos_runner import InkOSRunner
from gepa_wrapper.evaluator import InkOSEvaluator, MultiObjectiveScorer

book_id = '\u7c7b\u7ed1\u964d\u4e34-\u6211\u5728\u529e\u516c\u5ba4\u5c60boss'
runner = InkOSRunner('E:/workspace/inkos', book_id)
scorer = MultiObjectiveScorer()

seed_params = {
    'continuity__critical_threshold': 0,
    'continuity__info_boundary_weight': 0.7,
    'continuity__ooc_strictness': 0.7,
    'continuity__pacing_weight': 0.6,
    'continuity__power_scaling_weight': 0.6,
    'continuity__warning_threshold': 5,
    'settler__enforce_ledger_verification': 1,
    'settler__over_extract_bias': 0.7,
    'settler__settler_temperature': 0.2,
    'writer__disable_analysis_terms': 1,
    'writer__enforce_golden_chapters': 1,
    'writer__enforce_sensory_details': 1,
    'writer__length_hard_tolerance_pct': 0.2,
    'writer__length_soft_tolerance_pct': 0.1,
    'writer__max_consecutive_dialogue_paragraphs': 4,
    'writer__max_hedge_words_per_chapter': 3,
    'writer__max_transition_markers_per_3k': 1,
    'writer__paragraph_uniformity_cv_threshold': 0.15,
    'writer__writer_temperature_creative': 0.7,
    'writer__writer_temperature_settlement': 0.3,
}

params = {'params': seed_params, 'candidate_id': 'test_seed'}

with open('C:/Users/86185/AppData/Local/Temp/debug-inkos-result.txt', 'w', encoding='utf-8') as f:
    f.write('Starting test\n')
    f.flush()

    f.write('Running pipeline on ch 35...\n')
    f.flush()

    result = runner.run_pipeline(chapter=35, params=params, timeout=300)

    f.write('RESULT keys: ' + str(list(result.keys())) + '\n')
    f.write('exit_code: ' + str(result.get('exit_code')) + '\n')
    f.write('audit_pass: ' + str(result.get('audit_pass')) + '\n')
    f.write('aigc_resistance: ' + str(result.get('aigc_resistance')) + '\n')
    f.write('wordcount_deviation_pct: ' + str(result.get('wordcount_deviation_pct')) + '\n')
    f.write('ai_tell_density: ' + str(result.get('ai_tell_density')) + '\n')
    stdout_tail = result.get('stdout_tail', '') or ''
    stderr_tail = result.get('stderr_tail', '') or ''
    f.write('stdout_tail: ' + repr(stdout_tail[:300]) + '\n')
    f.write('stderr_tail: ' + repr(stderr_tail[:300]) + '\n')
    f.flush()

    f.write('Running evaluator on [35]...\n')
    f.flush()

    evaluator = InkOSEvaluator(runner, [35], scorer)
    eval_result = evaluator(seed_params)
    f.write('Evaluator result: ' + str(eval_result) + '\n')
    f.flush()
    f.write('DONE\n')
