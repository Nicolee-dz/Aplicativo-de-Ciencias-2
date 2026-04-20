/**
 * BÚSQUEDA BINARIA EXTERNA — Modelo
 * El archivo siempre se mantiene ordenado.
 * La búsqueda divide los bloques por la mitad en cada paso.
 */
class ExternalBinModel {
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

    insert(value) {
        const v = parseInt(value);
        if (isNaN(v)) return { ok: false, msg: 'Valor inválido' };
        if (this.records.includes(v)) return { ok: false, msg: 'La clave ya existe' };
        this.records.push(v);
        this.records.sort((a, b) => a - b); // siempre ordenado
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

    /**
     * Búsqueda binaria externa por bloques.
     * En cada paso lee el bloque del medio, compara su primer y último registro
     * para decidir si el target puede estar ahí, si no descarta mitad izquierda o derecha.
     */
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
        let left  = 0;
        let right = blocks.length - 1;

        while (left <= right) {
            const mid      = Math.floor((left + right) / 2);
            const block    = blocks[mid];
            blockReads++;

            const first = block.records[0];
            const last  = block.records[block.records.length - 1];
            totalComparisons += 2;

            // ¿Puede estar en este bloque?
            if (target >= first && target <= last) {
                // Buscar dentro del bloque
                let foundInBlock = false;
                for (let r = 0; r < block.records.length; r++) {
                    totalComparisons++;
                    if (block.records[r] === target) {
                        found      = true;
                        foundBlock = mid;
                        foundPos   = r;
                        foundInBlock = true;
                        steps.push({
                            blockIndex:      mid,
                            recordIndex:     r,
                            records:         block.records,
                            left, right, mid,
                            blockReads,
                            totalComparisons,
                            found: true,
                            done:  true
                        });
                        break;
                    }
                }
                if (!foundInBlock) {
                    // No está en este bloque aunque debería — no encontrado
                    steps.push({
                        blockIndex:      mid,
                        recordIndex:     block.records.length - 1,
                        records:         block.records,
                        left, right, mid,
                        blockReads,
                        totalComparisons,
                        found: false,
                        done:  true
                    });
                }
                break;
            } else if (target < first) {
                steps.push({
                    blockIndex:      mid,
                    recordIndex:     0,
                    records:         block.records,
                    left, right, mid,
                    blockReads,
                    totalComparisons,
                    found: false,
                    done:  false,
                    direction: 'left'
                });
                right = mid - 1;
            } else {
                steps.push({
                    blockIndex:      mid,
                    recordIndex:     block.records.length - 1,
                    records:         block.records,
                    left, right, mid,
                    blockReads,
                    totalComparisons,
                    found: false,
                    done:  false,
                    direction: 'right'
                });
                left = mid + 1;
            }
        }

        if (!found && steps.length > 0 && !steps[steps.length - 1].done) {
            const last = steps[steps.length - 1];
            steps.push({ ...last, done: true });
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

window.ExternalBinModel = ExternalBinModel;