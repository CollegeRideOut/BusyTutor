import luaparser from 'luaparse'

let code = `
x = -2
`;




export function testInterperter() {
    void code
    let ast = luaparser.parse(code);

    console.log(ast);
}

