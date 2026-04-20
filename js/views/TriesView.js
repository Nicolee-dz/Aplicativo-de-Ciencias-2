/**
 * Vista D3 — TRIES
 * Layout manual con espacio proporcional al número de HOJAS de cada subárbol:
 *   - Hijo bit=0 recibe fracción izquierda proporcional a sus hojas
 *   - Hijo bit=1 recibe fracción derecha proporcional a sus hojas
 *   - Las hojas aparecen en su profundidad REAL (no se alargan ramas)
 *   - Nodos internos: círculo vacío
 *   - Hojas: círculo con LETRA + bits
 *   - Aristas: etiqueta 0 (azul) / 1 (rojo)
 */
class TriesView {
    constructor(containerId = 'triesTreeContainer') {
        this.container   = document.getElementById(containerId);
        this.d3container = d3.select(`#${containerId}`);
        this.svg         = null;
    }

    render(model) {
        if (!this.d3container || !this.d3container.node()) return;
        this.d3container.html('');

        const hierarchy = model.getHierarchy();
        if (!hierarchy) return;

        const maxDepth = this._getDepth(hierarchy);

        // ── Dimensiones ──────────────────────────────────────
        const leafCount = this._countLeaves(hierarchy);
        const nodeSpacing = 80; // espacio mínimo por hoja
        const W       = Math.max(700, leafCount * nodeSpacing);
        const levelH  = 90;
        const height  = Math.max(350, (maxDepth + 2) * levelH);
        const marginX = 50;
        const startY  = 45;

        // ── Calcular posiciones ──────────────────────────────
        // El espacio se reparte proporcional al número de hojas
        // de cada subárbol. Así los nodos no se amontonan.
        const nodes = [];
        const links = [];

        const assignPos = (node, xMin, xMax, depth, parentPos, edgeLabel) => {
            if (!node) return;

            const x   = (xMin + xMax) / 2;
            const y   = startY + depth * levelH;
            const pos = { x, y, node, edgeLabel, depth };
            nodes.push(pos);

            if (parentPos) {
                links.push({ source: parentPos, target: pos, edgeLabel });
            }

            if (!node.children || node.children.length === 0) return;

            // Contar hojas de cada hijo para distribuir espacio
            const leftChild  = node.children.find(c => c.edgeLabel === 0) || null;
            const rightChild = node.children.find(c => c.edgeLabel === 1) || null;

            const leftLeaves  = leftChild  ? this._countLeaves(leftChild)  : 0;
            const rightLeaves = rightChild ? this._countLeaves(rightChild) : 0;
            const totalLeaves = leftLeaves + rightLeaves || 1;

            const totalWidth = xMax - xMin;
            const leftWidth  = totalLeaves > 0 ? (totalWidth * leftLeaves  / totalLeaves) : totalWidth / 2;
            const rightWidth = totalLeaves > 0 ? (totalWidth * rightLeaves / totalLeaves) : totalWidth / 2;

            if (leftChild) {
                assignPos(leftChild,  xMin,            xMin + leftWidth,  depth + 1, pos, 0);
            }
            if (rightChild) {
                assignPos(rightChild, xMin + leftWidth, xMax,             depth + 1, pos, 1);
            }
        };

        assignPos(hierarchy, marginX, W - marginX, 0, null, null);

        // ── SVG ──────────────────────────────────────────────
        const svg = this.d3container.append('svg')
            .attr('width',  W)
            .attr('height', height)
            .style('border',        '1px solid #e0e0e0')
            .style('border-radius', '8px')
            .style('display',       'block')
            .style('background',    '#fafbfc');

        const g = svg.append('g');

        // ── Aristas ──────────────────────────────────────────
        links.forEach(link => {
            g.append('line')
                .attr('x1',           link.source.x)
                .attr('y1',           link.source.y)
                .attr('x2',           link.target.x)
                .attr('y2',           link.target.y)
                .attr('stroke',       '#9aa')
                .attr('stroke-width', 1.8);

            const mx    = (link.source.x + link.target.x) / 2;
            const my    = (link.source.y + link.target.y) / 2;
            const color = link.edgeLabel === 0 ? '#1565c0' : '#b71c1c';

            g.append('circle')
                .attr('cx',           mx)
                .attr('cy',           my)
                .attr('r',            10)
                .attr('fill',         '#fff')
                .attr('stroke',       color)
                .attr('stroke-width', 1.6);

            g.append('text')
                .attr('x',            mx)
                .attr('y',            my + 4)
                .attr('text-anchor',  'middle')
                .style('font-size',   '11px')
                .style('font-weight', 'bold')
                .style('font-family', 'monospace')
                .style('fill',        color)
                .text(link.edgeLabel);
        });

        // ── Nodos ────────────────────────────────────────────
        const nodeG = g.append('g').selectAll('g')
            .data(nodes)
            .join('g')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .attr('class', 'dt-node');

        nodeG.append('circle')
            .attr('r',         22)
            .attr('class',     'dt-circle')
            .attr('data-char', d => d.node.char || '');

        // Letra — solo hojas
        nodeG.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy',          '-2px')
            .attr('class',       'dt-label-char')
            .text(d => d.node.isLeaf ? (d.node.char || '') : '');

        // Bits — solo hojas
        nodeG.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy',          '11px')
            .attr('class',       'dt-label-bits')
            .text(d => d.node.isLeaf ? (d.node.bitsStr || '') : '');

        // Guardar para animación
        this.svg    = svg;
        this.g      = g;
        this._nodes = nodes;
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
                const last = path[path.length - 1];
                if (last && last.node) {
                    self.svg.selectAll('circle.dt-circle').each(function(d) {
                        if (d && d.node && d.node._ref === last.node) {
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
                    if (d && d.node && d.node._ref === p.node) {
                        d3.select(this).classed('dt-visiting', true);
                    }
                });
            }

            stepIndex++;
            setTimeout(step, 650);
        };

        step();
    }

    /** Cuenta solo las hojas reales del subárbol */
    _countLeaves(node) {
        if (!node) return 0;
        if (!node.children || node.children.length === 0) return 1;
        return node.children.reduce((sum, c) => sum + this._countLeaves(c), 0);
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

window.TriesView = TriesView;   