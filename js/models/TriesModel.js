/**
 * Modelo TRIES
 * Regla de inserción:
 *   - Se recorre bit a bit la representación del carácter
 *   - Si el nodo actual está LIBRE (no tiene hijos en esa dirección
 *     y no es hoja), se inserta AHÍ como hoja (ruta corta)
 *   - Si el nodo ya es hoja (otro carácter), se "baja" ese carácter
 *     un nivel y se continúa discriminando
 *   - Las hojas quedan en su profundidad natural, no siempre en nivel 5
 */
class TriesNode {
    constructor() {
        this.left   = null;
        this.right  = null;
        this.char   = null;
        this.isLeaf = false;
    }
}

class TriesModel {
    constructor() {
        this.root          = new TriesNode();
        this.bitLength     = 5;
        this.words         = [];
        this.insertedChars = [];
    }

    reset() {
        this.root          = new TriesNode();
        this.words         = [];
        this.insertedChars = [];
    }

    charToPos(ch) {
        if (!ch || typeof ch !== 'string') return 0;
        const c = ch.trim().toUpperCase();
        if (!c.length) return 0;
        const code = c.charCodeAt(0);
        return (code >= 65 && code <= 90) ? code - 64 : 0;
    }

    posToChar(pos) {
        if (!pos || isNaN(pos) || pos <= 0) return '?';
        return String.fromCharCode(64 + Math.min(26, Math.max(1, Math.round(pos))));
    }

    posToBits(pos) {
        const bits = [];
        for (let i = this.bitLength - 1; i >= 0; i--) {
            bits.push((pos >> i) & 1);
        }
        return bits;
    }

    /**
     * Inserta un carácter usando la regla de TRIES real:
     * - En cada nivel se examina el bit correspondiente
     * - Si el hijo en esa dirección no existe → insertar aquí como hoja
     * - Si el hijo existe y es hoja → hay colisión: bajar ambos un nivel
     * - Si el hijo existe y es nodo interno → seguir bajando
     */
    _insertChar(char) {
        const pos = this.charToPos(char);
        if (pos === 0) return false;
        const key  = char.trim().toUpperCase();
        if (this.insertedChars.some(c => c.char === key)) return false;

        const bits = this.posToBits(pos);
        this.insertedChars.push({ char: key, pos, bits });
        this._insertNode(this.root, key, bits, 0);
        return true;
    }

    _insertNode(node, char, bits, depth) {
        if (depth >= this.bitLength) return; // seguridad

        const bit = bits[depth];

        if (bit === 0) {
            if (!node.left) {
                // Espacio libre → insertar hoja aquí
                node.left         = new TriesNode();
                node.left.isLeaf  = true;
                node.left.char    = char;
            } else if (node.left.isLeaf) {
                // Colisión con otra hoja → convertir en nodo interno y bajar ambos
                const existing     = node.left;
                const existingBits = this.posToBits(this.charToPos(existing.char));

                node.left         = new TriesNode(); // nuevo nodo interno
                // Re-insertar el que ya estaba
                this._insertNode(node.left, existing.char, existingBits, depth + 1);
                // Insertar el nuevo
                this._insertNode(node.left, char, bits, depth + 1);
            } else {
                // Nodo interno → seguir bajando
                this._insertNode(node.left, char, bits, depth + 1);
            }
        } else {
            if (!node.right) {
                node.right         = new TriesNode();
                node.right.isLeaf  = true;
                node.right.char    = char;
            } else if (node.right.isLeaf) {
                const existing     = node.right;
                const existingBits = this.posToBits(this.charToPos(existing.char));

                node.right         = new TriesNode();
                this._insertNode(node.right, existing.char, existingBits, depth + 1);
                this._insertNode(node.right, char, bits, depth + 1);
            } else {
                this._insertNode(node.right, char, bits, depth + 1);
            }
        }
    }

    insertWord(word) {
        if (!word || typeof word !== 'string') return false;
        const w = word.trim().toUpperCase();
        if (!w.length) return false;
        for (const char of w) this._insertChar(char);
        this.words.push(w);
        return true;
    }

    /**
     * Elimina un carácter reconstruyendo el árbol desde cero.
     */
    deleteChar(char) {
        const key = char.trim().toUpperCase();
        if (!this.insertedChars.some(c => c.char === key)) return false;

        const remaining = this.insertedChars
            .filter(c => c.char !== key)
            .map(c => c.char);

        this.root          = new TriesNode();
        this.insertedChars = [];
        this.words         = [];

        for (const ch of remaining) this._insertChar(ch);
        return true;
    }

    /**
     * Busca un carácter y retorna el path recorrido.
     */
    search(char) {
        const pos = this.charToPos(char);
        if (pos === 0) return null;
        const bits = this.posToBits(pos);
        const path = [];
        let node   = this.root;

        path.push({ node, bit: null, depth: 0 });

        for (let i = 0; i < bits.length; i++) {
            const bit = bits[i];
            const next = bit === 0 ? node?.left : node?.right;
            path.push({ node: next, bit, depth: i + 1 });
            if (!next) break;
            // Si encontramos una hoja, terminar aquí
            if (next.isLeaf) break;
            node = next;
        }

        const last  = path[path.length - 1];
        const found = !!(last?.node?.isLeaf && last?.node?.char === char.trim().toUpperCase());
        return { char: char.toUpperCase(), pos, bits, path, found };
    }

    /**
     * Jerarquía para la Vista.
     */
    getHierarchy() {
        const convert = (node, edgeLabel = null) => {
            if (!node) return null;
            const children = [];
            if (node.left)  children.push(convert(node.left,  0));
            if (node.right) children.push(convert(node.right, 1));

            return {
                char:      node.char || '',
                isLeaf:    node.isLeaf,
                bitsStr:   node.isLeaf ? this.posToBits(this.charToPos(node.char)).join('') : '',
                edgeLabel: edgeLabel,
                children:  children.length ? children : null,
                _ref:      node
            };
        };
        return convert(this.root);
    }
}

window.TriesModel = TriesModel;