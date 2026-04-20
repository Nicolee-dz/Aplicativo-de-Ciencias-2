class GraphView {
    constructor(containerId, width = 800, height = 500) {
        this.container = document.getElementById(containerId);
        this.width = width;
        this.height = height;
        this.svg = null;
        this.simulation = null;
        this.nodeElements = null;
        this.linkElements = null;
        this.graphData = { nodes: [], links: [] };
    }

    render(model) {
        if (!this.container) return;
        this.container.innerHTML = '';

        const vertices = model.getVertices();
        const edges = model.getEdges();

        if (vertices.length === 0) {
            this.container.innerHTML = '<div style="color:#aaa;text-align:center;padding:80px 20px;font-style:italic;">Agrega vértices y aristas para visualizar el grafo</div>';
            return;
        }

        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('border', '1px solid #ccc')
            .style('border-radius', '8px')
            .style('background', '#fafafa');

        // Convertir modelo a datos para D3
        const prevPos = new Map();
        this.graphData.nodes.forEach(n => prevPos.set(n.id, { x: n.x, y: n.y }));

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.max(60, Math.min(this.width, this.height) * 0.28);

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
        const links = edges.map(e => ({ source: nodeMap.get(e.from), target: nodeMap.get(e.to) }));

        this.graphData = { nodes, links };
        this.updateSimulation();
    }

    updateSimulation() {
        if (this.simulation) this.simulation.stop();

        this.simulation = d3.forceSimulation(this.graphData.nodes)
            .alpha(0.35)
            .alphaDecay(0.12)
            .alphaMin(0.03)
            .velocityDecay(0.75)
            .force('link', d3.forceLink(this.graphData.links).id(d => d.id).distance(95).strength(0.85))
            .force('charge', d3.forceManyBody().strength(-140))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide(28));

        // Dibujar enlaces
        this.linkElements = this.svg.selectAll('.link')
            .data(this.graphData.links)
            .join('line')
            .attr('class', 'link')
            .attr('stroke', '#999')
            .attr('stroke-width', 2)
            .attr('stroke-opacity', 0.6);

        // Dibujar nodos
        this.nodeElements = this.svg.selectAll('.node')
            .data(this.graphData.nodes)
            .join('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', (event, d) => {
                    if (!event.active) this.simulation.alphaTarget(0.08).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (event, d) => {
                    d.fx = event.x;
                    d.fy = event.y;
                })
                .on('end', (event, d) => {
                    if (!event.active) this.simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }));

        this.nodeElements.append('circle')
            .attr('r', 20)
            .attr('fill', '#4b6cb7')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2);

        this.nodeElements.append('text')
            .text(d => d.label)
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('fill', 'white')
            .style('font-weight', 'bold')
            .style('font-size', '12px');

        this.simulation.on('tick', () => {
            this.linkElements
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            this.nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
        });
    }

    clear() {
        if (this.simulation) this.simulation.stop();
        if (this.container) this.container.innerHTML = '';
    }
}