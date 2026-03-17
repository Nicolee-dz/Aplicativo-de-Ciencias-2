/**
 * Vista — Búsqueda Binaria Externa
 * Misma estructura que ExternalSeqView.
 * Diferencia visual: resalta bloque izquierdo, derecho y medio.
 */
class ExternalBinView {
    constructor() {
        this.blocksContainer = document.getElementById('extBinBlocksContainer');
        this.stepInfoEl      = document.getElementById('extBinStepInfo');
        this.stepDescEl      = document.getElementById('extBinStepDesc');
        this.blockReadsEl    = document.getElementById('extBinBlockReads');
        this.comparisonsEl   = document.getElementById('extBinComparisons');
    }

    renderBlocks(model, step = null) {
        if (!this.blocksContainer) return;
        const blocks = model.getBlocks();

        if (blocks.length === 0) {
            this.blocksContainer.innerHTML = `
                <div class="ext-empty-msg">
                    <p>El archivo está vacío.<br>Ingresa claves una por una.</p>
                </div>`;
            return;
        }

        const left  = step ? step.left  : -1;
        const right = step ? step.right : -1;
        const mid   = step ? step.mid   : -1;
        const state = step ? (step.found ? 'found' : 'idle') : 'idle';

        let html = '<div class="ext-blocks-grid">';

        blocks.forEach(block => {
            const b        = block.blockIndex;
            const isMid    = b === mid;
            const isInRange = step && b >= left && b <= right;
            const isOut    = step && (b < left || b > right) && !isMid;
            const isFound  = isMid && state === 'found';

            let cardClass = 'ext-block-card';
            if (isFound)         cardClass += ' ext-block-found';
            else if (isMid)      cardClass += ' ext-block-active';
            else if (isOut)      cardClass += ' ext-block-done';
            else if (isInRange)  cardClass += ' ext-block-inrange';

            let badge = '';
            if (isFound)              badge = '<span class="ext-block-found-badge">Encontrado</span>';
            else if (isMid)           badge = '<span class="ext-block-reading">Bloque medio</span>';
            else if (b === left && step)  badge = '<span class="ext-block-range-badge">Izq</span>';
            else if (b === right && step) badge = '<span class="ext-block-range-badge">Der</span>';
            else if (isOut)           badge = '<span class="ext-block-checked">Descartado</span>';

            html += `
                <div class="${cardClass}" id="extBinBlock_${b}">
                    <div class="ext-block-header">
                        <span class="ext-block-label">Bloque ${b + 1}</span>
                        ${badge}
                    </div>
                    <div class="ext-block-records">`;

            block.records.forEach((rec, ri) => {
                let recClass = 'ext-record';
                if (isMid && step) {
                    if (isFound && ri === step.recordIndex) recClass += ' ext-record-found';
                    else if (ri === step.recordIndex)       recClass += ' ext-record-current';
                }
                if (isOut) recClass += ' ext-record-checked';

                const recIdx = b * model.blockSize + ri;
                html += `
                    <div class="${recClass}" id="extBinRec_${b}_${ri}">
                        <span class="ext-rec-idx">${recIdx + 1}</span>
                        <span class="ext-rec-val">${rec}</span>
                    </div>`;
            });

            html += `</div></div>`;
        });

        html += '</div>';
        this.blocksContainer.innerHTML = html;

        if (mid >= 0) {
            const card = document.getElementById(`extBinBlock_${mid}`);
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    showSearchStep(step, target) {
        if (!this.stepInfoEl) return;
        this.stepInfoEl.style.display = 'block';
        if (this.blockReadsEl)  this.blockReadsEl.textContent  = step.blockReads;
        if (this.comparisonsEl) this.comparisonsEl.textContent = step.totalComparisons;

        let msg = '';
        if (step.found) {
            msg = `Clave <strong>${target}</strong> encontrada en el <strong>Bloque ${step.blockIndex + 1}</strong>, posición ${step.recordIndex + 1} dentro del bloque.`;
        } else if (step.direction === 'left') {
            msg = `Bloque medio ${step.blockIndex + 1}: primer valor <strong>${step.records[0]}</strong> > ${target}. Buscar en mitad izquierda.`;
        } else if (step.direction === 'right') {
            msg = `Bloque medio ${step.blockIndex + 1}: último valor <strong>${step.records[step.records.length - 1]}</strong> < ${target}. Buscar en mitad derecha.`;
        } else {
            msg = `Leyendo bloque medio <strong>${step.blockIndex + 1}</strong>.`;
        }
        if (this.stepDescEl) this.stepDescEl.innerHTML = msg;
    }

    showNotFound(target, blockReads, comparisons) {
        if (!this.stepInfoEl) return;
        this.stepInfoEl.style.display = 'block';
        if (this.blockReadsEl)  this.blockReadsEl.textContent  = blockReads;
        if (this.comparisonsEl) this.comparisonsEl.textContent = comparisons;
        if (this.stepDescEl) this.stepDescEl.innerHTML =
            `Clave <strong>${target}</strong> <strong>no encontrada</strong>. Se agotaron los bloques a revisar.`;
    }

    hideSearchInfo() {
        if (this.stepInfoEl) this.stepInfoEl.style.display = 'none';
        if (this.blockReadsEl)  this.blockReadsEl.textContent  = '0';
        if (this.comparisonsEl) this.comparisonsEl.textContent = '0';
    }

    animateSearch(result, model, onDone) {
        if (!result || result.steps.length === 0) { onDone && onDone(); return; }

        let stepIdx = 0;
        const delay = 900;

        const tick = () => {
            if (stepIdx >= result.steps.length) {
                const lastStep = result.steps[result.steps.length - 1];
                this.renderBlocks(model, lastStep);
                if (result.found) {
                    this.showSearchStep(lastStep, result.target);
                } else {
                    this.showNotFound(result.target, result.blockReads, result.totalComparisons);
                }
                onDone && onDone();
                return;
            }

            const step = result.steps[stepIdx];
            this.renderBlocks(model, step);
            this.showSearchStep(step, result.target);
            stepIdx++;
            setTimeout(tick, delay);
        };

        this.hideSearchInfo();
        tick();
    }
}

window.ExternalBinView = ExternalBinView;