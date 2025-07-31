import luaparser from 'luaparse'

let code = `
x = { name = 1 }
x[2] = '2'
return x['name']
`;




export function testInterperter() {
    void code
    let ast = luaparser.parse(code);

    console.log(ast);
}

