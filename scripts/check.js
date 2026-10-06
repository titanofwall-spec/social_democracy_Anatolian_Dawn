// Check actual compiled predicates/actions, where Dendry expands quality names.
const fs = require('fs'), path = require('path'), assert = require('assert');
const {spawnSync} = require('child_process');
const acorn = require('acorn');
const root = path.resolve(__dirname, '..');
function stateKeys(source) {
    const keys = new Set();
    const ast = acorn.parse(source, {ecmaVersion:'latest'});
    function visit(node) {
        if (node.type === 'MemberExpression' && node.object.type === 'Identifier' && node.object.name === 'Q') {
            if (!node.computed) keys.add(node.property.name);
            else if (node.property.type === 'Literal' && typeof node.property.value === 'string') keys.add(node.property.value);
        }
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(child => { if (child && child.type) visit(child); });
            else if (value && typeof value === 'object' && value.type) visit(value);
        }
    }
    visit(ast);
    return [...keys];
}
function collect(game) {
    const uses = new Map();
    function inspect(value, location) {
        if (typeof value === 'function') stateKeys('(' + value.toString() + ')').forEach(key => {
            if (!uses.has(key)) uses.set(key, new Set());
            uses.get(key).add(location);
        });
        else if (value && typeof value === 'object') Object.entries(value).forEach(([key, child]) => inspect(child, location + '.' + key));
    }
    inspect(game.scenes, 'scenes');
    ['game.js', 'rules.js', 'cyprus-atilla1.js', 'cyprus-campaign.js', 'data.js'].forEach(file => stateKeys(fs.readFileSync(path.join(root, 'out/html', file), 'utf8')).forEach(key => {
        if (!uses.has(key)) uses.set(key, new Set());
        uses.get(key).add(file);
    }));
    return uses;
}
function unknownKeys(uses, known) { return [...uses.keys()].filter(key => !known.has(key)); }
module.exports = {stateKeys, collect, unknownKeys};
if (require.main === module) {
    const compiler = require('dendrynexus/lib/parsers/compiler.js');
    const files = [];
    function walk(dir) { for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.dry')) files.push({name:path.relative(root, full).replace(/\\/g, '/'), contents:fs.readFileSync(full, 'utf8')});
    }}
    walk(path.join(root, 'source'));
    compiler.compileGame(files, (err, game) => {
        if (err) throw err;
        const known = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, 'state-keys.json'), 'utf8')));
        const uses = collect(game), unknown = unknownKeys(uses, known);
        assert(!unknown.length, 'Unregistered state names:\n' + unknown.map(key => key + ': ' + [...uses.get(key)].join(', ')).join('\n'));
        for (const source of files) {
            for (const match of source.contents.matchAll(/^(?:card-image|face-image):\s*(\S+)\s*$/gm)) {
                assert(fs.existsSync(path.join(root, 'out/html', match[1])), source.name + ': missing ' + match[1]);
            }
        }
        for (const file of ['rules.js', 'cyprus-atilla1.js', 'cyprus-campaign.js', 'game.js', 'data.js', 'd3-linegraph.js']) {
            const result = spawnSync(process.execPath, ['--check', path.join(root, 'out/html', file)], {stdio:'inherit'});
            assert.equal(result.status, 0, 'Syntax check: ' + file);
        }
        const tsc = path.join(path.dirname(require.resolve('typescript/package.json')), 'bin', 'tsc');
        const result = spawnSync(process.execPath, [tsc, '-p', path.join(root, 'tsconfig.rules.json')], {stdio:'inherit'});
        assert.equal(result.status, 0, 'Simulation type checks');
        console.log('PASS: ' + files.length + ' source files, ' + Object.keys(game.scenes).length + ' scenes, registered state names, card images, JavaScript syntax and economy types.');
    });
}
