//import { GoPackageDependencies } from "react-icons/go";
import { createFileRoute } from '@tanstack/react-router'
import { useContext, useEffect, useRef, useState, } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext } from '../__root'
import luaparser from 'luaparse'
//import { evalChunk } from '../../utils/interperter_generator/eval_generator'
import { Lua_Environment, Lua_Table, } from '../../utils/interperter/lua_types'
//import type { Lua_Object } from '../../utils/interperter/lua_types'
import { Button } from '../../components/ui/button'
import type { Lua_Object_Visualizer } from '../../utils/interperter_generator/generator_types'
import { evalChunk, Lua_Global_Environment, setGLobalEnvironmentGenerator } from '../../utils/interperter_generator/eval_generator'
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip'
import { parseLongString } from '../../utils/interperter/eval'

export const Route = createFileRoute('/arrays/test')({
    component: RouteComponent,
})
function RouteComponent() {
    const [code, setCode] = useState('')
    const [visCode, setVisCode] = useState<ReactNode[]>([])
    const theme = useContext(ThemeContext)
    const [gen, setGen] = useState<ReturnType<typeof evalChunk>>()
    const [visual, setVisual] = useState<Lua_Object_Visualizer[]>([])
    const [envVisual, setEnviVisual] = useState<Lua_Object_Visualizer[]>([])
    const [ast, setAst] = useState<luaparser.Chunk | null>(null)
    const [environment, setEnvironment] = useState<Lua_Environment | null>(null)
    const [globalEnvironment, setGlobalEnvironment] = useState<Lua_Environment | null>(null)
    const [visualEnvironment, setVisualEnvironment] = useState<ReactNode[]>([]);
    const [visualGlobalEnvironment, setVisualGlobalEnvironment] = useState<ReactNode[]>([])
    const visualEnvironmentRef = useRef<Map<string, HTMLElement>>(new Map());
    const [svg, setSvg] = useState<ReactNode>(null);
    //    const [history, setHistory] = useState<Lua_Object_Visualizer[]>([]);

    useEffect(() => {
        if (!ast) return;
        createVisCode();

    }, [ast, visual])
    useEffect(() => {
        if (!environment) return;
        setVisualEnvironment(environmentVisual(environment, visualEnvironmentRef))
    }, [environment])

    useEffect(() => {
        if (!globalEnvironment) return;
        setVisualGlobalEnvironment(environmentVisual(globalEnvironment, visualEnvironmentRef))
    }, [globalEnvironment])
    useEffect(() => {
        if (!envVisual) return;
        if(envVisual.length < 2) return;
        console.log('hello', envVisual)
        const rect2 = visualEnvironmentRef.current.get(envVisual[1].indexer!.name)!.getBoundingClientRect()
        const rect1 = visualEnvironmentRef.current.get(envVisual[1].identifier!.value)!.getBoundingClientRect()
        const coords = {
            x1: rect1.left ,
            y1: rect1.top  ,
            x2: rect2.left ,
            y2: rect2.top 
        }



        setSvg(
            <svg
                style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
                width={window.innerWidth}
                height={window.innerHeight}
            >
                <line
                    x1={coords.x1}
                    y1={coords.y1}
                    x2={coords.x2}
                    y2={coords.y2}
                    stroke="red"
                    strokeWidth={2}
                />
            </svg>
        )

    }, [envVisual])

    function createVisCode() {
        if (!ast) return;
        setVisCode(evalChunkFront(ast, visual))

    }
    return <div
        className="flex grow w-full"
    >
        <div
            className="flex flex-col w-1/2"
        >
            {!gen ? <textarea
                onChange={(e) => setCode(e.target.value)}
                value={code}
                className="flex flex-col w-4/5 h-4/5"
                style={{
                    background: theme.vals.colors.secondary,
                }}
            /> :
                (
                    <div
                        className="flex flex-col w-4/5 h-full"
                        style={{
                            border: '1px solid black',
                            height: '100%',
                            marginTop: 50,
                            width: '100%'
                        }}
                    >
                        {visCode}
                    </div>
                )
            }
            <Button onClick={() => {
                const _ast = luaparser.parse(code, { locations: true })
                setAst(_ast);
                let env = new Lua_Environment()
                let globalEnvironment = new Lua_Environment();
                setEnvironment(env);
                setGLobalEnvironmentGenerator(globalEnvironment);
                setGlobalEnvironment(globalEnvironment);
                setGen(evalChunk(_ast, env));
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
                    //if (!val.value) return;
                    //setVisual([...visual, val.value])
                    //
                    let v = val.value[1]

                    let visual = val.value[0]
                    if (visual) {
                        if (visual.identifier && visual.indexer) {
                            setEnviVisual([...envVisual, visual])
                            console.log('env visual hapened')
                        }
                    }
                    setEnvironment(JSON.parse(JSON.stringify(v, replacer), reviver) as Lua_Environment)
                    setGlobalEnvironment(JSON.parse(JSON.stringify(Lua_Global_Environment, replacer), reviver) as Lua_Environment)
                }
                //console.log('hello', environement!.store);

            }
            }
            >Next</Button>

            <Button onClick={() => {
                setAst(null)
                setVisCode([])
                setGen(undefined);

            }}
            >reset</Button>

            <Button onClick={() => {
                if (!ast) {
                    console.log('no ast')
                    return;
                }
                console.log(ast)
                console.log(visual)
                console.log(envVisual)

            }}
            >print ast</Button>

        </div>


        <div
            className="flex flex-col w-1/2"
        >
            <div
                style={{
                    border: '1px solid black',
                    height: '100%',
                    marginTop: 50,
                    width: '100%'
                }}
            >
                <div>
                    global
                    {
                        visualGlobalEnvironment
                    }

                </div>

                <div>
                    local
                    {
                        visualEnvironment
                    }

                </div>
            </div>
        </div>
        {svg}
    </div>
}
function environmentVisual(env: Lua_Environment, ref: React.RefObject<Map<string, HTMLElement>>) {
    if (!env) return [];
    if (!env.store) return [];
    let rc = [...env.store.entries()].map(([identifier, obj]) => {
        switch (obj.kind) {
            case 'string':
            case 'number':
            case 'boolean': {
                return <div
                    ref={(el) => { el && ref.current.set(identifier, el) }}
                >{identifier} {String(obj.value)}</div>
            }
            case 'table': {
                return <div
                    ref={(el) => { el && ref.current.set(identifier, el) }}
                >{identifier} {tableVisualizer(obj, ref)}</div>
            }
            case 'return':
            case 'error':
            case 'null':
            case 'builtin':
            case 'function': {
                return <div>{identifier} {obj.kind}</div>
            }
        }
    })
    return rc;

}
export function tableVisualizer(t: Lua_Table, ref: React.RefObject<Map<string, HTMLElement>>) {
    let rc = [...t.store.entries()].map(([key, obj]) => {
        let key_s = ''
        if (typeof key === 'string') key_s = key;
        else if (typeof key === 'number') key_s = String(key);
        else key_s = key.id;

        switch (obj.kind) {
            case 'string':
            case 'number':
            case 'boolean': {

                return (
                    <div
                        className="flex gap-x-2"
                        ref={(el) => { el && ref.current.set(obj.id, el) }}
                    >
                        {key.toString()}:{obj.value}
                    </div>)
            }
            case 'function': {
                return (
                    <div
                        className="flex gap-x-2"
                        ref={(el) => { el && ref.current.set(obj.id, el) }}
                    >
                        {key.toString()}:{obj.kind}
                    </div>
                )
            }
            case 'table': {
                return (
                    <div
                        className="flex gap-x-2"
                        ref={(el) => { el && ref.current.set(obj.id, el) }}

                    >
                        {key.toString()}: {tableVisualizer(obj, ref)}
                    </div>
                );
            }
            case 'return':
            case 'error':
            case 'null':
            case 'builtin': {
                return null
            }
            default: {
                return <div></div>
            }
        }
    })
    return (
        <div
            className="flex gap-x-2"
        >
            {...rc}
        </div>
    )
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
    //let visual = visuals.find((v) => v.id === id);
    //void visual;
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
                <div
                    key={id}
                >
                    {children}
                    end
                </div>
            );
        }
        case 'LocalStatement': {
            let vals: ReactNode[] = [];
            for (let v of node.init) {
                vals.push(evalExpression(v, visuals))
            }


            let variables: ReactNode[] = [];

            for (let i = 0; i < node.variables.length; i++) {
                let x = node.variables[i]
                const curr_var = evalAssignment(x, visuals);
                variables.push(curr_var);
            }

            return (
                <div
                    key={id}
                    className="flex gap-x-1"
                >
                    <div >local</div> {variables} = {vals}
                </div>
            );
        }
        case 'AssignmentStatement': {
            let vals: ReactNode[] = [];
            for (let v of node.init) {
                vals.push(evalExpression(v, visuals));
            }

            let variables: ReactNode[] = [];
            for (let i = 0; i < node.variables.length; i++) {
                variables.push(evalAssignment(node.variables[i], visuals))
            }

            return (
                <div
                    key={id}
                    className="flex gap-x-1"
                >
                    {variables} = {vals}
                </div>
            );
        }


        case 'CallStatement': {
            let obj = evalExpression(node.expression, visuals);
            return obj;
        }

        case 'FunctionDeclaration': {
            let identfier: ReactNode = null
            if (node.identifier) {
                identfier = evalAssignment(node.identifier, visuals);
            }
            let params: ReactNode[] = []
            for (let x of node.parameters) {
                params.push(evalExpression(x, visuals))
            }
            let body: ReactNode[] = [];
            for (let x of node.body) {
                body.push(evalStatements(x, visuals));
            }

            return (
                <div
                    key={id}
                >
                    <div className="flex">function {identfier}({params})</div>
                    <div className="pl-8">{body}</div>
                    end

                </div>
            );


        }
        case 'ForNumericStatement': {
            let start = evalExpression(node.start, visuals);
            let obj = evalAssignment(node.variable, visuals);
            let end = evalExpression(node.end, visuals);
            let step: ReactNode = null
            if (node.step) {
                step = evalExpression(node.step, visuals)
            }
            const body = evalStatementsArray(node.body, visuals);
            return (
                <div
                    key={id}
                >
                    <div className="flex gap-x-0.5">for {obj} = {start}, {end} {step ? <>, {step}</> : null} do</div>
                    <div className="pl-8">{body}</div>
                    end
                </div>
            );

        }

        case 'LabelStatement':
        case 'BreakStatement':
        case 'GotoStatement':
        case 'WhileStatement':
        case 'DoStatement':
        case 'RepeatStatement':
        case 'ForGenericStatement':
        default: {
            return <div key={id}>NOT yet IMPLEMENTED {node.type}</div>;
        }
    }
}

