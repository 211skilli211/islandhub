#!/usr/bin/env python3
"""Fix Turbopack-blocking issues in islandhub-v2 JSX/TSX files.

1. Remove JSX comments {/* ... */} between sibling elements (inline)
2. Replace bullet chars (•) with hyphen-dash equivalent
3. Replace middle dots (·) with regular dot or dash
"""
import os
import re

ROOT = "web/src"
js_comment_pattern = re.compile(r'\{/\*.*?\*/}', re.DOTALL)
bullet_char = '•'
middledot_char = '·'

stats = {"files_scanned": 0, "files_changed": 0, "comments_removed": 0, "bullets_replaced": 0, "middledots_replaced": 0}

exts = {'.tsx', '.ts', '.jsx', '.js'}

for dirpath, dirnames, filenames in os.walk(ROOT):
    # skip node_modules and .next
    dirnames[:] = [d for d in dirnames if d not in ('node_modules', '.next', '__tests__')]
    for fn in filenames:
        if os.path.splitext(fn)[1] not in exts:
            continue
        stats["files_scanned"] += 1
        fpath = os.path.join(dirpath, fn)
        with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
            original = f.read()
        
        content = original
        changed = False
        
        # 1. Remove JSX comments (only between siblings — not inside JSX expressions)
        comments = js_comment_pattern.findall(content)
        if comments:
            content = js_comment_pattern.sub('', content)
            stats["comments_removed"] += len(comments)
            changed = True
        
        # 2. Replace bullet chars → ' - '
        if bullet_char in content:
            count = content.count(bullet_char)
            content = content.replace(bullet_char, '-')
            stats["bullets_replaced"] += count
            changed = True
        
        # 3. Replace middle dots → '.'
        if middledot_char in content:
            count = content.count(middledot_char)
            content = content.replace(middledot_char, '.')
            stats["middledots_replaced"] += count
            changed = True
        
        if changed:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            stats["files_changed"] += 1

print(f"Scanned: {stats['files_scanned']} files")
print(f"Changed: {stats['files_changed']} files")
print(f"JSX comments removed: {stats['comments_removed']}")
print(f"Bullets replaced: {stats['bullets_replaced']}")
print(f"Middle dots replaced: {stats['middledots_replaced']}")
print(f"Total fixes: {stats['comments_removed'] + stats['bullets_replaced'] + stats['middledots_replaced']}")
