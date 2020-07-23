import React, { useEffect, useRef } from "react"
import * as d3 from "d3"
import dot from "@observablehq/graphviz"

import Layout from "../components/layout"
// import astJson from "../../content/ast.json"
import astJson from "../../content/complexAst.json"
import { getOrder } from "../traversal/getOrder"

// const order = select({
//   options: ["each", "eachAfter", "eachBefore"],
//   description: "Graph traversal method"
// })

const traverseOrder = getOrder(astJson);

const ast = astJson.map(node => ({
  ...node,
  id: `${node.id}`,
  parentId: node.parent !== 0 ? `${node.parent}` : "",
}));
const data = d3.stratify()(ast)

const graph = (currentContainer) => {
  let traverseIndex = 0;
  let current = 0,
    N = data.descendants().length;

  const svg = d3.select(currentContainer);
  const view = svg.append("div").style("user-select", "none");

  const draw = (node) => {
    view
      .html("")
      .node()
      .appendChild(
        digraph(
          data.copy()["each"](d => {
            let nodeLabel;
            if (d.data.leftOperand.type === 'identifier') {
              nodeLabel = `\n${escape(d.data.leftOperand.value)}\n${d.data.operator}\n${d.data.rightOperand.value}`;
            } else {
              nodeLabel = d.data.operator;
            }

            d.label = `${d.data.id}\n${nodeLabel}`;
            d.style = parseInt(d.data.id, 10) === current ? "filled" : "";
            return d;
          })
        )
      );
  }

  // const increment = () => draw((current = ++current % N));
  const increment = () => {
    ++traverseIndex;
    if (traverseIndex > traverseOrder.length - 1) {
      traverseIndex = 0;
    }
    current = traverseOrder[traverseIndex];
    draw();
  }
  view.on("click", increment);
  // d3.select(document.body).on("keyup", increment);

  current = traverseOrder[traverseIndex];
  draw();
debugger;
  return view.node();
};

const digraph = (hierarchy) => {
  const id = new Map(hierarchy.descendants().map((node, i) => [node, i]));
  return dot`digraph {
  rankdir = TB;
  node [shape="rectangle" fontname="var(--sans-serif)" fontsize=12];
  ${hierarchy
    .descendants()
    .map(
      node =>
        `"${id.get(node)}" [label="${node.label}"] [style="${node.style}"]`
    )
    .join("; ")}
  ${hierarchy
    .links()
    .map(({ source, target }) => `"${id.get(source)}" -> "${id.get(target)}"`)
    .join("; ")}
  }`;
}


const IndexPage = () => {
  let container = useRef(null);

  useEffect(() => {
    createTree();
  }, []);

  const createTree = () => {
    const currentContainer = container.current;

    graph(currentContainer);
  }

  return (
    <Layout>
      <h1>Segment AST</h1>
      <div ref={container}></div>
    </Layout>
  );
}

export default IndexPage
