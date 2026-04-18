const defaults = {
	onCreate: async function(){},
	onUpdate: (_, s) => s,
	onRender: function () { }
};

export class Engine {
    #isRunning = false;
    #animationFrameRequest;

	constructor(options = {}){
		this.options = { ...defaults, ...options };
		this.bind(this);
		this.init();
	}

    bind(){
	    this.init = this.init.bind(this);
	    this.tick = this.tick.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }

	init(){
		this.options.onCreate()
			.then(this.startEngine);
	}

	tick(timeMs){
		this.state = this.options.onUpdate(timeMs, this.state);
		this.options.onRender(timeMs, this.state);
		this.#animationFrameRequest = requestAnimationFrame(this.tick);
	}

    start(initialState){
        this.stop();
        this.#isRunning = true;
		this.state = initialState ?? this.state;
		this.#animationFrameRequest = requestAnimationFrame(this.tick);
	}
    stop(){
        this.#isRunning = false;
        cancelAnimationFrame(this.#animationFrameRequest);   
    }

    get isRunning(){
        return this.#isRunning;
    }

}
