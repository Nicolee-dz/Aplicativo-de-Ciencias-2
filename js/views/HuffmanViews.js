/**
 * Vista Árbol de Huffman
 * - Árbol D3 con nodos internos (frecuencia) y hojas (letra + código)
 * - Tabla de códigos
 * - Pasos de construcción
 * - Texto codificado
 */
class HuffmanView {
    constructor(containerId = 'huffmanTreeContainer') {
        this.containerId = containerId;
        this.d3container = d3.select(`#${containerId}`);
        this.svg         = null;
    }

    render(model) {
        this._renderTree(model);
        this._renderCodesTable(model);
        this._renderStats(model);
        this._renderSteps(model);
        this._renderEncoded(model);
    }

    // ── Árbol D3 ─────────────────────────────────────────────
    _renderTree(model) {
        if (!this.d3container || !this.d3container.node()) return;
        this.d3container.html('');

        const hierarchy = model.getHierarchy();
        if (!hierarchy) return;

        const maxDepth  = this._getDepth(hierarchy);
        const leafCount = this._countLeaves(hierarchy);

        const nodeSpacing = 60;
        const W      = Math.max(700, leafCount * nodeSpacing);
        const levelH = 70;
        const height = Math.max(400, (maxDepth + 2) * levelH);
        const marginX = 50;
        const startY  = 50;

        const nodes = [], links = [];

        const assignPos = (node, xMin, xMax, depth, parentPos, edgeLabel) => {
            if (!node) return;
            const x   = (xMin + xMax) / 2;
            const y   = startY + depth * levelH;
            const pos = { x, y, node, edgeLabel, depth };
            nodes.push(pos);
            if (parentPos) links.push({ source: parentPos, target: pos, edgeLabel });
            if (!node.children || !node.children.length) return;

            const leftChild  = node.children.find(c => c.edgeLabel === 0) || null;
            const rightChild = node.children.find(c => c.edgeLabel === 1) || null;
            const totalWidth = xMax - xMin;

            if (leftChild && rightChild) {
                const lL = this._countLeaves(leftChild);
                const rL = this._countLeaves(rightChild);
                const split = totalWidth * (lL / (lL + rL));
                assignPos(leftChild,  xMin,        xMin + split, depth + 1, pos, 0);
                assignPos(rightChild, xMin + split, xMax,        depth + 1, pos, 1);
            } else if (leftChild) {
                assignPos(leftChild, xMin, xMin + totalWidth * 0.45, depth + 1, pos, 0);
            } else if (rightChild) {
                assignPos(rightChild, xMin + totalWidth * 0.55, xMax, depth + 1, pos, 1);
            }
        };

        assignPos(hierarchy, marginX, W - marginX, 0, null, null);

        const svg = this.d3container.append('svg')
            .attr('width', W).attr('height', height)
            .style('border', '1px solid #e0e0e0')
            .style('border-radius', '8px')
            .style('display', 'block')
            .style('background', '#fafbfc');
        const g = svg.append('g');

        // Aristas
        links.forEach(link => {
            g.append('line')
                .attr('x1', link.source.x).attr('y1', link.source.y)
                .attr('x2', link.target.x).attr('y2', link.target.y)
                .attr('stroke', '#9aa').attr('stroke-width', 1.8);

            const mx    = (link.source.x + link.target.x) / 2;
            const my    = (link.source.y + link.target.y) / 2;
            const color = link.edgeLabel === 0 ? '#1565c0' : '#b71c1c';
            g.append('circle').attr('cx', mx).attr('cy', my).attr('r', 9)
                .attr('fill', '#fff').attr('stroke', color).attr('stroke-width', 1.8);
            g.append('text').attr('x', mx).attr('y', my + 4)
                .attr('text-anchor', 'middle')
                .style('font-size', '12px').style('font-weight', 'bold')
                .style('font-family', 'monospace').style('fill', color)
                .text(link.edgeLabel);
        });

        // Nodos
        const nodeG = g.append('g').selectAll('g').data(nodes).join('g')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .attr('class', 'dt-node');

        // Círculo — hoja: azul, interno: blanco/gris
        nodeG.append('circle').attr('r', 20)
            .attr('class', 'dt-circle')
            .style('fill',   d => d.node.isLeaf ? '#e8eaf6' : '#fff')
            .style('stroke', d => d.node.isLeaf ? '#3949ab' : '#90a4ae')
            .style('stroke-width', '2px');

        // Letra (hojas)
        nodeG.filter(d => d.node.isLeaf)
            .append('text').attr('text-anchor', 'middle').attr('dy', '-4px')
            .attr('class', 'dt-label-char')
            .text(d => d.node.char || '');

        // Frecuencia (todos)
        nodeG.append('text').attr('text-anchor', 'middle')
            .attr('dy', d => d.node.isLeaf ? '11px' : '5px')
            .attr('class', 'dt-label-bits')
            .text(d => d.node.freq);

        this.svg = svg;
    }

