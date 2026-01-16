import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import graphData from './graphData.json'
import Graph from './Graph'
import SidePanel from './SidePanel'

function App() {
  const cyRef = useRef<cytoscape.Core | null>(null)
  const originalPositionsRef = useRef<Record<string, { x: number; y: number }>>({})
  const [selectedNode, setSelectedNode] = useState<{ id: string; label: string; category: string } | null>(null)
  const [connectedNodes, setConnectedNodes] = useState<{ id: string; label: string; category: string }[]>([])
  const [panelOpen, setPanelOpen] = useState(true)

  const nodesByCategory = useMemo(() => ({
    type: graphData.nodes.filter((n) => n.data.category === 'type'),
    agreement: graphData.nodes.filter((n) => n.data.category === 'agreement'),
    clause: graphData.nodes.filter((n) => n.data.category === 'clause'),
    issue: graphData.nodes.filter((n) => n.data.category === 'issue')
  }), [])

  const selectNode = useCallback((nodeId: string) => {
    const cy = cyRef.current
    if (!cy) return

    const node = cy.getElementById(nodeId)
    if (!node || node.length === 0) return

    cy.elements().removeClass('highlighted faded')

    const connectedEdges = node.connectedEdges()
    const connected = connectedEdges.connectedNodes()

    cy.elements().addClass('faded')
    node.removeClass('faded').addClass('highlighted')
    connectedEdges.removeClass('faded').addClass('highlighted')
    connected.removeClass('faded')

    const centerX = 0
    const centerY = 0
    const numConnected = connected.length
    const radius = Math.max(200, numConnected * 25)

    connected.forEach((connectedNode: cytoscape.NodeSingular, index: number) => {
      const angle = (2 * Math.PI * index) / numConnected - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      connectedNode.animate({ position: { x, y }, duration: 500 })
    })

    node.animate({ position: { x: centerX, y: centerY }, duration: 500 })

    setTimeout(() => {
      cy.animate({
        fit: { eles: node.union(connected), padding: 80 },
        duration: 300
      })
    }, 500)

    setSelectedNode({
      id: node.id(),
      label: node.data('label'),
      category: node.data('category')
    })

    const connectedList: { id: string; label: string; category: string }[] = []
    connected.forEach((cn: cytoscape.NodeSingular) => {
      connectedList.push({
        id: cn.id(),
        label: cn.data('label'),
        category: cn.data('category')
      })
    })
    setConnectedNodes(connectedList)
  }, [])

  const resetGraph = useCallback(() => {
    const cy = cyRef.current
    if (!cy) return

    cy.elements().removeClass('highlighted faded')

    cy.nodes().forEach((node) => {
      const orig = originalPositionsRef.current[node.id()]
      if (orig) {
        node.animate({ position: orig, duration: 500 })
      }
    })

    setTimeout(() => {
      cy.animate({ fit: { eles: cy.elements(), padding: 50 }, duration: 300 })
    }, 500)

    setSelectedNode(null)
    setConnectedNodes([])
  }, [])

  // Listen for postMessage from parent iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ui_component_render' && event.data?.source === 'agentos') {
        console.log('Received payload:', event.data.payload)
        
        const relationshipName = event.data.payload?.relationshipName
        if (relationshipName) {
          // Search through all nodes for a match (same logic as SidePanel global search)
          const allNodes = [
            ...nodesByCategory.type,
            ...nodesByCategory.agreement,
            ...nodesByCategory.clause,
            ...nodesByCategory.issue
          ]
          
          console.log('Searching for:', relationshipName)
          console.log('All nodes:', allNodes.map(n => n.data.label))
          
          const matchingNode = allNodes.find(node =>
            node.data.label.toLowerCase().includes(relationshipName.toLowerCase())
          )
          
          console.log('Matching node:', matchingNode)
          
          if (matchingNode) {
            // Small delay to ensure graph is ready
            setTimeout(() => {
              console.log('Selecting node:', matchingNode.data.id)
              selectNode(matchingNode.data.id)
            }, 100)
          }
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [nodesByCategory, selectNode])

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Graph
        panelOpen={panelOpen}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        setConnectedNodes={setConnectedNodes}
        cyRef={cyRef}
        originalPositionsRef={originalPositionsRef}
      />
      <SidePanel
        panelOpen={panelOpen}
        setPanelOpen={setPanelOpen}
        selectedNode={selectedNode}
        connectedNodes={connectedNodes}
        nodesByCategory={nodesByCategory}
        selectNode={selectNode}
        resetGraph={resetGraph}
      />
    </div>
  )
}

export default App
