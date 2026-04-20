/**
 * Controlador para Centro o Bicentro de un arbol.
 * Usa poda iterativa de hojas hasta quedar con 1 o 2 vertices.
 */
class CenterBicentroController {
    constructor(model, mainView) {
        this.model = model;
        this.mainView = mainView;
        this.stepViews = [];
    }

    init() {
        this._renderMain();
        this._updateSetRepresentation();
        this._clearProcess();
    }

    addVertex(input) {
        const raw = input.trim();
        if (!raw) {
            showNotification('Ingresa un vértice válido', 'error');
            return;
        }

        const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
        let added = 0;
        for (const v of parts) {
            if (this.model.addVertex(v)) added += 1;
        }

        if (added === 0) {
            showNotification('Los vértices ya existen', 'error');
            return;
        }

        showNotification(`${added} vértice(s) agregado(s)`, 'success');
        this._renderMain();
        this._updateSetRepresentation();
        this._clearProcess();
    }

    removeVertex(input) {
        const v = input.trim();
        if (!v) {
            showNotification('Ingresa el vértice a eliminar', 'error');
            return;
        }

        if (!this.model.removeVertex(v)) {
            showNotification(`Vértice '${v}' no existe`, 'error');
            return;
        }

        showNotification(`Vértice '${v}' eliminado`, 'success');
        this._renderMain();
        this._updateSetRepresentation();
        this._clearProcess();
    }

    addEdge(from, to) {
        if (!from.trim() || !to.trim()) {
            showNotification('Ingresa los dos vértices de la arista', 'error');
            return;
        }

        if (from.trim() === to.trim()) {
            showNotification('La arista no puede unir un vértice consigo mismo', 'error');
            return;
        }

        this.model.addEdge(from, to);
        showNotification(`Arista ${from.trim()}–${to.trim()} agregada`, 'success');
        this._renderMain();
        this._updateSetRepresentation();
        this._clearProcess();
    }

    removeEdge(from, to) {
        if (!from.trim() || !to.trim()) {
            showNotification('Ingresa los dos vértices de la arista a eliminar', 'error');
            return;
        }

        if (!this.model.removeEdge(from, to)) {
            showNotification('Arista no encontrada', 'error');
            return;
        }

        showNotification(`Arista ${from.trim()}–${to.trim()} eliminada`, 'success');
        this._renderMain();
        this._updateSetRepresentation();
        this._clearProcess();
    }

    calculate() {
        const result = this._computeProcess();
        if (!result.ok) {
            showNotification(result.error, 'error');
            this._clearProcess();
            return;
        }

        this._renderProcess(result.steps);
        showNotification('Centro/Bicentro calculado correctamente', 'success');
    }

    reset() {
        this.model.clear();
        this._renderMain();
        this._updateSetRepresentation();
        this._clearProcess();
        showNotification('Se limpió la pestaña de centro o bicentro', 'success');
    }

    _renderMain() {
        this.mainView.render(this.model);
    }

    _updateSetRepresentation() {
        const vertices = this.model.getVertices();
        const edges = this.model.getEdges();
        const vEl = document.getElementById('cbSetV');
        const eEl = document.getElementById('cbSetE');
        if (vEl) vEl.textContent = vertices.length ? vertices.join(', ') : '—';
        if (eEl) eEl.textContent = edges.length ? edges.map(e => `(${e.from}, ${e.to})`).join(', ') : '—';
    }

    _computeProcess() {
        const vertices = this.model.getVertices();
        const edges = this.model.getEdges();

        if (vertices.length === 0) {
            return { ok: false, error: 'Agrega al menos un vértice' };
        }

        if (vertices.length === 1 && edges.length === 0) {
            return {
                ok: true,
                steps: [{ vertices: [...vertices], edges: [], removedLeaves: [] }],
                finalType: 'Centro',
                finalVertices: [...vertices]
            };
        }

        if (edges.length !== vertices.length - 1 || !this._isConnected(vertices, edges)) {
            return { ok: false, error: 'El grafo debe ser un árbol conexo para hallar centro o bicentro' };
        }

        const steps = [];
        let currentVertices = [...vertices];
        let currentEdges = [...edges];

        while (true) {
            const leaves = this._findLeaves(currentVertices, currentEdges);
            steps.push({
                vertices: [...currentVertices],
                edges: [...currentEdges],
                removedLeaves: [...leaves]
            });

            if (currentVertices.length <= 2) break;

            const nextVertices = currentVertices.filter(v => !leaves.includes(v));
            const nextEdges = currentEdges.filter(edge => nextVertices.includes(edge.from) && nextVertices.includes(edge.to));

            if (nextVertices.length === currentVertices.length) {
                break;
            }

            currentVertices = nextVertices;
            currentEdges = nextEdges;
        }

        const finalVertices = steps[steps.length - 1].vertices;
        const finalType = finalVertices.length === 1 ? 'Centro' : 'Bicentro';

        return {
            ok: true,
            steps,
            finalType,
            finalVertices
        };
    }

    _findLeaves(vertices, edges) {
        const degree = new Map(vertices.map(v => [v, 0]));
        for (const edge of edges) {
            if (degree.has(edge.from)) degree.set(edge.from, degree.get(edge.from) + 1);
            if (degree.has(edge.to)) degree.set(edge.to, degree.get(edge.to) + 1);
        }

        const leaves = vertices.filter(v => degree.get(v) <= 1);
        if (vertices.length === 2 && leaves.length === 2) return leaves;
        return leaves;
    }

    _isConnected(vertices, edges) {
        if (vertices.length === 0) return true;

        const adjacency = new Map(vertices.map(v => [v, new Set()]));
        for (const edge of edges) {
            adjacency.get(edge.from)?.add(edge.to);
            adjacency.get(edge.to)?.add(edge.from);
        }

        const visited = new Set();
        const stack = [vertices[0]];
        while (stack.length) {
            const v = stack.pop();
            if (visited.has(v)) continue;
            visited.add(v);
            for (const next of adjacency.get(v) || []) {
                if (!visited.has(next)) stack.push(next);
            }
        }

        return visited.size === vertices.length;
    }

    _renderProcess(steps) {
        const container = document.getElementById('cbProcessContainer');
        if (!container) return;

        this.stepViews.forEach(view => view.clear());
        this.stepViews = [];

        container.innerHTML = '';

        steps.forEach((step, index) => {
            const card = document.createElement('div');
            card.className = 'cb-process-card';
            card.innerHTML = `
                <div class="cb-process-header">
                    <div>
                        <strong>Iteración ${index + 1}</strong>
                        <div class="cb-process-subtitle">${index === 0 ? 'Grafo original' : 'Grafo tras eliminar hojas'}</div>
                    </div>
                    <div class="cb-process-badge">${step.vertices.length} vértice(s)</div>
                </div>
                <div class="cb-process-leaves">Hojas eliminadas: ${step.removedLeaves.length ? step.removedLeaves.join(', ') : '—'}</div>
                <div id="cbStep${index}" class="cb-step-graph"></div>
            `;
            container.appendChild(card);

            const view = new GraphView(`cbStep${index}`, 760, 260);
            const pseudo = {
                getVertices: () => step.vertices,
                getEdges: () => step.edges
            };
            view.render(pseudo);
            this.stepViews.push(view);
        });
    }

    _clearProcess() {
        this.stepViews.forEach(view => view.clear());
        this.stepViews = [];

        const container = document.getElementById('cbProcessContainer');
        if (container) container.innerHTML = '<div class="text-muted text-center py-4">Iteraciones.</div>';
    }
}

window.CenterBicentroController = CenterBicentroController;
