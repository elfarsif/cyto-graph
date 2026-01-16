import { useEffect, useRef, useState } from 'react'
import cytoscape from 'cytoscape'
import graphData from './graphData.json'

function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

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
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': 'data(size)',
            'height': 'data(size)',
            'font-size': '10px',
            'text-wrap': 'wrap',
            'text-max-width': '80px'
          }
        },
        {
          selector: 'node[category="agreement"]',
          style: {
            'background-color': '#3498DB',
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': 'data(size)',
            'height': 'data(size)',
            'font-size': '8px',
            'text-wrap': 'wrap',
            'text-max-width': '60px'
          }
        },
        {
          selector: 'node[category="clause"]',
          style: {
            'background-color': '#2ECC71',
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': 'data(size)',
            'height': 'data(size)',
            'font-size': '8px',
            'text-wrap': 'wrap',
            'text-max-width': '50px'
          }
        },
        {
          selector: 'node[category="issue"]',
          style: {
            'background-color': '#9B59B6',
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': 'data(size)',
            'height': 'data(size)',
            'font-size': '7px',
            'text-wrap': 'wrap',
            'text-max-width': '40px'
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
        name: 'cose',
        animate: false,
        nodeRepulsion: () => 8000,
        idealEdgeLength: () => 100,
        padding: 50
      }
    })

    cyRef.current = cy

    // Click on node to highlight its connections
    cy.on('tap', 'node', (e) => {
      const node = e.target

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

      // Zoom to neighborhood
      cy.animate({
        fit: {
          eles: node.union(connectedNodes),
          padding: 50
        },
        duration: 500
      })

      setSelectedNode(node.data('label'))
    })

    // Click on background to reset
    cy.on('tap', (e) => {
      if (e.target === cy) {
        cy.elements().removeClass('highlighted faded')
        cy.animate({
          fit: { eles: cy.elements(), padding: 50 },
          duration: 500
        })
        setSelectedNode(null)
      }
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
          <strong>Selected:</strong> {selectedNode}
        </div>
      )}
    </div>
  )
}

export default App