export function evalExpression(
    exp: luaparser.Expression,
    visuals: Lua_Object_Visualizer[],
): ReactNode {

    let id = `${exp.loc!.start.line}-${exp.loc!.end.line} | ${exp.loc!.start.column}-${exp.loc!.end.column}`
    //let visual = visuals.find((v) => v.id === id);
    //void visual
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
            return <div key={id}>{String(exp.value)}</div>
        }
        case 'NilLiteral': {
            return <div key={id}>nil</div>
        }
        case 'UnaryExpression': {
            const arg = evalExpression(exp.argument, visuals);
            return (
                <div
                    key={id}
                    className="flex gap-x-1"
                >
                    {exp.operator}{arg}
                </div>
            )
        }
        case 'BinaryExpression': {
            let left = evalExpression(exp.left, visuals);
            let right = evalExpression(exp.right, visuals);
            return (
                <div
                    key={id}
                    className="flex gap-x-1"

                >
                    {left}{exp.operator} {right}
                </div>
            )
        }
        case 'Identifier': {
            return <div key={id}>{exp.name}</div>
        }
        case 'CallExpression': {
            let func = evalExpression(exp.base, visuals);
            const args: ReactNode[] = [];
            for (let a of exp.arguments) {
                const arg = evalExpression(a, visuals);
                args.push(arg);
            }

            return (
                <div
                    key={id}
                    className="flex gap-x-1"
                >
                    {func}({args})
                </div>
            )
        }
        case 'FunctionDeclaration': {
            let identfier: ReactNode = null
            if (exp.identifier) {
                identfier = evalAssignment(exp.identifier, visuals);
            }
            let params: ReactNode[] = []
            for (let x of exp.parameters) {
                params.push(evalExpression(x, visuals))
            }
            let body: ReactNode[] = [];
            for (let x of exp.body) {
                body.push(evalStatements(x, visuals));
            }

            return (
                <div
                    key={id}
                >
                    <div className="flex">function {identfier}({params})</div>
                    <div className="pl-8">{body}</div>
                    end

                </div>
            );
        }
        case 'TableConstructorExpression': {
            const key_vals: ReactNode[] = []
            for (const field of exp.fields) {
                key_vals.push(evalTableField(field, visuals));

            }
            return (
                <div
                    key={id}
                    className="flex gap-x-1"
                >
                    {`{`} {key_vals} {`}`}
                </div>
            );
        }
        case 'IndexExpression': {

            const identifier = evalExpression(exp.base, visuals);
            let idx = evalExpression(exp.index, visuals);
            return <div key={id} className="flex">{identifier}[{idx}]</div>;
        }
        case 'MemberExpression': {

            const identifier = evalExpression(exp.base, visuals);
            const rest = evalExpression(exp.identifier, visuals)

            return <div key={id} className="flex">{identifier}{exp.indexer}{rest}</div>;
        }
        case 'StringLiteral': {
            let val = "";
            if (exp.raw[0] === "'" || exp.raw[0] === '"') {
                for (let i = 1; i < exp.raw.length - 1; i++) {
                    val += exp.raw[i];
                }
            } else {
                //TODO
                val = parseLongString(exp.raw);
            }
            return <div key={id}>{val}</div>;
        }
        case 'VarargLiteral':
        case 'LogicalExpression':
        case 'TableCallExpression':
        case 'StringCallExpression':
        default: {
            return <div>NOT IMplemented expression {exp.type}</div>
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



export function evalAssignment(
    exp:
        | luaparser.Identifier
        | luaparser.MemberExpression
        | luaparser.IndexExpression,
    visuals: Lua_Object_Visualizer[]
) {
    //TODO add viuals. Here we can do an animation 
    let id = `${exp.loc!.start.line}-${exp.loc!.end.line} | ${exp.loc!.start.column}-${exp.loc!.end.column}`
    void visuals;
    void id;
    switch (exp.type) {
        case "Identifier":
            return <div key={id}>{exp.name}</div>;
        case "IndexExpression":
            let identifier = evalExpression(exp.base, visuals);
            let idx = evalExpression(exp.index, visuals);
            return <div key={id}>{identifier}[{idx}]</div>;
        case "MemberExpression": {
            const identifier = evalExpression(exp.base, visuals)
            const rest = evalExpression(exp.identifier, visuals)


            return <div key={id} className="flex">{identifier}{exp.indexer}{rest}</div>;
        }

        default: {
            return <div>NOT IMPLEMENTED eval assigment</div>
        }
    }
}

export function evalTableField(
    field: luaparser.TableKey | luaparser.TableKeyString | luaparser.TableValue,
    visuals: Lua_Object_Visualizer[]
) {

    let id = `${field.loc!.start.line}-${field.loc!.end.line} | ${field.loc!.start.column}-${field.loc!.end.column}`
    switch (field.type) {
        case "TableKey": {
            const key = evalExpression(field.key, visuals);
            const val = evalExpression(field.value, visuals);
            return <div key={id} className="flex gap-x-0.5">{key} = {val}</div>;
        }
        case "TableKeyString": {
            const val = evalExpression(field.value, visuals);
            return <div key={id} className="flex gap-x-0.5">{field.key.name} = {val}</div>
        }
        case "TableValue": {
            const val = evalExpression(field.value, visuals);
            return <div key={id} className="flex gap-x-0.5">{val}</div>
        }
    }
}
function replacer(_key: any, value: any) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}
function reviver(_key: any, value: any) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}
