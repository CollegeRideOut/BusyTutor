import { createFileRoute } from '@tanstack/react-router'
import { useContext, useState } from 'react'
import { ThemeContext } from '../__root'
import luaparser from 'luaparse'
import { evalChunk } from '../../utils/interperter_generator/eval_generator'
import { Lua_Environment } from '../../utils/interperter/lua_types'
import { Button } from '../../components/ui/button'

export const Route = createFileRoute('/arrays/test')({
    component: RouteComponent,
})

function RouteComponent() {
    const [code, setCode] = useState('')
    const [visCode, setVisCode] = useState('')
    const theme = useContext(ThemeContext)
    const [gen, setGen] = useState<Generator<any> | null>(null)
    const [ast, setAst] = useState<luaparser.Chunk | null>(null)
    return <div
        style={{
            height: '100%',
            width: '100%'
        }}
    >

        <textarea
            onChange={(e) => setCode(e.target.value)}
            value={code}
            style={{
                margin: 20,
                background: theme.vals.colors.secondary,
                height: '40%',
                width: '40%'

            }}

        />
        <Button onClick={() => {
            const _ast = luaparser.parse(code, { locations: true })
            setAst(_ast);
            setGen(evalChunk(_ast, new Lua_Environment()))
            setVisCode(code);
            console.log(ast);
        }
        }
        >Crete Generator</Button>

        <Button onClick={() => {
            if (!gen) {
                console.log('no Generator')
                return;
            }
            const val = gen.next()
            if (val.done) { setGen(null) }
            console.log(val)

        }
        }
        >Next</Button>

        <Button onClick={() => {
            if (!ast) {
                console.log('no ast')
                return;
            }
            console.log(ast)

        }
        }
        >print ast</Button>


        <div
            style={{
                margin: 20,
                background: theme.vals.colors.primary,
                height: '40%',
                width: '40%'

            }}
        >{visCode}</div>



    </div>
}
