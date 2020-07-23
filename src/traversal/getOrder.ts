import { traverseAst } from "./ast";

export const getOrder = (astJson) => {
  let traverseOrder = [];

  const astIterator = traverseAst(astJson[0], astJson);
  let next = astIterator.next();

  while (!next.done) {
    if (next.value && next.value.id) {
      traverseOrder.push(next.value.id);
    }
    next = astIterator.next();
  }

  return traverseOrder;
}