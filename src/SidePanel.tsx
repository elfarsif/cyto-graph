import { useState } from 'react'

interface NodeData {
  id: string
  label: string
  category: string
}

interface GraphNode {
  data: NodeData
}

interface SidePanelProps {
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
  selectedNode: NodeData | null
  connectedNodes: NodeData[]
  nodesByCategory: {
    type: GraphNode[]
    agreement: GraphNode[]
    clause: GraphNode[]
    issue: GraphNode[]
  }
  selectNode: (nodeId: string) => void
  resetGraph: () => void
}

function SidePanel({
  panelOpen,
  setPanelOpen,
  selectedNode,
  connectedNodes,
  nodesByCategory,
  selectNode,
  resetGraph
}: SidePanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    selectedNodes: true,
    allNodes: true,
    type: true,
    agreement: false,
    clause: false,
    issue: false,
    connectedType: true,
    connectedAgreement: true,
    connectedClause: true,
    connectedIssue: true
  })

  const [filters, setFilters] = useState<Record<string, string>>({
    type: '',
    agreement: '',
    clause: '',
    issue: ''
  })

  const [globalFilter, setGlobalFilter] = useState('')

  // Get all nodes that match the global filter
  const allNodes = [
    ...nodesByCategory.type,
    ...nodesByCategory.agreement,
    ...nodesByCategory.clause,
    ...nodesByCategory.issue
  ]

  const globalFilteredNodes = globalFilter
    ? allNodes.filter(node => 
        node.data.label.toLowerCase().includes(globalFilter.toLowerCase())
      )
    : []

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'type': return '#E74C3C'
      case 'agreement': return '#3498DB'
      case 'clause': return '#2ECC71'
      case 'issue': return '#9B59B6'
      default: return '#666'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'type': return 'Transaction'
      case 'agreement': return 'Agreement'
      case 'clause': return 'Clause'
      case 'issue': return 'Issue'
      default: return category
    }
  }

  const updateFilter = (category: string, value: string) => {
    setFilters(prev => ({ ...prev, [category]: value }))
  }

  const toggleCategory = (category: string) => {
    setExpanded(prev => ({ ...prev, [category]: !prev[category] }))
  }

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      right: 0,
      height: '100%',
      width: panelOpen ? '330px' : '40px',
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

          {/* Global Search */}
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Search all nodes..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '13px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3498DB'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            
            {/* Global search results */}
            {globalFilter && (
              <div style={{
                marginTop: '8px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                maxHeight: '250px',
                overflowY: 'auto'
              }}>
                {globalFilteredNodes.length === 0 ? (
                  <div style={{
                    padding: '12px',
                    color: '#666',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}>
                    No nodes found
                  </div>
                ) : (
                  <div style={{ padding: '5px' }}>
                    <div style={{
                      fontSize: '11px',
                      color: '#666',
                      padding: '5px 8px',
                      borderBottom: '1px solid #eee',
                      marginBottom: '5px'
                    }}>
                      {globalFilteredNodes.length} result{globalFilteredNodes.length !== 1 ? 's' : ''}
                    </div>
                    {globalFilteredNodes.map((node) => (
                      <div
                        key={node.data.id}
                        onClick={() => {
                          selectNode(node.data.id)
                          setGlobalFilter('')
                        }}
                        style={{
                          padding: '6px 8px',
                          margin: '2px 0',
                          background: selectedNode?.id === node.data.id 
                            ? getCategoryColor(node.data.category) 
                            : '#f5f5f5',
                          color: selectedNode?.id === node.data.id ? '#fff' : '#333',
                          borderLeft: `3px solid ${getCategoryColor(node.data.category)}`,
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>{node.data.label}</span>
                        <span style={{
                          fontSize: '9px',
                          color: selectedNode?.id === node.data.id ? 'rgba(255,255,255,0.8)' : '#999',
                          textTransform: 'uppercase'
                        }}>
                          {getCategoryLabel(node.data.category)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Nodes Section */}
          {selectedNode && (
            <div style={{ marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <div
                onClick={() => toggleCategory('selectedNodes')}
                style={{
                  margin: 0,
                  padding: '10px',
                  fontSize: '14px',
                  color: '#333',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#f0f0f0',
                  borderRadius: expanded.selectedNodes ? '5px 5px 0 0' : '5px'
                }}
              >
                <span>Selected Nodes</span>
                <span>{expanded.selectedNodes ? '−' : '+'}</span>
              </div>

              {expanded.selectedNodes && (
                <div style={{ padding: '10px' }}>
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
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                    Connected ({connectedNodes.length}):
                  </div>

                  {/* Connected Transactions */}
                  {connectedNodes.filter(n => n.category === 'type').length > 0 && (
                    <div style={{ marginBottom: '6px', border: '1px solid #eee', borderRadius: '4px' }}>
                      <div
                        onClick={() => toggleCategory('connectedType')}
                        style={{
                          fontWeight: 'bold',
                          color: '#E74C3C',
                          padding: '6px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#fafafa',
                          borderRadius: expanded.connectedType ? '4px 4px 0 0' : '4px'
                        }}
                      >
                        <span>Transactions ({connectedNodes.filter(n => n.category === 'type').length})</span>
                        <span>{expanded.connectedType ? '−' : '+'}</span>
                      </div>
                      {expanded.connectedType && (
                        <div style={{ padding: '4px' }}>
                          {connectedNodes.filter(n => n.category === 'type').map((node) => (
                            <div
                              key={node.id}
                              onClick={() => selectNode(node.id)}
                              style={{
                                padding: '4px 6px',
                                margin: '2px 0',
                                background: '#f0f0f0',
                                borderLeft: '3px solid #E74C3C',
                                borderRadius: '2px',
                                cursor: 'pointer',
                                fontSize: '10px'
                              }}
                            >
                              {node.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Connected Agreements */}
                  {connectedNodes.filter(n => n.category === 'agreement').length > 0 && (
                    <div style={{ marginBottom: '6px', border: '1px solid #eee', borderRadius: '4px' }}>
                      <div
                        onClick={() => toggleCategory('connectedAgreement')}
                        style={{
                          fontWeight: 'bold',
                          color: '#3498DB',
                          padding: '6px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#fafafa',
                          borderRadius: expanded.connectedAgreement ? '4px 4px 0 0' : '4px'
                        }}
                      >
                        <span>Agreements ({connectedNodes.filter(n => n.category === 'agreement').length})</span>
                        <span>{expanded.connectedAgreement ? '−' : '+'}</span>
                      </div>
                      {expanded.connectedAgreement && (
                        <div style={{ padding: '4px' }}>
                          {connectedNodes.filter(n => n.category === 'agreement').map((node) => (
                            <div
                              key={node.id}
                              onClick={() => selectNode(node.id)}
                              style={{
                                padding: '4px 6px',
                                margin: '2px 0',
                                background: '#f0f0f0',
                                borderLeft: '3px solid #3498DB',
                                borderRadius: '2px',
                                cursor: 'pointer',
                                fontSize: '10px'
                              }}
                            >
                              {node.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Connected Clauses */}
                  {connectedNodes.filter(n => n.category === 'clause').length > 0 && (
                    <div style={{ marginBottom: '6px', border: '1px solid #eee', borderRadius: '4px' }}>
                      <div
                        onClick={() => toggleCategory('connectedClause')}
                        style={{
                          fontWeight: 'bold',
                          color: '#2ECC71',
                          padding: '6px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#fafafa',
                          borderRadius: expanded.connectedClause ? '4px 4px 0 0' : '4px'
                        }}
                      >
                        <span>Clauses ({connectedNodes.filter(n => n.category === 'clause').length})</span>
                        <span>{expanded.connectedClause ? '−' : '+'}</span>
                      </div>
                      {expanded.connectedClause && (
                        <div style={{ padding: '4px' }}>
                          {connectedNodes.filter(n => n.category === 'clause').map((node) => (
                            <div
                              key={node.id}
                              onClick={() => selectNode(node.id)}
                              style={{
                                padding: '4px 6px',
                                margin: '2px 0',
                                background: '#f0f0f0',
                                borderLeft: '3px solid #2ECC71',
                                borderRadius: '2px',
                                cursor: 'pointer',
                                fontSize: '10px'
                              }}
                            >
                              {node.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Connected Issues */}
                  {connectedNodes.filter(n => n.category === 'issue').length > 0 && (
                    <div style={{ marginBottom: '6px', border: '1px solid #eee', borderRadius: '4px' }}>
                      <div
                        onClick={() => toggleCategory('connectedIssue')}
                        style={{
                          fontWeight: 'bold',
                          color: '#9B59B6',
                          padding: '6px 8px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: '#fafafa',
                          borderRadius: expanded.connectedIssue ? '4px 4px 0 0' : '4px'
                        }}
                      >
                        <span>Issues ({connectedNodes.filter(n => n.category === 'issue').length})</span>
                        <span>{expanded.connectedIssue ? '−' : '+'}</span>
                      </div>
                      {expanded.connectedIssue && (
                        <div style={{ padding: '4px' }}>
                          {connectedNodes.filter(n => n.category === 'issue').map((node) => (
                            <div
                              key={node.id}
                              onClick={() => selectNode(node.id)}
                              style={{
                                padding: '4px 6px',
                                margin: '2px 0',
                                background: '#f0f0f0',
                                borderLeft: '3px solid #9B59B6',
                                borderRadius: '2px',
                                cursor: 'pointer',
                                fontSize: '10px'
                              }}
                            >
                              {node.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
                </div>
              )}
            </div>
          )}

          {/* All Nodes Section */}
          <div style={{ border: '1px solid #ddd', borderRadius: '5px' }}>
            <div
              onClick={() => toggleCategory('allNodes')}
              style={{
                margin: 0,
                padding: '10px',
                fontSize: '16px',
                color: '#333',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f0f0f0',
                borderRadius: expanded.allNodes ? '5px 5px 0 0' : '5px'
              }}
            >
              <span>All Nodes</span>
              <span>{expanded.allNodes ? '−' : '+'}</span>
            </div>

            {expanded.allNodes && (
              <div style={{ padding: '10px' }}>

          {/* Transaction Types */}
          <div style={{ marginBottom: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
            <div
              onClick={() => toggleCategory('type')}
              style={{
                fontWeight: 'bold',
                color: '#E74C3C',
                padding: '8px 10px',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafafa',
                borderRadius: expanded.type ? '5px 5px 0 0' : '5px'
              }}
            >
              <span>Transaction Types ({nodesByCategory.type.length})</span>
              <span>{expanded.type ? '−' : '+'}</span>
            </div>
            {expanded.type && (
              <div style={{ padding: '5px' }}>
                <input
                  type="text"
                  placeholder="Filter..."
                  value={filters.type}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    marginBottom: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    fontSize: '11px',
                    boxSizing: 'border-box'
                  }}
                />
                {nodesByCategory.type
                  .filter(node => node.data.label.toLowerCase().includes(filters.type.toLowerCase()))
                  .map((node) => (
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
            )}
          </div>

          {/* Agreement Types */}
          <div style={{ marginBottom: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
            <div
              onClick={() => toggleCategory('agreement')}
              style={{
                fontWeight: 'bold',
                color: '#3498DB',
                padding: '8px 10px',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafafa',
                borderRadius: expanded.agreement ? '5px 5px 0 0' : '5px'
              }}
            >
              <span>Agreement Types ({nodesByCategory.agreement.length})</span>
              <span>{expanded.agreement ? '−' : '+'}</span>
            </div>
            {expanded.agreement && (
              <div style={{ padding: '5px' }}>
                <input
                  type="text"
                  placeholder="Filter..."
                  value={filters.agreement}
                  onChange={(e) => updateFilter('agreement', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    marginBottom: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    fontSize: '11px',
                    boxSizing: 'border-box'
                  }}
                />
                {nodesByCategory.agreement
                  .filter(node => node.data.label.toLowerCase().includes(filters.agreement.toLowerCase()))
                  .map((node) => (
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
            )}
          </div>

          {/* Clauses */}
          <div style={{ marginBottom: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
            <div
              onClick={() => toggleCategory('clause')}
              style={{
                fontWeight: 'bold',
                color: '#2ECC71',
                padding: '8px 10px',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafafa',
                borderRadius: expanded.clause ? '5px 5px 0 0' : '5px'
              }}
            >
              <span>Clauses ({nodesByCategory.clause.length})</span>
              <span>{expanded.clause ? '−' : '+'}</span>
            </div>
            {expanded.clause && (
              <div style={{ padding: '5px' }}>
                <input
                  type="text"
                  placeholder="Filter..."
                  value={filters.clause}
                  onChange={(e) => updateFilter('clause', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    marginBottom: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    fontSize: '11px',
                    boxSizing: 'border-box'
                  }}
                />
                {nodesByCategory.clause
                  .filter(node => node.data.label.toLowerCase().includes(filters.clause.toLowerCase()))
                  .map((node) => (
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
            )}
          </div>

          {/* Issues */}
          <div style={{ marginBottom: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
            <div
              onClick={() => toggleCategory('issue')}
              style={{
                fontWeight: 'bold',
                color: '#9B59B6',
                padding: '8px 10px',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#fafafa',
                borderRadius: expanded.issue ? '5px 5px 0 0' : '5px'
              }}
            >
              <span>Issues ({nodesByCategory.issue.length})</span>
              <span>{expanded.issue ? '−' : '+'}</span>
            </div>
            {expanded.issue && (
              <div style={{ padding: '5px' }}>
                <input
                  type="text"
                  placeholder="Filter..."
                  value={filters.issue}
                  onChange={(e) => updateFilter('issue', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    marginBottom: '5px',
                    border: '1px solid #ddd',
                    borderRadius: '3px',
                    fontSize: '11px',
                    boxSizing: 'border-box'
                  }}
                />
                {nodesByCategory.issue
                  .filter(node => node.data.label.toLowerCase().includes(filters.issue.toLowerCase()))
                  .map((node) => (
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
            )}
          </div>
              </div>
            )}
          </div>

          {/* Reset button */}
          <button
            onClick={resetGraph}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '15px',
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
  )
}

export default SidePanel
