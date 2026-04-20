class ExternalHashController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    init() {
        console.log('ExternalHashController iniciado');
    }

    applyConfig(numBlocks, blockSize) {
        this.model.setNumBlocks(numBlocks);
        this.model.setBlockSize(blockSize);
        this.view.render(this.model);
    }

    setHashFunction(func) {
        this.model.setHashFunction(func);
        this.view.render(this.model);
        showNotification(`Función hash cambiada a: ${func}`, 'info');
    }

    setCollisionMethod(method) {
        this.model.setCollisionMethod(method);
        showNotification(`Método de colisión cambiado a: ${method}`, 'info');
        // No se reinicia, solo afecta futuras inserciones
        this.view.render(this.model);
    }

    insert(key, digits) {
        if (String(Math.abs(parseInt(key))).length !== digits) {
            showNotification(`La clave debe tener exactamente ${digits} dígito(s)`, 'error');
            return false;
        }
        const result = this.model.insert(parseInt(key));
        if (result.success) {
            this.view.render(this.model);
            showNotification(`Clave ${key} insertada en bloque ${result.blockIndex+1}`, 'success');
        } else {
            showNotification(result.message, 'error');
        }
        return result.success;
    }

    search(key, digits) {
        if (String(Math.abs(parseInt(key))).length !== digits) {
            showNotification(`La clave debe tener exactamente ${digits} dígito(s)`, 'error');
            return;
        }
        const result = this.model.search(parseInt(key));
        this.view.showSearchResult(result.found, result.blockIndex, result.position, result.comparisons);
        if (result.found) {
            // Resaltar visualmente el bloque y la posición
            const blocksDiv = document.querySelectorAll('.ext-block');
            if (blocksDiv[result.blockIndex]) {
                blocksDiv[result.blockIndex].classList.add('found-block');
                setTimeout(() => blocksDiv[result.blockIndex].classList.remove('found-block'), 2000);
            }
        }
    }

    remove(key, digits) {
        if (String(Math.abs(parseInt(key))).length !== digits) {
            showNotification(`La clave debe tener exactamente ${digits} dígito(s)`, 'error');
            return false;
        }
        const success = this.model.remove(parseInt(key));
        if (success) {
            this.view.render(this.model);
            showNotification(`Clave ${key} eliminada`, 'success');
        } else {
            showNotification(`Clave ${key} no encontrada`, 'error');
        }
        return success;
    }

    reset() {
        this.model.reset();
        this.view.render(this.model);
        this.view.hideStep();
        showNotification('Archivo hash reiniciado', 'success');
    }

    save() {
        // Implementar guardado en PDF similar a otros módulos
        const records = this.model.getRecords();
        if (records.length === 0) {
            showNotification('No hay datos para guardar', 'error');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text('Archivo Hash - Búsquedas Externas', 20, 20);
        doc.text(`Función hash: ${this.model.hashFunction}`, 20, 30);
        doc.text(`Método colisión: ${this.model.collisionMethod}`, 20, 40);
        doc.text(`Bloques: ${this.model.numBlocks}`, 20, 50);
        doc.text(`Tamaño bloque: ${this.model.blockSize}`, 20, 60);
        let y = 80;
        doc.text('Registros:', 20, y);
        y += 10;
        records.forEach((rec, i) => {
            doc.text(`${i+1}. ${rec}`, 20, y);
            y += 8;
            if (y > 280) { doc.addPage(); y = 20; }
        });
        doc.save(`external_hash_${Date.now()}.pdf`);
        showNotification('Archivo hash guardado como PDF', 'success');
    }

    print() {
        const records = this.model.getRecords();
        if (records.length === 0) {
            showNotification('No hay datos para imprimir', 'error');
            return;
        }
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>Archivo Hash</title>
            <style>body{font-family:sans-serif;} table{border-collapse:collapse; width:100%;} th,td{border:1px solid #ccc; padding:8px;}</style>
            </head><body>
            <h1>Archivo Hash - Búsquedas Externas</h1>
            <p>Función hash: ${this.model.hashFunction}</p>
            <p>Método colisión: ${this.model.collisionMethod}</p>
            <p>Bloques: ${this.model.numBlocks}</p>
            <p>Tamaño bloque: ${this.model.blockSize}</p>
            <h2>Registros</h2>
            <table><tr><th>#</th><th>Clave</th></tr>
            ${records.map((r,i) => `<tr><td>${i+1}</td><td>${r}</td></tr>`).join('')}
            </table>
            </body></html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}