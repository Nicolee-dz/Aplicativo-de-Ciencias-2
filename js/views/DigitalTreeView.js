/**
 * Vista D3 — Árbol Digital de Búsqueda
 * ──────────────────────────────────────────────────────────
 * Cada nodo muestra:   LETRA
 *                      bits (ej: 00001)
 *
 * Cada arista muestra: 0 (izquierda) ó 1 (derecha)
 *   en un pequeño círculo sobre la línea
 * ──────────────────────────────────────────────────────────
 */
class DigitalTreeView {
    constructor(containerId = 'digitalTreeContainer') {
        this.container   = document.getElementById(containerId);
        this.d3container = d3.select(`#${containerId}`);
        this.svg         = null;
    }

    render(model) {
        if (!this.d3container || !this.d3container.node()) return;
        this.d3container.html('');

        const hierarchy = model.getHierarchy();
        if (!hierarchy) return;

        const depth     = this._getDepth(hierarchy);
        const nodeCount = this._countNodes(hierarchy);

        const dx       = 130;
        const dy       = 130;
        const minWidth = Math.max(900, nodeCount * dx);
        const height   = Math.max(500, (depth + 2) * dy);

        const svg = this.d3container.append('svg')
            .attr('width',  minWidth)
            .attr('height', height)
            .style('border',        '1px solid #e0e0e0')
            .style('border-radius', '8px')
            .style('display',       'block')
            .style('background',    '#fafbfc');

        const g = svg.append('g')
            .attr('transform', `translate(${minWidth / 2}, 50)`);

        // ── Layout D3 ────────────────────────────────────────
        const tree = d3.tree().nodeSize([dx, dy]);
        const root = d3.hierarchy(hierarchy, d => d.children || []);
        tree(root);

        // ── Aristas + etiquetas 0/1 ──────────────────────────
        const linkGen = d3.linkVertical().x(d => d.x).y(d => d.y);

        root.links().forEach(link => {
            // Línea de arista
            g.append('path')
                .attr('d',            linkGen(link))
                .attr('fill',         'none')
                .attr('stroke',       '#9aa')
                .attr('stroke-width', 1.8);

            // Etiqueta 0/1 en el punto medio de la arista
            const mx         = (link.source.x + link.target.x) / 2;
            const my         = (link.source.y + link.target.y) / 2;
            const edgeLabel  = link.target.data.edgeLabel;

            if (edgeLabel !== null && edgeLabel !== undefined) {
                const color = edgeLabel === 0 ? '#1565c0' : '#b71c1c';

                // Círculo de fondo
                g.append('circle')
                    .attr('cx',           mx)
                    .attr('cy',           my)
                    .attr('r',            11)
                    .attr('fill',         '#fff')
                    .attr('stroke',       color)
                    .attr('stroke-width', 1.8);

                // Texto 0 ó 1
                g.append('text')
                    .attr('x',            mx)
                    .attr('y',            my + 4)
                    .attr('text-anchor',  'middle')
                    .style('font-size',   '12px')
                    .style('font-weight', 'bold')
                    .style('font-family', 'monospace')
                    .style('fill',        color)
                    .text(edgeLabel);
            }
        });

        // ── Nodos ────────────────────────────────────────────
        const node = g.append('g')
            .selectAll('g')
            .data(root.descendants())
            .join('g')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .attr('class', 'dt-node');

        // Círculo del nodo
        node.append('circle')
            .attr('r',    26)
            .attr('class', 'dt-circle')
            .attr('data-char', d => d.data.char || '');

        // Letra grande centrada
        node.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy',          '-3px')
            .attr('class',       'dt-label-char')
            .text(d => d.data.char || '');

        // Bits pequeños debajo de la letra
        node.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy',          '12px')
            .attr('class',       'dt-label-bits')
            .text(d => d.data.bitsStr || '');

        // Guardar para animación
        this.svg = svg;
        this.g   = g;
    }

    /** Anima el recorrido paso a paso */
    animatePath(path, callback) {
        if (!this.svg || !path || path.length === 0) {
            callback && callback();
            return;
        }

        const self = this;
        let stepIndex = 0;

        self.svg.selectAll('circle.dt-circle')
            .classed('dt-visiting', false)
            .classed('dt-highlight', false);

        const step = () => {
            if (stepIndex >= path.length) {
                // Marcar nodo encontrado
                const last = path[path.length - 1];
                if (last && last.node) {
                    self.svg.selectAll('circle.dt-circle').each(function(d) {
                        if (d && d.data && d.data._ref === last.node) {
                            d3.select(this)
                                .classed('dt-visiting',  false)
                                .classed('dt-highlight', true);
                        }
                    });
                }
                callback && callback();
                return;
            }

            const p = path[stepIndex];
            if (p && p.node) {
                self.svg.selectAll('circle.dt-circle').each(function(d) {
                    if (d && d.data && d.data._ref === p.node) {
                        d3.select(this).classed('dt-visiting', true);
                    }
                });
            }

            stepIndex++;
            setTimeout(step, 650);
        };

        step();
    }

    _getDepth(node, d = 0) {
        if (!node || !node.children || !node.children.length) return d;
        return Math.max(...node.children.map(c => this._getDepth(c, d + 1)));
    }

    _countNodes(node) {
        if (!node) return 0;
        let n = 1;
        if (node.children) for (const c of node.children) n += this._countNodes(c);
        return n;
    }
}

window.DigitalTreeView = DigitalTreeView;