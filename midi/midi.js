export function getString(dataView, offset, length) {
	let str = "";
	for (let i = 0; i < length; i++) {
		const code = dataView.getUint8(offset + i);
		str += String.fromCharCode(code);
	}
	return str;
}

function assert(actual, expected){
	if(actual != expected){
		throw new Error(`Failed assertion: got ${actual}, expected ${expected}`);
	}
}

const statusMap = {
	0b1000 : "NOTE_OFF",
	0b1001 : "NOTE_ON",
	0b1010 : "POLYPHONIC_PRESSURE",
	0b1011: "CONTROLLER_CHANGE",
	0b1100 : "PROGRAM_CHANGE",
	0b0101 : "CHANNEL_PRESSURE",
	0b1110 : "PITCH_BEND",
	0b1111 : "SYSTEM_EXCLUSIVE"
};

export class MidiFile{
	constructor(arrayBuffer){
		this.arrayBuffer = arrayBuffer;
		this.dataView = new DataView(this.arrayBuffer);
		this.type = getString(this.dataView, 0, 4);
		assert(this.type, "MThd");
		this.headerSize = this.dataView.getUint32(4);
		assert(this.headerSize, 6);
		this.fileFormat = this.dataView.getUint16(8); //0 - single, 1 - multitrack, 2 - multitrack async
		this.trackCount = this.dataView.getUint16(10);
		this.ticksPerQuarterNote = this.dataView.getUint16(12);
		
		this.tracks = [];
		let i = 14;
		while(i < this.arrayBuffer.byteLength && i < 100){
			const track = {};
			track.type = getString(this.dataView, i, 4);
			i += 4;
			track.length = this.dataView.getUint32(i);
			i += 4;
			track.events = [];
			let j = 0;
			while(j < track.length){
				const byte =  this.dataView.getUint8(i+j);
				j += 1;

				if(byte >> 7 === 0){
					const event = {};
					event.status = byte >> 4;
					event.channel = byte & 0x0000000F;
					event.type = statusMap[event.status];
					
					switch(event.type){
						case "NOTE_ON":
							event.pitch = this.dataView.getUint8(i+j);
							j += 1;
							event.velocity = this.dataView.getUint8(i+j);
							j += 1;

							if(event.velocity === 0){
								event.type = "NOTE_OFF";
							}
							break;
						case "NOTE_OFF":
							event.pitch = this.dataView.getUint8(i + j);
							j += 1;
							event.velocity = this.dataView.getUint8(i + j);
							j += 1;
						case "POLYPHONIC_PRESSURE":
							event.pitch = this.dataView.getUint8(i + j);
							j += 1;
							event.velocity = this.dataView.getUint8(i + j);
							j += 1;
						case "PROGRAM_CHANGE":
							//off by one?
							event.instrument = this.dataView.getUint8(i + j);
							j += 1;
						case "CONTROLLER_CHANGE":
							event.controller = this.dataView.getUint8(i + j);
							j += 1;
							event.value = this.dataView.getUint8(i + j);
							j += 1;
						case "CHANNEL_PRESSURE":
							event.value = this.dataView.getUint8(i + j);
							j += 1;
						case "PITCH_BEND":
							event.pitchBend1 = this.dataView.getUint8(i + j);
							j += 1;
							event.pitchBend2 = this.dataView.getUint8(i + j);
							j += 1;
						default:
							event.type = "UNKNOWN"
					}

					track.events.push(event);
				} else if(byte === 0xff){
					console.log("RESET!");
				} else {
					throw "Unexpected status event";
				}
			}
			this.tracks.push(track);
			
			console.log("#", this.tracks);
		}
		
	}
}