/**
 * BÚSQUEDA SECUENCIAL EXTERNA — Modelo
 * Simula un archivo en disco dividido en BLOQUES.
 * La unidad de costo es la LECTURA DE BLOQUE.
 */
class ExternalSeqModel {
    constructor() {
        this.records   = [];
        this.blockSize = 4;
        this.digits    = 3;
    }

    setBlockSize(size) {
        this.blockSize = Math.max(2, Math.min(10, parseInt(size) || 4));
    }

    setDigits(d) {
        this.digits = Math.max(1, Math.min(10, parseInt(d) || 3));
    }

    generate(count, digits) {
        if (digits !== undefined) this.setDigits(digits);
        count = Math.max(1, parseInt(count) || 16);

        const min  = Math.pow(10, this.digits - 1);
        const max  = Math.pow(10, this.digits) - 1;
        const pool = max - min + 1;
        const cap  = Math.min(count, pool);

        const used = new Set();
        this.records = [];
        let attempts = 0;
        while (this.records.length < cap && attempts < cap * 10) {
            const v = Math.floor(Math.random() * pool) + min;
            if (!used.has(v)) { used.add(v); this.records.push(v); }
            attempts++;
        }
        return this;
    }

    insert(value) {
        const v = parseInt(value);
        if (isNaN(v)) return { ok: false, msg: 'Valor inválido' };
        if (this.records.includes(v)) return { ok: false, msg: 'La clave ya existe' };
        this.records.push(v);
        return { ok: true };
    }

    remove(value) {
        const idx = this.records.indexOf(parseInt(value));
        if (idx === -1) return false;
        this.records.splice(idx, 1);
        return true;
    }

    clear() { this.records = []; }

    getBlocks() {
        const blocks = [];
        for (let i = 0; i < this.records.length; i += this.blockSize) {
            blocks.push({
                blockIndex: Math.floor(i / this.blockSize),
                records: this.records.slice(i, i + this.blockSize)
            });
        }
        return blocks;
    }

    get blockCount() {
        return Math.ceil(this.records.length / this.blockSize);
    }

    search(target) {
        target = parseInt(target);
        if (isNaN(target)) return null;

        const blocks = this.getBlocks();
        const steps  = [];
        let blockReads       = 0;
        let totalComparisons = 0;
        let found      = false;
        let foundBlock = -1;
        let foundPos   = -1;

        for (let b = 0; b < blocks.length; b++) {
            blockReads++;
            const block = blocks[b];

            for (let r = 0; r < block.records.length; r++) {
                totalComparisons++;
                if (block.records[r] === target) {
                    found      = true;
                    foundBlock = b;
                    foundPos   = r;
                    steps.push({
                        blockIndex:      b,
                        recordIndex:     r,
                        records:         block.records,
                        blockReads,
                        totalComparisons,
                        found: true,
                        done:  true
                    });
                    break;
                }
            }

            if (!found) {
                steps.push({
                    blockIndex:      b,
                    recordIndex:     block.records.length - 1,
                    records:         block.records,
                    blockReads,
                    totalComparisons,
                    found: false,
                    done:  false
                });
            } else {
                break;
            }
        }

        return { target, found, foundBlock, foundPos, blockReads, totalComparisons, totalBlocks: blocks.length, steps };
    }

    getStats() {
        const r = this.records;
        return {
            total:     r.length,
            blocks:    this.blockCount,
            blockSize: this.blockSize,
            min:       r.length ? Math.min(...r) : '-',
            max:       r.length ? Math.max(...r) : '-'
        };
    }
}

window.ExternalSeqModel = ExternalSeqModel;