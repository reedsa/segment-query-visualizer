export const digraph = hierarchy => {
  const id = new Map(hierarchy.descendants().map((node, i) => [node, i]))
  return `digraph {
  rankdir = TB;
  node [shape="record" fontname="Arial" fontsize="8"];
  ${hierarchy
    .descendants()
    .map(
      node =>
        `"${id.get(node)}" [label="${node.label}"] [style="${
          node.style
        }"] [fillcolor="${node.fillcolor}"]`
    )
    .join("; ")}
  ${hierarchy
    .links()
    .map(({ source, target }) => `"${id.get(source)}" -> "${id.get(target)}"`)
    .join("; ")}
  }`
}
