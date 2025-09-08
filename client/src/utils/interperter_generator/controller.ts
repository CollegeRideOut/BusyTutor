import { TreeNode, type Tree } from '../../components/tree';
import { Lua_Environment } from '../interperter/lua_types';
import { evalChunk } from './eval_generator';
import luaparser from 'luaparse';

type event = {
  step: number;
  env: Lua_Environment;
  type: 'curr' | 'new' | 'exit';
  goTo?: string;
};

class History {
  readonly timeline: event[];
  private current: number;

  constructor(event: event) {
    this.timeline = [event];
    this.current = 1;
  }

  next() {
    if (this.current >= this.timeline.length)
      throw Error('crruent paased the timeline');

    let val = this.timeline[this.current];
    this.current++;
    return val;
  }
  goTo(idx: number) {
    if (idx >= this.timeline.length || idx < 0) throw Error('idx not in range');

    this.current = idx;
    return this.timeline[this.current];
  }
  currentHistory() {
    if (this.current > this.timeline.length || this.current < 0)
      throw Error('current not in range');
    return this.timeline[this.current - 1];
  }
  addHistory(event: event) {
    this.timeline.push(event);
    this.current++;
  }
}

export function controller(ast: luaparser.Chunk, tree: Tree<History>) {
  const global = new Lua_Environment();
  let stepper = evalChunk(ast, global);
  let first_event: event = { step: 0, env: global, type: 'curr' };

  let steps = 0;
  let curr_node = new TreeNode(new History(first_event));
  tree.root = curr_node;

  return {
    next: () => {
      let values = stepper.next();
      steps++;
      if (values.done) return;
      let [a, b, modify_env] = values.value;
      if (modify_env === 'exit') {
        let event: event = {
          step: steps,
          env: global,
          type: 'exit',
          goTo: curr_node.parent?.id,
        };
        curr_node.value.addHistory(event);
        curr_node = curr_node.parent!;
      }else if(modify_env === 'new'){
        let event: event = {
          step: steps,
          env: global,
          type: 'new',
          goTo: curr_node.parent?.id,
        };
      }
    },
  };
}
