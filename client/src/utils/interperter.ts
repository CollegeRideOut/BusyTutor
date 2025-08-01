import luaparser from "luaparse";

let code = `
local obj = {} 
obj.name = 'a'
return 'a' 
`;

export function testInterperter() {
    void code;
    let ast = luaparser.parse(code);

    console.log(ast);
}
