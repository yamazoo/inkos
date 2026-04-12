# -*- coding: utf-8 -*-
import traceback
import sys, os
sys.path.insert(0, 'E:/workspace/inkos/packages/gepa/src')
os.chdir('E:/workspace/inkos')

OUT = 'C:/Users/86185/AppData/Local/Temp/debug-inkos2.txt'
with open(OUT, 'w', encoding='utf-8') as f:
    try:
        f.write('imports OK\n')
        f.flush()

        from gepa_wrapper.inkos_runner import InkOSRunner
        f.write('InkOSRunner imported\n')
        f.flush()

        book_id = '\u7c7b\u7ed1\u964d\u4e34-\u6211\u5728\u529e\u516c\u5ba4\u5c60boss'
        runner = InkOSRunner('E:/workspace/inkos', book_id)
        f.write('Runner created\n')
        f.flush()

        result = runner.run_pipeline(chapter=35, params={'params': {}, 'candidate_id': 'test'}, timeout=120)
        f.write('Result keys: ' + str(list(result.keys())) + '\n')
        f.write('exit_code: ' + str(result.get('exit_code')) + '\n')
        f.write('audit_pass: ' + str(result.get('audit_pass')) + '\n')
        f.write('aigc_resistance: ' + str(result.get('aigc_resistance')) + '\n')
        f.flush()
        f.write('DONE\n')
    except Exception as e:
        f.write('ERROR: ' + str(type(e).__name__) + ': ' + str(e)[:500] + '\n')
        traceback.print_exc(file=f)
