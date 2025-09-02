class Node<T> {
  public value: T;
  public children: T[];
  constructor(val: T) {
    this.value = val;
    this.children = [];
  }
}
export class Tree<T> {
  public root: Node<T> | null;
  constructor(root: Node<T> | null = null) {
    this.root = root;
  }
}
