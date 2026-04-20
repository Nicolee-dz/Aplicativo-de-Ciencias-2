/**
 * Controlador para Residuos Múltiples
 */
class ResiduosMultipleController {
    constructor(model, view) {
        this.model       = model;
        this.view        = view;
        this.isSearching = false;
    }

    init() {
        console.log('ResiduosMultipleController inicializado');
    }

    changeN(n) {
        const nVal = Math.min(5, Math.max(2, parseInt(n)));
        this.model.setN(nVal);
        this.view.render(this.model);
        this._hideSearchInfo();
        this._clearCharTable();
        this._updateNInfo(nVal);
        showNotification(`n=${nVal} → M=${Math.pow(2, nVal)} hijos por nodo`, 'success');
    }

    _updateNInfo(n) {
        const M    = Math.pow(2, n);
        const info = document.getElementById('residueNInfo');
        if (!info) return;
        // Generar todos los códigos posibles para ese M
        const codes = [];
        for (let i = 0; i < M; i++) {
            codes.push(i.toString(2).padStart(n, '0'));
        }
        // Calcular grupos del primer ejemplo (A=1=00001)
        const exampleGroups = [];
        for (let i = 0; i < 5; i += n) {
            exampleGroups.push('00001'.slice(i, Math.min(i + n, 5)));
        }
        info.innerHTML = `
            <strong>n = ${n}</strong> → 
            <strong>M = 2<sup>${n}</sup> = ${M}</strong> hijos por nodo 
            | <strong>${Math.ceil(5/n)} niveles</strong><br>
            <small>Códigos posibles: ${codes.join(', ')}
            ${5 % n !== 0 ? ` | Último nivel: ${(5 % n)} bit(s) suelto(s)` : ''}</small>
        `;
    }

    insertWord(word) {
        if (!word || typeof word !== 'string' || word.trim().length === 0) {
            showNotification('Ingresa una palabra válida', 'error');
            return;
        }
        const success = this.model.insertWord(word);
        if (!success) {
            showNotification('No se pudo insertar la palabra', 'error');
            return;
        }
        this.view.render(this.model);
        this._updateCharTable();
        showNotification(`Palabra "${word.toUpperCase()}" insertada`, 'success');
    }

    deleteChar(char) {
        if (!char || char.trim().length !== 1) {
            showNotification('Ingresa un único carácter válido', 'error');
            return;
        }
        const success = this.model.deleteChar(char);
        if (!success) {
            showNotification(`Carácter '${char.toUpperCase()}' no existe en el árbol`, 'error');
            return;
        }
        this.view.render(this.model);
        this._updateCharTable();
        showNotification(`Carácter '${char.toUpperCase()}' eliminado`, 'success');
    }

    searchChar(char) {
        if (this.isSearching) {
            showNotification('Búsqueda en progreso', 'warning');
            return;
        }
        if (!char || char.trim().length !== 1) {
            showNotification('Ingresa un único carácter válido', 'error');
            return;
        }

        const result = this.model.search(char);
        if (!result) {
            showNotification('Búsqueda inválida', 'error');
            return;
        }

        this.isSearching = true;
        this._showSearchInfo(char, result);

        this.view.animatePath(result.path, () => {
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
        this.model.reset();
        this.view.render(this.model);
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
        const groupsStr = result.groups
            .map((g, i) => `Nivel ${i + 1}: grupo <code>"${g}"</code>`)
            .join('<br>');
        desc.innerHTML = `
            <strong>Buscando:</strong> ${char.toUpperCase()}<br>
            <strong>Posición:</strong> ${result.pos} → binario: <code>${this.model.posToBits(result.pos)}</code><br>
            <strong>Grupos (n=${this.model.n}):</strong><br>${groupsStr}<br>
            <strong>Resultado:</strong> ${result.found ? 'Encontrado ✓' : 'Buscando...'}
        `;
    }

    _updateSearchInfo(char, result, found) {
        const desc = document.getElementById('residueStepDescription');
        if (!desc) return;
        const groupsStr = result.groups
            .map((g, i) => `Nivel ${i + 1}: grupo <code>"${g}"</code>`)
            .join('<br>');
        desc.innerHTML = `
            <strong>Buscando:</strong> ${char.toUpperCase()}<br>
            <strong>Posición:</strong> ${result.pos} → binario: <code>${this.model.posToBits(result.pos)}</code><br>
            <strong>Grupos (n=${this.model.n}):</strong><br>${groupsStr}<br>
            <strong>Resultado:</strong> ${found ? 'Hoja encontrada ✓' : 'Hoja no encontrada ✗'}
        `;
    }

    _hideSearchInfo() {
        const info = document.getElementById('residueStepInfo');
        if (info) info.style.display = 'none';
    }

    _updateCharTable() {
        const tbody = document.getElementById('residueKeyTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        for (const entry of this.model.insertedChars) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${entry.char}</strong></td>
                <td>${entry.pos}</td>
                <td><code>${this.model.posToBits(entry.pos)}</code></td>
                <td><code>${entry.groups.join(', ')}</code></td>
            `;
            tbody.appendChild(row);
        }
    }

    _clearCharTable() {
        const tbody = document.getElementById('residueKeyTableBody');
        if (tbody) tbody.innerHTML = '';
    }
}

window.ResiduosMultipleController = ResiduosMultipleController;