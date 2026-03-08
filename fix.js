const fs = require('fs');

const problems = [
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\page.tsx", "message": "The class `bg-gradient-to-r` can be written as `bg-linear-to-r`", "startLine": 248 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\events\\page.tsx", "message": "The class `bg-gradient-to-r` can be written as `bg-linear-to-r`", "startLine": 246 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\events\\page.tsx", "message": "The class `bg-gradient-to-br` can be written as `bg-linear-to-br`", "startLine": 293 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\groups\\page.tsx", "message": "The class `bg-gradient-to-r` can be written as `bg-linear-to-r`", "startLine": 190 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\groups\\page.tsx", "message": "The class `bg-gradient-to-br` can be written as `bg-linear-to-br`", "startLine": 237 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\messages\\page.tsx", "message": "The class `rounded-[1.5rem]` can be written as `rounded-3xl`", "startLine": 385 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\messages\\page.tsx", "message": "The class `rounded-[1.5rem]` can be written as `rounded-3xl`", "startLine": 386 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\stories\\page.tsx", "message": "The class `flex-shrink-0` can be written as `shrink-0`", "startLine": 195 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\stories\\page.tsx", "message": "The class `flex-shrink-0` can be written as `shrink-0`", "startLine": 201 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\stories\\page.tsx", "message": "The class `flex-shrink-0` can be written as `shrink-0`", "startLine": 213 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\stories\\page.tsx", "message": "The class `bg-gradient-to-tr` can be written as `bg-linear-to-tr`", "startLine": 215 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\stories\\page.tsx", "message": "The class `bg-gradient-to-br` can be written as `bg-linear-to-br`", "startLine": 251 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\stories\\page.tsx", "message": "The class `bg-gradient-to-br` can be written as `bg-linear-to-br`", "startLine": 299 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\stories\\page.tsx", "message": "The class `aspect-[9/16]` can be written as `aspect-9/16`", "startLine": 318 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\app\\community\\stories\\page.tsx", "message": "The class `bg-gradient-to-br` can be written as `bg-linear-to-br`", "startLine": 318 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\components\\admin\\OverviewTab.tsx", "message": "The class `aspect-[16/9]` can be written as `aspect-video`", "startLine": 638 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\components\\dashboard\\VendorAssistant.tsx", "message": "The class `z-[9999]` can be written as `z-9999`", "startLine": 79 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\components\\social\\CommentThread.tsx", "message": "The class `flex-shrink-0` can be written as `shrink-0`", "startLine": 102 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\components\\social\\CommentThread.tsx", "message": "The class `bg-gradient-to-br` can be written as `bg-linear-to-br`", "startLine": 103 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\components\\social\\CommentThread.tsx", "message": "The class `break-words` can be written as `wrap-break-word`", "startLine": 118 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\components\\social\\PostCard.tsx", "message": "The class `bg-gradient-to-br` can be written as `bg-linear-to-br`", "startLine": 99 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\components\\social\\PostComposer.tsx", "message": "The class `bg-gradient-to-br` can be written as `bg-linear-to-br`", "startLine": 89 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\components\\social\\PostComposer.tsx", "message": "The class `bg-gradient-to-br` can be written as `bg-linear-to-br`", "startLine": 142 },
    { "path": "c:\\Users\\Skilli\\Desktop\\island_fund\\web\\src\\components\\social\\PostComposer.tsx", "message": "The class `bg-gradient-to-r` can be written as `bg-linear-to-r`", "startLine": 272 }
];

const changes = {};

problems.forEach(p => {
    const match = p.message.match(/class `([^`]+)` can be written as `([^`]+)`/);
    if (match) {
        if (!changes[p.path]) changes[p.path] = [];
        changes[p.path].push({
            line: p.startLine - 1,
            from: match[1],
            to: match[2]
        });
    }
});

for (const [file, reps] of Object.entries(changes)) {
    try {
        let lines = fs.readFileSync(file, 'utf8').split('\n');
        for (const rep of reps) {
            lines[rep.line] = lines[rep.line].replace(rep.from, rep.to);
        }
        fs.writeFileSync(file, lines.join('\n'));
        console.log(`Updated ${file}`);
    } catch (e) {
        console.error(`Error processing ${file}: ${e.message}`);
    }
}
