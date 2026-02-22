/**
 * Controlador para Residuos Múltiples (estructura similar a Tries)
 * Usa el modelo que se le pase; la visualización del árbol está pendiente.
 */
class ResiduosMultipleController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.isSearching = false;
    }

    init() {
        console.log('ResiduosMultipleController inicializado');
    }

    insertWord(word) {
        if (!word || typeof word !== 'string' || word.trim().length === 0) {
            showNotification('Ingresa una palabra válida', 'error');
            return;
        }
        const success = this.model && this.model.insertWord ? this.model.insertWord(word) : true;
        if (!success) {
            showNotification('No se pudo insertar la palabra', 'error');
            return;
        }
        this.view && this.view.render(this.model);
        this._updateCharTable();
        showNotification(`Palabra "${word.toUpperCase()}" insertada`, 'success');
    }

    searchChar(char) {
        if (this.isSearching) {
            showNotification('Búsqueda en progreso', 'warning');
            return;
        }
        if (!char || typeof char !== 'string' || char.trim().length !== 1) {
            showNotification('Ingresa un único carácter válido', 'error');
            return;
        }

        const result = this.model && this.model.search ? this.model.search(char) : { found: false, path: [] };

        this.isSearching = true;
        this._showSearchInfo(char, result);

        // Animar paso a paso (vacío por ahora)
        this.view && this.view.animatePath(result.path, () => {
            if (result.found) {
                showNotification(`Carácter '${char.toUpperCase()}' encontrado`, 'success');
                this._updateSearchInfo(char, result, true);
            } else {
                showNotification(`Carácter '${char.toUpperCase()}' no encontrado`, 'warning');
                this._updateSearchInfo(char, result, false);
            }
            this.isSearching = false;
        });
    }

    reset() {
        this.model && this.model.reset && this.model.reset();
        this.view && this.view.render(this.model);
        this._hideSearchInfo();
        this._clearCharTable();
        this.isSearching = false;
        showNotification('Árbol reiniciado', 'success');
    }

    _showSearchInfo(char, result) {
        const info = document.getElementById('residueStepInfo');
        if (!info) return;
        info.style.display = 'block';
        const desc = document.getElementById('residueStepDescription');
        if (!desc) return;
        desc.innerHTML = `
            <strong>Buscando:</strong> ${char.toUpperCase()}<br>
            <strong>Estado:</strong> búsqueda iniciada
        `;
    }

    _updateSearchInfo(char, result, found) {
        const desc = document.getElementById('residueStepDescription');
        if (!desc) return;
        desc.innerHTML = `
            <strong>Buscando:</strong> ${char.toUpperCase()}<br>
            <strong>Resultado:</strong> ${found ? 'Nodo encontrado ✓' : 'Nodo no encontrado ✗'}
        `;
    }

    _hideSearchInfo() {
        const info = document.getElementById('residueStepInfo');
        if (info) info.style.display = 'none';
    }

    _updateCharTable() {
        const tbody = document.getElementById('residueCharTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        // Si el modelo provee insertedChars mantén la misma lógica
        const chars = (this.model && this.model.insertedChars) ? this.model.insertedChars : [];
        for (const charInfo of chars) {
            const row = document.createElement('tr');
            const rep = (charInfo.repr || (charInfo.bits ? charInfo.bits.join('') : ''));
            row.innerHTML = `
                <td><strong>${charInfo.char}</strong></td>
                <td>${charInfo.pos || ''}</td>
                <td><code>${rep}</code></td>
            `;
            tbody.appendChild(row);
        }
    }

    _clearCharTable() {
        const tbody = document.getElementById('residueCharTableBody');
        if (tbody) tbody.innerHTML = '';
    }
}

window.ResiduosMultipleController = ResiduosMultipleController;
