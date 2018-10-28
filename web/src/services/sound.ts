import { Howler, Howl } from 'howler';

class Sound {
    public sounds: Map<string, Howl> = new Map();

    public addSound(name: string, isLoop: boolean = false, immediate: boolean = false, volume: number = 1) {
        console.log('Adding...', `/sounds/${name}.ogg`);
        const sound = new Howl({
            loop: isLoop,
            volume,
            preload: false,
            src: `/sounds/${name}.ogg`,
        });

        if (immediate) {
            const id = sound.play();
            sound.once('unlock', () => {
                sound.pause(id);
                sound.play();
            });
        }

        this.sounds.set(name, sound);
    }

    public setMute(isMuted: boolean) {
        Howler.mute(isMuted);
    }

    public play(name: string) {
        console.log('Playing', name);
        const sound = this.sounds.get(name)!;

        console.log(sound);
        if (sound) {
            sound.play();
        }
    }

    public async load() {
        return await Promise.all(Array.from(this.sounds.values()).map((sound: Howl) => {
             console.log('Loading', sound);
             const promise = new Promise((resolve) => sound.on('load', resolve));
             sound.load();
             return promise;
        }));
    }
}

export const sound = new Sound();