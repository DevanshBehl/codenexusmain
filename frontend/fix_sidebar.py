import os
import glob

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    changed = False

    # Replace APPLICATIONS with PROFILE
    if "label: 'APPLICATIONS'" in content:
        content = content.replace("label: 'APPLICATIONS', path: '/student/dashboard'", "label: 'PROFILE', path: '/student/profile'")
        # Handle cases where it might use onClick
        content = content.replace("label: 'APPLICATIONS', onClick: () => navigate('/student/dashboard')", "label: 'PROFILE', onClick: () => window.location.href = '/student/profile'")
        changed = True

    # Fix the map button onClick
    if "sidebarItems.map((item, index) => (" in content and "<button" in content:
        if "onClick={item.onClick" not in content and "onClick={() => window.location.href" not in content:
            # Inject the routing logic into the button mapping
            content = content.replace("<button\n                            key={index}", "<button\n                            key={index}\n                            onClick={() => { if(item.onClick) item.onClick(); else if(item.path) window.location.href=item.path; }}\n")
            changed = True

    if changed:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk('/Users/devanshbehl/Documents/Code/codenexus2/frontend/src/pages'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

