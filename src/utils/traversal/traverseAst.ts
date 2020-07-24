export function* traverseAst(node, ast) {
  const children = node && node.children;
  let leftChild, rightChild;

  if (children && children[0]) {
    leftChild = ast.find(n => n.id === children[0]);
  }
  if (children && children[1]) {
    rightChild = ast.find(n => n.id === children[1]);
  }

  if (children && children.length) yield* traverseAst(leftChild, ast);
  yield node;
  if (children && children.length) yield* traverseAst(rightChild, ast);
}