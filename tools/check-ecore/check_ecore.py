#!/usr/bin/env python3
"""Usage: check_ecore.py <Ecore.ecore>. Regenerates, type-checks merged into the user's workspace layout,
runs runtime checks against an oracle computed from the .ecore XML, prints a checklist report."""
import json, os, re, shutil, subprocess, sys, xml.etree.ElementTree as ET, xml.dom.minidom

ECORE = os.path.abspath(sys.argv[1])
PATCH = os.path.abspath(sys.argv[sys.argv.index('--patch') + 1]) if '--patch' in sys.argv else None
WS = '/home/claude/typemf_workspace'
TOOLS = f'{WS}/tools/check-ecore'
WORKSPACE_ZIP = '/mnt/user-data/uploads/workspace.zip'
RUN, MERGED = '/tmp/check-run', '/tmp/check-ws'
rows = []
def row(id, ok, detail): rows.append((id, ok, detail))
def sh(cmd, cwd=None, timeout=600):
    return subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True, timeout=timeout)

# ---- A1 XML
src = open(ECORE).read()
try:
    xml.dom.minidom.parseString(src); row('xml.wellFormed', True, 'ok')
except Exception as e:
    row('xml.wellFormed', False, str(e)); print_report = True
    for r in rows: print(f"{'PASS' if r[1] else 'FAIL'} {r[0]}: {r[2]}")
    sys.exit(1)

# ---- static checks on the file
for m in re.finditer(r'<details (?!key=)([^/>]*)/?>', src): row('static.detailWithoutKey', False, f'a <details> has no `key` attribute: {m.group(0)[:80]}')
if 'use-type-name' in src: row('static.useTypeName', False, '`use-type-name` is not read by the generator (redundant with the import annotation)')
for m in re.finditer(r'<eOperations name="(\w+)"[^>]*>(.*?)</eOperations>', src, re.S):
    for im in re.finditer(r'<eAnnotations source="https://typemf.dev/generator/import">(.*?)</eAnnotations>', m.group(2), re.S):
        d = dict(re.findall(r'<details key="([^"]*)" value="([^"]*)"', im.group(1)))
        if 'internal-from' not in d and d.get('from', '').startswith('.'):
            row(f'static.bodyImport.{d.get("type")}', None, f'op {m.group(1)}: relative path in `from` (works through the fallback, but `from` is the EXTERNAL specifier; other body imports use `internal-from`)')

# ---- oracle from the XML
root = ET.fromstring(src.encode())
XSI = '{http://www.w3.org/2001/XMLSchema-instance}type'
cls = {}
for c in root.findall('eClassifiers'):
    if c.get(XSI) == 'ecore:EClass':
        sup = [s.split('//')[-1] for s in (c.get('eSuperTypes') or '').split()]
        cls[c.get('name')] = dict(supers=sup, feats=len(c.findall('eStructuralFeatures')), ops=len(c.findall('eOperations')),
                                  names=[f.get('name') for f in c.findall('eStructuralFeatures')])
def all_supers(n, seen=None):
    seen = seen if seen is not None else []
    for s in cls.get(n, {}).get('supers', []):
        if s in cls and s not in seen: seen.append(s); all_supers(s, seen)
    return seen
def all_names(n, seen):
    # EMF order: every supertype's features first (in supertype order), then the class's own
    if n in seen or n not in cls: return []
    seen.add(n)
    return [x for s in cls[n]['supers'] for x in all_names(s, seen)] + cls[n]['names']
exp = {}
for n, c in cls.items():
    sup = all_supers(n)
    exp[n] = dict(allFeatures=c['feats'] + sum(cls[s]['feats'] for s in sup), ownOperations=c['ops'],
                  allOperations=c['ops'] + sum(cls[s]['ops'] for s in sup), allSuperTypes=len(sup),
                  allFeatureNames=all_names(n, set()))

# ---- generate
shutil.rmtree(RUN, ignore_errors=True); os.makedirs(RUN)
shutil.copy(ECORE, f'{RUN}/Ecore.ecore')
json.dump({"ecoreFile": "./Ecore.ecore", "outputDir": "./generated", "templateSet": "typescript", "options": {"generate-ecore": True}}, open(f'{RUN}/typemf-ecore-generator.config.json', 'w'))
sh('npx tsup', cwd=f'{WS}/packages/core'); sh('npx tsup', cwd=f'{WS}/packages/generator')
g = sh(f'node dist/cli.js {RUN}/typemf-ecore-generator.config.json', cwd=f'{WS}/packages/generator')
row('generate', g.returncode == 0, (g.stdout + g.stderr).strip().splitlines()[-1][:150] if (g.stdout + g.stderr).strip() else '')
if g.returncode != 0:
    for r in rows: print(f"{'PASS' if r[1] else 'FAIL'} {r[0]}: {r[2]}")
    sys.exit(1)
GEN = f'{RUN}/generated'

# ---- stubs (static, from the generated code)
stubs = []
for f in sorted(os.listdir(f'{GEN}/impl')):
    L = open(f'{GEN}/impl/{f}').read().split('\n')
    for i, l in enumerate(L):
        m = re.search(r"throw new Error\('(\w+)\.(\w+)\(([^)]*)\) has no `body` annotation", l)
        if m: stubs.append(f'{m.group(1)}.{m.group(2)}')
        m = re.search(r"throw new Error\('(\w+)\.(\w+)\(\) is overloaded and (.*?) - nothing", l)
        if m: stubs.append(f'{m.group(1)}.{m.group(2)} (overloaded: {m.group(3)})')
row('stubs', len(stubs) == 0, f'{len(stubs)} remaining: ' + ', '.join(stubs))

