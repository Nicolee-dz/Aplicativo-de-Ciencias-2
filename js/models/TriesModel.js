/**
 * Modelo TRIES (mismo que Árbol Digital)
 * - Acepta palabras (string)
 * - Convierte cada carácter a posición en alfabeto (A=1..Z=26)
 * - Convierte posición a 5 bits
 * - Construye un trie binario basado esos bits
 */
class TriesNode {
    constructor() {
        this.left = null;  // bit 0
        this.right = null; // bit 1
        this.char = null;  // carácter almacenado en esta hoja
        this.isLeaf = false;
    }
}

class TriesModel {
    constructor() {
        this.root = new TriesNode();
        this.bitLength = 5; // suficiente para A-Z (1-26)
        this.words = []; // palabras insertadas (para ref)
        this.insertedChars = []; // caracteres únicos insertados con su info
    }

    reset() {
        this.root = new TriesNode();
        this.words = [];
        this.insertedChars = [];
    }

    /**
     * Convierte un carácter a su posición en el alfabeto
     * A/a -> 1, B/b -> 2 ... Z/z -> 26
     */
    charToPos(ch) {
        if (!ch || typeof ch !== 'string') return 0;
        const c = ch.trim().toUpperCase();
        if (c.length === 0) return 0;
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) {
            return code - 64; // A(65) - 64 = 1
        }
        return 0;
    }

    /**
     * Convierte posición a carácter (1->A, 2->B, ..., 26->Z)
     */
    posToChar(pos) {
        if (!pos || isNaN(pos) || pos <= 0) return '?';
        const p = Math.min(26, Math.max(1, Math.round(pos)));
        return String.fromCharCode(64 + p); // 64+1=65=A
    }

    /**
     * Convierte posición a array de 5 bits (MSB a LSB)
     */
    posToBits(pos) {
        const bits = [];
        for (let i = this.bitLength - 1; i >= 0; i--) {
            bits.push((pos >> i) & 1);
        }
        return bits;
    }

    /**
     * Inserta una palabra en el árbol
     * Cada carácter se convierte a posición y luego a bits
     */
    insertWord(word) {
        if (!word || typeof word !== 'string') return false;
        const w = word.trim().toUpperCase();
        if (w.length === 0) return false;

        // Recorrer cada carácter de la palabra
        for (const char of w) {
            const pos = this.charToPos(char);
            if (pos === 0) continue; // ignorar caracteres inválidos
            const bits = this.posToBits(pos);
            let node = this.root;
            // Navegar por el árbol siguiendo los bits
            for (const bit of bits) {
                if (bit === 0) {
                    if (!node.left) node.left = new TriesNode();
                    node = node.left;
                } else {
                    if (!node.right) node.right = new TriesNode();
                    node = node.right;
                }
            }
            // Marcar como hoja con el carácter
            node.isLeaf = true;
            node.char = char;

            // Registrar carácter único (si no existe ya)
            if (!this.insertedChars.some(c => c.char === char)) {
                this.insertedChars.push({ char, pos, bits });
            }
        }
        this.words.push(w);
        return true;
    }

    /**
     * Busca un carácter y retorna la ruta (path) con info de cada paso
     */
    search(char) {
        const pos = this.charToPos(char);
        if (pos === 0) return null;
        const bits = this.posToBits(pos);
        const path = [];
        let node = this.root;
        path.push({ node, bit: null, depth: 0, char: null });

        for (let i = 0; i < bits.length; i++) {
            const bit = bits[i];
            node = bit === 0 ? node?.left : node?.right;
            path.push({ node, bit, depth: i + 1, char: node?.char || null });
            if (!node) break;
        }
        return { char, pos, bits, path, found: path[path.length - 1]?.node?.isLeaf || false };
    }

    /**
     * Retorna la estructura jerárquica del árbol para D3
     */
    getHierarchy() {
        const convert = (node, depth = 0) => {
            if (!node) return null;
            const children = [];
            if (node.left) children.push(convert(node.left, depth + 1));
            if (node.right) children.push(convert(node.right, depth + 1));
            
            // Si es nodo hoja con carácter, calcular bits
            let bits = null;
            if (node.isLeaf && node.char) {
                const pos = this.charToPos(node.char);
                bits = this.posToBits(pos).join('');
            }
            
            return {
                char: node.char || '',
                isLeaf: node.isLeaf,
                bits: bits,
                children: children.length ? children : null,
                _ref: node
            };
        };
        return convert(this.root);
    }
}

window.TriesModel = TriesModel;
