import cors from 'cors'
import crypto from 'crypto';
import express from 'express';
import CDP from 'chrome-remote-interface';
import { build217 } from './array/217-builder.ts';
import { spawn } from 'child_process'
import tcpportued from 'tcp-port-used'
import path from 'path'



type user =
    { id: string, problem: string, input: string, port: number, child: any, debugger?: CDP.Client, steps: any, currStep: number }

let users: user[] = []


async function connectDebugger(port: number, uuid: string) {
    console.log('this is the port debugger got called with ', port)
    const debuggerClient = await CDP({ port: port, });

    await debuggerClient.Runtime.runIfWaitingForDebugger();

    await debuggerClient.Debugger.enable();
    await debuggerClient.Runtime.enable();

    debuggerClient.Debugger.paused(async (params) => {
        const frame = params.callFrames[0];
        console.log('Paused at line:', frame.location.lineNumber + 1);
        const callFrame = params.callFrames[0];

        for (const scope of callFrame.scopeChain) {
            if (scope.type === 'local' || scope.type === 'block') {
                const { object } = scope;

                const result = await debuggerClient.Runtime.getProperties({
                    objectId: object.objectId!,
                    ownProperties: true
                });

                console.log('Local variables:');
                //for (const prop of result.result) {
                //    console.log(`${prop.name} ${JSON.stringify(prop)}`);
                //}
                const user = users.find((u) => u.id === uuid)
                if (!user) {
                    console.log('WHERE IS THE USER')
                    return;
                }
                user.steps.push(result.result);
                user.currStep++;
            }
        }


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
        steps: [],
        currStep: 0
    }

    if (c.stdout) {
        console.log('yes stdout')
        process.stdout.write("data");
    } else {

        console.log('nope stdout')
    }
    setTimeout(async () => {
        console.log('ima call the debugger')

        const debuggerClient = await connectDebugger(port, uuid)
        u.debugger = debuggerClient
    }, 1000)

    users.push(u);
    res.json({ id: uuid })
})

app.get('/exit/all', async (req, res) => {

    for (const u of users) {
        await u.debugger?.close()
        u.child.stdin.pause();
        u.child.kill();
    }

    users = [];
    res.json({ ok: 'cool' });
})

app.get("/exit/user/:id", async (req, res) => {
    let id = req.params.id

    const u = users.find((u) => u.id === id);
    if (!u) {
        res.json({ error: 'user not found' });
        return;
    }

    await u.debugger?.close()
    u.child.stdin.pause();
    u.child.kill();
    users = users.filter((u) => u.id !== id);

    res.json({ ok: 'cool' })

})


app.get("/step/user/:id", async (req, res) => {
    let id = req.params.id

    const u = users.find((u) => u.id === id);
    if (!u) {
        res.json({ error: 'user not found' });
        return;
    }


    await u.debugger?.Debugger!.stepOver()


    res.json({ steps: u.steps })

})

app.listen(3000);
