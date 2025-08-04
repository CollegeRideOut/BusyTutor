//import { GoPackageDependencies } from "react-icons/go";
import { createFileRoute } from '@tanstack/react-router'
import { useContext, useEffect, useState, } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext } from '../__root'
import luaparser from 'luaparse'
//import { evalChunk } from '../../utils/interperter_generator/eval_generator'
import { Lua_Environment, } from '../../utils/interperter/lua_types'
//import type { Lua_Object } from '../../utils/interperter/lua_types'
import { Button } from '../../components/ui/button'
import type { Lua_Object_Visualizer } from '../../utils/interperter_generator/generator_types'
import { evalChunk } from '../../utils/interperter_generator/eval_generator'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip'

export const Route = createFileRoute('/arrays/test')({
    component: RouteComponent,
})
function RouteComponent() {
    const [code, setCode] = useState('')
    const [visCode, setVisCode] = useState<ReactNode[]>([])
    const theme = useContext(ThemeContext)
    const [gen, setGen] = useState<ReturnType<typeof evalChunk>>()
    const [visual, setVisual] = useState<Lua_Object_Visualizer[]>([])
    const [ast, setAst] = useState<luaparser.Chunk | null>(null)
    //    const [history, setHistory] = useState<Lua_Object_Visualizer[]>([]);

    useEffect(() => {
        if (!ast) return;
        createVisCode();
    }, [ast, visual])

    function createVisCode() {
        if (!ast) return;
        setVisCode(evalChunkFront(ast, visual))

    }
    return <div
        className="flex flex-col grow"
    >
        <textarea
            onChange={(e) => setCode(e.target.value)}
            value={code}
            className="my-8 mx-8"
            style={{
                background: theme.vals.colors.secondary,
                height: '40%',
                width: '40%'

            }}

        />
        <Button onClick={() => {
            const _ast = luaparser.parse(code, { locations: true })
            setAst(_ast);
            setGen(evalChunk(_ast, new Lua_Environment()))
            //setHistory([]);
        }
        }
        >Crete Generator</Button>

        <Button onClick={() => {
            if (!gen) {
                console.log('no Generator')
                return;
            }
            const val = gen.next();
            if (val.done) {
                setGen(undefined)
            } else {
                if (!val.value) return;
                setVisual([...visual, val.value])
            }
        }
        }
        >Next</Button>

        <Button onClick={() => {
            if (!ast) {
                console.log('no ast')
                return;
            }
            console.log(ast)
            console.log(visual)

        }}
        >print ast</Button>


        <div
            style={{
                border: '1px solid black',
                height: '100%',
                marginTop: 50,
                width: '100%'
            }}
        >
            {visCode}
        </div>
    </div>
}

export function evalChunkFront(
    node: luaparser.Chunk,
    visual: Lua_Object_Visualizer[]
) {

    return evalStatementsArray(node.body, visual);
}

export function evalStatementsArray(
    node: luaparser.Statement[],
    visual: Lua_Object_Visualizer[]
) {
    const vals: ReactNode[] = []
    for (let statement of node) {
        let lua = evalStatements(statement, visual);
        vals.push(lua);;
    }

    return vals;
}

export function evalStatements(
    node: luaparser.Statement,
    visuals: Lua_Object_Visualizer[]
) {

    let id = `${node.loc!.start.line}-${node.loc!.end.line} | ${node.loc!.start.column}-${node.loc!.end.column}`
    let visual = visuals.find((v) => v.id === id);
    void visual;
    switch (node.type) {
        case "ReturnStatement": {
            let vals: ReactNode[] = [];
            for (let exp of node.arguments) {
                vals.push(evalExpression(exp, visuals));
            }
            return (
                <div
                    key={id}
                    className="flex gap-x-1"
                >
                    <Tooltip
                    >
                        <TooltipTrigger>
                            <div>return</div>
                        </TooltipTrigger>
                        <div>{vals}</div>
                        <TooltipContent>
                            <p>return</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            );
        }

        case "IfStatement": {
            let children: ReactNode[] = [];
            for (const clause of node.clauses) {
                children.push(evalClause(clause, visuals));
                //if (obj.kind === "error") return obj;
                //if (t) return obj;
            }
            return (
                <div>
                    {children}
                    end
                </div>
            );
        }
        default: {
            return null;
        }
    }
}

export function evalExpression(
    exp: luaparser.Expression,
    visuals: Lua_Object_Visualizer[],
): ReactNode {

    let id = `${exp.loc!.start.line}-${exp.loc!.end.line} | ${exp.loc!.start.column}-${exp.loc!.end.column}`
    let visual = visuals.find((v) => v.id === id);
    void visual
    switch (exp.type) {
        case "NumericLiteral": {
            return (
                <Tooltip key={id}>
                    <TooltipTrigger>
                        {exp.value}
                    </TooltipTrigger>
                    <TooltipContent>
                        <p># Literal</p>
                    </TooltipContent>
                </Tooltip>
            )
        }
        case "BooleanLiteral": {
            return <div>{String(exp.value)}</div>
        }
        default: {
            return null
        }
    }
}
export function evalClause(
    clause: (luaparser.IfClause | luaparser.ElseifClause | luaparser.ElseClause),
    visuals: Lua_Object_Visualizer[]
) {

    let id = `${clause.loc!.start.line}-${clause.loc!.end.line} | ${clause.loc!.start.column}-${clause.loc!.end.column}`
    switch (clause.type) {
        case "ElseClause": {
            const child = evalStatementsArray(clause.body, visuals)
            return (
                <div
                    key={id}
                    className='ml-8'
                >
                    else
                    {child}
                </div>
            );
        }
        default: {
            let name = clause.type === 'IfClause' ? 'if' : 'elseif';
            let condition = evalExpression(clause.condition, visuals);
            const child = evalStatementsArray(clause.body, visuals)
            return (
                <div
                    key={id}
                >
                    <div
                        className='flex gap-x-1'
                    >
                        {name} {condition} then
                    </div>
                    <div className='pl-8' >
                        {child}
                    </div>
                </div>
            )
        }
    }
}
