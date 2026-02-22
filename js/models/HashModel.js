class HashModel {
    constructor(size = 10) {
        this.size = size;
        this.table = new Array(size).fill(null);
        this.maxSize = 100;
    }

    setSize(newSize) {
        this.size = Math.min(newSize, this.maxSize);
        this.table = new Array(this.size).fill(null);
    }

    division(key) {
        return key % this.size;
    }

    multiplication(key) {
        const A = 0.6180339887;
        return Math.floor(this.size * ((key * A) % 1));
    }

    folding(key) {
        const sum = Math.abs(key).toString().split('').reduce((s, d) => s + parseInt(d), 0);
        return sum % this.size;
    }

    getIndex(key, method) {
        switch (method) {
            case 'division': return this.division(key);
            case 'multiplication': return this.multiplication(key);
            case 'folding': return this.folding(key);
            default: return key % this.size;
        }
    }

    insert(key, method) {
        if (this.table.includes(key)) return { success: false, message: 'Clave ya existe' };
        let idx = this.getIndex(key, method);
        const start = idx;
        while (this.table[idx] !== null) {
            idx = (idx + 1) % this.size;
            if (idx === start) return { success: false, message: 'Tabla llena' };
        }
        this.table[idx] = key;
        return { success: true, index: idx };
    }

    search(key, method) {
        let idx = this.getIndex(key, method);
        const start = idx;
        let comparisons = 0;
        while (this.table[idx] !== null) {
            comparisons++;
            if (this.table[idx] === key) {
                return { found: true, index: idx, comparisons };
            }
            idx = (idx + 1) % this.size;
            if (idx === start) break;
        }
        return { found: false, comparisons };
    }

    reset() {
        this.table = new Array(this.size).fill(null);
    }

    getTable() {
        return this.table;
    }
}