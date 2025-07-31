import luaparser from 'luaparse'

let code = `
t = {1}
function t:sound()
    return self[1]
end
return t:sound()
`;




export function testInterperter() {
    void code
    let ast = luaparser.parse(code);

    console.log(ast);
}

