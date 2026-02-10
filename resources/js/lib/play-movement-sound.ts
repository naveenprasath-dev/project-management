/**
 * Plays a catchy "pop" or "click" sound when a task is moved to a new status.
 * Uses Web Audio API to synthesize the sound on the fly.
 */
export const playMovementSound = () => {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        const ctx = new AudioContextClass();

        // High-pitched "click" pulse
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc1.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // A4

        gain1.gain.setValueAtTime(0.1, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);

        osc1.start();
        osc1.stop(ctx.currentTime + 0.1);

        // Subtler "thump" for the landing
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(150, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);

        gain2.gain.setValueAtTime(0.15, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);

        osc2.start();
        osc2.stop(ctx.currentTime + 0.15);
    } catch (e) {
        console.warn('Audio feedback failed', e);
    }
};
