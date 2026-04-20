class HashView {
    constructor() {
        this.hashTableContainer = document.getElementById('hashTableContainer');
        this.hashStepInfo = document.getElementById('hashStepInfo');
        this.hashStepDescription = document.getElementById('hashStepDescription');
    }

    displayTable(table) {
        if (!this.hashTableContainer) return;

        // Filtrar solo las posiciones ocupadas (valor no nulo)
        const occupied = [];
        for (let i = 0; i < table.length; i++) {
            if (table[i] !== null) {
                occupied.push({ index: i, value: table[i] });
            }
        }

        if (occupied.length === 0) {
            this.hashTableContainer.innerHTML = '<p class="text-muted">Tabla vacía. Inserta claves para visualizarlas.</p>';
            return;
        }

        let html = '<div class="table-vertical">';
        occupied.forEach(item => {
            const rowClass = 'table-row';
            html += `<div class="${rowClass}">`;
            html += `<span class="table-index">${item.index + 1}</span>`;
            html += `<span class="table-value">${item.value}</span>`;
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
                // Resaltar la fila encontrada (solo si está visible)
                const rows = document.querySelectorAll('#hashTableContainer .table-row');
                rows.forEach((row, i) => {
                    row.classList.remove('found-row');
                    const idxSpan = row.querySelector('.table-index');
                    if (idxSpan && parseInt(idxSpan.innerText) === index+1) {
                        row.classList.add('found-row');
                    }
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