import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type EdgeTypes,
  type NodeTypes,
  type Node,
} from '@xyflow/react'
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react'
import '@xyflow/react/dist/style.css'

import { getFullGraph } from '../../api/graphApi'
import type {
  BiomedicalEntityType,
  GraphEdge,
  GraphNode,
} from '../../types/biomedical'
import { toFlowEdges, toFlowNodes } from './graphAdapter'
import BiomedicalNode from './BiomedicalNode'
import { BiomedicalEdge } from './BiomedicalEdge'
import { GraphDetailPanel } from './GraphDetailPanel'
import { GraphLegend } from './GraphLegend'
import './graph.css'

const nodeTypes: NodeTypes = { biomedicalNode: BiomedicalNode }
const edgeTypes: EdgeTypes = { biomedicalEdge: BiomedicalEdge }

interface KnowledgeGraphViewProps {
  graph?: ReturnType<typeof getFullGraph>
}

export function KnowledgeGraphView({ graph }: KnowledgeGraphViewProps) {
  return (
    <ReactFlowProvider>
      <KnowledgeGraphInner graph={graph} />
    </ReactFlowProvider>
  )
}

function KnowledgeGraphInner({ graph }: KnowledgeGraphViewProps) {
  const data = useMemo(() => graph ?? getFullGraph(), [graph])
  const flowNodes = useMemo(() => toFlowNodes(data), [data])
  const flowEdges = useMemo(() => toFlowEdges(data), [data])

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, , onEdgesChange] = useEdgesState(flowEdges)
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [visibleTypes, setVisibleTypes] = useState<Set<BiomedicalEntityType>>(
    new Set(['disease', 'gene', 'pathway', 'drug']),
  )
  const reactFlow = useReactFlow()
  const fitTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (fitTimeout.current) clearTimeout(fitTimeout.current)
    fitTimeout.current = setTimeout(() => {
      reactFlow.fitView({ padding: 0.25, duration: 300 })
    }, 60)
    return () => {
      if (fitTimeout.current) clearTimeout(fitTimeout.current)
    }
  }, [reactFlow])

  const filteredNodes = useMemo(
    () => nodes.filter((n) => visibleTypes.has(n.data.entityType)),
    [nodes, visibleTypes],
  )
  const visibleNodeIds = useMemo(
    () => new Set(filteredNodes.map((n) => n.id)),
    [filteredNodes],
  )
  const filteredEdges = useMemo(
    () =>
      edges.filter(
        (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
      ),
    [edges, visibleNodeIds],
  )

  const connections = useMemo(() => {
    if (!selectedNode) return []
    return data.edges
      .filter(
        (e: GraphEdge) =>
          e.source === selectedNode.id || e.target === selectedNode.id,
      )
      .map((e: GraphEdge) => {
        const connectedId =
          e.source === selectedNode.id ? e.target : e.source
        const connected = data.nodes.find(
          (n: GraphNode) => n.id === connectedId,
        )
        return {
          relationship: e.relationship.replace(/-/g, ' '),
          connectedLabel: connected?.label ?? connectedId,
          connectedType: connected?.type ?? '',
        }
      })
  }, [selectedNode, data])

  const handleNodeClick = useCallback(
    (_e: React.MouseEvent, node: Node) => {
      const original = data.nodes.find((n) => n.id === node.id)
      if (original) setSelectedNode(original)
    },
    [data.nodes],
  )

  const handleToggleType = useCallback((type: BiomedicalEntityType) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const handleFitView = useCallback(() => {
    reactFlow.fitView({ padding: 0.25, duration: 300 })
  }, [reactFlow])

  const handleClearSelection = useCallback(() => {
    setSelectedNode(null)
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })))
  }, [setNodes])

  return (
    <div className="kg-view">
      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handleClearSelection}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'biomedicalEdge' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="#d1d3ca"
        />
      </ReactFlow>

      <div className="kg-toolbar">
        <GraphLegend visibleTypes={visibleTypes} onToggleType={handleToggleType} />
        <div className="kg-controls" role="group" aria-label="Graph controls">
          <button type="button" onClick={() => reactFlow.zoomIn({ duration: 200 })} aria-label="Zoom in">
            <ZoomIn size={15} />
          </button>
          <button type="button" onClick={() => reactFlow.zoomOut({ duration: 200 })} aria-label="Zoom out">
            <ZoomOut size={15} />
          </button>
          <button type="button" onClick={handleFitView} aria-label="Fit to screen">
            <Maximize2 size={15} />
          </button>
        </div>
      </div>

      <div className="kg-hint">Drag nodes · Pan canvas · Scroll to zoom</div>

      <GraphDetailPanel
        node={selectedNode}
        connections={connections}
        onClose={handleClearSelection}
      />
    </div>
  )
}
