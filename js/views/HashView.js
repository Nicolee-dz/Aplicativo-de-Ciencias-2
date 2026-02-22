class HashView {
    constructor() {
        this.hashTableContainer = document.getElementById('hashTableContainer');
        this.hashStepInfo = document.getElementById('hashStepInfo');
        this.hashStepDescription = document.getElementById('hashStepDescription');
    }

    displayTable(table) {
        if (!this.hashTableContainer) return;
        if (table.length === 0) {
            this.hashTableContainer.innerHTML = '<p class="text-muted">Tabla vacía</p>';
            return;
        }
        let html = '<div class="table-vertical">';
        table.forEach((val, i) => {
            let rowClass = 'table-row';
            if (val === null) rowClass += ' empty-row';
            html += `<div class="${rowClass}">`;
            html += `<span class="table-index">${i+1}</span>`;
            html += `<span class="table-value">${val !== null ? val : '∅'}</span>`;
            html += '</div>';
        });
        html += '</div>';
        this.hashTableContainer.innerHTML = html;
    }

    showSearchResult(found, index, comparisons) {
        if (this.hashStepInfo) this.hashStepInfo.style.display = 'block';
        if (this.hashStepDescription) {
            if (found) {
                this.hashStepDescription.innerHTML = `Clave encontrada en posición ${index+1} después de ${comparisons} comparación(es).`;
                const rows = document.querySelectorAll('#hashTableContainer .table-row');
                rows.forEach((row, i) => {
                    row.classList.remove('found-row');
                    if (i === index) row.classList.add('found-row');
                });
            } else {
                this.hashStepDescription.innerHTML = `Clave no encontrada (${comparisons} comparaciones).`;
            }
        }
    }

    hideStep() {
        if (this.hashStepInfo) this.hashStepInfo.style.display = 'none';
    }
}