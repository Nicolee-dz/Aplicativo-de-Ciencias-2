/**
 * Controlador — Búsqueda Binaria Externa
 */
class ExternalBinController {
    constructor(model, view) {
        this.model       = model;
        this.view        = view;
        this.isSearching = false;
    }

    init() {
        this.view.renderBlocks(this.model);
        this.view.hideSearchInfo();
    }

    applyBlockSize(size) {
        this.model.setBlockSize(size);
        this.view.renderBlocks(this.model);
        this.view.hideSearchInfo();
        showNotification(`Claves por bloque: ${this.model.blockSize}`, 'success');
    }

    insert(value) {
        const res = this.model.insert(value);
        if (!res.ok) { showNotification(res.msg, 'error'); return; }
        this.view.renderBlocks(this.model);
        this.view.hideSearchInfo();
        showNotification(`Clave ${value} insertada`, 'success');
    }

    remove(value) {
        if (!value) { showNotification('Ingresa un valor', 'error'); return; }
        const ok = this.model.remove(value);
        if (!ok) { showNotification('Clave no encontrada', 'error'); return; }
        this.view.renderBlocks(this.model);
        this.view.hideSearchInfo();
        showNotification(`Clave ${value} eliminada`, 'success');
    }

    search(target) {
        if (this.isSearching) { showNotification('Búsqueda en progreso…', 'warning'); return; }
        if (!target || isNaN(parseInt(target))) { showNotification('Ingresa un valor válido', 'error'); return; }
        if (this.model.records.length === 0) { showNotification('El archivo está vacío', 'error'); return; }

        const result = this.model.search(target);
        if (!result) { showNotification('Búsqueda inválida', 'error'); return; }

        this.isSearching = true;
        this.view.animateSearch(result, this.model, () => {
            if (result.found) {
                showNotification(`Clave ${target} encontrada en Bloque ${result.foundBlock + 1} — ${result.blockReads} lectura(s) de bloque`, 'success');
            } else {
                showNotification(`Clave ${target} no encontrada — ${result.blockReads} bloque(s) leído(s)`, 'warning');
            }
            this.isSearching = false;
        });
    }

    save() {
        const arr = this.model.records;
        if (arr.length === 0) { showNotification('No hay claves para guardar', 'error'); return; }

        const { jsPDF } = window.jspdf;
        const doc   = new jsPDF();
        const stats = this.model.getStats();
        const fecha = new Date().toLocaleString('es-CO');

        doc.setFontSize(16);
        doc.setTextColor(37, 99, 204);
        doc.text('Ciencias de la Computación 2', 105, 18, { align: 'center' });

        doc.setFontSize(13);
        doc.setTextColor(40, 40, 40);
        doc.text('Búsqueda Binaria Externa — Archivo guardado', 105, 27, { align: 'center' });

        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Fecha: ${fecha}`, 105, 34, { align: 'center' });

        doc.setDrawColor(37, 99, 204);
        doc.setLineWidth(0.5);
        doc.line(20, 37, 190, 37);

        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.text(`Total de claves: ${stats.total}   |   Bloques: ${stats.blocks}   |   Claves/bloque: ${stats.blockSize}`, 20, 44);
        doc.text(`Mínimo: ${stats.min}   |   Máximo: ${stats.max}`, 20, 51);

        doc.setDrawColor(200, 200, 200);
        doc.line(20, 55, 190, 55);

        const blocks = this.model.getBlocks();
        let y = 63;

        blocks.forEach(block => {
            if (y > 265) { doc.addPage(); y = 20; }
            doc.setFillColor(232, 237, 245);
            doc.rect(20, y - 5, 170, 7, 'F');
            doc.setFontSize(9);
            doc.setTextColor(30, 63, 138);
            doc.text(`Bloque ${block.blockIndex + 1}`, 22, y);
            y += 5;
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(9);
            doc.text(block.records.join('   |   '), 25, y);
            y += 9;
        });

        const marker = `##EXTBIN_DATA##${JSON.stringify(arr)}##BLOCKSIZE##${this.model.blockSize}##END##`;
        doc.setFontSize(5);
        doc.setTextColor(220, 220, 220);
        let dy = y + 8;
        for (let i = 0; i < marker.length; i += 180) {
            if (dy > 285) { doc.addPage(); dy = 15; }
            doc.text(marker.substring(i, i + 180), 15, dy);
            dy += 4;
        }

        const pages = doc.internal.getNumberOfPages();
        for (let p = 1; p <= pages; p++) {
            doc.setPage(p);
            doc.setFontSize(8);
            doc.setTextColor(180, 180, 180);
            doc.text('Aplicativo - Ciencias de la Computación 2', 105, 292, { align: 'center' });
        }

        doc.save(`externo_binario_${Date.now()}.pdf`);
        showNotification('Archivo guardado como PDF ✓', 'success');
    }

