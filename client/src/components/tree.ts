export class TreeNode<T> {
  public id: string;
  public parent: TreeNode<T> | null;
  public value: T;
  public children: TreeNode<T>[];
  constructor(val: T) {
    this.id = crypto.randomUUID();
    this.value = val;
    this.children = [];
    this.parent = null;
  }
}
export class Tree<T> {
  public root: TreeNode<T> | null;
  constructor() {
    this.root = null;
  }
}
