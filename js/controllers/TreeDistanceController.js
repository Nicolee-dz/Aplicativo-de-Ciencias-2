/**
 * Controlador para Distancia entre Árboles de Expansión.
 */
class TreeDistanceController {
    constructor(model, viewA, viewB, viewC, viewD) {
        this.model = model;
        this.viewA = viewA;
        this.viewB = viewB;
        this.viewC = viewC;
        this.viewD = viewD;
    }

    init() {
        this._renderInputs();
        this._clearResults();
    }

    addVertex(graphId, input) {
        const raw = input.trim();
        if (!raw) {
            showNotification('Ingresa un vértice válido', 'error');
            return;
        }

        const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
        let added = 0;

        for (const v of parts) {
            if (this.model.addVertex(graphId, v)) added += 1;
        }

        if (added === 0) {
            showNotification('Los vértices ya existen', 'error');
            return;
        }

        showNotification(`${added} vértice(s) agregado(s) en ${graphId}`, 'success');
        this._renderInputs();
        this._clearResults();
    }

    removeVertex(graphId, input) {
        const v = input.trim().toUpperCase();
        if (!v) {
            showNotification('Ingresa el vértice a eliminar', 'error');
            return;
        }

        if (!this.model.removeVertex(graphId, v)) {
            showNotification(`Vértice '${v}' no existe`, 'error');
            return;
        }

        showNotification(`Vértice '${v}' eliminado de ${graphId}`, 'success');
        this._renderInputs();
        this._clearResults();
    }

    addEdge(graphId, from, to, weight) {
        if (!from.trim() || !to.trim()) {
            showNotification('Ingresa los dos vértices de la arista', 'error');
            return;
        }

        const w = weight.trim() === '' ? 1 : parseFloat(weight);
        if (isNaN(w)) {
            showNotification('El peso debe ser un número', 'error');
            return;
        }

        if (!this.model.addEdge(graphId, from, to, w)) {
            showNotification('La arista ya existe o los vértices son iguales', 'error');
            return;
        }

        showNotification(`Arista ${from.toUpperCase()}–${to.toUpperCase()} agregada en ${graphId}`, 'success');
        this._renderInputs();
        this._clearResults();
    }

    removeEdge(graphId, from, to) {
        if (!from.trim() || !to.trim()) {
            showNotification('Ingresa los dos vértices de la arista a eliminar', 'error');
            return;
        }

        const u = from.trim().toUpperCase();
        const v = to.trim().toUpperCase();

        if (!this.model.removeEdge(graphId, u, v)) {
            showNotification('Arista no encontrada', 'error');
            return;
        }

        showNotification(`Arista ${u}–${v} eliminada de ${graphId}`, 'success');
        this._renderInputs();
        this._clearResults();
    }

    calculateDistance() {
        const result = this.model.computeDistanceData();

        if (!result.ok) {
            showNotification(result.error, 'error');
            this._clearResults();
            return;
        }

        this._renderGraph(this.viewA, result.graphA.vertices, result.graphA.edges, '#2e7d32');
        this._renderGraph(this.viewB, result.graphB.vertices, result.graphB.edges, '#1565c0');
        this._renderGraph(this.viewC, result.graphC.vertices, result.graphC.edges, '#ef6c00');
        this._renderGraph(this.viewD, result.graphD.vertices, result.graphD.edges, '#6a1b9a');

        this._updateSetResult('tdSetA', result.graphA.vertices, result.graphA.edges);
        this._updateSetResult('tdSetB', result.graphB.vertices, result.graphB.edges);
        this._updateSetResult('tdSetC', result.graphC.vertices, result.graphC.edges);
        this._updateSetResult('tdSetD', result.graphD.vertices, result.graphD.edges);

        const infoA = document.getElementById('tdInfoA');
        const infoB = document.getElementById('tdInfoB');
        const infoC = document.getElementById('tdInfoC');
        const infoD = document.getElementById('tdInfoD');

        const weightA = result.graphA.edges.reduce((total, edge) => total + (Number(edge.weight) || 0), 0);
        const weightB = result.graphB.edges.reduce((total, edge) => total + (Number(edge.weight) || 0), 0);

        if (infoA) infoA.innerHTML = `<span class="badge" style="background:#2e7d32">Peso total: ${weightA}</span>`;
        if (infoB) infoB.innerHTML = `<span class="badge" style="background:#1565c0">Peso total: ${weightB}</span>`;
        if (infoC) infoC.innerHTML = `<span class="badge" style="background:#ef6c00">Σ pesos: ${result.graphC.weightTotal}</span>`;
        if (infoD) infoD.innerHTML = `<span class="badge" style="background:#6a1b9a">Σ pesos: ${result.graphD.weightTotal}</span>`;

        this._updateDistanceBox(result.graphC.weightTotal, result.graphD.weightTotal, result.distance);
        showNotification('Distancia calculada correctamente', 'success');
    }

