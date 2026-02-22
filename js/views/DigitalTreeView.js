/**
 * Vista D3 para el Árbol Digital
 * Renderiza el árbol y anima la búsqueda
 */
class DigitalTreeView {
    constructor(containerId = 'digitalTreeContainer') {
        this.container = document.getElementById(containerId);
        this.d3container = d3.select(`#${containerId}`);
    }

    render(model) {
        if (!this.d3container || !this.d3container.node()) return;
        this.d3container.html('');

        const hierarchy = model.getHierarchy();
        if (!hierarchy) return;

        // Calcular dimensiones basadas en la profundidad del árbol
        const depth = this._getDepth(hierarchy);
        const nodeCount = this._countNodes(hierarchy);
        
        // Ancho mínimo para mostrar el árbol completamente
        const minWidth = Math.max(800, nodeCount * 80);
        const height = Math.max(500, (depth + 1) * 120);

        const svg = this.d3container.append('svg')
            .attr('width', minWidth)
            .attr('height', height)
            .style('border', '1px solid #e0e0e0')
            .style('border-radius', '6px')
            .style('display', 'block');

        const g = svg.append('g')
            .attr('transform', `translate(${minWidth / 2}, 30)`);

        // D3 tree layout con mejor espaciado
        const dx = 100; // espacio horizontal entre nodos
        const dy = 120; // espacio vertical entre niveles
        const tree = d3.tree().nodeSize([dx, dy]);
        const root = d3.hierarchy(hierarchy);
        tree(root);

        // Draw links
        g.append('g')
            .attr('fill', 'none')
            .attr('stroke', '#bbb')
            .attr('stroke-width', 1.5)
            .selectAll('path')
            .data(root.links())
            .join('path')
            .attr('d', d3.linkVertical().x(d => d.x).y(d => d.y));

        // Draw nodes
        const node = g.append('g')
            .selectAll('g')
            .data(root.descendants())
            .join('g')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .attr('class', d => d.data.isLeaf ? 'dt-node dt-leaf' : 'dt-node');

        node.append('circle')
            .attr('r', d => d.data.isLeaf ? 14 : 10)
            .attr('class', 'dt-circle')
            .attr('data-char', d => d.data.char || '');

        node.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 4)
            .attr('class', 'dt-text')
            .text(d => d.data.isLeaf ? (d.data.char || '•') : '•')
            .style('font-size', d => d.data.isLeaf ? '10px' : '8px')
            .style('font-weight', 'bold')
            .style('font-family', 'sans-serif');

        // Guardar referencia para animación
        this.svg = svg;
        this.g = g;
    }

    /**
     * Anima el recorrido de una búsqueda
     * Resalta los nodos en orden del path
     */
    highlightPath(path) {
        if (!this.svg) return;
        this.svg.selectAll('circle.dt-circle').classed('dt-highlight', false);
        // Resaltar solo el último nodo (destino)
        if (path && path.length > 0) {
            const last = path[path.length - 1];
            if (last.node && last.node.isLeaf) {
                const char = last.node.char;
                this.svg.selectAll(`circle[data-char="${char}"]`).classed('dt-highlight', true);
            } else {
                // Si no hay hoja, resaltar círculos en orden
                this.svg.selectAll('circle.dt-circle').classed('dt-highlight', false);
            }
        }
    }

    /**
     * Anima paso a paso el recorrido del árbol
     */
    animatePath(path, callback) {
        if (!this.svg || !path || path.length === 0) {
            callback && callback();
            return;
        }
        
        const self = this;
        let stepIndex = 0;

        // Limpiar estados previos
        self.svg.selectAll('circle.dt-circle')
            .classed('dt-visiting', false)
            .classed('dt-highlight', false);

        const step = () => {
            if (stepIndex >= path.length) {
                // Resaltar el nodo final
                if (path[path.length - 1].node && path[path.length - 1].node.isLeaf) {
                    self.svg.selectAll('circle.dt-leaf').classed('dt-highlight', true);
                }
                callback && callback();
                return;
            }

            const p = path[stepIndex];
            
            // Resaltar el nodo actual
            if (p.node) {
                // Marcar como visitado
                self.svg.selectAll('circle.dt-circle').each(function(d) {
                    if (d.data._ref === p.node) {
                        d3.select(this).classed('dt-visiting', true);
                    }
                });
            }
            
            stepIndex++;
            setTimeout(step, 500); // 500ms por step
        };
        
        step();
    }

    /**
     * Calcula la profundidad máxima del árbol
     */
    _getDepth(node, depth = 0) {
        if (!node) return depth;
        if (!node.children || node.children.length === 0) return depth;
        return Math.max(
            this._getDepth(node.children[0], depth + 1),
            this._getDepth(node.children[1], depth + 1)
        );
    }

    /**
     * Cuenta el total de nodos en el árbol
     */
    _countNodes(node) {
        if (!node) return 0;
        let count = 1;
        if (node.children) {
            for (const child of node.children) {
                count += this._countNodes(child);
            }
        }
        return count;
    }
}

window.DigitalTreeView = DigitalTreeView;
