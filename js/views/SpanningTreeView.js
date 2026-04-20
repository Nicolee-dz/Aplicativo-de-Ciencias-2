/**
 * Vista D3 — Árbol de Expansión
 * Basada en GraphView.js con soporte para:
 *  - Pesos en aristas
 *  - Resaltado de aristas del árbol (mínimo / máximo)
 *  - Nodos arrastrables (force simulation)
 */
class SpanningTreeView {
    constructor(containerId, width = 700, height = 420) {
        this.containerId = containerId;
        this.container   = document.getElementById(containerId);
        this.width       = width;
        this.height      = height;
        this.svg         = null;
        this.simulation  = null;
        this.graphData   = { nodes: [], links: [] };
    }

    // ── Render grafo base ────────────────────────────────
    render(model, highlightEdges = [], highlightColor = '#999') {
        if (!this.container) return;
        this.container.innerHTML = '';

        const vertices = model.getVertices();
        const edges    = model.getEdges();

        if (vertices.length === 0) {
            this.container.innerHTML =
                '<div style="color:#aaa;text-align:center;padding:60px;font-style:italic;">Agrega vértices y aristas para visualizar el grafo</div>';
            return;
        }

        // Preservar posiciones si ya existían
        const prevPos = new Map();
        this.graphData.nodes.forEach(n => prevPos.set(n.id, { x: n.x, y: n.y }));

        const centerX = (this.container.clientWidth || this.width) / 2;
        const centerY = this.height / 2;
        const radius = Math.max(60, Math.min(this.container.clientWidth || this.width, this.height) * 0.26);

        const nodeMap = new Map();
        const nodes = vertices.map((v, i) => {
            const prev = prevPos.get(v);
            const angle = (2 * Math.PI * i) / Math.max(vertices.length, 1);
            const node = {
                id: v,
                label: v.toString(),
                x: prev?.x ?? (centerX + radius * Math.cos(angle)),
                y: prev?.y ?? (centerY + radius * Math.sin(angle))
            };
            nodeMap.set(v, node);
            return node;
        });

        // Construir conjunto de aristas resaltadas para lookup rápido
        const hlSet = new Set(
            highlightEdges.map(e => `${e.from}|${e.to}`)
        );
        const isHighlighted = (u, v) => hlSet.has(`${u}|${v}`) || hlSet.has(`${v}|${u}`);

        const links = edges.map(e => ({
            source:     nodeMap.get(e.from),
            target:     nodeMap.get(e.to),
            weight:     e.weight,
            highlighted: isHighlighted(e.from, e.to)
        }));

        this.graphData = { nodes, links };
        this._buildSVG(highlightColor);
    }

    // ── Render solo el árbol (subconjunto de aristas) ───
    renderTree(model, treeEdges, color) {
        this.render(model, treeEdges, color);
    }

    _buildSVG(highlightColor) {
        if (this.simulation) this.simulation.stop();

        const w = this.width, h = this.height;

        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width',  '100%')
            .attr('height', h)
            .style('border',        '1px solid #dde')
            .style('border-radius', '10px')
            .style('background',    '#fafbfc')
            .style('display',       'block');

        // Definir marcadores de flecha (no usados en no-dirigido, pero útil)
        const defs = this.svg.append('defs');
        defs.append('marker')
            .attr('id', `arrow-${this.containerId}`)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 28).attr('refY', 0)
            .attr('markerWidth', 6).attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#999');

        const g = this.svg.append('g');

        // Usar ancho real del contenedor para centrar correctamente
        const actualW = this.container.clientWidth || w;

        // Zoom + pan
        this.svg.call(
            d3.zoom().scaleExtent([0.3, 3])
                .on('zoom', (event) => g.attr('transform', event.transform))
        );

        // ── Aristas ──────────────────────────────────────
        const linkG = g.append('g').attr('class', 'links');
        const linkSel = linkG.selectAll('line')
            .data(this.graphData.links)
            .join('line')
            .attr('stroke', d => d.highlighted ? highlightColor : '#bbb')
            .attr('stroke-width', d => d.highlighted ? 4 : 2)
            .attr('stroke-opacity', d => d.highlighted ? 1 : 0.7);

        // ── Etiquetas de peso en aristas ─────────────────
        const weightG = g.append('g').attr('class', 'weights');
        const weightSel = weightG.selectAll('text')
            .data(this.graphData.links)
            .join('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-5px')
            .style('font-size',   '11px')
            .style('font-weight', '600')
            .style('font-family', 'monospace')
            .style('fill', d => d.highlighted ? highlightColor : '#777')
            .style('pointer-events', 'none')
            .text(d => d.weight !== 1 || d.highlighted ? d.weight : '');

        // ── Nodos ─────────────────────────────────────────
        const nodeG = g.append('g').attr('class', 'nodes');
        const nodeSel = nodeG.selectAll('g')
            .data(this.graphData.nodes)
            .join('g')
            .attr('class', 'st-node')
            .call(d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) this.simulation.alphaTarget(0.08).restart();
                    d.fx = d.x; d.fy = d.y;
                })
                .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
                .on('end', (event, d) => {
                    if (!event.active) this.simulation.alphaTarget(0);
                    d.fx = null; d.fy = null;
                })
            );

        nodeSel.append('circle')
            .attr('r', 22)
            .attr('fill', '#4b6cb7')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2.5);

        nodeSel.append('text')
            .text(d => d.label)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', 'white')
            .style('font-weight', 'bold')
            .style('font-size', '13px')
            .style('pointer-events', 'none');

        // ── Simulación ───────────────────────────────────
        this.simulation = d3.forceSimulation(this.graphData.nodes)
            .alpha(0.35)
            .alphaDecay(0.12)
            .alphaMin(0.03)
            .velocityDecay(0.75)
            .force('link',   d3.forceLink(this.graphData.links).id(d => d.id).distance(95).strength(0.85))
            .force('charge', d3.forceManyBody().strength(-150))
            .force('center', d3.forceCenter(actualW / 2, h / 2))
            .force('collision', d3.forceCollide(30));

        this.simulation.on('tick', () => {
            linkSel
                .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
            weightSel
                .attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2);
            nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
        });
    }

    clear() {
        if (this.simulation) this.simulation.stop();
        if (this.container) this.container.innerHTML = '';
    }
}

window.SpanningTreeView = SpanningTreeView;
