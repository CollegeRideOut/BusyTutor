import { parentPort } from 'worker_threads';
import luaparser from 'luaparse';
import { selfContainedEvalGenerator } from '../interperter/eval_gen';
import { Lua_Table } from '../interperter/lua_types';
import { make_replacer } from '../utils/stringify';

function postAndWait(msg: any): Promise<void> {
  return new Promise((resolve) => {
    parentPort!.once('message', (msg: { type: string }) => {
      if (msg.type === 'ack') resolve();
    });
    parentPort!.postMessage(msg);
  });
}

parentPort!.once('message', async (msg: { type: string; code: string }) => {
  if (msg.type !== 'start')
    throw new Error('first message should be the start one');

  let ast = luaparser.parse(msg.code, { locations: true });

  let { evalChunkGenerator, getGlobal } = selfContainedEvalGenerator();

  let gen = evalChunkGenerator(ast, new Lua_Table());
  let val: ReturnType<typeof gen.next> = { done: false, value: {} };

  do {
    val = gen.next();
    let { Lua_Current_Environment, Lua_Heap } = getGlobal();
    let currEnv = JSON.stringify(Lua_Current_Environment, make_replacer());
    let heap = JSON.stringify(Lua_Heap, make_replacer());
    let visual = JSON.stringify(val.value);

    await postAndWait({
      type: 'value',
      visual,
      currEnv,
      heap,
    });
  } while (!val.done);

  parentPort!.postMessage({ type: 'done' });
  parentPort!.close();
});
