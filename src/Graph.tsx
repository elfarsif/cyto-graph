import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import graphData from './graphData.json'

interface GraphProps {
  panelOpen: boolean
  selectedNode: { id: string; label: string; category: string } | null
  setSelectedNode: (node: { id: string; label: string; category: string } | null) => void
  setConnectedNodes: (nodes: { id: string; label: string; category: string }[]) => void
  cyRef: React.MutableRefObject<cytoscape.Core | null>
  originalPositionsRef: React.MutableRefObject<Record<string, { x: number; y: number }>>
}

function Graph({
  panelOpen,
  selectedNode,
  setSelectedNode,
  setConnectedNodes,
  cyRef,
  originalPositionsRef
}: GraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredNode, setHoveredNode] = useState<{ label: string; category: string; x: number; y: number } | null>(null)

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

    // Click on node
    cy.on('tap', 'node', (e) => {
      const node = e.target
      const nodeId = node.id()

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

      // Arrange connected nodes in circle
      const centerX = 0
      const centerY = 0
      const numConnected = connectedNodes.length
      const radius = Math.max(200, numConnected * 25)

      connectedNodes.forEach((connectedNode: cytoscape.NodeSingular, index: number) => {
        const angle = (2 * Math.PI * index) / numConnected - Math.PI / 2
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        connectedNode.animate({ position: { x, y }, duration: 500 })
      })

      node.animate({ position: { x: centerX, y: centerY }, duration: 500 })

      setTimeout(() => {
        cy.animate({
          fit: { eles: node.union(connectedNodes), padding: 80 },
          duration: 300
        })
      }, 500)

      setSelectedNode({
        id: nodeId,
        label: node.data('label'),
        category: node.data('category')
      })

      const connectedList: { id: string; label: string; category: string }[] = []
      connectedNodes.forEach((cn: cytoscape.NodeSingular) => {
        connectedList.push({
          id: cn.id(),
          label: cn.data('label'),
          category: cn.data('category')
        })
      })
      setConnectedNodes(connectedList)
    })

    // Click on background to reset
    cy.on('tap', (e) => {
      if (e.target === cy) {
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
      }
    })

    // Hover
    cy.on('mouseover', 'node', (e) => {
      const node = e.target
      const originalEvent = e.originalEvent as MouseEvent
      setHoveredNode({
        label: node.data('label'),
        category: node.data('category'),
        x: originalEvent.clientX,
        y: originalEvent.clientY
      })
    })

    cy.on('mouseout', 'node', () => {
      setHoveredNode(null)
    })

    return () => {
      cy.destroy()
    }
  }, [])

  // Recenter graph when panel opens/closes
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    const timeout = setTimeout(() => {
      cy.resize()
      cy.fit(undefined, 50)
    }, 350)

    return () => clearTimeout(timeout)
  }, [panelOpen])

  return (
    <>
      <div
        ref={containerRef}
        style={{
          width: panelOpen ? 'calc(100% - 330px)' : 'calc(100% - 40px)',
          height: '100%',
          transition: 'width 0.3s'
        }}
      />

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
          position: 'fixed',
          left: hoveredNode.x + 15,
          top: hoveredNode.y + 15,
          background: 'rgba(255,255,255,0.95)',
          padding: '8px 12px',
          borderRadius: '6px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          zIndex: 1000
        }}>
          <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>
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
    </>
  )
}

export default Graph
