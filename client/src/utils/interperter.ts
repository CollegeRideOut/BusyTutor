import luaparser from 'luaparse'

let code = `
return 1 // 2
`;




export function testInterperter() {
    void code
    let ast = luaparser.parse(code);

    console.log(ast);
}

