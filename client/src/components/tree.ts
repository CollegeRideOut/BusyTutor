export class TreeNode<T> {
  public id: string;
  public name: string;
  public parent: TreeNode<T> | null;
  public value: T;
  public children: TreeNode<T>[];
  constructor(val: T, name: string) {
    this.id = crypto.randomUUID();
    this.value = val;
    this.children = [];
    this.name = name;
    this.parent = null;
  }
}
export class Tree<T> {
  public root: TreeNode<T> | null;
  constructor() {
    this.root = null;
  }
}
