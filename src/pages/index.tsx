import React, { useEffect, useRef } from "react"
import * as d3 from "d3"
import "d3-graphviz"
import "@hpcc-js/wasm";

import Layout from "../components/layout"
// import astJson from "../../content/ast.json"
import astJson from "../../content/complexAst.json"
import { getOrder } from "../traversal/getOrder"

// const order = select({
//   options: ["each", "eachAfter", "eachBefore"],
//   description: "Graph traversal method"
// })

const escapeHtml = (unsafe) => unsafe
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const traverseOrder = getOrder(astJson);

const ast = astJson.map(node => ({
  ...node,
  id: node.id,
  parentId: node.parent !== 0 ? `${node.parent}` : "",
}));
const data = d3.stratify()(ast)

const graph = (currentContainer) => {
  let traverseIndex = 0;
  let current = 0,
    N = data.descendants().length;

  const graphviz = d3.select(currentContainer).graphviz({ width: window.innerWidth - 40 });

  const draw = (node) => {
    const graph = digraph(
      data.copy()["each"](d => {
        let nodeLabel;
        if (d.data.leftOperand.type === 'identifier') {
          const {
            leftOperand: { value: nodeLeftOperandValue },
            rightOperand: { value: nodeRightOperandValue },
            operator: nodeOperator
          } = d.data;
          
          nodeLabel = escapeHtml(`${nodeLeftOperandValue} ${nodeOperator} "${nodeRightOperandValue}"`);
        } else {
          nodeLabel = escapeHtml(d.data.operator);
        }

        const selectedNode = d.data.id === current;
        d.label = `${d.data.id} | ${nodeLabel}`;
        d.style = selectedNode ? "filled" : "filled";
        d.fillcolor = selectedNode ? "#009dd9" : "#99e1f4";
        return d;
      })
    );

    graphviz.renderDot(graph).on("end", interactive);
  }

  const interactive = () => {
    d3.selectAll(".node,.edge").on("click", increment);
    d3.select(document.body).on("keyup", increment);
  }

  const increment = () => {
    ++traverseIndex;
    if (traverseIndex > traverseOrder.length - 1) {
      traverseIndex = 0;
    }
    current = traverseOrder[traverseIndex];
    draw();
  }

  current = traverseOrder[traverseIndex];
  draw();
};

const digraph = (hierarchy) => {
  const id = new Map(hierarchy.descendants().map((node, i) => [node, i]));
  return `digraph {
  rankdir = TB;
  node [shape="record" fontname="Arial" fontsize="8"];
  ${hierarchy
    .descendants()
    .map(
      node =>
        `"${id.get(node)}" [label="${node.label}"] [style="${node.style}"] [fillcolor="${node.fillcolor}"]`
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
      <script src="@hpcc-js/wasm/dist/index.min.js" type="javascript/worker"/>
      <div id="graph" ref={container}></div>
    </Layout>
  );
}

export default IndexPage
