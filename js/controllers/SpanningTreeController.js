/**
 * Controlador — Árboles de Expansión Mínima y Máxima
 */
class SpanningTreeController {
    constructor(model, mainView, minView, maxView) {
        this.model   = model;
        this.mainView = mainView;
        this.minView  = minView;
        this.maxView  = maxView;
    }

    init() {
        console.log('SpanningTreeController inicializado');
        this._renderAll();
    }

    // ── Vértices ─────────────────────────────────────────
    addVertex(input) {
        const raw = input.trim();
        if (!raw) { showNotification('Ingresa un vértice válido', 'error'); return; }

        // Permite ingresar varios separados por coma
        const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
        let added = 0;
        for (const v of parts) {
            if (this.model.addVertex(v)) added++;
        }

        if (added === 0) {
            showNotification('El vértice ya existe', 'error');
        } else {
            showNotification(`${added} vértice(s) agregado(s)`, 'success');
            this._renderAll();
        }
    }

    removeVertex(input) {
        const v = input.trim().toUpperCase();
        if (!v) { showNotification('Ingresa el vértice a eliminar', 'error'); return; }
        if (this.model.removeVertex(v)) {
            showNotification(`Vértice '${v}' eliminado`, 'success');
            this._renderAll();
            this._updateEdgeTable();
        } else {
            showNotification(`Vértice '${v}' no existe`, 'error');
        }
    }

    // ── Aristas ──────────────────────────────────────────
    addEdge(from, to, weight) {
        if (!from.trim() || !to.trim()) {
            showNotification('Ingresa los dos vértices de la arista', 'error');
            return;
        }
        const w = weight.trim() === '' ? 1 : parseFloat(weight);
        if (isNaN(w)) { showNotification('El peso debe ser un número', 'error'); return; }

        if (this.model.addEdge(from, to, w)) {
            showNotification(`Arista ${from.toUpperCase()}–${to.toUpperCase()} (peso: ${w}) agregada`, 'success');
            this._renderAll();
            this._updateEdgeTable();
        } else {
            showNotification('La arista ya existe o los vértices son iguales', 'error');
        }
    }

    removeEdge(from, to) {
        if (!from.trim() || !to.trim()) {
            showNotification('Ingresa los dos vértices de la arista a eliminar', 'error');
            return;
        }
        const u = from.trim().toUpperCase();
        const v = to.trim().toUpperCase();
        if (this.model.removeEdge(u, v)) {
            showNotification(`Arista ${u}–${v} eliminada`, 'success');
            this._renderAll();
            this._updateEdgeTable();
        } else {
            showNotification('Arista no encontrada', 'error');
        }
    }

    // ── Calcular árboles ─────────────────────────────────
    calculate() {
        const vertices = this.model.getVertices();
        const edges    = this.model.getEdges();

        if (vertices.length < 2) {
            showNotification('Necesitas al menos 2 vértices', 'error'); return;
        }
        if (edges.length === 0) {
            showNotification('Agrega al menos una arista', 'error'); return;
        }

        const minResult = this.model.getMinSpanningTree();
        const maxResult = this.model.getMaxSpanningTree();

        if (!minResult.connected) {
            showNotification('El grafo no es conexo: no existe árbol de expansión', 'error');
            this._updateResultInfo(null, null);
            return;
        }

        // Renderizar árboles resaltados
        this.minView.renderTree(this.model, minResult.edges, '#2e7d32');
        this.maxView.renderTree(this.model, maxResult.edges, '#b71c1c');

        this._updateResultInfo(minResult, maxResult);
        showNotification('Árboles calculados correctamente', 'success');
    }

    // ── Reset ─────────────────────────────────────────────
    reset() {
        this.model.reset();
        this._renderAll();
        this._updateEdgeTable();
        this._updateResultInfo(null, null);
        showNotification('Grafo reiniciado', 'success');
    }

    // ── Internos ─────────────────────────────────────────
    _renderAll() {
        this.mainView.render(this.model);
        this.minView.render(this.model);
        this.maxView.render(this.model);
        this._updateSetRepresentation();
    }

    _updateVertexBadges() {
        // Mantenido por compatibilidad — la representación T=(S,A) reemplaza los badges
        this._updateSetRepresentation();
    }

    _updateEdgeTable() {
        // La tabla fue reemplazada por la representación T=(S,A)
        this._updateSetRepresentation();
    }

    _updateSetRepresentation() {
        const verts = this.model.getVertices();
        const edges = this.model.getEdges();

        const sStr = verts.length > 0 ? verts.join(', ') : '—';
        const aStr = edges.length > 0
            ? edges.map(e => `(${e.from}, ${e.to}, ${e.weight})`).join(', ')
            : '—';

        const sEl = document.getElementById('stSetS');
        const aEl = document.getElementById('stSetA');
        if (sEl) sEl.textContent = sStr;
        if (aEl) aEl.textContent = aStr;
    }

    _updateResultInfo(minResult, maxResult) {
        const minEl    = document.getElementById('stMinInfo');
        const maxEl    = document.getElementById('stMaxInfo');
        const minSetRep = document.getElementById('stMinSetRep');
        const maxSetRep = document.getElementById('stMaxSetRep');

        if (!minEl || !maxEl) return;

        if (!minResult) {
            minEl.innerHTML = '<span class="text-muted">—</span>';
            maxEl.innerHTML = '<span class="text-muted">—</span>';
            if (minSetRep) minSetRep.style.display = 'none';
            if (maxSetRep) maxSetRep.style.display = 'none';
            return;
        }

        const allVerts = this.model.getVertices();
        const sStr = allVerts.join(', ');

        // Mínimo
        const minAStr = minResult.edges
            .map(e => `(${e.from}, ${e.to}, ${e.weight})`).join(', ');
        minEl.innerHTML = `<span class="badge" style="background:#2e7d32">Costo total: ${minResult.totalWeight}</span>`;
        if (minSetRep) {
            minSetRep.style.display = 'block';
            const ms = document.getElementById('stMinSetS');
            const ma = document.getElementById('stMinSetA');
            if (ms) ms.textContent = sStr;
            if (ma) ma.textContent = minAStr || '—';
        }

        // Máximo
        const maxAStr = maxResult.edges
            .map(e => `(${e.from}, ${e.to}, ${e.weight})`).join(', ');
        maxEl.innerHTML = `<span class="badge" style="background:#b71c1c">Costo total: ${maxResult.totalWeight}</span>`;
        if (maxSetRep) {
            maxSetRep.style.display = 'block';
            const ms = document.getElementById('stMaxSetS');
            const ma = document.getElementById('stMaxSetA');
            if (ms) ms.textContent = sStr;
            if (ma) ma.textContent = maxAStr || '—';
        }
    }
}

window.SpanningTreeController = SpanningTreeController;
