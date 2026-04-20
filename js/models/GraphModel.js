class GraphModel {
    constructor() {
        this.adjacency = new Map(); // Map<vertex, Set<vertex>>
        this.vertices = new Set();
        this.directed = false;
    }

    // --- Operaciones básicas (ya existentes) ---
    addVertex(v) {
        if (!this.vertices.has(v)) {
            this.vertices.add(v);
            this.adjacency.set(v, new Set());
            return true;
        }
        return false;
    }

    removeVertex(v) {
        if (!this.vertices.has(v)) return false;
        this.vertices.delete(v);
        this.adjacency.delete(v);
        for (let u of this.vertices) {
            this.adjacency.get(u).delete(v);
        }
        return true;
    }

    addEdge(u, v) {
        if (!this.vertices.has(u)) this.addVertex(u);
        if (!this.vertices.has(v)) this.addVertex(v);
        this.adjacency.get(u).add(v);
        if (!this.directed) this.adjacency.get(v).add(u);
        return true;
    }

    removeEdge(u, v) {
        if (!this.vertices.has(u) || !this.vertices.has(v)) return false;
        const removed1 = this.adjacency.get(u).delete(v);
        const removed2 = !this.directed ? this.adjacency.get(v).delete(u) : false;
        return removed1 || removed2;
    }

    getVertices() { return Array.from(this.vertices); }
    getEdges() {
        const edges = [];
        for (let u of this.vertices) {
            for (let v of this.adjacency.get(u)) {
                if (this.directed || u < v) edges.push({ from: u, to: v });
            }
        }
        return edges;
    }

    clear() {
        this.vertices.clear();
        this.adjacency.clear();
    }

    // --- Operaciones binarias (entre grafos) ---
    union(other) {
        const result = new GraphModel();
        for (let v of this.vertices) result.addVertex(v);
        for (let v of other.vertices) result.addVertex(v);
        for (let { from, to } of this.getEdges()) result.addEdge(from, to);
        for (let { from, to } of other.getEdges()) result.addEdge(from, to);
        return result;
    }

    intersection(other) {
        const result = new GraphModel();
        for (let v of this.vertices) {
            if (other.vertices.has(v)) result.addVertex(v);
        }
        for (let { from, to } of this.getEdges()) {
            if (result.vertices.has(from) && result.vertices.has(to) && other.adjacency.get(from)?.has(to)) {
                result.addEdge(from, to);
            }
        }
        return result;
    }

    // Suma anillo: diferencia simétrica de conjuntos de aristas
    ringSum(other) {
        const result = new GraphModel();
        // Vértices: unión de ambos
        for (let v of this.vertices) result.addVertex(v);
        for (let v of other.vertices) result.addVertex(v);
        // Aristas que están exactamente en uno de los dos
        const thisEdges = new Set(this.getEdges().map(e => `${e.from}|${e.to}`));
        const otherEdges = new Set(other.getEdges().map(e => `${e.from}|${e.to}`));
        for (let e of thisEdges) {
            if (!otherEdges.has(e)) {
                const [u, v] = e.split('|');
                result.addEdge(u, v);
            }
        }
        for (let e of otherEdges) {
            if (!thisEdges.has(e)) {
                const [u, v] = e.split('|');
                result.addEdge(u, v);
            }
        }
        return result;
    }

    // Suma (unión disjunta): renombra vértices del segundo grafo para evitar conflicto
    sum(other) {
        const result = new GraphModel();
        for (let v of this.vertices) result.addVertex(v);
        const offset = Math.max(...Array.from(this.vertices).map(v => parseInt(v) || 0), 0) + 1;
        for (let v of other.vertices) {
            const newV = typeof v === 'number' ? v + offset : v + offset;
            result.addVertex(newV);
        }
        for (let { from, to } of this.getEdges()) result.addEdge(from, to);
        for (let { from, to } of other.getEdges()) {
            const newFrom = typeof from === 'number' ? from + offset : from + offset;
            const newTo = typeof to === 'number' ? to + offset : to + offset;
            result.addEdge(newFrom, newTo);
        }
        return result;
    }

    // --- Operaciones unarias ---
    complement() {
        const result = new GraphModel();
        const vertices = this.getVertices();
        for (let v of vertices) result.addVertex(v);
        for (let i = 0; i < vertices.length; i++) {
            for (let j = i+1; j < vertices.length; j++) {
                const u = vertices[i], v = vertices[j];
                if (!this.adjacency.get(u).has(v)) {
                    result.addEdge(u, v);
                }
            }
        }
        return result;
    }

    // Fusión de vértices: fusiona u y v en uno solo (elimina u, conserva v)
    vertexFusion(u, v) {
        const result = new GraphModel();
        for (let w of this.vertices) {
            if (w !== u) result.addVertex(w);
        }
        if (!result.vertices.has(v)) result.addVertex(v);
        for (let { from, to } of this.getEdges()) {
            let newFrom = from, newTo = to;
            if (from === u) newFrom = v;
            if (to === u) newTo = v;
            if (newFrom !== newTo) result.addEdge(newFrom, newTo);
        }
        return result;
    }

    // Contracción de arista: contrae (u,v) en un solo vértice (elimina u, v y añade nuevo w)
    edgeContraction(u, v) {
        if (!this.adjacency.get(u)?.has(v) && !this.adjacency.get(v)?.has(u)) return this;
        const result = new GraphModel();
        const newVertex = `${u}${v}`;
        for (let w of this.vertices) {
            if (w !== u && w !== v) result.addVertex(w);
        }
        result.addVertex(newVertex);
        for (let { from, to } of this.getEdges()) {
            let newFrom = from, newTo = to;
            if (from === u || from === v) newFrom = newVertex;
            if (to === u || to === v) newTo = newVertex;
            if (newFrom !== newTo) result.addEdge(newFrom, newTo);
        }
        return result;
    }

    // --- Productos entre grafos ---
    cartesianProduct(other) {
        const result = new GraphModel();
        const V1 = this.getVertices(), V2 = other.getVertices();
        for (let u of V1) {
            for (let v of V2) {
                result.addVertex(`(${u},${v})`);
            }
        }
        // Aristas horizontales: (u1,v) - (u2,v) si (u1,u2) en G1
        for (let { from: u1, to: u2 } of this.getEdges()) {
            for (let v of V2) {
                result.addEdge(`(${u1},${v})`, `(${u2},${v})`);
            }
        }
        // Aristas verticales: (u,v1) - (u,v2) si (v1,v2) en G2
        for (let u of V1) {
            for (let { from: v1, to: v2 } of other.getEdges()) {
                result.addEdge(`(${u},${v1})`, `(${u},${v2})`);
            }
        }
        return result;
    }

    tensorProduct(other) {
        const result = new GraphModel();
        const V1 = this.getVertices(), V2 = other.getVertices();
        for (let u of V1) {
            for (let v of V2) {
                result.addVertex(`(${u},${v})`);
            }
        }
        for (let { from: u1, to: u2 } of this.getEdges()) {
            for (let { from: v1, to: v2 } of other.getEdges()) {
                result.addEdge(`(${u1},${v1})`, `(${u2},${v2})`);
                result.addEdge(`(${u1},${v2})`, `(${u2},${v1})`);
            }
        }
        return result;
    }

    // Composición (producto lexicográfico): G[H] = G □ H con aristas adicionales cuando u1=u2 y (v1,v2) en H
    composition(other) {
        const result = new GraphModel();
        const V1 = this.getVertices(), V2 = other.getVertices();
        for (let u of V1) {
            for (let v of V2) {
                result.addVertex(`(${u},${v})`);
            }
        }
        // Aristas horizontales: (u1,v) - (u2,v) si (u1,u2) en G1
        for (let { from: u1, to: u2 } of this.getEdges()) {
            for (let v of V2) {
                result.addEdge(`(${u1},${v})`, `(${u2},${v})`);
            }
        }
        // Aristas verticales internas: (u,v1) - (u,v2) si (v1,v2) en G2
        for (let u of V1) {
            for (let { from: v1, to: v2 } of other.getEdges()) {
                result.addEdge(`(${u},${v1})`, `(${u},${v2})`);
            }
        }
        return result;
    }

    // --- Ejemplos predefinidos ---
    static empty() { return new GraphModel(); }
    static complete(n) {
        const g = new GraphModel();
        for (let i = 0; i < n; i++) g.addVertex(i);
        for (let i = 0; i < n; i++)
            for (let j = i+1; j < n; j++)
                g.addEdge(i, j);
        return g;
    }
    static cycle(n) {
        const g = new GraphModel();
        for (let i = 0; i < n; i++) g.addVertex(i);
        for (let i = 0; i < n; i++) g.addEdge(i, (i+1)%n);
        return g;
    }
}