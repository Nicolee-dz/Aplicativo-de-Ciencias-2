class SearchController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.searchAlgorithm = 'sequential';
        this.currentStep = 0;
        this.comparisons = 0;
        this.searchInProgress = false;
        this.searchResult = null;
        this.timeoutId = null;
    }

    init() {
        console.log('SearchController iniciado');
    }

    startSequential(searchValue) {
        if (isNaN(searchValue)) { showNotification('Ingresa un valor', 'error'); return; }
        if (this.model.getArray().length === 0) { showNotification('Arreglo vacío', 'error'); return; }
        this.reset();
        this.searchAlgorithm = 'sequential';
        this.view.setAlgorithmInfo('Búsqueda Secuencial', 'Compara cada elemento uno por uno.');
        this.searchInProgress = true;
        this.searchValue = searchValue;
        this.sequentialStep();
    }

    sequentialStep() {
        const arr = this.model.getArray();
        if (this.currentStep >= arr.length) {
            this.view.showStep(`Valor ${this.searchValue} no encontrado.`, this.comparisons);
            this.searchInProgress = false;
            this.view.displayArray(arr, false, this.searchAlgorithm, this.currentStep, this.searchResult);
            return;
        }
        this.comparisons++;
        const cur = arr[this.currentStep];
        if (cur === this.searchValue) {
            this.searchResult = { found: true, index: this.currentStep };
            this.view.showStep(`¡Encontrado en posición ${this.currentStep+1}!`, this.comparisons);
            this.searchInProgress = false;
            this.view.showDeleteButton(true);
            this.view.displayArray(arr, false, this.searchAlgorithm, this.currentStep, this.searchResult);
        } else {
            this.view.showStep(`Comparando ${this.searchValue} con ${cur} en posición ${this.currentStep+1} - No coincide.`, this.comparisons);
            this.view.displayArray(arr, true, this.searchAlgorithm, this.currentStep, this.searchResult);
            this.currentStep++;
            this.timeoutId = setTimeout(() => this.sequentialStep(), 800);
        }
    }

    startBinary(searchValue) {
        if (isNaN(searchValue)) { showNotification('Ingresa un valor', 'error'); return; }
        if (this.model.getArray().length === 0) { showNotification('Arreglo vacío', 'error'); return; }
        const arr = this.model.getArray();
        const sorted = [...arr].sort((a,b) => a-b);
        if (JSON.stringify(arr) !== JSON.stringify(sorted)) {
            this.model.setArray(sorted);
            this.view.displayArray(sorted, false, 'binary', 0, null);
            showNotification('Arreglo ordenado para búsqueda binaria', 'warning');
        }
        this.reset();
        this.searchAlgorithm = 'binary';
        this.view.setAlgorithmInfo('Búsqueda Binaria', 'Requiere datos ordenados. Divide a la mitad.');
        this.searchInProgress = true;
        this.searchValue = searchValue;
        this.binaryStep(0, this.model.getArray().length - 1);
    }

    binaryStep(left, right) {
        const arr = this.model.getArray();
        if (left > right) {
            this.view.showStep(`Valor ${this.searchValue} no encontrado.`, this.comparisons);
            this.searchInProgress = false;
            this.view.displayArray(arr, false, 'binary', 0, this.searchResult);
            return;
        }
        this.comparisons++;
        const mid = Math.floor((left + right) / 2);
        const midVal = arr[mid];
        this.view.highlightBinaryRange(left, right, mid);
        if (midVal === this.searchValue) {
            this.searchResult = { found: true, index: mid };
            this.view.showStep(`¡Encontrado en posición ${mid+1}!`, this.comparisons);
            this.searchInProgress = false;
            this.view.showDeleteButton(true);
            this.view.displayArray(arr, false, 'binary', 0, this.searchResult);
        } else if (midVal < this.searchValue) {
            this.view.showStep(`Comparando ${this.searchValue} con ${midVal} en posición ${mid+1} - Buscando en derecha.`, this.comparisons);
            left = mid + 1;
            this.timeoutId = setTimeout(() => this.binaryStep(left, right), 800);
        } else {
            this.view.showStep(`Comparando ${this.searchValue} con ${midVal} en posición ${mid+1} - Buscando en izquierda.`, this.comparisons);
            right = mid - 1;
            this.timeoutId = setTimeout(() => this.binaryStep(left, right), 800);
        }
    }

    reset() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.searchInProgress = false;
        this.currentStep = 0;
        this.comparisons = 0;
        this.searchResult = null;
        this.view.hideStep();
        this.view.showDeleteButton(false);
        this.view.displayArray(this.model.getArray(), false, this.searchAlgorithm, 0, null);
    }

    deleteFound() {
        if (this.searchResult && this.searchResult.found) {
            const arr = this.model.getArray();
            const val = arr[this.searchResult.index];
            arr.splice(this.searchResult.index, 1);
            this.model.setArray(arr);
            this.reset();
            this.view.displayArray(arr);
            this.view.updateStats(this.model.getStats());
            showNotification(`Elemento ${val} eliminado`, 'success');
        } else {
            showNotification('No hay elemento encontrado', 'error');
        }
    }
}