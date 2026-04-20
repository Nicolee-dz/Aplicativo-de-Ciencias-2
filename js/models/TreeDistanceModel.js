/**
 * Modelo para Distancia entre Arboles/Grafos.
 * Gestiona dos grafos independientes: A y B.
 */
class TreeDistanceModel {
    constructor() {
        this.graphA = this._createGraph();
        this.graphB = this._createGraph();
    }

    _createGraph() {
        return { vertices: new Set(), edges: [] };
    }

    _getGraph(graphId) {
        return graphId === 'B' ? this.graphB : this.graphA;
    }

    reset() {
        this.graphA = this._createGraph();
        this.graphB = this._createGraph();
    }

    resetGraph(graphId) {
        if (graphId === 'B') this.graphB = this._createGraph();
        else this.graphA = this._createGraph();
    }

    addVertex(graphId, v) {
        const graph = this._getGraph(graphId);
        const key = v.toString().trim().toUpperCase();
        if (!key || graph.vertices.has(key)) return false;
        graph.vertices.add(key);
        return true;
    }

    removeVertex(graphId, v) {
        const graph = this._getGraph(graphId);
        const key = v.toString().trim().toUpperCase();
        if (!graph.vertices.has(key)) return false;
        graph.vertices.delete(key);
        graph.edges = graph.edges.filter(e => e.from !== key && e.to !== key);
        return true;
    }

    addEdge(graphId, from, to, weight = 1) {
        const graph = this._getGraph(graphId);
        const u = from.toString().trim().toUpperCase();
        const v = to.toString().trim().toUpperCase();
        if (!u || !v || u === v) return false;

        if (!graph.vertices.has(u)) graph.vertices.add(u);
        if (!graph.vertices.has(v)) graph.vertices.add(v);

        const parsed = parseFloat(weight);
        const w = isNaN(parsed) ? 1 : parsed;

        const exists = graph.edges.some(
            e => (e.from === u && e.to === v) || (e.from === v && e.to === u)
        );
        if (exists) return false;

        graph.edges.push({ from: u, to: v, weight: w });
        return true;
    }

    removeEdge(graphId, from, to) {
        const graph = this._getGraph(graphId);
        const u = from.toString().trim().toUpperCase();
        const v = to.toString().trim().toUpperCase();
        const before = graph.edges.length;
        graph.edges = graph.edges.filter(
            e => !((e.from === u && e.to === v) || (e.from === v && e.to === u))
        );
        return graph.edges.length < before;
    }

    getVertices(graphId) {
        return Array.from(this._getGraph(graphId).vertices);
    }

    getEdges(graphId) {
        return this._getGraph(graphId).edges;
    }

    _edgeKey(edge) {
        const a = edge.from;
        const b = edge.to;
        return a < b ? `${a}|${b}` : `${b}|${a}`;
    }

    _copyEdge(edge) {
        return { from: edge.from, to: edge.to, weight: edge.weight };
    }

    _setUnion(edgesA, edgesB) {
        const map = new Map();
        for (const edge of [...edgesA, ...edgesB]) {
            const key = this._edgeKey(edge);
            if (!map.has(key)) map.set(key, this._copyEdge(edge));
        }
        return Array.from(map.values());
    }

    _sumWeights(edges) {
        return edges.reduce((total, edge) => total + (Number(edge.weight) || 0), 0);
    }

    _setIntersection(edgesA, edgesB) {
        const mapB = new Map(edgesB.map(e => [this._edgeKey(e), e]));
        const common = [];

        for (const edge of edgesA) {
            const key = this._edgeKey(edge);
            if (mapB.has(key)) common.push(this._copyEdge(edge));
        }

        return common;
    }

    _verticesFromEdges(edges) {
        const set = new Set();
        edges.forEach(e => {
            set.add(e.from);
            set.add(e.to);
        });
        return Array.from(set);
    }

    _setUnionVertices(verticesA, verticesB) {
        return Array.from(new Set([...verticesA, ...verticesB]));
    }

    _setIntersectionVertices(verticesA, verticesB) {
        const bSet = new Set(verticesB);
        return verticesA.filter(v => bSet.has(v));
    }

    computeDistanceData() {
        const verticesA = this.getVertices('A');
        const verticesB = this.getVertices('B');
        const edgesA = this.getEdges('A');
        const edgesB = this.getEdges('B');

        if (edgesA.length === 0) {
            return { ok: false, error: 'Agrega al menos una arista en el Grafo A' };
        }
        if (edgesB.length === 0) {
            return { ok: false, error: 'Agrega al menos una arista en el Grafo B' };
        }

        const unionEdges = this._setUnion(edgesA, edgesB);
        const interEdges = this._setIntersection(edgesA, edgesB);

        const verticesC = this._setUnionVertices(verticesA, verticesB);
        const verticesD = this._setIntersectionVertices(verticesA, verticesB);
        const verticesDByEdges = this._verticesFromEdges(interEdges);

        const unionWeight = this._sumWeights(unionEdges);
        const interWeight = this._sumWeights(interEdges);
        const distance = (unionWeight - interWeight) / 2;

        return {
            ok: true,
            graphA: { vertices: verticesA, edges: edgesA },
            graphB: { vertices: verticesB, edges: edgesB },
            graphC: { vertices: verticesC, edges: unionEdges, weightTotal: unionWeight },
            graphD: {
                vertices: verticesDByEdges.length ? verticesDByEdges : verticesD,
                edges: interEdges,
                weightTotal: interWeight
            },
            unionWeight,
            interWeight,
            distance
        };
    }
}

window.TreeDistanceModel = TreeDistanceModel;
