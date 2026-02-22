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
}