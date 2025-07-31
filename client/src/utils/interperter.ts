import luaparser from 'luaparse'

let code = `

-- Define the "class"
Person = {}
Person.__index = Person

-- Constructor
function Person:new(name)
    local obj = setmetatable({}, self)
    obj.name = name
    return obj
end

-- Method
function Person:greet()
    print("Hello, my name is " .. self.name)
end

-- Create an object
local p = Person:new("Alice")
p:greet()
`;




export function testInterperter() {
    void code
    let ast = luaparser.parse(code);

    console.log(ast);
}

