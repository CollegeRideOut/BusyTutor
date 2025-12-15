import { parentPort } from 'worker_threads';
import luaparser from 'luaparse';
import {
  Lua_Function,
  Lua_Object,
  selfContainedEvalGenerator,
} from '../interpreter';
import { evalChunk, applyFunction } from '../interpreter/eval';
import { indexingVisual, Lua_Table, Lua_Visualzer } from '../interpreter';
import { make_replacer, serialize_heap } from '../utils/stringify';
import { createLuaObject } from '../interpreter/eval_gen';

function postAndWait(msg: any): Promise<void> {
  return new Promise((resolve) => {
    parentPort!.once('message', (msg: { type: string }) => {
      if (msg.type === 'ack') resolve();
    });
    parentPort!.postMessage(msg);
  });
}

function helpProblem217(userSolution: string, nums: Lua_Object) {
  let numsTable = new Lua_Table();

  let correctSolution = `
function solution(nums)
    for i = 1, #nums do
        for j = i + 1, #nums do
            if nums[i] == nums[j] then
                return true
            end
        end
    end
    return false
end
  `;

  let [correctResult] = generalHelper(correctSolution, [numsTable]);
  let [userResult] = generalHelper(userSolution, [numsTable]);

  if (correctResult.kind !== 'return')
    throw Error('No return on correct Solution');
  if (correctResult.value.length !== 1)
    throw Error('Correct result Wrong length');
  let correctResultValue = correctResult.value[0];
  if (correctResultValue.kind !== 'boolean')
    throw Error('Correct Result wrong kind');

  if (userResult.kind !== 'return') return false;
  if (userResult.value.length !== 1) return false;
  let userResultValue = userResult.value[0];
  if (userResultValue.kind !== 'boolean') return false;

  return correctResultValue.value === userResultValue.value;
}

function generalHelper(code: string, args: Lua_Object[]) {
  let global = new Lua_Table();
  let valueRegistry: Map<string, Lua_Object> = new Map();
  let ast = luaparser.parse(code, { locations: true });

  let { evalChunkTestHelper } = selfContainedEvalGenerator();

  evalChunkTestHelper(ast, global, valueRegistry);
  let func = global.get('solution');
  if (func.kind !== 'function') throw Error('should be a function');
  let result = applyFunction(func, args, global);
  return [result, global];
}

parentPort!.once(
  'message',
  async (msg: { type: string; test: string; code: string }) => {
    if (msg.type !== 'start')
      throw new Error('first message should be the start one');

    let ast = luaparser.parse(msg.code, { locations: true });

    let { evalChunkGenerator, evalChunkTestHelper, applyFunction, getGlobal } =
      selfContainedEvalGenerator();
    let global = new Lua_Table();
    let valueRegistry: Map<string, Lua_Object> = new Map();

    //loading user code into enviromnet
    evalChunkTestHelper(ast, global, valueRegistry);

    let userSolution = global.get('solution');
    if (userSolution.kind !== 'function')
      throw new Error('Solution function does not exist');

    //  this should be done per problem but for now we just have 1 problem

    let firstPart = JSON.parse(msg.test) as { nums: string };
    let secondPart = JSON.parse(firstPart.nums) as number[];

    let nums = new Lua_Table();
    nums.name = 'nums';
    for (let x of secondPart) {
      let obj = createLuaObject({
        kind: 'number',
        value: x,
        registry: valueRegistry,
      });
      nums.setValue(obj);
    }

    valueRegistry.set(nums.id, nums);

    // passing nums to fnction
    let gen = applyFunction(userSolution, [nums], global);
    let didSolutionPass = helpProblem217(msg.code, nums);

    //let gen = evalChunkGenerator(ast, global);
    let val: ReturnType<typeof gen.next> = { done: false, value: {} };
    let savedIndexdVisuals: indexingVisual[] = [];

    do {
      val = gen.next();
      if (val.done) break;

      let { Lua_Current_Environment, Lua_Heap, Global_Nest_Loop_Count } =
        getGlobal();
      let currEnv = JSON.stringify(Lua_Current_Environment, make_replacer());

      let valueRegistryString = JSON.stringify(valueRegistry, make_replacer());
      let heap = JSON.stringify(serialize_heap(Lua_Heap));
      let v = val.value;

      if (v.clearIndexingVisuals) {
        savedIndexdVisuals = [];
      }
      if (v.indexingVisual) {
        savedIndexdVisuals.push(v.indexingVisual[0]);
      }

      v.indexingVisual = savedIndexdVisuals;
      v.nestedLoopCount = Global_Nest_Loop_Count;
      let visual = JSON.stringify(v);

      await postAndWait({
        type: 'value',
        visual,
        currEnv,
        valueRegistry: valueRegistryString,
        heap,
        didSolutionPass,
      });
    } while (!val.done);

    parentPort!.postMessage({ type: 'done' });
    parentPort!.close();
  }
);
