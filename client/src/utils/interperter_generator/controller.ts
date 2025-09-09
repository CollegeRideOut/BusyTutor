import { Tree, TreeNode } from '../../components/tree';
import { Lua_Environment } from '../interperter/lua_types';
import { evalChunk } from './eval_generator';
import luaparser from 'luaparse';

type event = {
  step: number;
  env: Lua_Environment;
  type: 'curr' | 'new' | 'exit';
  goTo?: string;
};

export class History {
  readonly timeline: event[];
  private current: number;

  constructor(event?: event) {
    if (event) {
      this.timeline = [event];
      this.current = 1;
    } else {
      this.timeline = [];
      this.current = 0;
    }
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

export function controller(ast: luaparser.Chunk) {
  let info: {
    global: Lua_Environment;
    stepper: ReturnType<typeof evalChunk>;
    curr_env: Lua_Environment;
    steps: number;
    curr_node: TreeNode<History>;
    tree: Tree<History>;
  } | null = null;
  // TODO figure this shit out

  return {
    info: () => info,
    init: function () {
      const global = new Lua_Environment();
      let stepper = evalChunk(ast, global);
      let first_event: event = { step: 0, env: global, type: 'curr' };
      let curr_node = new TreeNode(new History(first_event));
      let curr_env = global;
      let tree = new Tree<History>();
      tree.root = curr_node;
      info = {
        global: global,
        curr_env: curr_env,
        stepper: stepper,
        steps: 0,
        curr_node: curr_node,
        tree: tree,
      };
    },
    next: function () {
      if (info === null) throw Error('needs to be nitiialzie');
      let values = info.stepper.next();
      info.steps++;
      if (values.done) return;
      let [_, curr_env, modify_env] = values.value;
      info.curr_env = curr_env;

      if (modify_env === 'exit') {
        let event: event = {
          step: info.steps,
          env: curr_env,
          type: 'exit',
          goTo: info.curr_node.parent?.id,
        };
        info.curr_node.value.addHistory(event);
        info.curr_node = info.curr_node.parent!;
        // TODO maybe add and event to the parent?
      } else if (modify_env === 'new') {
        let new_node = new TreeNode(new History());
        new_node.parent = info.curr_node;
        let event: event = {
          step: info.steps,
          env: curr_env,
          type: 'new',
          goTo: new_node.id,
        };
        info.curr_node.value.addHistory(event);

        // modifuing event
        event.type = 'curr';
        event.goTo = undefined;
        new_node.value.addHistory(event);

        // ading children to current_node
        info.curr_node.children.push(new_node);
        info.curr_node = new_node;
      } else if (modify_env === 'curr') {
        let event: event = {
          step: info.steps,
          env: curr_env,
          type: 'curr',
        };
        info.curr_node.value.addHistory(event);
      }
      return values;
    },
    curr: function () {
      if (info === null) throw Error('should be initilized');

      return info.curr_node;
    },
    goTo: function (step: number) {
      this.init();
      if (info === null) throw Error('check this goto function pls');
      while (info.steps < step) {
        this.next();
      }
    },
  };
}