    recover(file) {
        if (!file) return;
        showNotification('Leyendo PDF…', 'warning');

        pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        file.arrayBuffer().then(buf => pdfjsLib.getDocument({ data: buf }).promise).then(async pdf => {
            let fullText = '';
            for (let p = 1; p <= pdf.numPages; p++) {
                const page    = await pdf.getPage(p);
                const content = await page.getTextContent();
                fullText += content.items.map(i => i.str).join('');
            }

            const start = fullText.indexOf('##EXTBIN_DATA##');
            const end   = fullText.indexOf('##END##');
            if (start === -1 || end === -1) {
                showNotification('No se encontraron datos en el PDF', 'error');
                return;
            }

            const inner   = fullText.substring(start + 15, end);
            const bsIdx   = inner.indexOf('##BLOCKSIZE##');
            const jsonStr = bsIdx !== -1 ? inner.substring(0, bsIdx) : inner;
            const bsStr   = bsIdx !== -1 ? inner.substring(bsIdx + 13) : null;

            const recovered = JSON.parse(jsonStr.replace(/\s+/g, ''));
            if (!Array.isArray(recovered) || recovered.length === 0) {
                showNotification('Datos inválidos en el PDF', 'error');
                return;
            }

            if (bsStr) this.model.setBlockSize(parseInt(bsStr));
            this.model.records = recovered.sort((a, b) => a - b);
            this.view.renderBlocks(this.model);
            this.view.hideSearchInfo();
            showNotification(`${recovered.length} claves recuperadas ✓`, 'success');
        }).catch(err => {
            showNotification(`Error al leer el PDF: ${err.message}`, 'error');
        });
    }

    print() {
        const arr = this.model.records;
        if (arr.length === 0) { showNotification('No hay claves para imprimir', 'error'); return; }

        const stats  = this.model.getStats();
        const blocks = this.model.getBlocks();
        const fecha  = new Date().toLocaleString('es-CO');

        const win = window.open('', '_blank', 'width=900,height=700');
        win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
        <title>Búsqueda Binaria Externa</title>
        <style>
            body { font-family:'Segoe UI',sans-serif; padding:30px; color:#222; }
            h1 { color:#2563cc; text-align:center; margin-bottom:4px; }
            h2 { text-align:center; color:#555; font-size:1rem; font-weight:normal; margin-top:0; }
            .fecha { text-align:center; color:#888; font-size:0.85rem; margin-bottom:16px; }
            hr { border:1px solid #2563cc; margin:14px 0; }
            .stats { display:flex; justify-content:space-around; margin:14px 0; }
            .stat { text-align:center; }
            .stat-val { font-size:1.3rem; font-weight:bold; color:#2563cc; }
            .stat-lbl { font-size:0.8rem; color:#888; }
            .blocks { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:12px; margin-top:16px; }
            .block-card { border:2px solid #cdd5e0; border-radius:8px; overflow:hidden; }
            .block-hdr { background:#e8edf5; padding:5px 10px; font-weight:700; font-size:0.82rem; color:#2c3e50; }
            .block-body { padding:6px 10px; }
            .rec { display:flex; gap:8px; padding:3px 0; font-family:'Courier New',monospace; font-size:0.9rem; border-bottom:1px solid #f0f0f0; }
            .rec-idx { color:#aaa; min-width:22px; text-align:right; }
            .footer { text-align:center; margin-top:30px; font-size:0.78rem; color:#aaa; }
            @media print { body { padding:10px; } }
        </style></head><body>
        <h1>Ciencias de la Computación 2</h1>
        <h2>Búsqueda Binaria Externa</h2>
        <div class="fecha">Fecha: ${fecha}</div>
        <hr>
        <div class="stats">
            <div class="stat"><div class="stat-val">${stats.total}</div><div class="stat-lbl">Claves</div></div>
            <div class="stat"><div class="stat-val">${stats.blocks}</div><div class="stat-lbl">Bloques</div></div>
            <div class="stat"><div class="stat-val">${stats.blockSize}</div><div class="stat-lbl">Cl/Bloque</div></div>
            <div class="stat"><div class="stat-val">${stats.min}</div><div class="stat-lbl">Mínimo</div></div>
            <div class="stat"><div class="stat-val">${stats.max}</div><div class="stat-lbl">Máximo</div></div>
        </div>
        <hr>
        <div class="blocks">
            ${blocks.map(b => `
                <div class="block-card">
                    <div class="block-hdr">Bloque ${b.blockIndex + 1}</div>
                    <div class="block-body">
                        ${b.records.map((r, ri) => `
                            <div class="rec">
                                <span class="rec-idx">${b.blockIndex * stats.blockSize + ri + 1}</span>
                                <span>${r}</span>
                            </div>`).join('')}
                    </div>
                </div>`).join('')}
        </div>
        <div class="footer">Aplicativo - Ciencias de la Computación 2</div>
        <script>window.onload=()=>{ window.print(); window.onafterprint=()=>window.close(); };<\/script>
        </body></html>`);
        win.document.close();
    }

    reset() {
        this.model.clear();
        this.view.renderBlocks(this.model);
        this.view.hideSearchInfo();
        this.isSearching = false;
        showNotification('Archivo reiniciado', 'success');
    }
}

window.ExternalBinController = ExternalBinController;