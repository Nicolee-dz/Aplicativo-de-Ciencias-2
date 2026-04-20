class ExternalHashView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.stepInfo = document.getElementById('extHashStepInfo');
        this.stepDesc = document.getElementById('extHashStepDesc');
        this.blockReadsSpan = document.getElementById('extHashBlockReads');
        this.comparisonsSpan = document.getElementById('extHashComparisons');
    }

    render(model) {
        if (!this.container) return;
        const blocks = model.getBlocks();
        let html = '<div class="ext-blocks-wrapper">';
        blocks.forEach((block, idx) => {
            const isOverflow = false;
            html += `<div class="ext-block">`;
            html += `<div class="ext-block-header">Bloque ${idx + 1}</div>`;
            html += `<div class="ext-block-content">`;
            block.forEach(key => {
                html += `<span class="ext-record">${key}</span>`;
            });
            if (block.overflow && block.overflow.length) {
                html += `<div class="ext-overflow">Desbordamiento: `;
                block.overflow.forEach(key => {
                    html += `<span class="ext-record">${key}</span>`;
                });
                html += `</div>`;
            }
            html += `</div></div>`;
        });
        html += '</div>';
        this.container.innerHTML = html;
    }

    showSearchResult(found, blockIndex, position, comparisons) {
        if (this.stepInfo) this.stepInfo.style.display = 'block';
        if (this.stepDesc) {
            if (found) {
                this.stepDesc.innerHTML = `Clave encontrada en bloque ${blockIndex+1}, posición ${position+1} dentro del bloque.`;
            } else {
                this.stepDesc.innerHTML = `Clave no encontrada.`;
            }
        }
        if (this.blockReadsSpan) this.blockReadsSpan.textContent = found ? '1 bloque leído' : `${Math.ceil(comparisons / 4)} bloques aprox.`; // simplificado
        if (this.comparisonsSpan) this.comparisonsSpan.textContent = comparisons;
    }

    hideStep() {
        if (this.stepInfo) this.stepInfo.style.display = 'none';
    }
}