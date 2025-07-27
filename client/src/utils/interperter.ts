import luaparser from 'luaparse'

let code = `
x = true
`;

export function testInterperter() {
    void code
    let ast = luaparser.parse(code);
    console.log(ast);
}

