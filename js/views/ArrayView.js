class ArrayView {
    constructor() {
        this.arrayContainer = document.getElementById('arrayContainer');
        this.stepInfo = document.getElementById('stepInfo');
        this.stepDescription = document.getElementById('stepDescription');
        this.comparisonsEl = document.getElementById('comparisons');
        this.currentAlgorithmEl = document.getElementById('currentAlgorithm');
        this.algorithmDescriptionEl = document.getElementById('algorithmDescription');
        this.arrayLengthEl = document.getElementById('arrayLength');
        this.arrayMinEl = document.getElementById('arrayMin');
        this.arrayMaxEl = document.getElementById('arrayMax');
        this.arraySumEl = document.getElementById('arraySum');
    }

    displayArray(array, searchInProgress = false, searchAlgorithm = 'sequential', currentStep = 0, searchResult = null) {
        if (!this.arrayContainer) return;
        if (array.length === 0) {
            this.arrayContainer.innerHTML = '<p class="text-muted">Arreglo vacío</p>';
            return;
        }
        let html = '<div class="table-vertical">';
        array.forEach((value, i) => {
            let rowClass = 'table-row';
            if (searchInProgress && searchAlgorithm === 'sequential') {
                if (i === currentStep - 1) rowClass += ' checked-row';
                if (i === currentStep) rowClass += ' current-row';
            }
            if (searchResult && searchResult.index === i && searchResult.found) {
                rowClass += ' found-row';
            }
            html += `<div class="${rowClass}">`;
            html += `<span class="table-index">${i+1}</span>`;
            html += `<span class="table-value">${value}</span>`;
            html += '</div>';
        });
        html += '</div>';
        this.arrayContainer.innerHTML = html;
    }

    highlightBinaryRange(left, right, mid) {
        const rows = document.querySelectorAll('#arrayContainer .table-row');
        rows.forEach((row, idx) => {
            row.classList.remove('current-row', 'checked-row');
            if (idx === mid) {
                row.classList.add('current-row');
            } else if (idx >= left && idx <= right) {
                row.classList.add('checked-row');
            }
        });
    }

    updateStats(stats) {
        if (this.arrayLengthEl) this.arrayLengthEl.textContent = stats.length;
        if (this.arrayMinEl) this.arrayMinEl.textContent = stats.min;
        if (this.arrayMaxEl) this.arrayMaxEl.textContent = stats.max;
        if (this.arraySumEl) this.arraySumEl.textContent = stats.sum;
    }

    showStep(description, comparisons) {
        if (this.stepInfo) this.stepInfo.style.display = 'block';
        if (this.stepDescription) this.stepDescription.textContent = description;
        if (this.comparisonsEl) this.comparisonsEl.textContent = comparisons;
    }

    hideStep() {
        if (this.stepInfo) this.stepInfo.style.display = 'none';
    }

    showDeleteButton(show) {
        const deleteBtnSeq = document.getElementById('deleteBtnSeq');
        const deleteBtnBin = document.getElementById('deleteBtnBin');
        if (deleteBtnSeq) deleteBtnSeq.style.display = show ? 'block' : 'none';
        if (deleteBtnBin) deleteBtnBin.style.display = show ? 'block' : 'none';
    }

    setAlgorithmInfo(name, desc) {
        if (this.currentAlgorithmEl) this.currentAlgorithmEl.textContent = name;
        if (this.algorithmDescriptionEl) this.algorithmDescriptionEl.textContent = desc;
    }
}