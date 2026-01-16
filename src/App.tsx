import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import graphData from './graphData.json'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const [selectedNode, setSelectedNode] = useState<{ id: string; label: string; category: string } | null>(null)
  const [connectedNodes, setConnectedNodes] = useState<{ id: string; label: string; category: string }[]>([])
  const [hoveredNode, setHoveredNode] = useState<{ label: string; category: string } | null>(null)
  const [panelOpen, setPanelOpen] = useState(true)
  const originalPositionsRef = useRef<Record<string, { x: number; y: number }>>({})

  // Group nodes by category for the side panel
  const nodesByCategory = {
    type: graphData.nodes.filter((n) => n.data.category === 'type'),
    agreement: graphData.nodes.filter((n) => n.data.category === 'agreement'),
    clause: graphData.nodes.filter((n) => n.data.category === 'clause'),
    issue: graphData.nodes.filter((n) => n.data.category === 'issue')
  }

  // Function to select a node (used by both graph click and list click)
  const selectNode = (nodeId: string) => {
    const cy = cyRef.current
    if (!cy) return

    const node = cy.getElementById(nodeId)
    if (!node || node.length === 0) return

    // Reset all styles
    cy.elements().removeClass('highlighted faded')

    // Get connected elements
    const connectedEdges = node.connectedEdges()
    const connectedNodes = connectedEdges.connectedNodes()

    // Fade everything
    cy.elements().addClass('faded')

    // Highlight selected node and connections
    node.removeClass('faded').addClass('highlighted')
    connectedEdges.removeClass('faded').addClass('highlighted')
    connectedNodes.removeClass('faded')

    // Use a fixed center point in model coordinates
    const centerX = 0
    const centerY = 0

    // Arrange connected nodes in a circle around center first
    const numConnected = connectedNodes.length
    const radius = Math.max(200, numConnected * 25)

    connectedNodes.forEach((connectedNode: cytoscape.NodeSingular, index: number) => {
      const angle = (2 * Math.PI * index) / numConnected - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      connectedNode.animate({
        position: { x, y },
        duration: 500
      })
    })

    // Move selected node to center of the circle
    node.animate({
      position: { x: centerX, y: centerY },
      duration: 500
    })

    // Fit view after animation
    setTimeout(() => {
      cy.animate({
        fit: {
          eles: node.union(connectedNodes),
          padding: 80
        },
        duration: 300
      })
    }, 500)

    // Store selected node info
    setSelectedNode({
      id: node.id(),
      label: node.data('label'),
      category: node.data('category')
    })

    // Store connected nodes info
    const connectedList: { id: string; label: string; category: string }[] = []
    connectedNodes.forEach((cn: cytoscape.NodeSingular) => {
      connectedList.push({
        id: cn.id(),
        label: cn.data('label'),
        category: cn.data('category')
      })
    })
    setConnectedNodes(connectedList)
  }

  // Function to reset the graph
  const resetGraph = () => {
    const cy = cyRef.current
    if (!cy) return

    cy.elements().removeClass('highlighted faded')

    // Animate back to original positions
    cy.nodes().forEach((node) => {
      const orig = originalPositionsRef.current[node.id()]
      if (orig) {
        node.animate({
          position: orig,
          duration: 500
        })
      }
    })

    setTimeout(() => {
      cy.animate({
        fit: { eles: cy.elements(), padding: 50 },
        duration: 300
      })
    }, 500)

    setSelectedNode(null)
    setConnectedNodes([])
  }

  useEffect(() => {
    if (!containerRef.current) return

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...graphData.nodes, ...graphData.edges],
      style: [
        {
          selector: 'node[category="type"]',
          style: {
            'background-color': '#E74C3C',
            'width': 80,
            'height': 80,
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '6px',
            'text-wrap': 'wrap',
            'text-max-width': '70px',
            'text-overflow-wrap': 'anywhere'
          }
        },
        {
          selector: 'node[category="agreement"]',
          style: {
            'background-color': '#3498DB',
            'width': 60,
            'height': 60,
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '5px',
            'text-wrap': 'wrap',
            'text-max-width': '50px',
            'text-overflow-wrap': 'anywhere'
          }
        },
        {
          selector: 'node[category="clause"]',
          style: {
            'background-color': '#2ECC71',
            'width': 50,
            'height': 50,
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '5px',
            'text-wrap': 'wrap',
            'text-max-width': '40px',
            'text-overflow-wrap': 'anywhere'
          }
        },
        {
          selector: 'node[category="issue"]',
          style: {
            'background-color': '#9B59B6',
            'width': 45,
            'height': 45,
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '4px',
            'text-wrap': 'wrap',
            'text-max-width': '35px',
            'text-overflow-wrap': 'anywhere'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1,
            'line-color': '#bdc3c7',
            'curve-style': 'bezier',
            'opacity': 0.5
          }
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 4,
            'border-color': '#F39C12'
          }
        },
        {
          selector: 'node.faded',
          style: {
            'opacity': 0.2
          }
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#F39C12',
            'width': 3,
            'opacity': 1
          }
        },
        {
          selector: 'edge.faded',
          style: {
            'opacity': 0.1
          }
        }
      ],
      layout: {
        name: 'concentric',
        animate: false,
        concentric: (node: cytoscape.NodeSingular) => {
          // Transaction types on outer ring, then agreements, clauses, issues toward center
          const cat = node.data('category')
          if (cat === 'type') return 4
          if (cat === 'agreement') return 3
          if (cat === 'clause') return 2
          return 1
        },
        levelWidth: () => 1,
        minNodeSpacing: 50,
        padding: 50
      }
    })

    cyRef.current = cy

    // Store original positions for reset
    cy.nodes().forEach((node) => {
      originalPositionsRef.current[node.id()] = { ...node.position() }
    })

    // Click on node to highlight and arrange connections in circle
    cy.on('tap', 'node', (e) => {
      selectNode(e.target.id())
    })

    // Click on background to reset
    cy.on('tap', (e) => {
      if (e.target === cy) {
        resetGraph()
      }
    })

    // Hover to show info in side card
    cy.on('mouseover', 'node', (e) => {
      const node = e.target
      setHoveredNode({
        label: node.data('label'),
        category: node.data('category')
      })
    })

    cy.on('mouseout', 'node', () => {
      setHoveredNode(null)
    })

    return () => {
      cy.destroy()
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <div><span style={{ color: '#E74C3C' }}>●</span> Transaction Type</div>
        <div><span style={{ color: '#3498DB' }}>●</span> Agreement Type</div>
        <div><span style={{ color: '#2ECC71' }}>●</span> Clause</div>
        <div><span style={{ color: '#9B59B6' }}>●</span> Issue</div>
        <div style={{ marginTop: '10px', color: '#666' }}>Click node to focus</div>
        <div style={{ color: '#666' }}>Click background to reset</div>
      </div>

      {/* Selected node info */}
      {selectedNode && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          left: 10,
          background: 'rgba(255,255,255,0.9)',
          padding: '10px',
          borderRadius: '5px',
          maxWidth: '300px'
        }}>
          <strong>Selected:</strong> {selectedNode.label}
        </div>
      )}

      {/* Hover card */}
      {hoveredNode && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          right: panelOpen ? 320 : 60,
          background: 'rgba(255,255,255,0.95)',
          padding: '10px 15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          transition: 'right 0.3s'
        }}>
          <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>
            {hoveredNode.category === 'type' && 'Transaction Type'}
            {hoveredNode.category === 'agreement' && 'Agreement Type'}
            {hoveredNode.category === 'clause' && 'Clause'}
            {hoveredNode.category === 'issue' && 'Issue'}
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color:
              hoveredNode.category === 'type' ? '#E74C3C' :
              hoveredNode.category === 'agreement' ? '#3498DB' :
              hoveredNode.category === 'clause' ? '#2ECC71' : '#9B59B6'
          }}>
            {hoveredNode.label}
          </div>
        </div>
      )}

      {/* Collapsible Side Panel */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        height: '100%',
        width: panelOpen ? '300px' : '40px',
        background: 'rgba(255,255,255,0.98)',
        boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
        transition: 'width 0.3s',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Toggle button */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          style={{
            position: 'absolute',
            left: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '60px',
            background: '#fff',
            border: '1px solid #ddd',
            borderRight: 'none',
            borderRadius: '5px 0 0 5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}
        >
          {panelOpen ? '>' : '<'}
        </button>

        {panelOpen && (
          <div style={{ padding: '15px', overflowY: 'auto', flex: 1 }}>

            {/* Selected Nodes Section */}
            {selectedNode && (
              <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#333' }}>Selected Nodes</h3>

                {/* The selected node */}
                <div
                  style={{
                    padding: '6px 10px',
                    margin: '3px 0',
                    background: selectedNode.category === 'type' ? '#E74C3C' :
                      selectedNode.category === 'agreement' ? '#3498DB' :
                      selectedNode.category === 'clause' ? '#2ECC71' : '#9B59B6',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {selectedNode.label}
                </div>

                {/* Connected nodes */}
                {connectedNodes.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    {/* Category counts */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      {connectedNodes.filter(n => n.category === 'type').length > 0 && (
                        <span style={{ fontSize: '10px', background: '#E74C3C', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
                          {connectedNodes.filter(n => n.category === 'type').length} Transactions
                        </span>
                      )}
                      {connectedNodes.filter(n => n.category === 'agreement').length > 0 && (
                        <span style={{ fontSize: '10px', background: '#3498DB', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
                          {connectedNodes.filter(n => n.category === 'agreement').length} Agreements
                        </span>
                      )}
                      {connectedNodes.filter(n => n.category === 'clause').length > 0 && (
                        <span style={{ fontSize: '10px', background: '#2ECC71', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
                          {connectedNodes.filter(n => n.category === 'clause').length} Clauses
                        </span>
                      )}
                      {connectedNodes.filter(n => n.category === 'issue').length > 0 && (
                        <span style={{ fontSize: '10px', background: '#9B59B6', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
                          {connectedNodes.filter(n => n.category === 'issue').length} Issues
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>
                      Connected ({connectedNodes.length}):
                    </div>
                    {connectedNodes.map((node) => (
                      <div
                        key={node.id}
                        onClick={() => selectNode(node.id)}
                        style={{
                          padding: '5px 8px',
                          margin: '2px 0',
                          background: '#f0f0f0',
                          borderLeft: `3px solid ${
                            node.category === 'type' ? '#E74C3C' :
                            node.category === 'agreement' ? '#3498DB' :
                            node.category === 'clause' ? '#2ECC71' : '#9B59B6'
                          }`,
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        {node.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>All Nodes</h3>

            {/* Transaction Types */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', color: '#E74C3C', marginBottom: '5px', fontSize: '13px' }}>
                Transaction Types ({nodesByCategory.type.length})
              </div>
              {nodesByCategory.type.map((node) => (
                <div
                  key={node.data.id}
                  onClick={() => selectNode(node.data.id)}
                  style={{
                    padding: '5px 8px',
                    margin: '2px 0',
                    background: selectedNode?.label === node.data.label ? '#E74C3C' : '#f5f5f5',
                    color: selectedNode?.label === node.data.label ? '#fff' : '#333',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {node.data.label}
                </div>
              ))}
            </div>

            {/* Agreement Types */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', color: '#3498DB', marginBottom: '5px', fontSize: '13px' }}>
                Agreement Types ({nodesByCategory.agreement.length})
              </div>
              {nodesByCategory.agreement.map((node) => (
                <div
                  key={node.data.id}
                  onClick={() => selectNode(node.data.id)}
                  style={{
                    padding: '5px 8px',
                    margin: '2px 0',
                    background: selectedNode?.label === node.data.label ? '#3498DB' : '#f5f5f5',
                    color: selectedNode?.label === node.data.label ? '#fff' : '#333',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {node.data.label}
                </div>
              ))}
            </div>

            {/* Clauses */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', color: '#2ECC71', marginBottom: '5px', fontSize: '13px' }}>
                Clauses ({nodesByCategory.clause.length})
              </div>
              {nodesByCategory.clause.map((node) => (
                <div
                  key={node.data.id}
                  onClick={() => selectNode(node.data.id)}
                  style={{
                    padding: '5px 8px',
                    margin: '2px 0',
                    background: selectedNode?.label === node.data.label ? '#2ECC71' : '#f5f5f5',
                    color: selectedNode?.label === node.data.label ? '#fff' : '#333',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {node.data.label}
                </div>
              ))}
            </div>

            {/* Issues */}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', color: '#9B59B6', marginBottom: '5px', fontSize: '13px' }}>
                Issues ({nodesByCategory.issue.length})
              </div>
              {nodesByCategory.issue.map((node) => (
                <div
                  key={node.data.id}
                  onClick={() => selectNode(node.data.id)}
                  style={{
                    padding: '5px 8px',
                    margin: '2px 0',
                    background: selectedNode?.label === node.data.label ? '#9B59B6' : '#f5f5f5',
                    color: selectedNode?.label === node.data.label ? '#fff' : '#333',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {node.data.label}
                </div>
              ))}
            </div>

            {/* Reset button */}
            <button
              onClick={resetGraph}
              style={{
                width: '100%',
                padding: '10px',
                background: '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Reset View
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
