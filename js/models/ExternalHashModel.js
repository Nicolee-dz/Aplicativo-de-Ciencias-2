class ExternalHashModel {
    constructor() {
        this.blocks = [];        // array de bloques (cada bloque es un array de claves)
        this.numBlocks = 5;      // número de bloques fijo (puede ajustarse)
        this.blockSize = 4;      // claves por bloque
        this.hashFunction = 'division';
        this.collisionMethod = 'chaining'; // 'chaining' o 'linearProbing'
        this.records = [];        // lista plana para facilitar guardado
        this.maxRecords = 100;
        this.initBlocks();
    }

    initBlocks() {
        this.blocks = [];
        for (let i = 0; i < this.numBlocks; i++) {
            this.blocks.push([]);
        }
        this.records = [];
    }

    setNumBlocks(num) {
        this.numBlocks = Math.min(100, Math.max(1, num));
        this.initBlocks();
    }

    setBlockSize(size) {
        this.blockSize = Math.min(10, Math.max(1, size));
        this.initBlocks();
    }

    setHashFunction(func) {
        this.hashFunction = func;
        this.initBlocks(); // reinicia porque cambia distribución
    }

    setCollisionMethod(method) {
        this.collisionMethod = method;
        // No reinicia, solo afecta futuras inserciones
    }

    divisionHash(key) {
        return key % this.numBlocks;
    }

    multiplicationHash(key) {
        const A = 0.6180339887;
        return Math.floor(this.numBlocks * ((key * A) % 1));
    }

    foldingHash(key) {
        const sum = Math.abs(key).toString().split('').reduce((s, d) => s + parseInt(d), 0);
        return sum % this.numBlocks;
    }

    getBlockIndex(key) {
        switch (this.hashFunction) {
            case 'division': return this.divisionHash(key);
            case 'multiplication': return this.multiplicationHash(key);
            case 'folding': return this.foldingHash(key);
            default: return key % this.numBlocks;
        }
    }

    insert(key) {
        if (this.records.includes(key)) return { success: false, message: 'Clave ya existe' };
        if (this.records.length >= this.maxRecords) return { success: false, message: 'Límite de registros alcanzado' };

        let blockIdx = this.getBlockIndex(key);
        if (this.collisionMethod === 'chaining') {
            // Insertar en el bloque principal; si está lleno, agregar al final (simula overflow)
            if (this.blocks[blockIdx].length < this.blockSize) {
                this.blocks[blockIdx].push(key);
            } else {
                // Buscar un bloque de desbordamiento (lo simulamos como un array adicional)
                // Por simplicidad, creamos un nuevo bloque al final? No, mejor usar un array de overflow por bloque.
                if (!this.blocks[blockIdx].overflow) this.blocks[blockIdx].overflow = [];
                this.blocks[blockIdx].overflow.push(key);
            }
        } else { // linear probing
            let start = blockIdx;
            while (this.blocks[blockIdx].length >= this.blockSize) {
                blockIdx = (blockIdx + 1) % this.numBlocks;
                if (blockIdx === start) return { success: false, message: 'Tabla llena (sondeo lineal)' };
            }
            this.blocks[blockIdx].push(key);
        }
        this.records.push(key);
        return { success: true, blockIndex: blockIdx };
    }

    search(key) {
        let blockIdx = this.getBlockIndex(key);
        let comparisons = 0;
        let found = false;
        let foundBlock = -1;
        let position = -1;

        if (this.collisionMethod === 'chaining') {
            // Buscar en bloque principal
            for (let i = 0; i < this.blocks[blockIdx].length; i++) {
                comparisons++;
                if (this.blocks[blockIdx][i] === key) {
                    found = true;
                    foundBlock = blockIdx;
                    position = i;
                    break;
                }
            }
            if (!found && this.blocks[blockIdx].overflow) {
                for (let i = 0; i < this.blocks[blockIdx].overflow.length; i++) {
                    comparisons++;
                    if (this.blocks[blockIdx].overflow[i] === key) {
                        found = true;
                        foundBlock = blockIdx;
                        position = i;
                        break;
                    }
                }
            }
        } else { // linear probing
            let start = blockIdx;
            while (true) {
                for (let i = 0; i < this.blocks[blockIdx].length; i++) {
                    comparisons++;
                    if (this.blocks[blockIdx][i] === key) {
                        found = true;
                        foundBlock = blockIdx;
                        position = i;
                        break;
                    }
                }
                if (found) break;
                blockIdx = (blockIdx + 1) % this.numBlocks;
                if (blockIdx === start) break;
            }
        }
        return { found, blockIndex: foundBlock, position, comparisons };
    }

    remove(key) {
        const idx = this.records.indexOf(key);
        if (idx === -1) return false;
        this.records.splice(idx, 1);

        // Buscar y eliminar del bloque
        let blockIdx = this.getBlockIndex(key);
        if (this.collisionMethod === 'chaining') {
            let pos = this.blocks[blockIdx].indexOf(key);
            if (pos !== -1) {
                this.blocks[blockIdx].splice(pos, 1);
                return true;
            } else if (this.blocks[blockIdx].overflow) {
                pos = this.blocks[blockIdx].overflow.indexOf(key);
                if (pos !== -1) {
                    this.blocks[blockIdx].overflow.splice(pos, 1);
                    return true;
                }
            }
        } else {
            let start = blockIdx;
            while (true) {
                let pos = this.blocks[blockIdx].indexOf(key);
                if (pos !== -1) {
                    this.blocks[blockIdx].splice(pos, 1);
                    return true;
                }
                blockIdx = (blockIdx + 1) % this.numBlocks;
                if (blockIdx === start) break;
            }
        }
        return false;
    }

    reset() {
        this.initBlocks();
        this.records = [];
    }

    getBlocks() {
        return this.blocks;
    }

    getRecords() {
        return this.records;
    }
}