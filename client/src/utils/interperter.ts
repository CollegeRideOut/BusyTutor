import luaparser from 'luaparse'

let code = `
return 10 + 10
`;




export function testInterperter() {
    void code
    let ast = luaparser.parse(code);

    console.log(ast);
}

