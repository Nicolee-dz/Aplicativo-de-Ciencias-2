/**
 * Vista D3 — Residuos Múltiples
 * - Todas las hojas quedan al MISMO nivel (profundidad = groupCount)
 * - Cada nodo puede tener hasta M = 2^n hijos
 * - Aristas con etiqueta de grupo (ej: "01", "10", "0")
 * - Nodos internos: círculo vacío
 * - Hojas: LETRA + binario
 * - Layout: espacio dividido en M partes iguales por nivel
 */
class ResiduosMultipleView {
    constructor(containerId = 'residueTreeContainer') {
        this.container   = document.getElementById(containerId);
        this.d3container = d3.select(`#${containerId}`);
        this.svg         = null;
    }

    render(model) {
        if (!this.d3container || !this.d3container.node()) return;
        this.d3container.html('');

        const hierarchy = model.getHierarchy();
        if (!hierarchy) {
            this.d3container.append('div')
                .style('color', '#aaa')
                .style('text-align', 'center')
                .style('padding', '40px')
                .style('font-style', 'italic')
                .text('Inserta una palabra para visualizar el árbol');
            return;
        }

        const maxDepth = model.groupCount;
        const M        = model.M;
        const n        = model.n;

        // ── Dimensiones ──────────────────────────────────────
        // El número máximo de hojas posibles es M^(groupCount-1) * 2 (último nivel puede ser 2)
        // Pero usamos el conteo real de nodos en el último nivel para el ancho
        const leafCount   = this._countAtDepth(hierarchy, maxDepth);
        const nodeSpacing = Math.max(70, 90 - (M * 5)); // más compacto si hay más hijos
        const W       = Math.max(700, Math.max(leafCount, M) * nodeSpacing);
        const levelH  = 95;
        const height  = Math.max(350, (maxDepth + 2) * levelH);
        const marginX = 50;
        const startY  = 50;

        // ── Calcular posiciones ──────────────────────────────
        // Cada nodo recibe un rango [xMin, xMax].
        // Sus hijos dividen ese rango en partes IGUALES según el número
        // de hijos posibles en ese nivel (para mantener la estructura simétrica).
        const nodes = [];
        const links = [];

        const assignPos = (node, xMin, xMax, depth, parentPos, edgeLabel) => {
            if (!node) return;

            const x   = (xMin + xMax) / 2;
            const y   = startY + depth * levelH;
            const pos = { x, y, node, edgeLabel, depth };
            nodes.push(pos);

            if (parentPos) links.push({ source: parentPos, target: pos, edgeLabel });

            if (!node.children || node.children.length === 0) return;

            // Ordenar hijos por edgeLabel
            const sortedChildren = [...node.children]
                .sort((a, b) => (a.edgeLabel || '').localeCompare(b.edgeLabel || ''));

            // Dividir el rango en partes iguales entre los hijos reales
            const totalWidth  = xMax - xMin;
            const childWidth  = totalWidth / sortedChildren.length;

            sortedChildren.forEach((child, i) => {
                const cxMin = xMin + i * childWidth;
                const cxMax = cxMin + childWidth;
                assignPos(child, cxMin, cxMax, depth + 1, pos, child.edgeLabel);
            });
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

        // Paleta de colores según valor entero del grupo
        const palette = [
            '#1565c0', '#b71c1c', '#2e7d32', '#e65100',
            '#6a1b9a', '#00838f', '#558b2f', '#4e342e',
            '#37474f', '#ad1457', '#0277bd', '#283593',
            '#4a148c', '#880e4f', '#1b5e20', '#bf360c',
            '#006064', '#33691e', '#3e2723', '#212121',
            '#f57f17', '#0d47a1', '#1a237e', '#311b92',
            '#880e4f', '#4a148c', '#01579b', '#006064',
            '#33691e', '#827717', '#e65100', '#bf360c'
        ];
        const edgeColor = (label) => {
            if (!label) return '#9aa';
            const idx = parseInt(label, 2) % palette.length;
            return palette[idx];
        };

        // ── Aristas ──────────────────────────────────────────
        links.forEach(link => {
            g.append('line')
                .attr('x1',           link.source.x)
                .attr('y1',           link.source.y)
                .attr('x2',           link.target.x)
                .attr('y2',           link.target.y)
                .attr('stroke',       '#bbb')
                .attr('stroke-width', 1.6);

            if (link.edgeLabel !== null && link.edgeLabel !== undefined) {
                const mx    = (link.source.x + link.target.x) / 2;
                const my    = (link.source.y + link.target.y) / 2;
                const color = edgeColor(link.edgeLabel);
                const rw    = link.edgeLabel.length * 7 + 8;

                g.append('rect')
                    .attr('x',            mx - rw / 2)
                    .attr('y',            my - 10)
                    .attr('width',        rw)
                    .attr('height',       18)
                    .attr('rx',           5)
                    .attr('fill',         '#fff')
                    .attr('stroke',       color)
                    .attr('stroke-width', 1.5);

                g.append('text')
                    .attr('x',            mx)
                    .attr('y',            my + 4)
                    .attr('text-anchor',  'middle')
                    .style('font-size',   '10px')
                    .style('font-weight', 'bold')
                    .style('font-family', 'monospace')
                    .style('fill',        color)
                    .text(link.edgeLabel);
            }
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

        // Binario — solo hojas
        nodeG.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy',          '11px')
            .attr('class',       'dt-label-bits')
            .text(d => d.node.isLeaf ? (d.node.bitsStr || '') : '');

        this.svg    = svg;
        this.g      = g;
        this._nodes = nodes;
    }

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

    /** Cuenta nodos en una profundidad específica */
    _countAtDepth(node, targetDepth, currentDepth = 0) {
        if (!node) return 0;
        if (currentDepth === targetDepth) return 1;
        if (!node.children) return 0;
        return node.children.reduce(
            (s, c) => s + this._countAtDepth(c, targetDepth, currentDepth + 1), 0
        );
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

window.ResiduosMultipleView = ResiduosMultipleView;