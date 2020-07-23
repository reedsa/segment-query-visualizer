import React, { useEffect, useRef } from "react"
import * as d3 from "d3"
import dot from "@observablehq/graphviz"

import Layout from "../components/layout"
// import astJson from "../../content/ast.json"
import astJson from "../../content/complexAst.json"

// const order = select({
//   options: ["each", "eachAfter", "eachBefore"],
//   description: "Graph traversal method"
// })

const ast = astJson.map(node => ({
  ...node,
  id: `${node.id}`,
  parentId: node.parent !== 0 ? `${node.parent}` : "",
}));
const data = d3.stratify()(ast)

const graph = (currentContainer) => {
  let current = 0,
    N = data.descendants().length;

  const svg = d3.select(currentContainer);
  const view = svg.append("div").style("user-select", "none");

  const draw = (node) => {
    let i = 0;
    view
      .html("")
      .node()
      .appendChild(
        digraph(
          data.copy()["each"](d => {
            d.label = `${d.data.id} ${i === 0 ? "*" : ""}`;
            d.style = i++ === current ? "filled" : "";
            return d;
          })
        )
      );
  }

  const increment = () => draw((current = ++current % N));
  view.on("click", increment);
  // d3.select(document.body).on("keyup", increment);

  draw();

  return view.node();
};

const digraph = (hierarchy) => {
  const id = new Map(hierarchy.descendants().map((node, i) => [node, i]));
  return dot`digraph {
  rankdir = TB;
  node [fontname="var(--sans-serif)" fontsize=12];
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