    reset() {
        this.model.reset();
        this._renderInputs();
        this._clearResults();
        showNotification('Se limpió la pestaña de distancia', 'success');
    }

    _renderInputs() {
        this._renderGraph(this.viewA, this.model.getVertices('A'), this.model.getEdges('A'), '#2e7d32');
        this._renderGraph(this.viewB, this.model.getVertices('B'), this.model.getEdges('B'), '#1565c0');

        this.viewC.clear();
        this.viewD.clear();

        this._updateInputSetRepresentation('A');
        this._updateInputSetRepresentation('B');
    }

    _renderGraph(view, vertices, edges, color) {
        const pseudo = {
            getVertices: () => vertices,
            getEdges: () => edges
        };

        view.render(pseudo, edges, color);
    }

    _updateInputSetRepresentation(graphId) {
        const s = this.model.getVertices(graphId);
        const a = this.model.getEdges(graphId);

        const sStr = s.length ? s.join(', ') : '—';
        const aStr = a.length
            ? a.map(e => `(${e.from}, ${e.to}, ${e.weight})`).join(', ')
            : '—';

        const sEl = document.getElementById(`tdInputSet${graphId}S`);
        const aEl = document.getElementById(`tdInputSet${graphId}A`);

        if (sEl) sEl.textContent = sStr;
        if (aEl) aEl.textContent = aStr;
    }

    _updateSetResult(prefix, vertices, edges) {
        const box = document.getElementById(prefix);
        if (!box) return;

        const sEl = box.querySelector('[data-role="set-s"]');
        const aEl = box.querySelector('[data-role="set-a"]');

        const sStr = vertices.length ? vertices.join(', ') : '—';
        const aStr = edges.length
            ? edges.map(e => `(${e.from}, ${e.to}, ${e.weight})`).join(', ')
            : '—';

        box.style.display = 'block';
        if (sEl) sEl.textContent = sStr;
        if (aEl) aEl.textContent = aStr;
    }

    _updateDistanceBox(unionWeight, interWeight, distance) {
        const cardEl = document.getElementById('tdDistanceResultCard');
        const detailEl = document.getElementById('tdDistanceDetail');
        const valueEl = document.getElementById('tdDistanceValue');

        if (cardEl) cardEl.style.display = 'block';
        if (detailEl) {
            detailEl.textContent = `d(A,B) = (Σ pesos de C - Σ pesos de D) / 2 = (${unionWeight} - ${interWeight}) / 2`;
        }
        if (valueEl) valueEl.textContent = distance;
    }

    _clearResults() {
        ['tdInfoA', 'tdInfoB', 'tdInfoC', 'tdInfoD'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<span class="text-muted" style="font-size:0.8rem">—</span>';
        });

        ['tdSetA', 'tdSetB', 'tdSetC', 'tdSetD'].forEach(id => {
            const box = document.getElementById(id);
            if (!box) return;
            box.style.display = 'none';

            const sEl = box.querySelector('[data-role="set-s"]');
            const aEl = box.querySelector('[data-role="set-a"]');
            if (sEl) sEl.textContent = '—';
            if (aEl) aEl.textContent = '—';
        });

        const cardEl = document.getElementById('tdDistanceResultCard');
        const detailEl = document.getElementById('tdDistanceDetail');
        const valueEl = document.getElementById('tdDistanceValue');

        if (cardEl) cardEl.style.display = 'none';
        if (detailEl) detailEl.textContent = '—';
        if (valueEl) valueEl.textContent = '—';
    }
}

window.TreeDistanceController = TreeDistanceController;
