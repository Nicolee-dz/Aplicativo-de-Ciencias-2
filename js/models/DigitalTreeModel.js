/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║         ÁRBOL DIGITAL DE BÚSQUEDA (Digital Search Tree) ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  - La RAÍZ es la PRIMERA clave insertada                ║
 * ║  - Cada NODO almacena una clave (nunca vacíos)          ║
 * ║  - Para insertar: se compara bit a bit con el nodo      ║
 * ║    actual, usando el bit según la PROFUNDIDAD del nodo  ║
 * ║  - Bit = 0 → izquierda   |   Bit = 1 → derecha         ║
 * ║  - Profundidad 0 → bit más significativo (bit 4)        ║
 * ╚══════════════════════════════════════════════════════════╝
 *
 *  Ejemplo con A=1(00001), B=2(00010), H=8(01000):
 *
 *         [H 01000]          ← raíz (primera insertada)
 *        /         \
 *   [A 00001]   [P 10000]   ← bit 4: A→0 izq, P→1 der
 *      ...
 */
class DigitalTreeNode {
    constructor(char, pos, bits) {
        this.char  = char;   // letra almacenada ej: 'A'
        this.pos   = pos;    // posición alfabeto ej: 1
        this.bits  = bits;   // array 5 bits [b4,b3,b2,b1,b0]
        this.left  = null;   // bit=0
        this.right = null;   // bit=1
    }
}

class DigitalTreeModel {
    constructor() {
        this.root          = null;
        this.bitLength     = 5;
        this.insertedChars = [];
        this.words         = [];
    }

    reset() {
        this.root          = null;
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

    /** pos → 5 bits MSB primero.  A=1 → [0,0,0,0,1]  Z=26 → [1,1,0,1,0] */
    posToBits(pos) {
        const bits = [];
        for (let i = this.bitLength - 1; i >= 0; i--) {
            bits.push((pos >> i) & 1);
        }
        return bits;
    }

    _insertChar(char) {
        const pos = this.charToPos(char);
        if (pos === 0) return false;
        const key = char.trim().toUpperCase();

        // Ignorar duplicado
        if (this.insertedChars.some(c => c.char === key)) return false;

        const bits    = this.posToBits(pos);
        const newNode = new DigitalTreeNode(key, pos, bits);
        this.insertedChars.push({ char: key, pos, bits });

        // Árbol vacío → raíz
        if (!this.root) {
            this.root = newNode;
            return true;
        }

        /**
         * Recorre el árbol:
         * En el nodo a profundidad d, examinamos bits[d] del NUEVO nodo.
         *   0 → ir/insertar izquierda
         *   1 → ir/insertar derecha
         */
        let current = this.root;
        let depth   = 0;

        while (depth < this.bitLength) {
            const bit = bits[depth];

            if (bit === 0) {
                if (!current.left) {
                    current.left = newNode;
                    return true;
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = newNode;
                    return true;
                }
                current = current.right;
            }
            depth++;
        }
        return false;
    }

    /**
     * Elimina un carácter del árbol y del registro.
     * Estrategia: reconstruir el árbol sin ese nodo,
     * reinsertando sus hijos.
     */
    deleteChar(char) {
        const key = char.trim().toUpperCase();
        if (!this.root) return false;
        if (!this.insertedChars.some(c => c.char === key)) return false;

        // Recolectar todos los chars del árbol excepto el eliminado
        const remaining = this.insertedChars
            .filter(c => c.char !== key)
            .map(c => c.char);

        // Reconstruir árbol desde cero con los restantes
        this.root          = null;
        this.insertedChars = [];
        for (const ch of remaining) this._insertChar(ch);
        return true;
    }

    insertWord(word) {
        if (!word || typeof word !== 'string') return false;
        const w = word.trim().toUpperCase();
        if (!w.length) return false;
        for (const ch of w) this._insertChar(ch);
        this.words.push(w);
        return true;
    }

    /**
     * Busca un carácter y devuelve el path recorrido.
     * path[i] = { node, depth, bit (bit examinado para bajar) }
     */
    search(char) {
        const pos  = this.charToPos(char);
        if (pos === 0) return null;

        const bits = this.posToBits(pos);
        const path = [];
        let   node  = this.root;
        let   depth = 0;

        while (node) {
            path.push({ node, depth, bit: bits[depth] ?? null });

            if (node.char === char.trim().toUpperCase()) {
                return { char: char.toUpperCase(), pos, bits, path, found: true };
            }

            if (depth >= this.bitLength) break;
            const bit = bits[depth];
            node  = bit === 0 ? node.left : node.right;
            depth++;
        }

        return { char: char.toUpperCase(), pos, bits, path, found: false };
    }

    /**
     * Jerarquía para D3.
     * edgeLabel = bit (0 ó 1) que tomamos para llegar a este nodo.
     */
    getHierarchy() {
        const convert = (node, edgeLabel = null) => {
            if (!node) return null;
            const children = [];
            if (node.left)  children.push(convert(node.left,  0));
            if (node.right) children.push(convert(node.right, 1));

            return {
                char:      node.char,
                pos:       node.pos,
                bitsStr:   node.bits ? node.bits.join('') : '',
                edgeLabel: edgeLabel,
                children:  children.length ? children : null,
                _ref:      node
            };
        };
        return this.root ? convert(this.root) : null;
    }
}

window.DigitalTreeModel = DigitalTreeModel;