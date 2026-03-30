import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    changed = False

    # Fix: APPLICATIONS to PROFILE in the sidebar list
    # regex matches: { icon: FileText, label: 'APPLICATIONS', path: '/student/dashboard' }
    if "'APPLICATIONS'" in content:
        content = re.sub(r"label:\s*'APPLICATIONS',\s*path:\s*'\/student\/dashboard'", r"label: 'PROFILE', path: '/student/profile'", content)
        content = re.sub(r"label:\s*'APPLICATIONS',\s*onClick:\s*\(\)\s*=>\s*navigate\('([^']+)'\)", r"label: 'PROFILE', onClick: () => navigate('/student/profile')", content)
        content = re.sub(r"label:\s*'APPLICATIONS',\s*onClick:\s*\(\)\s*=>\s*window\.location\.href\s*=\s*'([^']+)'", r"label: 'PROFILE', onClick: () => window.location.href = '/student/profile'", content)
        
    # Fix: Add onClick to the button inside the map
    if "sidebarItems.map" in content and "<button" in content:
        # Find the button right after sidebarItems.map
        # We look for <button\s+key={index}
        # and manually inject onClick if not present
        if " onClick=" not in content.split("sidebarItems.map")[1][:200]:
            content = re.sub(r"(<button\s+key=\{index\})", r"\1 onClick={() => { if(item.onClick) item.onClick(); else if(item.path) window.location.href=item.path; }}", content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk('/Users/devanshbehl/Documents/Code/codenexus2/frontend/src/pages'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

