
import moveselfSound from '../..//assets/sounds/move-self.mp3'
import captureSound from '../../assets/sounds/capture.mp3';

async function playSound(sound: string) {
    try {
        let audio = new Audio(sound);
        await audio.play();
    } catch (err) {
        console.error('error playing sound : ', err)
    }
}

export async function playMoveSelf() {
    await playSound(moveselfSound);
}

export async function playCaptureSound() {
    await playSound(captureSound);
}
