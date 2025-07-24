import cors from 'cors'
import crypto from 'crypto';
import express from 'express';
import CDP from 'chrome-remote-interface';
import { build217 } from './array/217-builder.ts';
import { spawn } from 'child_process'
import tcpportued from 'tcp-port-used'
import path from 'path'



type user =
    { id: string, problem: string, input: string, port: number, child: any, debugger?: CDP.Client }

const users: user[] = []


async function connectDebugger(port: number) {
    console.log('this is the port debugger got called with ', port)
    const debuggerClient = await CDP({ port: port, });

    await debuggerClient.Runtime.runIfWaitingForDebugger();

    await debuggerClient.Debugger.enable();
    await debuggerClient.Runtime.enable();

    debuggerClient.Debugger.paused(({ callFrames }) => {
        console.log('Debugger paused at:', callFrames[0].location);
    });
    return debuggerClient;
}


const app = express();

app.use(cors())
app.use(express.json())

let port = 49152;
app.post('/:type/:problem', async (req, res) => {
    const body = req.body;

    const uuid = crypto.randomUUID();
    const problemId = req.params.problem;
    const type = req.params.type;
    build217(uuid, body.nums)

    console.log('portque??')
    while (await tcpportued.check(port, '127.0.0.1')) {
        port++;
    }
    console.log('what??')
    let spawn_on = path.resolve(process.cwd() + `/debuggin/${uuid}--${problemId}.ts`)

    let c = spawn('node', [`--inspect-brk=${port}`, `${spawn_on}`], { stdio: ['pipe', 'pipe', 'pipe'] })

    c.stdout.setEncoding('utf8');
    console.log('this is the port used ', port)

    const u: user = {
        id: uuid,
        problem: problemId,
        port: port,
        input: problemId,
        child: c,
    }

    if (c.stdout) {
        console.log('yes stdout')
        process.stdout.write("data");
    } else {

        console.log('nope stdout')
    }
    setTimeout(async () => {
        console.log('ima call the debugger')

        const debuggerClient = await connectDebugger(port)
        u.debugger = debuggerClient
    }

        , 1000)



    users.push(
        u
    );
    res.json({ id: uuid })
})

app.listen(3000);
