import React, { useCallback, useState, createContext, useContext } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { nanoid } from 'nanoid';
import AccountNode from './NodeTypes/AccountNode';
import LoanNode from './NodeTypes/LoanNode';
import CollateralNode from './NodeTypes/CollateralNode';
import { getLayoutedElements } from '../utils/layoutUtils';
import { FiDownload, FiList } from 'react-icons/fi';

const nodeTypes = {
  accountNode: AccountNode,
  loanNode: LoanNode,
  collateralNode: CollateralNode,
};

const allowedChildren = {
  Account: ['Loan', 'Collateral'],
  Loan: ['Collateral'],
  Collateral: [],
};

const TreeContext = createContext();

const TreeEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [treeText, setTreeText] = useState('');

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, id: nanoid() }, eds)),
    []
  );

  const onNodeClick = (_, node) => setSelectedNode(node);

  const addNode = (type) => {
    const newNode = {
      id: nanoid(),
      type: `${type.toLowerCase()}Node`,
      position: { x: 0, y: 0 },
      data: { label: `${type} Node`, type },
    };

    if (!selectedNode) {
      if (type === 'Loan' || type === 'Account') {
        const layouted = getLayoutedElements([...nodes, newNode], edges);
        setNodes(layouted.nodes);
        setEdges(layouted.edges);
      } else {
        alert(`${type} must be added under Account or Loan.`);
      }
      return;
    }

    const parentType = selectedNode.data.type;
    if (!allowedChildren[parentType]?.includes(type)) {
      alert(`${parentType} cannot have ${type} as a child.`);
      return;
    }

    const newEdge = { id: nanoid(), source: selectedNode.id, target: newNode.id };
    const layouted = getLayoutedElements([...nodes, newNode], [...edges, newEdge]);

    setNodes(layouted.nodes);
    setEdges(layouted.edges);
    setSelectedNode(null);
  };

  const deleteNode = () => {
    if (!selectedNode) return;
    const deleteIds = [selectedNode.id];

    const collectDescendants = (id) => {
      edges
        .filter((e) => e.source === id)
        .forEach((e) => {
          deleteIds.push(e.target);
          collectDescendants(e.target);
        });
    };

    collectDescendants(selectedNode.id);
    const remainingNodes = nodes.filter((n) => !deleteIds.includes(n.id));
    const remainingEdges = edges.filter(
      (e) => !deleteIds.includes(e.source) && !deleteIds.includes(e.target)
    );
    const layouted = getLayoutedElements(remainingNodes, remainingEdges);

    setNodes(layouted.nodes);
    setEdges(layouted.edges);
    setSelectedNode(null);
  };

  const exportJSON = () => {
    const json = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tree-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTreeStructure = () => {
    const map = Object.fromEntries(nodes.map(n => [n.id, n]));
    const build = (id, depth = 0) => {
      const node = map[id];
      const label = `${'—'.repeat(depth)} ${node.data.type}`;
      const children = edges.filter(e => e.source === id).map(e => e.target);
      return [label, ...children.flatMap(c => build(c, depth + 1))];
    };
    const roots = nodes.filter(n => !edges.some(e => e.target === n.id));
    const tree = roots.flatMap(r => build(r.id)).join('\n');
    setTreeText(tree);
  };

  return (
    <TreeContext.Provider value={{ nodes, edges, selectedNode }}>
      <div className="flex w-full h-screen">
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            nodeTypes={nodeTypes}
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>

        <div className="w-80 p-4 border-l bg-gray-50 overflow-auto">
          <h3 className="text-lg font-bold mb-2">Actions</h3>
          <button onClick={() => addNode('Loan')} className="w-full bg-yellow-300 px-2 py-1 rounded mb-2">+ Add Loan</button>
          <button onClick={() => addNode('Account')} className="w-full bg-blue-300 px-2 py-1 rounded mb-2">+ Add Account</button>

          {selectedNode && (
            <>
              <hr className="my-3" />
              <h4 className="font-semibold mb-1">Selected Node</h4>
              <p className="text-sm mb-2"><strong>Type:</strong> {selectedNode.data.type}</p>
              <p className="text-sm mb-3"><strong>ID:</strong> {selectedNode.id}</p>

              {allowedChildren[selectedNode.data.type].includes('Loan') && (
                <button onClick={() => addNode('Loan')} className="w-full bg-yellow-200 px-2 py-1 rounded mb-2">+ Add Loan</button>
              )}
              {allowedChildren[selectedNode.data.type].includes('Collateral') && (
                <button onClick={() => addNode('Collateral')} className="w-full bg-gray-300 px-2 py-1 rounded mb-2">+ Add Collateral</button>
              )}
              <button onClick={deleteNode} className="w-full bg-red-500 text-white px-2 py-1 rounded">🗑 Delete Node</button>
            </>
          )}

          <hr className="my-3" />
          <button onClick={exportJSON} className="w-full bg-green-400 px-2 py-1 rounded mb-2 flex items-center gap-2 justify-center">
            <FiDownload /> Export JSON
          </button>
          <button onClick={getTreeStructure} className="w-full bg-purple-300 px-2 py-1 rounded flex items-center gap-2 justify-center">
            <FiList /> Show Tree
          </button>

          {treeText && (
            <pre className="mt-3 p-2 bg-white border rounded text-sm whitespace-pre-wrap">{treeText}</pre>
          )}
        </div>
      </div>
    </TreeContext.Provider>
  );
};

export default TreeEditor;
