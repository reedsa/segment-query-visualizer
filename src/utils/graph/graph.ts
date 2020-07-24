import * as d3 from "d3"
import "d3-graphviz"

import { escapeHtml } from "../escapeHtml"
import { digraph } from "./digraph"
import { getOrder } from "../traversal/getOrder"

export const graph = (astJson, currentContainer) => {
  const traverseOrder = getOrder(astJson)

  const ast = astJson.map(node => ({
    ...node,
    id: node.id,
    parentId: node.parent !== 0 ? `${node.parent}` : "",
  }))
  const data = d3.stratify()(ast)

  let traverseIndex = 0
  let current = 0,
    N = data.descendants().length

  const graphviz = d3
    .select(currentContainer)
    .graphviz({ width: window.innerWidth - 40 })

  const draw = node => {
    const graph = digraph(
      data.copy()["each"](d => {
        let nodeLabel
        if (d.data.leftOperand.type === "identifier") {
          const {
            leftOperand: { value: nodeLeftOperandValue },
            rightOperand: { value: nodeRightOperandValue },
            operator: nodeOperator,
          } = d.data

          nodeLabel = escapeHtml(
            `${nodeLeftOperandValue} ${nodeOperator} "${nodeRightOperandValue}"`
          )
        } else {
          nodeLabel = escapeHtml(d.data.operator)
        }

        const selectedNode = d.data.id === current
        d.label = `${d.data.id} | ${nodeLabel}`
        d.style = selectedNode ? "filled" : "filled"
        d.fillcolor = selectedNode ? "#009dd9" : "#99e1f4"
        return d
      })
    )

    graphviz.renderDot(graph).on("end", interactive)
  }

  const interactive = () => {
    d3.selectAll(".node,.edge").on("click", increment)
    d3.select(document.body).on("keyup", increment)
  }

  const increment = () => {
    ++traverseIndex
    if (traverseIndex > traverseOrder.length - 1) {
      traverseIndex = 0
    }
    current = traverseOrder[traverseIndex]
    draw()
  }

  current = traverseOrder[traverseIndex]
  draw()
}
