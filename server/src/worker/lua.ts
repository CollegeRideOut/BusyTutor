import { parentPort } from 'worker_threads';
import luaparser from 'luaparse';
import { selfContainedEvalGenerator } from '../interperter/eval_gen';
import {
  indexingVisual,
  Lua_Table,
  Lua_Visualzer,
} from '../interperter/lua_types';
import { make_replacer, serialize_heap } from '../utils/stringify';

function postAndWait(msg: any): Promise<void> {
  return new Promise((resolve) => {
    parentPort!.once('message', (msg: { type: string }) => {
      if (msg.type === 'ack') resolve();
    });
    parentPort!.postMessage(msg);
  });
}

function BuildVisualIndexing(
  partialVisals: Lua_Visualzer[] | null
): indexingVisual {
  //TODO throw an error
  if (partialVisals === null) return {};

  let v: indexingVisual = {};
  let status: 'start' | 'end' | 'identifier' | 'idx' | 'val' | null = null;
  for (let x of partialVisals) {
    status = x.expresion?.indexExpresssion?.status || status;
    if (status === 'identifier') {
      let identifier = x.expresion?.identifier;
      if (identifier) {
        v!.identifier = {
          name: identifier.name,
          valId: identifier.valId,
        };
      }
    }
    if (status === 'idx') {
      let idx = x.expresion?.identifier;
      if (idx) {
        v!.idexer = {
          name: idx.name,
          valId: idx.valId,
        };
      }
    }
    if (status === 'val') {
      let val = x.expresion?.indexExpresssion?.valId;
      if (val) {
        v!.val = { valId: val };
      }
    }
    if (status === 'end') break;
  }

  return v;
}

parentPort!.once('message', async (msg: { type: string; code: string }) => {
  if (msg.type !== 'start')
    throw new Error('first message should be the start one');

  let ast = luaparser.parse(msg.code, { locations: true });

  let { evalChunkGenerator, getGlobal } = selfContainedEvalGenerator();
  let global = new Lua_Table();
  let gen = evalChunkGenerator(ast, global);
  let val: ReturnType<typeof gen.next> = { done: false, value: {} };
  let visualHelperStatus: null | 'BuildingIndexingVisual' = null;
  let partialVisuals: null | Lua_Visualzer[] = null;
  let savedIndexdVisuals: indexingVisual[] = [];
  do {
    val = gen.next();
    if (val.done) break;

    let { Lua_Current_Environment, Lua_Heap } = getGlobal();
    let currEnv = JSON.stringify(Lua_Current_Environment, make_replacer());
    let heap = JSON.stringify(serialize_heap(Lua_Heap));
    let v = val.value;
    if (
      v.expresion &&
      v.expresion.indexExpresssion &&
      v.expresion.indexExpresssion.status === 'start'
    ) {
      visualHelperStatus = 'BuildingIndexingVisual';
      partialVisuals = [v];
    }
    if (
      v.expresion &&
      v.expresion.indexExpresssion &&
      v.expresion.indexExpresssion.status === 'end'
    ) {
      visualHelperStatus = null;
      savedIndexdVisuals.push(BuildVisualIndexing(partialVisuals));
      partialVisuals = [];
    }
    if (v.clearIndexingVisuals) {
      savedIndexdVisuals = [];
    }
    if (visualHelperStatus === 'BuildingIndexingVisual') {
      partialVisuals!.push(v);
    }
    v.indexingVisual = savedIndexdVisuals;
    let visual = JSON.stringify(v);

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
