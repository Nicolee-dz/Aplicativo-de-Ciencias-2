/**
 * Vista D3 — Árbol Digital de Búsqueda
 * Mismo algoritmo que TriesView (proporcional a hojas reales),
 * pero cuando solo hay un hijo respeta su lado (0=izq, 1=der).
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

        const maxDepth  = this._getDepth(hierarchy);
        const leafCount = this._countLeaves(hierarchy);

        const nodeSpacing = 80;
        const W       = Math.max(700, leafCount * nodeSpacing);
        const levelH  = 100;
        const height  = Math.max(400, (maxDepth + 2) * levelH);
        const marginX = 50;
        const startY  = 50;

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

            const leftChild  = node.children.find(c => c.edgeLabel === 0) || null;
            const rightChild = node.children.find(c => c.edgeLabel === 1) || null;
            const totalWidth = xMax - xMin;

            if (leftChild && rightChild) {
                // Proporcional a hojas reales de cada subárbol
                const leftLeaves  = this._countLeaves(leftChild);
                const rightLeaves = this._countLeaves(rightChild);
                const total  = leftLeaves + rightLeaves;
                const split  = totalWidth * (leftLeaves / total);
                assignPos(leftChild,  xMin,        xMin + split, depth + 1, pos, 0);
                assignPos(rightChild, xMin + split, xMax,        depth + 1, pos, 1);
            } else if (leftChild) {
                // Solo izquierdo: centro se desplaza a la izquierda
                // Le damos 2/3 izquierdo para que visualmente quede a la izq del padre
                assignPos(leftChild, xMin, xMin + totalWidth * 0.45, depth + 1, pos, 0);
            } else if (rightChild) {
                // Solo derecho: centro se desplaza a la derecha
                assignPos(rightChild, xMin + totalWidth * 0.55, xMax, depth + 1, pos, 1);
            }
        };

        assignPos(hierarchy, marginX, W - marginX, 0, null, null);

        const svg = this.d3container.append('svg')
            .attr('width',  W)
            .attr('height', height)
            .style('border',        '1px solid #e0e0e0')
            .style('border-radius', '8px')
            .style('display',       'block')
            .style('background',    '#fafbfc');

        const g = svg.append('g');

        links.forEach(link => {
            g.append('line')
                .attr('x1', link.source.x).attr('y1', link.source.y)
                .attr('x2', link.target.x).attr('y2', link.target.y)
                .attr('stroke', '#9aa').attr('stroke-width', 1.8);

            const mx    = (link.source.x + link.target.x) / 2;
            const my    = (link.source.y + link.target.y) / 2;
            const color = link.edgeLabel === 0 ? '#1565c0' : '#b71c1c';

            g.append('circle')
                .attr('cx', mx).attr('cy', my).attr('r', 11)
                .attr('fill', '#fff').attr('stroke', color).attr('stroke-width', 1.8);

            g.append('text')
                .attr('x', mx).attr('y', my + 4)
                .attr('text-anchor', 'middle')
                .style('font-size', '12px').style('font-weight', 'bold')
                .style('font-family', 'monospace').style('fill', color)
                .text(link.edgeLabel);
        });

        const node = g.append('g').selectAll('g').data(nodes).join('g')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .attr('class', 'dt-node');

        node.append('circle')
            .attr('r', 26).attr('class', 'dt-circle')
            .attr('data-char', d => d.node.char || '');

        node.append('text')
            .attr('text-anchor', 'middle').attr('dy', '-3px')
            .attr('class', 'dt-label-char')
            .text(d => d.node.char || '');

        node.append('text')
            .attr('text-anchor', 'middle').attr('dy', '12px')
            .attr('class', 'dt-label-bits')
            .text(d => d.node.bitsStr || '');

        this.svg    = svg;
        this.g      = g;
        this._nodes = nodes;
    }

    animatePath(path, callback) {
        if (!this.svg || !path || path.length === 0) { callback && callback(); return; }
        const self = this;
        let stepIndex = 0;
        self.svg.selectAll('circle.dt-circle')
            .classed('dt-visiting', false).classed('dt-highlight', false);
        const step = () => {
            if (stepIndex >= path.length) {
                const last = path[path.length - 1];
                if (last && last.node) {
                    self.svg.selectAll('circle.dt-circle').each(function(d) {
                        if (d && d.node && d.node._ref === last.node)
                            d3.select(this).classed('dt-visiting', false).classed('dt-highlight', true);
                    });
                }
                callback && callback();
                return;
            }
            const p = path[stepIndex];
            if (p && p.node) {
                self.svg.selectAll('circle.dt-circle').each(function(d) {
                    if (d && d.node && d.node._ref === p.node)
                        d3.select(this).classed('dt-visiting', true);
                });
            }
            stepIndex++;
            setTimeout(step, 650);
        };
        step();
    }

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

window.DigitalTreeView = DigitalTreeView;