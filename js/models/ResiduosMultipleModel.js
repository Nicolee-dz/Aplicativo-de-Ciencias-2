/**
 * Modelo Residuos Múltiples
 * - n configurable (2-5), M = 2^n hijos por nodo
 * - Cada letra → posición (A=1..Z=26) → binario 5 bits
 * - 5 bits se dividen en grupos de n dígitos (el último puede tener menos)
 * - TODAS las hojas quedan en el MISMO nivel (profundidad = groupCount)
 * - No hay "insertar en primer nodo libre": siempre se baja hasta el último nivel
 *
 * Ejemplo n=2 → grupos de bits "01010":
 *   Nivel 1: "01"  (bits 0-1)
 *   Nivel 2: "01"  (bits 2-3)
 *   Nivel 3: "0"   (bit 4, último suelto)
 *
 * Ejemplo n=4 → grupos de "01010":
 *   Nivel 1: "0101" (bits 0-3)
 *   Nivel 2: "0"    (bit 4, último suelto)
 */
class ResiduosNode {
    constructor() {
        this.children = {}; // grupo (string) → ResiduosNode
        this.char     = null;
        this.isLeaf   = false;
    }
}

class ResiduosMultipleModel {
    constructor(n = 2) {
        this.n             = Math.min(5, Math.max(2, parseInt(n)));
        this.M             = Math.pow(2, this.n);
        this.root          = new ResiduosNode();
        this.insertedChars = [];
        this.words         = [];
    }

    setN(n) {
        this.n             = Math.min(5, Math.max(2, parseInt(n)));
        this.M             = Math.pow(2, this.n);
        this.root          = new ResiduosNode();
        this.insertedChars = [];
        this.words         = [];
    }

    reset() {
        this.root          = new ResiduosNode();
        this.insertedChars = [];
        this.words         = [];
    }

    charToPos(ch) {
        if (!ch || typeof ch !== 'string') return 0;
        const c = ch.trim().toUpperCase();
        if (!c.length) return 0;
        const code = c.charCodeAt(0);
        return (code >= 65 && code <= 90) ? code - 64 : 0;
    }

    /** pos → string de 5 bits. Ej: 10 → "01010" */
    posToBits(pos) {
        return pos.toString(2).padStart(5, '0');
    }

    /**
     * Divide los 5 bits en grupos de n dígitos.
     * El último grupo puede tener menos de n si 5 % n !== 0.
     * NO se rellena con ceros.
     * Ej: n=2 → ["01","01","0"]
     * Ej: n=3 → ["010","10"]
     * Ej: n=4 → ["0101","0"]
     * Ej: n=5 → ["01010"]
     */
    getGroups(pos) {
        const bits   = this.posToBits(pos);
        const groups = [];
        for (let i = 0; i < 5; i += this.n) {
            groups.push(bits.slice(i, Math.min(i + this.n, 5)));
        }
        return groups;
    }

    /** Número de niveles del árbol según n actual */
    get groupCount() {
        return Math.ceil(5 / this.n);
    }

    /**
     * Inserta un carácter.
     * SIEMPRE baja hasta el último nivel (groupCount).
     * Todas las hojas quedan a la misma profundidad.
     */
    _insertChar(char) {
        const pos = this.charToPos(char);
        if (pos === 0) return false;
        const key = char.trim().toUpperCase();
        if (this.insertedChars.some(c => c.char === key)) return false;

        const groups = this.getGroups(pos);
        this.insertedChars.push({ char: key, pos, groups });

        let node = this.root;
        for (let i = 0; i < groups.length; i++) {
            const g      = groups[i];
            const isLast = i === groups.length - 1;

            if (!node.children[g]) {
                node.children[g] = new ResiduosNode();
            }
            node = node.children[g];

            if (isLast) {
                node.isLeaf = true;
                node.char   = key;
            }
        }
        return true;
    }

    insertWord(word) {
        if (!word || typeof word !== 'string') return false;
        const w = word.trim().toUpperCase();
        if (!w.length) return false;
        for (const char of w) this._insertChar(char);
        this.words.push(w);
        return true;
    }

    deleteChar(char) {
        const key = char.trim().toUpperCase();
        if (!this.insertedChars.some(c => c.char === key)) return false;

        const remaining = this.insertedChars
            .filter(c => c.char !== key)
            .map(c => c.char);

        this.root          = new ResiduosNode();
        this.insertedChars = [];
        this.words         = [];

        for (const ch of remaining) this._insertChar(ch);
        return true;
    }

    search(char) {
        const pos  = this.charToPos(char);
        if (pos === 0) return null;
        const key    = char.trim().toUpperCase();
        const groups = this.getGroups(pos);
        const path   = [];
        let   node   = this.root;

        path.push({ node, group: null, depth: 0 });

        for (let i = 0; i < groups.length; i++) {
            const g    = groups[i];
            const next = node.children[g];
            path.push({ node: next, group: g, depth: i + 1 });
            if (!next) break;
            node = next;
        }

        const last  = path[path.length - 1];
        const found = !!(last?.node?.isLeaf && last?.node?.char === key);
        return { char: key, pos, groups, path, found };
    }

    getHierarchy() {
        const convert = (node, edgeLabel = null) => {
            if (!node) return null;

            const childEntries = Object.entries(node.children)
                .sort((a, b) => a[0].localeCompare(b[0]));

            const children = childEntries
                .map(([g, child]) => convert(child, g))
                .filter(Boolean);

            return {
                char:      node.char || '',
                isLeaf:    node.isLeaf,
                edgeLabel: edgeLabel,
                bitsStr:   node.isLeaf ? this.posToBits(this.charToPos(node.char)) : '',
                children:  children.length ? children : null,
                _ref:      node
            };
        };
        return convert(this.root);
    }
}

window.ResiduosMultipleModel = ResiduosMultipleModel;