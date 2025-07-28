import luaparser from 'luaparse'

let code = `
if false then return 5 elseif true return 10 end return 20
`;




export function testInterperter() {
    void code
    let ast = luaparser.parse(code);

    console.log(ast);
}

