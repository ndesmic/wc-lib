//https://en.wikiversity.org/wiki/Reed%E2%80%93Solomon_codes_for_coders
export class GaloisField {
	constructor(length = 256, prime = 285) {
		this.length = length;
		this.prime = prime;
		this.buildTables();
	}
	buildTables() {
		this.expTable = new Array(this.length).fill(0);
		this.logTable = new Array(this.length);
		let x = 1;
		for (let i = 0; i < this.length - 1; i++) {
			this.expTable[i] = x;
			this.logTable[x] = i;
			x = this._mul(x, 2);
		}
		this.expTable[this.length - 1] = 1;
	}
	add(x, y) {
		return x ^ y;
	}
	sub(x, y) {
		return x ^ y;
	}
	//More efficent "Russian Peasant" multiplication
	_mul(x, y, carryless = true) {
		let result = 0;
		let currentY = y;
		let currentX = x;
		while (currentY > 0) {
			if ((currentY & 1) !== 0) { //odd
				result = carryless ? result ^ currentX : result + currentX;
			}
			currentY = currentY >> 1; //divide by 2
			currentX = currentX << 1; //x * 2
			if (this.prime > 0 && ((currentX & this.length) > 0)) { //if > length
				currentX = currentX ^ this.prime; //modulo
			}
		}
		return result;
	}
	mul(x, y) {
		if (x === 0 || y === 0) return 0;
		return this.expTable[(this.logTable[x] + this.logTable[y]) % (this.length - 1)];
	}
	div(x, y) {
		if (y === 0) throw `Tried to divide by zero`;
		if (x === 0) return 0;
		return this.expTable[((this.logTable[x] + this.length) - this.logTable[y]) % this.length];
	}
	pow(x, p) {
		return this.expTable[(this.logTable[x] * p) % this.length];
	}
	polyMul(x, y) {
		const result = new Array(x.length + y.length - 1).fill(0);
		for (let j = 0; j < y.length; j++) {
			for (let i = 0; i < x.length; i++) {
				result[i + j] = this.add(result[i + j], this.mul(x[i], y[j]));
			}
		}
		return result;
	}
	//https://en.wikipedia.org/wiki/Synthetic_division#Expanded_synthetic_division
	//dividend / divisor
	polyDiv(dividend, divisor) { 
		let out = [...dividend];
		//const normalizer = y[0];
		for (let i = 0; i < dividend.length - (divisor.length - 1); i++) {
			//out[i] = this.div(out[i], normalizer);
			const coef = out[i];
			if (coef !== 0) {
				for (let j = 1; j < divisor.length; j++) {
					if (divisor[j] === 0) continue;
					out[i + j] = this.add(out[i + j], this.mul(divisor[j], coef));
				}
			}
		}
		const separator = 1 - divisor.length;
		return [out.slice(0, separator), out.slice(separator)];
	}
	//coefficents are full decimal, not exponents
	getGeneratorPoly(count) {
		let g = [1];
		for (let i = 0; i < count; i++) {
			g = this.polyMul(g, [1, this.pow(2, i)]);
		}
		return g;
	}
}