import luaparser from 'luaparse';

let code = `
function g(b, ...)
  local x = ...
  return x
end
return g(10, 20, 30)
`;

export function testInterperter() {
  void code;
  let ast = luaparser.parse(code);

  console.log(ast);
}
