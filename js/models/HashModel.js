class HashModel {
    constructor(size = 10) {
        this.size = size;
        this.table = new Array(size).fill(null);
        this.maxSize = 100;
        this.collisionMethod = 'linear'; // 'linear', 'quadratic', 'double'
    }

    setSize(newSize) {
        this.size = Math.min(newSize, this.maxSize);
        this.table = new Array(this.size).fill(null);
    }

    setCollisionMethod(method) {
        this.collisionMethod = method;
    }

    // Funciones hash
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

    // Doble hash: segunda función hash = 1 + (clave % (tamaño-1))
    doubleHashStep(key) {
        return 1 + (Math.abs(key) % (this.size - 1));
    }

    // Inserción con resolución de colisiones configurable
    insert(key, method) {
        if (this.table.includes(key)) return { success: false, message: 'Clave ya existe' };
        let idx = this.getIndex(key, method);
        const start = idx;
        let step = 1;
        let attempt = 0;
        const maxAttempts = this.size;

        while (this.table[idx] !== null) {
            attempt++;
            if (attempt >= maxAttempts) return { success: false, message: 'Tabla llena' };

            switch (this.collisionMethod) {
                case 'linear':
                    idx = (idx + 1) % this.size;
                    break;
                case 'quadratic':
                    idx = (start + step * step) % this.size;
                    step++;
                    break;
                case 'double':
                    const stepSize = this.doubleHashStep(key);
                    idx = (start + attempt * stepSize) % this.size;
                    break;
                default:
                    idx = (idx + 1) % this.size;
            }
            if (idx === start && this.collisionMethod !== 'quadratic') break;
        }
        this.table[idx] = key;
        return { success: true, index: idx };
    }

    // Búsqueda con la misma estrategia de colisiones
    search(key, method) {
        let idx = this.getIndex(key, method);
        const start = idx;
        let comparisons = 0;
        let step = 1;
        let attempt = 0;
        const maxAttempts = this.size;

        while (this.table[idx] !== null) {
            comparisons++;
            if (this.table[idx] === key) {
                return { found: true, index: idx, comparisons };
            }
            attempt++;
            if (attempt >= maxAttempts) break;

            switch (this.collisionMethod) {
                case 'linear':
                    idx = (idx + 1) % this.size;
                    break;
                case 'quadratic':
                    idx = (start + step * step) % this.size;
                    step++;
                    break;
                case 'double':
                    const stepSize = this.doubleHashStep(key);
                    idx = (start + attempt * stepSize) % this.size;
                    break;
                default:
                    idx = (idx + 1) % this.size;
            }
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