# ---- merge into the user's workspace layout and type-check
shutil.rmtree(MERGED, ignore_errors=True); os.makedirs(MERGED)
sh(f'unzip -o -q {WORKSPACE_ZIP}', cwd=MERGED)
core = f'{MERGED}/packages/core/src/metamodel'
for d in ('impl', 'types', 'util'):
    os.makedirs(f'{core}/{d}', exist_ok=True); sh(f'cp -r {GEN}/{d}/* {core}/{d}/')
sh(f'cp {GEN}/EcorePackage.ts {GEN}/EcoreFactory.ts {core}/')
imp = f'{core}/impl'
for f, a, b in [('DynamicEFactoryImpl.ts', 'import { DynamicEObjectImpl, EFactoryImpl } from "./index.js";', 'import { DynamicEObjectImpl } from "./DynamicEObjectImpl.js";\nimport { EFactoryImpl } from "./EFactoryImpl.js";'),
                ('DynamicEObjectImpl.ts', 'import { BasicEList, EObjectImpl } from "./index.js";', 'import { BasicEList } from "./BasicEList.js";\nimport { EObjectImpl } from "./EObjectImpl.js";'),
                ('BasicEList.ts', 'import { EObjectImpl } from "./index.js";', 'import { EObjectImpl } from "./EObjectImpl.js";'),
                ('EObjectImpl.ts', 'import { BasicEList } from "./index.js";', 'import { BasicEList } from "./BasicEList.js";')]:
    p = f'{imp}/{f}'
    if os.path.exists(p):
        text = open(p).read()  # read BEFORE opening for write (which truncates)
        open(p, 'w').write(text.replace(a, b))
open(f'{core}/types/TypeScriptClass.ts', 'w').write('export type TypeScriptClass<T> = new (...args: any[]) => T;\n')
# Hand-written core files this session's work has touched, not just generated ones - the merge above
# only overlays GENERATED metamodel classes; a change to a foundational hand-written file (like
# EObjectImpl.ts, for the model-generation caching counter) has to be applied here too, or the
# generated code (which now calls EObjectImpl.getModelGeneration()) is checked against a stale core
# that doesn't have it - found the hard way (18 tsc errors, all "does not exist") before adding this.
HAND_WRITTEN_CORE_PATCHES = [
    f'{WS}/packages/core/src/metamodel/impl/EObjectImpl.ts',
    f'{WS}/packages/core/src/metamodel/impl/BasicEList.ts',
    f'{WS}/packages/core/src/metamodel/impl/DynamicEObjectImpl.ts',
    f'{WS}/packages/core/src/metamodel/types/EObject.ts',
    f'{WS}/packages/core/src/metamodel/types/Disposable.ts',
    f'{WS}/packages/core/src/metamodel/types/Notification.ts',
]
for src_path in HAND_WRITTEN_CORE_PATCHES:
    import shutil as _shutil
    dest_dir = imp if '/impl/' in src_path else f'{core}/types'
    _shutil.copy(src_path, f'{dest_dir}/{os.path.basename(src_path)}')
open(f'{core}/types/EEnumerator.ts', 'w').write('export interface EEnumerator {\n  getValue(): number;\n  getName(): string;\n  getLiteral(): string;\n}\n')
open(f'{MERGED}/pnpm-workspace.yaml', 'w').write('packages:\n  - "packages/*"\nonlyBuiltDependencies:\n  - esbuild\n')
if PATCH:  # try-out patches on the GENERATED code: [{"file": "impl/EClassImpl.ts", "old": ..., "new": ...}]
    for p in json.load(open(PATCH)):
        path = f'{core}/{p["file"]}'; text = open(path).read()
        if text.count(p['old']) != 1: row('patch', False, f'{p["file"]}: text to replace found {text.count(p["old"])} times, expected 1')
        else:
            open(path, 'w').write(text.replace(p['old'], p['new'])); row('patch', None, f'applied to {p["file"]} (a try-out: the generator cannot emit this yet)')
sh('pnpm install', cwd=MERGED)
CORE = f'{MERGED}/packages/core'
t = sh('npx tsc -p tsconfig.json --noEmit', cwd=CORE)
errs = [re.sub(r'^src/metamodel/', '', l)[:170] for l in t.stdout.splitlines() if 'error TS' in l]
row('tsc.strict', len(errs) == 0, f'{len(errs)} error(s)' + ('' if not errs else ': ' + ' || '.join(errs[:6])))

# ---- runtime checks
json.dump(exp, open(f'{RUN}/expected.json', 'w'))
shutil.copy(f'{TOOLS}/runtime-checks.test.ts', f'{CORE}/src/runtime-checks.test.ts')
r = subprocess.run('npx vitest run src/runtime-checks.test.ts', shell=True, cwd=CORE, capture_output=True, text=True, env={**os.environ, 'CHECK_EXPECTED': f'{RUN}/expected.json'}, timeout=300)
found = [l for l in (r.stdout + r.stderr).splitlines() if l.startswith('CHECK|')]
if not found: row('runtime', False, 'runtime checks did not run: ' + (r.stdout + r.stderr)[-300:].replace('\n', ' '))
for l in found:
    _, id, st, detail = l.split('|', 3); row('runtime.' + id, st == 'PASS', detail)

# ---- report
print(f"\nChecked {ECORE}\n")
for id, ok, detail in rows:
    print(f"{'PASS' if ok is True else 'FAIL' if ok is False else 'NOTE'}  {id:34} {detail}")
n_fail = sum(1 for r in rows if r[1] is False)
print(f"\n{sum(1 for r in rows if r[1] is True)} passed, {n_fail} failed, {sum(1 for r in rows if r[1] is None)} notes")
