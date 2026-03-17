/**
 * Vista — Búsqueda Secuencial Externa
 */
class ExternalSeqView {
    constructor() {
        this.blocksContainer = document.getElementById('extSeqBlocksContainer');
        this.statsEl         = document.getElementById('extSeqStats');
        this.stepInfoEl      = document.getElementById('extSeqStepInfo');
        this.stepDescEl      = document.getElementById('extSeqStepDesc');
        this.blockReadsEl    = document.getElementById('extSeqBlockReads');
        this.comparisonsEl   = document.getElementById('extSeqComparisons');
    }

    renderBlocks(model, highlightBlock = -1, highlightRecord = -1, state = 'idle') {
        if (!this.blocksContainer) return;
        const blocks = model.getBlocks();

        if (blocks.length === 0) {
            this.blocksContainer.innerHTML = `
                <div class="ext-empty-msg">
                    <p>El archivo está vacío.<br>Ingresa claves una por una.</p>
                </div>`;
            return;
        }

        let html = '<div class="ext-blocks-grid">';

        blocks.forEach(block => {
            const isActive = block.blockIndex === highlightBlock;
            const isDone   = block.blockIndex < highlightBlock;
            const isFound  = isActive && state === 'found';

            let cardClass = 'ext-block-card';
            if (isActive && state === 'found') cardClass += ' ext-block-found';
            else if (isActive)                 cardClass += ' ext-block-active';
            else if (isDone)                   cardClass += ' ext-block-done';

            html += `
                <div class="${cardClass}" id="extBlock_${block.blockIndex}">
                    <div class="ext-block-header">
                        <span class="ext-block-label">Bloque ${block.blockIndex + 1}</span>
                        ${isActive && !isFound ? '<span class="ext-block-reading">Leyendo…</span>' : ''}
                        ${isDone              ? '<span class="ext-block-checked">Revisado</span>' : ''}
                        ${isFound             ? '<span class="ext-block-found-badge">Encontrado</span>' : ''}
                    </div>
                    <div class="ext-block-records">`;

            block.records.forEach((rec, ri) => {
                let recClass = 'ext-record';
                if (isActive) {
                    if (ri < highlightRecord)                            recClass += ' ext-record-checked';
                    else if (ri === highlightRecord && state === 'found') recClass += ' ext-record-found';
                    else if (ri === highlightRecord)                     recClass += ' ext-record-current';
                } else if (isDone) {
                    recClass += ' ext-record-checked';
                }

                const recIdx = block.blockIndex * model.blockSize + ri;
                html += `
                    <div class="${recClass}" id="extRec_${block.blockIndex}_${ri}">
                        <span class="ext-rec-idx">${recIdx + 1}</span>
                        <span class="ext-rec-val">${rec}</span>
                    </div>`;
            });

            html += `</div></div>`;
        });

        html += '</div>';
        this.blocksContainer.innerHTML = html;

        if (highlightBlock >= 0) {
            const card = document.getElementById(`extBlock_${highlightBlock}`);
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    updateStats(stats) {
        if (!this.statsEl) return;
        this.statsEl.innerHTML = `
            <div class="ext-stat"><span class="ext-stat-val">${stats.total}</span><div class="ext-stat-lbl">Claves</div></div>
            <div class="ext-stat"><span class="ext-stat-val">${stats.blocks}</span><div class="ext-stat-lbl">Bloques</div></div>
            <div class="ext-stat"><span class="ext-stat-val">${stats.blockSize}</span><div class="ext-stat-lbl">Cl/Bloque</div></div>
            <div class="ext-stat"><span class="ext-stat-val">${stats.min}</span><div class="ext-stat-lbl">Mínimo</div></div>
            <div class="ext-stat"><span class="ext-stat-val">${stats.max}</span><div class="ext-stat-lbl">Máximo</div></div>
        `;
    }

    showSearchStep(step, target) {
        if (!this.stepInfoEl) return;
        this.stepInfoEl.style.display = 'block';
        if (this.blockReadsEl)  this.blockReadsEl.textContent  = step.blockReads;
        if (this.comparisonsEl) this.comparisonsEl.textContent = step.totalComparisons;

        let msg = '';
        if (step.found) {
            msg = `Clave <strong>${target}</strong> encontrada en el <strong>Bloque ${step.blockIndex + 1}</strong>, posición ${step.recordIndex + 1} dentro del bloque.`;
        } else {
            msg = `Leyendo <strong>Bloque ${step.blockIndex + 1}</strong> — Clave comparada: <strong>${step.records[step.recordIndex]}</strong> ≠ ${target}.`;
        }
        if (this.stepDescEl) this.stepDescEl.innerHTML = msg;
    }

    showNotFound(target, blockReads, comparisons) {
        if (!this.stepInfoEl) return;
        this.stepInfoEl.style.display = 'block';
        if (this.blockReadsEl)  this.blockReadsEl.textContent  = blockReads;
        if (this.comparisonsEl) this.comparisonsEl.textContent = comparisons;
        if (this.stepDescEl) this.stepDescEl.innerHTML =
            `Clave <strong>${target}</strong> <strong>no encontrada</strong>. Se leyeron todos los bloques.`;
    }

    hideSearchInfo() {
        if (this.stepInfoEl) this.stepInfoEl.style.display = 'none';
        if (this.blockReadsEl)  this.blockReadsEl.textContent  = '0';
        if (this.comparisonsEl) this.comparisonsEl.textContent = '0';
    }

    animateSearch(result, model, onDone) {
        if (!result || result.steps.length === 0) { onDone && onDone(); return; }

        let stepIdx    = 0;
        const delay    = 900;

        const tick = () => {
            if (stepIdx >= result.steps.length) {
                const lastStep = result.steps[result.steps.length - 1];
                const state    = result.found ? 'found' : 'checked';
                this.renderBlocks(model,
                    result.found ? result.foundBlock : model.blockCount,
                    result.found ? result.foundPos   : -1,
                    state);
                if (result.found) {
                    this.showSearchStep(lastStep, result.target);
                } else {
                    this.showNotFound(result.target, result.blockReads, result.totalComparisons);
                }
                onDone && onDone();
                return;
            }

            const step  = result.steps[stepIdx];
            const state = step.found ? 'found' : 'idle';
            this.renderBlocks(model, step.blockIndex, step.recordIndex, state);
            this.showSearchStep(step, result.target);
            stepIdx++;
            setTimeout(tick, delay);
        };

        this.hideSearchInfo();
        tick();
    }
}

window.ExternalSeqView = ExternalSeqView;