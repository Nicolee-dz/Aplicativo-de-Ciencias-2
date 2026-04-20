/**
 * Modelo Árbol de Huffman
 * - Recibe un texto o una tabla de frecuencias
 * - Construye el árbol paso a paso
 * - Genera los códigos binarios para cada símbolo
 */
class HuffmanNode {
    constructor(char, freq) {
        this.char  = char;   // null si es nodo interno
        this.freq  = freq;
        this.left  = null;
        this.right = null;
        this.code  = '';
    }
}

class HuffmanModel {
    constructor() {
        this.root       = null;
        this.codes      = {};   // { char: '0110', ... }
        this.freqTable  = [];   // [{ char, freq }]
        this.charOrder  = {};   // { char: orden_de_aparicion }
        this.steps      = [];   // pasos del proceso de construcción
        this.text       = '';
        this.encoded    = '';   // texto codificado en bits
        this.totalBits  = 0;
        this.normalBits = 0;
    }

    reset() {
        this.root       = null;
        this.codes      = {};
        this.freqTable  = [];
        this.charOrder  = {};
        this.steps      = [];
        this.text       = '';
        this.encoded    = '';
        this.totalBits  = 0;
        this.normalBits = 0;
    }

    /**
     * Construye el árbol a partir de un texto
     */
    buildFromText(text) {
        this.reset();
        if (!text || text.trim().length === 0) return false;
        this.text = text.toUpperCase();

        // Contar frecuencias manteniendo orden de aparición
        const freqMap = {};
        const orderMap = {};
        let orderIndex = 0;
        for (const ch of this.text) {
            if (!(ch in freqMap)) {
                freqMap[ch] = 0;
                orderMap[ch] = orderIndex++;
            }
            freqMap[ch]++;
        }
        this.charOrder = { ...orderMap };
        return this._build(freqMap, orderMap);
    }

    /**
     * Construye el árbol a partir de tabla manual { char: freq }
     */
    buildFromTable(freqMap) {
        this.reset();
        if (!freqMap || Object.keys(freqMap).length === 0) return false;
        // Para tabla manual, usar orden alfabético
        const orderMap = {};
        Object.keys(freqMap).sort().forEach((ch, i) => {
            orderMap[ch] = i;
        });
        this.charOrder = { ...orderMap };
        return this._build(freqMap, orderMap);
    }

    _build(freqMap, orderMap) {
        // Crear nodos hoja - ordenar ascendente por frecuencia, luego por orden de aparición
        let queue = Object.entries(freqMap)
            .map(([char, freq]) => {
                const node = new HuffmanNode(char, freq);
                node.order = orderMap[char];
                return node;
            })
            .sort((a, b) => {
                if (a.freq !== b.freq) return a.freq - b.freq;
                return a.order - b.order;  // Orden de aparición, no alfabético
            });

        if (queue.length === 0) return false;

        this.freqTable = queue.map(n => ({ char: n.char, freq: n.freq }));
        this.steps = [];

        // Guardar estado inicial (mostrar de abajo hacia arriba en la vista)
        this.steps.push({
            label: 'Tabla inicial ordenada por frecuencia',
            queue: queue.map(n => ({ char: n.char, label: n.char, freq: n.freq, isNew: false }))
        });

        // Caso especial: un solo símbolo
        if (queue.length === 1) {
            const only = queue[0];
            const parent = new HuffmanNode(null, only.freq);
            parent.left = only;
            this.root = parent;
            this._assignCodes(this.root, '');
            this._calcStats();
            return true;
        }

        // Algoritmo de Huffman - leer de abajo hacia arriba
        let stepNum = 1;
        while (queue.length > 1) {
            // Tomar los dos de MENOR frecuencia (primeros en la cola ordenada ascendente)
            const left  = queue.shift();
            const right = queue.shift();

            const merged = new HuffmanNode(null, left.freq + right.freq);
            merged.left  = left;
            merged.right = right;
            
            // Label legible para el nodo fusionado
            const leftLabel = left.char || left.label || `∑${left.freq}`;
            const rightLabel = right.char || right.label || `∑${right.freq}`;
            merged.label = leftLabel + '+' + rightLabel;

            // Insertar en posición correcta: 
            // - Ordenado por frecuencia ascendente
            // - Si hay empate de frecuencia, el nuevo va DESPUÉS (arriba en vista invertida)
            let inserted = false;
            for (let i = 0; i < queue.length; i++) {
                if (merged.freq < queue[i].freq) {
                    queue.splice(i, 0, merged);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) queue.push(merged);

            // Guardar paso
            this.steps.push({
                label: `Paso ${stepNum}: Fusionar "${leftLabel}" (${left.freq}) + "${rightLabel}" (${right.freq}) = ${merged.freq}`,
                merged: { 
                    leftChar: left.char || leftLabel, 
                    leftFreq: left.freq, 
                    rightChar: right.char || rightLabel, 
                    rightFreq: right.freq, 
                    newFreq: merged.freq,
                    newLabel: merged.label
                },
                queue: queue.map(n => ({
                    char:  n.char,
                    label: n.label || n.char,
                    freq:  n.freq,
                    isNew: n === merged
                }))
            });
            stepNum++;
        }

        this.root = queue[0];
        this._assignCodes(this.root, '');
        this._calcStats();
        return true;
    }

    _assignCodes(node, code) {
        if (!node) return;
        node.code = code;
        if (node.char !== null) {
            this.codes[node.char] = code || '0';
            return;
        }
        this._assignCodes(node.left,  code + '0');
        this._assignCodes(node.right, code + '1');
    }

    _calcStats() {
        if (!this.text) return;
        this.encoded    = this.text.split('').map(c => this.codes[c] || '').join('');
        this.totalBits  = this.encoded.length;
        this.normalBits = this.text.length * 8;
    }

    /**
     * Jerarquía para D3
     */
    getHierarchy() {
        const convert = (node, edgeLabel = null) => {
            if (!node) return null;
            const children = [];
            if (node.left)  children.push(convert(node.left,  0));
            if (node.right) children.push(convert(node.right, 1));
            return {
                char:      node.char,
                freq:      node.freq,
                code:      node.code,
                isLeaf:    node.char !== null,
                edgeLabel: edgeLabel,
                children:  children.length ? children : null,
                _ref:      node
            };
        };
        return this.root ? convert(this.root) : null;
    }

    getCodesTable() {
        return Object.entries(this.codes)
            .sort((a, b) => {
                const aOrder = this.charOrder[a[0]] ?? Number.MAX_SAFE_INTEGER;
                const bOrder = this.charOrder[b[0]] ?? Number.MAX_SAFE_INTEGER;
                return aOrder - bOrder;
            })
            .map(([char, code]) => ({
                char,
                freq: this.freqTable.find(f => f.char === char)?.freq || 0,
                code,
                bits: code.length
            }));
    }
}

window.HuffmanModel = HuffmanModel;