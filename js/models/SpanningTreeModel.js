/**
 * Modelo para Árboles de Expansión
 * - Grafo no dirigido con pesos opcionales en aristas
 * - Implementa Kruskal para árbol de expansión mínima y máxima
 * - Union-Find para detección de ciclos
 */
class SpanningTreeModel {
    constructor() {
        this.vertices = new Set();
        this.edges = []; // { from, to, weight }
    }

    reset() {
        this.vertices = new Set();
        this.edges = [];
    }

    addVertex(v) {
        const key = v.toString().trim().toUpperCase();
        if (!key || this.vertices.has(key)) return false;
        this.vertices.add(key);
        return true;
    }

    removeVertex(v) {
        const key = v.toString().trim().toUpperCase();
        if (!this.vertices.has(key)) return false;
        this.vertices.delete(key);
        this.edges = this.edges.filter(e => e.from !== key && e.to !== key);
        return true;
    }

    addEdge(from, to, weight = 1) {
        const u = from.toString().trim().toUpperCase();
        const v = to.toString().trim().toUpperCase();
        if (!u || !v || u === v) return false;

        // Auto-agregar vértices si no existen
        if (!this.vertices.has(u)) this.vertices.add(u);
        if (!this.vertices.has(v)) this.vertices.add(v);

        const w = parseFloat(weight);
        const finalWeight = isNaN(w) ? 1 : w;

        // Evitar arista duplicada
        const exists = this.edges.some(
            e => (e.from === u && e.to === v) || (e.from === v && e.to === u)
        );
        if (exists) return false;

        this.edges.push({ from: u, to: v, weight: finalWeight });
        return true;
    }

    removeEdge(from, to) {
        const u = from.toString().trim().toUpperCase();
        const v = to.toString().trim().toUpperCase();
        const before = this.edges.length;
        this.edges = this.edges.filter(
            e => !((e.from === u && e.to === v) || (e.from === v && e.to === u))
        );
        return this.edges.length < before;
    }

    getVertices() { return Array.from(this.vertices); }
    getEdges() { return this.edges; }

    // ── Union-Find ──────────────────────────────────────
    _makeSet(vertices) {
        const parent = {}, rank = {};
        for (const v of vertices) { parent[v] = v; rank[v] = 0; }
        return { parent, rank };
    }

    _find(parent, x) {
        if (parent[x] !== x) parent[x] = this._find(parent, parent[x]);
        return parent[x];
    }

    _union(parent, rank, x, y) {
        const rx = this._find(parent, x);
        const ry = this._find(parent, y);
        if (rx === ry) return false;
        if (rank[rx] < rank[ry]) parent[rx] = ry;
        else if (rank[rx] > rank[ry]) parent[ry] = rx;
        else { parent[ry] = rx; rank[rx]++; }
        return true;
    }

    // ── Kruskal ──────────────────────────────────────────
    _kruskal(ascending = true) {
        const vertices = this.getVertices();
        if (vertices.length < 2) return { edges: [], totalWeight: 0, connected: false };

        const sorted = [...this.edges].sort((a, b) =>
            ascending ? a.weight - b.weight : b.weight - a.weight
        );

        const { parent, rank } = this._makeSet(vertices);
        const treeEdges = [];
        let totalWeight = 0;

        for (const edge of sorted) {
            if (this._union(parent, rank, edge.from, edge.to)) {
                treeEdges.push(edge);
                totalWeight += edge.weight;
                if (treeEdges.length === vertices.length - 1) break;
            }
        }

        const connected = treeEdges.length === vertices.length - 1;
        return { edges: treeEdges, totalWeight, connected };
    }

    getMinSpanningTree() { return this._kruskal(true); }
    getMaxSpanningTree() { return this._kruskal(false); }

    isConnected() {
        const vertices = this.getVertices();
        if (vertices.length === 0) return true;
        const result = this._kruskal(true);
        return result.connected;
    }
}

window.SpanningTreeModel = SpanningTreeModel;
