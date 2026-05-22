# BusyTutor

A visual Lua runtime for learning programming. Write Lua code, watch every variable, table, and stack operation update in real time. Step forward and backward through execution history. See exactly how your code transforms data.

---

## What It Does

Most code visualizers show you a simplified animation. BusyTutor runs a real Lua interpreter under the hood and visualizes every internal state change — environments, tables, the heap, pointer relationships, and execution flow — using SVG graphics with A\* pathfinding for clean arrow routing.

| Feature | What You See |
|---------|-------------|
| **Real interpreter** | Full Lua 5.1 runtime — metatables, `pcall`, `error`, `ipairs`, `next`, built-in libraries |
| **Environment tree** | Every scope visualized as a collapsible card with variables and their values |
| **Heap visualization** | Tables live on a heap; variables and other tables point to them with SVG arrows |
| **Execution timeline** | Step forward and backward through every operation — not just breakpoints |
| **Code highlighting** | The currently executing line is highlighted in sync with the visual state |
| **A\* pathfinding** | SVG arrows automatically route around boxes to avoid overlap |
| **AST visualizer** | Side-by-side Lua source and its parsed AST |
| **Practice problems** | Built-in problem system with test verification |
| **Pixel-art UI** | Custom pixel-border components and retro aesthetic |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   BusyTutor Monorepo                     │
│                                                         │
│  ┌──────────────────┐      ┌─────────────────────────┐ │
│  │  @busytutor/server  │      │   @busytutor/client    │ │
│  │                     │      │                        │ │
│  │  ┌─────────────┐   │      │  ┌──────────────────┐  │ │
│  │  │ Interpreter  │   │◄─tRPC─►│  Visualizer      │  │ │
│  │  │ ─ eval_gen  │   │      │  │ ─ luaVisualizer │  │ │
│  │  │ ─ lua_types │   │      │  │ ─ ast_visualizer│  │ │
│  │  │ ─ builtin   │   │      │  │ ─ PixelArt      │  │ │
│  │  │ ─ modules   │   │      │  └──────────────────┘  │ │
│  │  └─────────────┘   │      │                        │ │
│  │  ┌─────────────┐   │      │  ┌──────────────────┐  │ │
│  │  │ Server      │   │      │  │ Routes & Auth    │  │ │
│  │  │ ─ Express   │   │      │  │ ─ Landing        │  │ │
│  │  │ ─ tRPC      │   │      │  │ ─ Practice       │  │ │
│  │  │ ─ WebSocket │   │      │  │ ─ Problems       │  │ │
│  │  │ ─ SQLite    │   │      │  └──────────────────┘  │ │
│  │  └─────────────┘   │      │                        │ │
│  │  ┌─────────────┐   │      │  ┌──────────────────┐  │ │
│  │  │ Worker      │   │      │  │ Heap & Pathfind  │  │ │
│  │  │ ─ Web Worker│   │      │  │ ─ A* routing     │  │ │
│  │  │ ─ Sends     │   │      │  │ ─ Rasterizer     │  │ │
│  │  │   state     │   │      │  │ ─ SVG arrows     │  │ │
│  │  └─────────────┘   │      │  └──────────────────┘  │ │
│  └──────────────────┘      └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Packages

| Package | Tech | Purpose |
|---------|------|---------|
| `@busytutor/server` | TypeScript, Express, tRPC, SQLite, luaparse | Interpreter, auth, API, WebSocket worker |
| `@busytutor/client` | TypeScript, React 19, Vite, Tailwind, TanStack Router | Visualizer UI, practice platform, pixel-art components |

### Key Modules (Server)

| Module | What It Does |
|--------|-------------|
| `interpreter/eval_gen.ts` | Core Lua evaluator — handles expressions, statements, control flow |
| `interpreter/lua_types.ts` | All Lua runtime types (number, string, table, function, etc.) |
| `interpreter/builtin.ts` | Built-in functions (`tostring`, `type`, `pcall`, `setmetatable`, etc.) |
| `interpreter/eval.ts` | Initial evaluator implementation (pre-refactor) |
| `modules/lua/` | Lua standard library modules (`math`, `string`, `table`, etc.) |
| `worker/lua.ts` | Web Worker for offloaded interpretation |
| `server/` | Express server, tRPC router, auth (session + JWT + Google OAuth) |
| `db/` | Drizzle ORM schema and migrations |

### Key Components (Client)

| Component | What It Does |
|-----------|-------------|
| `luaVisualizer.tsx` | Main environment visualization — tables, variables, arrows |
| `ast_visualizer.tsx` | Side-by-side Lua source and AST tree |
| `PixelArt.tsx` | Custom pixel-border components for visual elements |
| `visualizerTool.tsx` | Toolbar and controls for the visualizer |
| `tree.ts` | Tree layout and rendering utilities |
| `problem.tsx` | Practice problem interface with test runner |
| `test.tsx` | Test output and verification display |

---

## Quick Start

### Prerequisites

- Node.js 20+

### Setup

```bash
git clone https://github.com/CollegeRideOut/BusyTutor
cd BusyTutor

# Install dependencies (npm workspaces)
npm install

# Start the server (builds worker, starts Express on :3000)
npm run start

# In another terminal, start the client dev server
npm run dev -w @busytutor/client
```

The client proxies `/api` requests to `localhost:3000`.

---

## Built With

- **Runtime**: TypeScript, luaparse (Lua AST parser)
- **Frontend**: React 19, Vite, Tailwind CSS 4, TanStack Router + Query
- **Backend**: Express, tRPC 11, WebSocket, Passport (Google OAuth)
- **Database**: SQLite, Drizzle ORM
- **Visualization**: SVG, A\* pathfinding (mnemonist heap), custom rasterizer
- **Monorepo**: npm workspaces

---

## Why This Matters

Building a Lua interpreter from scratch requires:

- Implementing a full dynamic type system (numbers, strings, booleans, tables, functions)
- Handling metatables, `__index`, `__newindex`, `__call`, arithmetic metamethods
- Correct semantics for `pcall`/`xpcall`, `error`, tail calls
- Environment chains and lexical scoping
- Standard library functions (`math`, `string`, `table`)

The visualization layer adds:

- Real-time state synchronization between interpreter and renderer
- A\* pathfinding for clean SVG arrow routing between nodes
- Custom pixel-art rendering engine
- Timeline-based history stepping with full state snapshots

This is a systems-level project that demonstrates deep understanding of language runtimes, data visualization, and full-stack engineering.

---

## License

MIT
