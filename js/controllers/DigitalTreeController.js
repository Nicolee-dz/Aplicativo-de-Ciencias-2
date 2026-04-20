/**
 * Controlador para el Árbol Digital
 * Maneja inserción de palabras y búsqueda animada
 */
class DigitalTreeController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.isSearching = false;
    }

    init() {
        console.log('DigitalTreeController inicializado');
    }

    /**
     * Inserta una palabra en el árbol
     */
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

    /**
     * Busca un carácter en el árbol y anima el recorrido
     */
    searchChar(char) {
        if (this.isSearching) {
            showNotification('Búsqueda en progreso', 'warning');
            return;
        }
        if (!char || typeof char !== 'string' || char.trim().length !== 1) {
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

        // Animar paso a paso
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

    /**
     * Reinicia el árbol
     */
    reset() {
        this.model.reset();
        this.view.render(this.model);
        this._hideSearchInfo();
        this._clearCharTable();
        this.isSearching = false;
        showNotification('Árbol reiniciado', 'success');
    }

    /**
     * Muestra info de búsqueda
     */
    _showSearchInfo(char, result) {
        const info = document.getElementById('digitalStepInfo');
        if (!info) return;
        info.style.display = 'block';
        const desc = document.getElementById('digitalStepDescription');
        if (!desc) return;
        const pos = result.pos;
        const bits = result.bits.join('');
        desc.innerHTML = `
            <strong>Buscando:</strong> ${char.toUpperCase()}<br>
            <strong>Posición alfabeto:</strong> ${pos}<br>
            <strong>Binario (5 bits):</strong> ${bits}<br>
            <strong>Recorrido:</strong> Hoja ${result.found ? 'encontrada ✓' : 'no encontrada ✗'}
        `;
    }

    /**
     * Actualiza resultado final
     */
    _updateSearchInfo(char, result, found) {
        const desc = document.getElementById('digitalStepDescription');
        if (!desc) return;
        const pos = result.pos;
        const bits = result.bits.join('');
        desc.innerHTML = `
            <strong>Buscando:</strong> ${char.toUpperCase()}<br>
            <strong>Posición alfabeto:</strong> ${pos}<br>
            <strong>Binario (5 bits):</strong> ${bits}<br>
            <strong>Resultado:</strong> ${found ? 'Hoja encontrada ✓' : 'Hoja no encontrada ✗'}
        `;
    }

    /**
     * Oculta info de búsqueda
     */
    _hideSearchInfo() {
        const info = document.getElementById('digitalStepInfo');
        if (info) info.style.display = 'none';
    }

    /**
     * Actualiza la tabla de caracteres insertados
     */
    _updateCharTable() {
        const tbody = document.getElementById('digitalCharTableBody');
        if (!tbody) return;
        
        // Limpiar filas existentes
        tbody.innerHTML = '';
        
        // Agregar una fila por cada carácter insertado
        for (const charInfo of this.model.insertedChars) {
            const row = document.createElement('tr');
            const bitsStr = charInfo.bits.join('');
            row.innerHTML = `
                <td><strong>${charInfo.char}</strong></td>
                <td>${charInfo.pos}</td>
                <td><code>${bitsStr}</code></td>
            `;
            tbody.appendChild(row);
        }
    }

    /**
     * Limpia la tabla de caracteres
     */
    _clearCharTable() {
        const tbody = document.getElementById('digitalCharTableBody');
        if (tbody) tbody.innerHTML = '';
    }
}

window.DigitalTreeController = DigitalTreeController;
