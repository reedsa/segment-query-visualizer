import React, { useEffect, useRef, useState } from "react"
import "@hpcc-js/wasm"
import "@sendgrid/ui-components/styles/global/main.scss"
import { TextInput } from "@sendgrid/ui-components/text-input"

import Layout from "../components/layout"
import { graph } from "../utils/graph/graph"

// Pick JSON file to load from content dir
// import astJson from "../../content/ast.json"
// import astJson from "../../content/complexAst.json"

const URL = ""
const AUTH_TOKEN = ""

async function fetchSegment(segmentId) {
  return await fetch(`${URL}/${segmentId}?query_json=true`, {
    headers: {
      authorization: AUTH_TOKEN,
    },
    method: "GET",
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed request")
      }
      return res.json()
    })
    .then(json => {
      if (!json && !json["query_json"]) {
        throw new Error("Failed to parse segment response")
      }
      return json["query_json"]
    })
    .catch(error => {
      console.log("Could not load data", error)
    })
}

const IndexPage = () => {
  let [segmentId, setSegmentId] = useState()
  let container = useRef(null)

  useEffect(() => {
    createTree(segmentId)
  }, [segmentId])

  const createTree = segmentId => {
    const currentContainer = container.current

    fetchSegment(segmentId).then(queryJson => {
      if (queryJson) {
        graph(queryJson, currentContainer)
      }
    })
  }

  const handleChange = e => {
    setSegmentId(e.target.value.trim())

    if (e.keyCode === 13) {
      createTree(segmentId)
    }
  }

  return (
    <Layout>
      <script src="@hpcc-js/wasm/dist/index.min.js" type="javascript/worker" />
      <TextInput
        type="text"
        name="segment-id"
        placeholder="Segment ID"
        onChange={handleChange}
        value={segmentId}
        isLarge
      />
      <div id="graph" ref={container}></div>
    </Layout>
  )
}

export default IndexPage
