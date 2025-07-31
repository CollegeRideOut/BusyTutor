import luaparser from 'luaparse'

let code = `
x = {1, 2, 3, 4}
x.2
`;




export function testInterperter() {
    void code
    let ast = luaparser.parse(code);

    console.log(ast);
}

