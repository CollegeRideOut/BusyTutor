import luaparser from 'luaparse'

let code = `
x = 0
i = 1
for i = 1, 3, -1 do
    x = x + 1
end

return x
`;




export function testInterperter() {
    void code
    let ast = luaparser.parse(code);

    console.log(ast);
}

