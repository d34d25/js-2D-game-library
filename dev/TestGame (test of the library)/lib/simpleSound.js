class SoundPlayer 
{
    constructor(url,volume = 1) 
    {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = volume;
        this.gainNode.connect(this.audioContext.destination);
        this.currentSource;
        this.url = url;
        this.isPlaying = false;

        this._unlocked = false;
        this._unlockOnGesture(); // Set up auto-unlock
    }

    get volume()
    {
        if (this.gainNode) 
        {
            return this.gainNode.gain.value;
        }
    }

    _unlockOnGesture() {
        const resume = async () => {
            if (this.audioContext.state === "suspended") {
                await this.audioContext.resume();
                this._unlocked = true;
                window.removeEventListener("click", resume);
                window.removeEventListener("keydown", resume);
            }
        };
        window.addEventListener("click", resume);
        window.addEventListener("keydown", resume);
    }

    async resumeAudioContext() 
    {
        if (this.audioContext.state === 'suspended') 
        {
            await this.audioContext.resume();
            console.log('AudioContext resumed');
        }
    }

    async load() 
    {
        const response = await fetch(this.url);
        const arrayBuffer = await response.arrayBuffer();
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    }


    async play(options = {}) 
    {
        await this.resumeAudioContext();

        if (!this.audioBuffer) 
        {
            console.warn('Audio not loaded. Call load() before play().');
            return;
        }

        if (this.isPlaying) return;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = this.audioBuffer;
        source.loop = options.loop ?? false;

        source.connect(this.gainNode);
        source.start(0);

        this.currentSource = source;
        this.isPlaying = true;

        source.onended = () => {
            this.isPlaying = false;
            this.currentSource = null;
        };

        return source;
    }

    stop() 
    {
        if (this.currentSource) 
        {
            this.currentSource.stop();
            this.currentSource = null;
            this.isPlaying = false;
        }
    }

    async resume() 
    {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }


    setVolume(value) 
    {
        if(!this.isPlaying) return;

        value = Math.min(Math.max(value, 0), 1);
        if (this.gainNode) 
        {
            this.gainNode.gain.value = value;
            if (this.gainNode.gain.value < 0) this.gainNode.gain.value = 0;
            if (this.gainNode.gain.value > 1) this.gainNode.gain.value = 1;
        }
        
    }

    fadeVolume(value) 
    {
        if(!this.isPlaying) return;

        if (this.gainNode) 
        {
            this.gainNode.gain.value += value;
            if (this.gainNode.gain.value <= 0) this.gainNode.gain.value = 0;
            if (this.gainNode.gain.value >= 1) this.gainNode.gain.value = 1;
        }

    }

}

export { SoundPlayer };
//# sourceMappingURL=index.js.map
