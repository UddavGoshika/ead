const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        if (fs.statSync(dirFile).isDirectory()) {
            filelist = walkSync(dirFile, filelist);
        } else if (dirFile.endsWith('.tsx')) {
            filelist.push(dirFile);
        }
    });
    return filelist;
}

const files = walkSync('src/pages/dashboard');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Fix NavItem import
    content = content.replace(
        /import StaffLayout, { (NavItem) } from '(.*?)';/g,
        "import StaffLayout from '$2';\nimport type { $1 } from '$2';"
    );

    // Fix Column import
    content = content.replace(
        /import { DataTable, (Column) } from '(.*?)';/g,
        "import { DataTable } from '$2';\nimport type { $1 } from '$2';"
    );

    // Fix StaffLayout path in some marketing/support/operations dashboards
    content = content.replace(
        /import StaffLayout from '\.\.\/\.\.\/\.\.\/staff\/shared\/StaffLayout';/g,
        "import StaffLayout from '../../staff/shared/StaffLayout';"
    );
    content = content.replace(
        /import type { NavItem } from '\.\.\/\.\.\/\.\.\/staff\/shared\/StaffLayout';/g,
        "import type { NavItem } from '../../staff/shared/StaffLayout';"
    );

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed:', file);
    }
});
