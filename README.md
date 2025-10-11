# Busy Tutor

### Aug 7

- Layout & spacing: Wrap environment elements using flex + flex-wrap with proper spacing.
- Box highlighting: When indexing a variable, highlight the source box and the target box.
- Arrow / visual link: Draw an arrow from the source to the target for chain indexing.
- Path finding scaffold

### Aug 13

- Highlight current code line – show Lua line triggering access
- gotta look into rasterizng

### Aug 14

- rasterizing
- Basic pathfinding: Ensure arrows avoid overlapping other boxes for clarity.

### Aug 15

- Can support multiple paths simultaneously (for statements like a[1] === b[1])
- supportin left hand assigment

### Aug 18

- take front ast visualizer out
- Collapsible Make tables/nested objects collapsible to handle large data.

### Aug 20

- Scrollable Make tables/nested objects scrollable to handle large data. maybe have a maximum size
- extendable table
- movable table
- layered environemnts
- collapsible environment
- scrollable environment

### Sep 2

- N-arry tree

### Sep 3

- stack "history" no going back yet
- Tree display (gpt the great)
- change "mode" tree view to current environment
- can only click the current environment
- when exiting goes to parent
- button to change between Tree and Env mode

### Sep 7

- Break statement
- Using Global env as the frist env. cause it makes sense... for now
- While Statement
- Repeat Statement
- TableCallExpression
- StringCallExpression
- Fixing Environment issuue
  - When assigning we look for the enviroment up the stack and return if found set the value in that environment
- LogicalExpressions
- VarsLieteral

### Sep 9

- History init
- Controller
- Modify front end to use Controler type
- allow to click into any node and check the given
- Basic visalization of curr_node stack hisotry
- allow to click on stack history and present environment
- Allow user to move through foward history but (Button timeline.next) not program .next
- Allow user to move through backword history but (Button timeline.prev)

### Sep 10

- Refacotring not operator
- Refactor eval Binary Expression
- metabales functions
- **lt, **le, etc
- meta table \_\_newIndex
- meta table \_\_call
- meta table \_\_newIndex

### Sep 12

- table visualization (put table in "heap" variables always point to it
- added "heap" to interperte gnerator side.

### Sep 14

- on scroll recalculate svg
- trying to do pointers from variables to heap;

### Sep 15

- version 1 of variables poiting to table
- version 1 of table value poiting to other tables

### Sep 16

- allow mergin table inside of table property removing the pointer its sooooo bad but is what i wanted.... for now

### Sep 17

- new landing page
- new practice page

### Sep 21

- Refactorign problem page
- Pulled out 'pure' visulizer
- wrap tree nodes elements in pxilated border
- fix height problem

### Sep 22

- wrap identifiers and tables with the "pixel" border
- allow for visual code

### Sep 23

- pcall()
- error()

### Sep 24

- pcall()
- error()
- next()
- ipairs()

### Sep 30

- bunch of stuff i forgot
- refactored enviroment into Lua-Tables
- most built in function complete
- math global table almost complete

### Oct 7

- string global table started
- table global table started

### Up Next

- io, os, package, coroutine TODO and test all global tables
- table (TODO)
- table.sort
- string (TODO)
- string.dump — implement real function serialization
- string.find — add full Lua pattern matching
- string.format — add C-style formatting (%d, %f, %s, etc.)
- string.gmatch — pattern iterator
- string.gsub — pattern substitution
- string.match — pattern captures
- string.sub — handle pattern captures + finalize negative index logic
- math.randomseed — proper seedable RNG
- math.frexp — split float into mantissa & exponent
- math.ldexp — mantissa \* 2^exp reconstruction

- importnat nothing should return and error is more like a throw that takes over
- move to server
- indexing for the member expresions
- pretify visulzer
- refactor visualizer
- or it has a special type of our data structures
- basic implementations and visualization of Data Structures
- 2d array
- Stack
- queue
- linked list
- double linked list
- binary tree / binary search tree
- heap <- just a array represented as tree
- finish interpert
- tanslate intperter to generator
- reafactor how to pass the problem
- refactor how to pass test
- test builder allow user to create heir own test
- be able to show when time lmit/stack limit excee , passed, failed
- Waiting on desing
- Environment visuals: polish node cards, spacing, and shadows
- Movable layout: allow dragging nodes/groups
- Collapsible nodes: toggle children open/closed with indicator
- Connector fix: reroute SVG links if target is off-screen/hidden
- Scroll & collapse logic: links attach to visible ancestor or viewport edge
- End-state indicator: show banner + color ring for correct/incorrect runs
- Demo capture: quick screen recording of expand/collapse, drag, reroute, and end badge
- Improved arrow styling – rounded corners, subtle animation, glow
- branching
- Mini tooltips – show variable info (type, value, key) on hover
- Operation-aware visual feedback – color/effect depending on operation (+, -, \*, assignment)
- extenable environment
- Simple animations for assignments – animate variables/tables when updated or accessed
- Add all tables to a heap with unique IDs for clean visualization, leaving cycle handling and arrow layout as a later enhancement.
- chaing indexing
- cache layout
- Time Complexity calculator?
- do vidoe
- move interperter to the server
- optimizations

## Features to Include in MVP

- [ ] Collapsible Tables / Nested Structures

  - [ ] Support deep nested objects without overwhelming the UI
  - [ ] Collapsed boxes show summary (e.g., size, keys)

- [ ] Chain Indexing Visualization

  - [ ] Support nested access like a.b.c or table[1][2]
  - [ ] Highlight the current part of the chain being accessed

- [ ] Code-Aware Indexing

  - [ ] Show line of code currently executing for the operation
  - [ ] Highlight the corresponding element(s) in the environment

- [ ] Multiple Simultaneous Indexing

  - [ ] Show multiple accesses happening at the same time
  - [ ] Example: a[1] === b[1] → both elements visually highlighted concurrently
  - [ ] Provides binary-level understanding of comparisons/assignments

- [ ] Code Animations

  - [ ] Animate elements when assigned or updated
  - [ ] Smoothly highlight changes to variables/tables

- [ ] Operation Awareness (Optional for MVP)
  - [ ] Visual effect based on operation type (e.g., +, -, \*)
  - [ ] Simple animation or highlight can indicate the action being performed
