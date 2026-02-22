class ArrayModel {
    constructor() {
        this.array = [];
        this.maxSize = 100;
    }

    generate(source, sizeOrInput) {
        let newArray = [];
        if (source === 'random') {
            const size = Math.min(sizeOrInput, this.maxSize);
            const unique = new Set();
            while (unique.size < size) {
                unique.add(Math.floor(Math.random() * 100) + 1);
            }
            newArray = Array.from(unique);
        } else if (source === 'sorted') {
            const size = Math.min(sizeOrInput, this.maxSize);
            const unique = new Set();
            while (unique.size < size) {
                unique.add(Math.floor(Math.random() * 100) + 1);
            }
            newArray = Array.from(unique).sort((a, b) => a - b);
        } else if (source === 'manual') {
            const nums = sizeOrInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
            const unique = [...new Set(nums)];
            newArray = unique.slice(0, this.maxSize);
        }
        this.array = newArray;
        return this.array;
    }

    updateFromString(str) {
        const nums = str.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        const unique = [...new Set(nums)].slice(0, this.maxSize);
        this.array = unique;
        return this.array;
    }

    addValue(val) {
        if (this.array.includes(val)) return false;
        if (this.array.length >= this.maxSize) return false;
        this.array.push(val);
        return true;
    }

    removeValue(val) {
        const idx = this.array.indexOf(val);
        if (idx === -1) return false;
        this.array.splice(idx, 1);
        return true;
    }

    sort() {
        this.array.sort((a, b) => a - b);
    }

    getStats() {
        if (this.array.length === 0) {
            return { length: 0, min: '-', max: '-', sum: 0 };
        }
        return {
            length: this.array.length,
            min: Math.min(...this.array),
            max: Math.max(...this.array),
            sum: this.array.reduce((s, n) => s + n, 0)
        };
    }

    clear() {
        this.array = [];
    }

    getArray() {
        return this.array;
    }

    setArray(arr) {
        this.array = arr;
    }
}