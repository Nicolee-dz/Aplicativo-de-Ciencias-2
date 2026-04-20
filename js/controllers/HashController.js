class HashController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    init() {
        console.log('HashController iniciado');
    }

    changeSize(newSize) {
        this.model.setSize(newSize);
        this.view.displayTable(this.model.getTable());
        this.view.hideStep();
    }

    changeFunction() {
        this.model.reset();
        this.view.displayTable(this.model.getTable());
        this.view.hideStep();
    }

    changeCollisionMethod(method) {
        this.model.setCollisionMethod(method);
        this.view.displayTable(this.model.getTable());
        showNotification(`Método de colisión cambiado a: ${method}`, 'info');
    }

    insert(key) {
        const method = document.getElementById('hashFunction').value;
        const result = this.model.insert(key, method);
        if (result.success) {
            this.view.displayTable(this.model.getTable());
            showNotification(`Clave ${key} insertada en posición ${result.index+1}`, 'success');
        } else {
            showNotification(result.message, 'error');
        }
        this.view.hideStep();
    }

    search(key) {
        const method = document.getElementById('hashFunction').value;
        const result = this.model.search(key, method);
        this.view.displayTable(this.model.getTable());
        this.view.showSearchResult(result.found, result.index, result.comparisons);
    }

    reset() {
        this.model.reset();
        this.view.displayTable(this.model.getTable());
        this.view.hideStep();
    }

    // Métodos para obtener descripciones (usados en app.js)
    getHashFunctionDescription(func) {
        const descriptions = {
            division: 'h(k) = k mod M. Divide la clave entre el tamaño de la tabla y toma el residuo. Rápido pero puede agrupar claves similares.',
            multiplication: 'h(k) = floor(M * (k * A mod 1)), con A ≈ 0.618. Mejor distribución que la división, especialmente para claves consecutivas.',
            folding: 'Suma los dígitos de la clave (o los agrupa) y aplica módulo M. Útil para claves grandes como números de teléfono.'
        };
        return descriptions[func] || 'Selecciona una función hash.';
    }

    getCollisionMethodDescription(method) {
        const descriptions = {
            linear: 'Sondeo lineal: ante una colisión, avanza linealmente a la siguiente posición. Puede producir agrupamiento primario.',
            quadratic: 'Sondeo cuadrático: salta en pasos cuadráticos (1², 2², 3²...). Reduce el agrupamiento primario pero puede no recorrer toda la tabla.',
            double: 'Doble hash: usa una segunda función hash para calcular el paso. Distribuye mejor pero es más costoso.'
        };
        return descriptions[method] || 'Selecciona un método de resolución de colisiones.';
    }
}