const fs = require('fs');
const glob = require('glob');

const files = glob.sync('/Users/devanshbehl/Documents/Code/codenexus2/frontend/src/pages/**/*.tsx');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Fix 1: Change "APPLICATIONS" to "PROFILE" and update path
    if (content.includes("label: 'APPLICATIONS'")) {
        content = content.replace(/label:\s*'APPLICATIONS',\s*path:\s*'\/[a-z]+\/dashboard'/g, "label: 'PROFILE', path: '/student/profile'");
        content = content.replace(/label:\s*'APPLICATIONS',\s*onClick:\s*\(\)\s*=>\s*navigate\('\/student\/dashboard'\)/g, "label: 'PROFILE', onClick: () => navigate('/student/profile')");
        changed = true;
    }
    
    // Fix 2: Check if button map exists without onClick and fix it.
    if (content.includes("sidebarItems.map((item, index) => (") && content.includes("<button\n") && !content.includes("onClick={item.onClick || (() => item.path && navigate(item.path))}")) {
        // We need to inject onClick handler into the button, and ensure 'navigate' is imported/used.
        // We'll insert onClick right after key={index}
        content = content.replace(/<button\s*key=\{index\}\s*className=/g, "<button\n                            key={index}\n                            onClick={item.onClick || (() => item.path ? navigate(item.path) : window.location.href = item.path)}\n                            className=");
        changed = true;
    }

    if (changed) {
        // Make sure navigate is available if we use it, but since they are pages they likely import useNavigate or we can just use window.location.href as fallback
        content = content.replace(/onClick=\{item\.onClick \|\| \(\(\) => item\.path \? navigate\(item\.path\) : window\.location\.href = item\.path\)\}/g, "onClick={item.onClick || (() => { if(item.path) { try { navigate(item.path) } catch(e) { window.location.href = item.path } } })}")
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed:', file);
    }
});
