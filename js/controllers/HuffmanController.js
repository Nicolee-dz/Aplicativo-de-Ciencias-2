/**
 * Controlador Árbol de Huffman
 */
class HuffmanController {
    constructor(model, view) {
        this.model = model;
        this.view  = view;
    }

    init() {
        console.log('HuffmanController inicializado');
    }

    buildFromText() {
        const input = document.getElementById('huffTextInput');
        if (!input) return;
        const text = input.value.trim();
        if (!text) { showNotification('Ingresa un texto', 'error'); return; }

        const ok = this.model.buildFromText(text);
        if (!ok) { showNotification('No se pudo construir el árbol', 'error'); return; }

        this._showResults();
        showNotification('Árbol de Huffman construido ✓', 'success');
    }

    reset() {
        this.model.reset();
        const resultsSection = document.getElementById('huffmanResults');
        if (resultsSection) resultsSection.style.display = 'none';
        const encodedSection = document.getElementById('huffEncodedSection');
        if (encodedSection) encodedSection.style.display = 'none';
        const tbody = document.getElementById('huffmanCodesBody');
        if (tbody) tbody.innerHTML = '';
        const stepsContainer = document.getElementById('huffmanStepsContainer');
        if (stepsContainer) stepsContainer.innerHTML = '';
        const treeContainer = document.getElementById('huffmanTreeContainer');
        if (treeContainer) treeContainer.innerHTML = '';
        const textInput = document.getElementById('huffTextInput');
        if (textInput) textInput.value = '';
        showNotification('Reiniciado', 'success');
    }

    _showResults() {
        const resultsSection = document.getElementById('huffmanResults');
        if (resultsSection) resultsSection.style.display = 'flex';
        const encodedSection = document.getElementById('huffEncodedSection');
        if (encodedSection) encodedSection.style.display = this.model.text ? 'block' : 'none';
        this.view.render(this.model);
    }
}

window.HuffmanController = HuffmanController;