import { query } from '../database/pool.js';

// 1. Dijkstra's Algorithm
function dijkstra(graph, startNode, endNode) {
  const distances = {};
  const previous = {};
  const nodes = new Set();

  for (const node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
    nodes.add(node);
  }
  distances[startNode] = 0;

  while (nodes.size > 0) {
    let closestNode = null;
    for (const node of nodes) {
      if (closestNode === null || distances[node] < distances[closestNode]) {
        closestNode = node;
      }
    }

    if (closestNode === null || distances[closestNode] === Infinity) break;
    if (closestNode === endNode) break;

    nodes.delete(closestNode);

    for (const neighbor in graph[closestNode]) {
      const alt = distances[closestNode] + graph[closestNode][neighbor];
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = closestNode;
      }
    }
  }

  return buildPath(previous, startNode, endNode, distances[endNode]);
}

// 2. Bellman-Ford Algorithm (Distance Vector)
function distanceVector(graph, startNode, endNode) {
  const distances = {};
  const previous = {};
  const nodes = Object.keys(graph);

  nodes.forEach(node => {
    distances[node] = Infinity;
    previous[node] = null;
  });
  distances[startNode] = 0;

  for (let i = 0; i < nodes.length - 1; i++) {
    for (const u in graph) {
      for (const v in graph[u]) {
        const weight = graph[u][v];
        if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
          distances[v] = distances[u] + weight;
          previous[v] = u;
        }
      }
    }
  }

  return buildPath(previous, startNode, endNode, distances[endNode]);
}

function buildPath(previous, startNode, endNode, cost) {
  const path = [];
  let current = endNode;
  while (current !== null) {
    path.unshift(Number(current));
    current = previous[current];
  }
  return { path, cost };
}

export async function getTopology(req, res, next) {
  try {
    const nodes = await query('SELECT * FROM network_nodes');
    const connections = await query('SELECT * FROM network_connections WHERE is_active = 1');
    res.json({ success: true, data: { nodes, connections } });
  } catch (err) {
    next(err);
  }
}

export async function calculateRoute(req, res, next) {
  try {
    const { algorithm, startNode, endNode, linkFailed } = req.body;

    const nodes = await query('SELECT * FROM network_nodes');
    let connections = await query('SELECT * FROM network_connections WHERE is_active = 1');

    // If linkFailed is true, remove the connection between IoT Gateway (1) and Core Router (2)
    if (linkFailed) {
      connections = connections.filter(c => 
        !((c.source_node_id === 1 && c.target_node_id === 2) || 
          (c.source_node_id === 2 && c.target_node_id === 1))
      );
    }

    const graph = {};
    nodes.forEach(n => graph[n.id] = {});
    connections.forEach(c => {
      if (!graph[c.source_node_id]) graph[c.source_node_id] = {};
      if (!graph[c.target_node_id]) graph[c.target_node_id] = {};
      graph[c.source_node_id][c.target_node_id] = c.link_cost;
      graph[c.target_node_id][c.source_node_id] = c.link_cost;
    });

    let result = null;

    if (algorithm === 'dijkstra') {
      result = dijkstra(graph, startNode, endNode);
    } else if (algorithm === 'distance_vector') {
      result = distanceVector(graph, startNode, endNode);
    }

    if (!result || result.cost === Infinity) {
      return res.status(400).json({ success: false, error: { message: "Destination unreachable. The network is partitioned." } });
    }

    res.json({ success: true, data: { path: result.path, cost: result.cost, algorithm } });
  } catch (err) {
    next(err);
  }
}