    // ── Tabla de códigos ─────────────────────────────────────
    _renderCodesTable(model) {
        const tbody = document.getElementById('huffmanCodesBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const table = model.getCodesTable();
        const colors = ['#1565c0','#b71c1c','#2e7d32','#e65100','#6a1b9a','#00838f','#558b2f','#4e342e'];

        let totalLi   = 0;
        let totalFrLi = 0;

        table.forEach((row, i) => {
            const color = colors[i % colors.length];
            const frLi  = row.freq * row.bits;
            totalLi   += row.bits;
            totalFrLi += frLi;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${row.char === ' ' ? '␣' : row.char}</strong></td>
                <td>${row.freq}</td>
                <td><span class="huffman-code" style="color:${color};border-color:${color}">${row.code}</span></td>
                <td>${row.bits}</td>
                <td>${frLi}</td>
            `;
            tbody.appendChild(tr);
        });

        // Fila de totales con promedio en la última columna
        const totalChars = model.text.length;
        const promedio = totalChars > 0 ? (totalFrLi / totalChars).toFixed(2) : '0';
        const tfr = document.createElement('tr');
        tfr.className = 'huffman-total-row';
        tfr.innerHTML = `
            <td><strong>Total</strong></td>
            <td></td>
            <td></td>
            <td><strong>${totalLi}</strong></td>
            <td><strong>${promedio}</strong></td>
        `;
        tbody.appendChild(tfr);
        
        // Fila con el mensaje en binario
        const encodedBits = model.encoded || '';
        const tbinary = document.createElement('tr');
        tbinary.className = 'huffman-total-row';
        tbinary.innerHTML = `
            <td colspan="5" style="word-break: break-all; font-family: monospace; font-size: 0.85rem;">
                <strong>Mensaje binario:</strong> ${encodedBits}
            </td>
        `;
        tbody.appendChild(tbinary);
    }

    // ── Estadísticas ─────────────────────────────────────────
    _renderStats(model) {
        const el = id => document.getElementById(id);
        if (el('huffStatChars'))   el('huffStatChars').textContent   = model.freqTable.length;
        if (el('huffStatOriginal')) el('huffStatOriginal').textContent = model.normalBits || (model.freqTable.reduce((s,f)=>s+f.freq,0) * 8);
        if (el('huffStatHuffman')) el('huffStatHuffman').textContent  = model.totalBits || '—';
        if (el('huffStatSaving')) {
            if (model.normalBits && model.totalBits) {
                const pct = (((model.normalBits - model.totalBits) / model.normalBits) * 100).toFixed(1);
                el('huffStatSaving').textContent = pct + '%';
            } else {
                el('huffStatSaving').textContent = '—';
            }
        }
    }

    // ── Pasos de construcción ────────────────────────────────
    _renderSteps(model) {
        const container = document.getElementById('huffmanStepsContainer');
        if (!container) return;
        container.innerHTML = '';

        model.steps.forEach((step, i) => {
            const card = document.createElement('div');
            card.className = 'huffman-step-card';

            let html = `<div class="huffman-step-title"><span class="step-badge">Paso ${i}</span>${step.label}</div>`;
            html += `<table class="table table-sm huffman-step-table mb-0"><thead><tr><th>Carácter</th><th>Frecuencia</th></tr></thead><tbody>`;
            [...step.queue].reverse().forEach(item => {
                const cls = item.isNew ? 'huffman-merged-row' : '';
                const sym = item.label || item.char || `[${item.freq}]`;
                html += `<tr class="${cls}"><td>${sym === ' ' ? '␣' : sym}</td><td>${item.freq}</td></tr>`;
            });
            html += `</tbody></table>`;
            card.innerHTML = html;
            container.appendChild(card);
        });
    }

    // ── Texto codificado ─────────────────────────────────────
    _renderEncoded(model) {
        const container = document.getElementById('huffmanEncodedContainer');
        if (!container) return;
        container.innerHTML = '';
        if (!model.encoded || !model.text) return;

        // Paleta
        const codesTable = model.getCodesTable();
        const colorMap   = {};
        const colors = ['#1565c0','#b71c1c','#2e7d32','#e65100','#6a1b9a','#00838f','#558b2f','#4e342e'];
        codesTable.forEach((row, i) => { colorMap[row.char] = colors[i % colors.length]; });

        const div = document.createElement('div');
        div.className = 'huffman-encoded-string';

        for (const ch of model.text) {
            const code  = model.codes[ch] || '';
            const color = colorMap[ch]    || '#555';
            const span  = document.createElement('span');
            span.className   = 'huffman-encoded-block';
            span.textContent = code;
            span.title       = `${ch === ' ' ? '␣' : ch} → ${code}`;
            span.style.color       = color;
            span.style.borderColor = color;
            div.appendChild(span);
        }
        container.appendChild(div);
    }

    // ── Helpers ──────────────────────────────────────────────
    _countLeaves(node) {
        if (!node) return 0;
        if (!node.children || !node.children.length) return 1;
        return node.children.reduce((s, c) => s + this._countLeaves(c), 0);
    }
    _getDepth(node, d = 0) {
        if (!node || !node.children || !node.children.length) return d;
        return Math.max(...node.children.map(c => this._getDepth(c, d + 1)));
    }
}

window.HuffmanView = HuffmanView;