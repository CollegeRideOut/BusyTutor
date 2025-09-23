import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { parseLongString } from '../utils/interperter/eval';
import luaparser from 'luaparse';
import type { Lua_Object_Visualizer } from '../utils/interperter_generator/generator_types';
import type { ReactNode } from 'react';

type Theme = any;

export function EvalChunkFront({
  node,
  visual,
  theme,
}: {
  node: luaparser.Chunk;
  visual: Lua_Object_Visualizer;
  theme: Theme;
}) {
  return evalStatementsArray(node.body, visual, theme);
}

export function evalChunkFront(
  node: luaparser.Chunk,
  visual: Lua_Object_Visualizer,
  theme: Theme,
) {
  return evalStatementsArray(node.body, visual, theme);
}

export function evalStatementsArray(
  node: luaparser.Statement[],
  visual: Lua_Object_Visualizer,
  theme: Theme,
) {
  const vals: ReactNode[] = [];
  for (let statement of node) {
    let lua = evalStatements(statement, visual, theme);
    vals.push(lua);
  }

  return vals;
}

export function evalStatements(
  node: luaparser.Statement,
  visuals: Lua_Object_Visualizer,
  theme: Theme,
) {
  let id = `${node.loc!.start.line}-${node.loc!.end.line} | ${node.loc!.start.column}-${node.loc!.end.column}`;
  let visualid =
    visuals.loc === undefined
      ? ''
      : `${visuals.loc.start.line}-${visuals.loc.end.line} | ${visuals.loc.start.column}-${visuals.loc.end.column}`;
  let backgroundColor = visualid === id ? theme.colors.primary : '';
  switch (node.type) {
    case 'ReturnStatement': {
      let vals: ReactNode[] = [];
      for (let exp of node.arguments) {
        vals.push(evalExpression(exp, visuals, theme));
      }
      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <Tooltip>
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

    case 'IfStatement': {
      let children: ReactNode[] = [];
      for (const clause of node.clauses) {
        children.push(evalClause(clause, visuals, theme));
        //if (obj.kind === "error") return obj;
        //if (t) return obj;
      }
      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {children}
          end
        </div>
      );
    }
    case 'LocalStatement': {
      let vals: ReactNode[] = [];
      for (let v of node.init) {
        vals.push(evalExpression(v, visuals, theme));
      }

      let variables: ReactNode[] = [];

      for (let i = 0; i < node.variables.length; i++) {
        let x = node.variables[i];
        const curr_var = evalAssignment(x, visuals, theme);
        variables.push(curr_var);
      }

      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <div>local</div> {variables} = {vals}
        </div>
      );
    }
    case 'AssignmentStatement': {
      let vals: ReactNode[] = [];
      for (let v of node.init) {
        vals.push(evalExpression(v, visuals, theme));
      }

      let variables: ReactNode[] = [];
      for (let i = 0; i < node.variables.length; i++) {
        variables.push(evalAssignment(node.variables[i], visuals, theme));
      }

      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {variables} = {vals}
        </div>
      );
    }

    case 'CallStatement': {
      let obj = evalExpression(node.expression, visuals, theme);
      return obj;
    }

    case 'FunctionDeclaration': {
      let identfier: ReactNode = null;
      if (node.identifier) {
        identfier = evalAssignment(node.identifier, visuals, theme);
      }
      let params: ReactNode[] = [];
      for (let x of node.parameters) {
        params.push(evalExpression(x, visuals, theme));
      }
      let body: ReactNode[] = [];
      for (let x of node.body) {
        body.push(evalStatements(x, visuals, theme));
      }

      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <div className='flex'>
            function {identfier}({params})
          </div>
          <div className='pl-8'>{body}</div>
          end
        </div>
      );
    }
    case 'ForNumericStatement': {
      let start = evalExpression(node.start, visuals, theme);
      let obj = evalAssignment(node.variable, visuals, theme);
      let end = evalExpression(node.end, visuals, theme);
      let step: ReactNode = null;
      if (node.step) {
        step = evalExpression(node.step, visuals, theme);
      }
      const body = evalStatementsArray(node.body, visuals, theme);
      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <div className='flex gap-x-0.5'>
            for {obj} = {start}, {end} {step ? <>, {step}</> : null} do
          </div>
          <div className='pl-8'>{body}</div>
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
  visuals: Lua_Object_Visualizer,
  theme: Theme,
): ReactNode {
  let id = `${exp.loc!.start.line}-${exp.loc!.end.line} | ${exp.loc!.start.column}-${exp.loc!.end.column}`;
  let visualid =
    visuals.loc === undefined
      ? ''
      : `${visuals.loc.start.line}-${visuals.loc.end.line} | ${visuals.loc.start.column}-${visuals.loc.end.column}`;
  let backgroundColor = visualid === id ? theme.colors.primary : '';
  switch (exp.type) {
    case 'NumericLiteral': {
      return (
        <div
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <Tooltip key={id}>
            <TooltipTrigger>{exp.value}</TooltipTrigger>
            <TooltipContent>
              <p># Literal</p>
            </TooltipContent>
          </Tooltip>
        </div>
      );
    }
    case 'BooleanLiteral': {
      return (
        <div
          style={{
            backgroundColor: backgroundColor,
          }}
          key={id}
        >
          {String(exp.value)}
        </div>
      );
    }
    case 'NilLiteral': {
      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          nil
        </div>
      );
    }
    case 'UnaryExpression': {
      const arg = evalExpression(exp.argument, visuals, theme);
      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {exp.operator}
          {arg}
        </div>
      );
    }
    case 'BinaryExpression': {
      let left = evalExpression(exp.left, visuals, theme);
      let right = evalExpression(exp.right, visuals, theme);
      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {left}
          {exp.operator} {right}
        </div>
      );
    }
    case 'Identifier': {
      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {exp.name}
        </div>
      );
    }
    case 'CallExpression': {
      let func = evalExpression(exp.base, visuals, theme);
      const args: ReactNode[] = [];
      for (let a of exp.arguments) {
        const arg = evalExpression(a, visuals, theme);
        args.push(arg);
      }

      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {func}({args})
        </div>
      );
    }
    case 'FunctionDeclaration': {
      let identfier: ReactNode = null;
      if (exp.identifier) {
        identfier = evalAssignment(exp.identifier, visuals, theme);
      }
      let params: ReactNode[] = [];
      for (let x of exp.parameters) {
        params.push(evalExpression(x, visuals, theme));
      }
      let body: ReactNode[] = [];
      for (let x of exp.body) {
        body.push(evalStatements(x, visuals, theme));
      }

      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          <div className='flex'>
            function {identfier}({params})
          </div>
          <div className='pl-8'>{body}</div>
          end
        </div>
      );
    }
    case 'TableConstructorExpression': {
      const key_vals: ReactNode[] = [];
      for (const field of exp.fields) {
        key_vals.push(evalTableField(field, visuals, theme));
      }
      return (
        <div
          key={id}
          className='flex gap-x-1'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {`{`} {key_vals} {`}`}
        </div>
      );
    }
    case 'IndexExpression': {
      const identifier = evalExpression(exp.base, visuals, theme);
      let idx = evalExpression(exp.index, visuals, theme);
      return (
        <div
          key={id}
          className='flex'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {identifier}[{idx}]
        </div>
      );
    }
    case 'MemberExpression': {
      const identifier = evalExpression(exp.base, visuals, theme);
      const rest = evalExpression(exp.identifier, visuals, theme);

      return (
        <div
          key={id}
          className='flex'
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {identifier}
          {exp.indexer}
          {rest}
        </div>
      );
    }
    case 'StringLiteral': {
      let val = '';
      if (exp.raw[0] === "'" || exp.raw[0] === '"') {
        for (let i = 1; i < exp.raw.length - 1; i++) {
          val += exp.raw[i];
        }
      } else {
        //TODO
        val = parseLongString(exp.raw);
      }
      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {val}
        </div>
      );
    }
    case 'VarargLiteral':
    case 'LogicalExpression':
    case 'TableCallExpression':
    case 'StringCallExpression':
    default: {
      return <div>NOT IMplemented expression {exp.type}</div>;
    }
  }
}
export function evalClause(
  clause: luaparser.IfClause | luaparser.ElseifClause | luaparser.ElseClause,
  visuals: Lua_Object_Visualizer,
  theme: Theme,
) {
  let id = `${clause.loc!.start.line}-${clause.loc!.end.line} | ${clause.loc!.start.column}-${clause.loc!.end.column}`;
  let visualid =
    visuals.loc === undefined
      ? ''
      : `${visuals.loc.start.line}-${visuals.loc.end.line} | ${visuals.loc.start.column}-${visuals.loc.end.column}`;
  let backgroundColor = visualid === id ? theme.colors.primary : '';
  switch (clause.type) {
    case 'ElseClause': {
      const child = evalStatementsArray(clause.body, visuals, theme);
      return (
        <div
          style={{
            backgroundColor: backgroundColor,
          }}
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
      let condition = evalExpression(clause.condition, visuals, theme);
      const child = evalStatementsArray(clause.body, visuals, theme);
      return (
        <div
          style={{
            backgroundColor: backgroundColor,
          }}
          key={id}
        >
          <div className='flex gap-x-1'>
            {name} {condition} then
          </div>
          <div className='pl-8'>{child}</div>
        </div>
      );
    }
  }
}

export function evalAssignment(
  exp:
    | luaparser.Identifier
    | luaparser.MemberExpression
    | luaparser.IndexExpression,
  visuals: Lua_Object_Visualizer,
  theme: Theme,
) {
  //TODO add viuals. Here we can do an animation
  let id = `${exp.loc!.start.line}-${exp.loc!.end.line} | ${exp.loc!.start.column}-${exp.loc!.end.column}`;
  let visualid =
    visuals.loc === undefined
      ? ''
      : `${visuals.loc.start.line}-${visuals.loc.end.line} | ${visuals.loc.start.column}-${visuals.loc.end.column}`;
  let backgroundColor = visualid === id ? theme.colors.primary : '';
  switch (exp.type) {
    case 'Identifier':
      return (
        <div
          key={id}
          style={{
            backgroundColor: backgroundColor,
          }}
        >
          {exp.name}
        </div>
      );
    case 'IndexExpression':
      let identifier = evalExpression(exp.base, visuals, theme);
      let idx = evalExpression(exp.index, visuals, theme);
      return (
        <div
          style={{
            backgroundColor: backgroundColor,
          }}
          key={id}
        >
          {identifier}[{idx}]
        </div>
      );
    case 'MemberExpression': {
      const identifier = evalExpression(exp.base, visuals, theme);
      const rest = evalExpression(exp.identifier, visuals, theme);

      return (
        <div
          style={{
            backgroundColor: backgroundColor,
          }}
          key={id}
          className='flex'
        >
          {identifier}
          {exp.indexer}
          {rest}
        </div>
      );
    }

    default: {
      return <div>NOT IMPLEMENTED eval assigment</div>;
    }
  }
}

export function evalTableField(
  field: luaparser.TableKey | luaparser.TableKeyString | luaparser.TableValue,
  visuals: Lua_Object_Visualizer,
  theme: Theme,
) {
  let id = `${field.loc!.start.line}-${field.loc!.end.line} | ${field.loc!.start.column}-${field.loc!.end.column}`;
  let visualid =
    visuals.loc === undefined
      ? ''
      : `${visuals.loc.start.line}-${visuals.loc.end.line} | ${visuals.loc.start.column}-${visuals.loc.end.column}`;

  let backgroundColor = visualid === id ? theme.colors.primary : '';
  let render: ReactNode = null;
  switch (field.type) {
    case 'TableKey': {
      const key = evalExpression(field.key, visuals, theme);
      const val = evalExpression(field.value, visuals, theme);
      render = (
        <>
          {key} = {val}
        </>
      );
      break;
    }
    case 'TableKeyString': {
      const val = evalExpression(field.value, visuals, theme);
      render = (
        <>
          {field.key.name} = {val}
        </>
      );

      break;
    }
    case 'TableValue': {
      const val = evalExpression(field.value, visuals, theme);

      render = <>{val}</>;

      break;
    }
  }

  return (
    <div
      key={id}
      className='flex gap-x-0.5'
      style={{
        backgroundColor,
      }}
    >
      {render}
    </div>
  );
}
