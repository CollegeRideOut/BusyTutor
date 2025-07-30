import luaparser from 'luaparse'

let code = `
x = 'hello'
x = "hello"
x = [[=
    hello
]]
`;




export function testInterperter() {
    void code
    let ast = luaparser.parse(code);

    console.log(ast);
}

