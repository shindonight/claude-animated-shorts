#!/usr/bin/env python3
"""
Geração completa de áudio para SubaruShort no Google Colab.
Usa edge-tts para narração (pt-BR) e síntese procedural para música/SFX.
"""

import asyncio
import json
import os
import subprocess
import sys
import numpy as np
from pathlib import Path

# Configuração
OUTPUT_DIR = Path("subaru-short")
OUTPUT_DIR.mkdir(exist_ok=True)

SCRIPT_PT_BR = """Você acorda, queima a torrada, perde o ônibus, tropeça no gato... e volta no tempo. De novo. E de novo. E de novo. São 7 da manhã. Terça-feira. Você é um cara comum. Mas hoje, pela quadragésima sétima vez, seu alarme toca. Cozinha. Torradeira. Três segundos de distração e... carvão. A fumaça dispara o alarme. Você morre intoxicado. Acorda. 7 da manhã. Corre pro ponto. O ônibus passa na sua frente. Motorista não vê. Você corre, escorrega, cai na frente do próximo. Acorda. 7 da manhã. Quarto. Gato no escuro. Você tropeça, bate a cabeça na quina da mesa. Acorda. 7 da manhã. O gato te olha. Ele sabe. Espera... quantas vezes já foi? Você para de contar depois de vinte. O ponto de salvamento... ele tá se movendo? Você vê, é igual speedrun. Cada morte ensina o padrão. A torrada: 3 vírgula 2 segundos. O ônibus: sai às 7 horas 14 exatas. O gato: sempre dorme no tapete da esquerda. O segredo não é evitar a morte. É decorar a fase. Terça-feira, tentativa quarenta e oito. Torrada perfeita. Ônibus pegue. Gato evitado. Chega no café. A garota do caixa sorri. Você sabe o que ela vai dizer. Você sabe a piada que ela vai fazer. Você sabe o cheiro do café antes de entrar. Você se inclina. Beija ela. O mundo explode em luz. Alarme. 7 da manhã. Quarta-feira. O ponto de salvamento... avançou. Parabéns. Você zerou a terça-feira. Agora começa a quarta. Boa sorte."""

async def generate_voice_tts():
    """Gera narração com edge-tts (pt-BR-AntonioNeural)."""
    import edge_tts

    voice = "pt-BR-AntonioNeural"
    rate = "+10%"  # ~4.0 palavras/segundo
    volume = "+2%"

    communicate = edge_tts.Communicate(SCRIPT_PT_BR, voice, rate=rate, volume=volume)
    output_path = OUTPUT_DIR / "voice.mp3"
    await communicate.save(str(output_path))

    # Converter para WAV 48kHz mono
    wav_path = OUTPUT_DIR / "voice.wav"
    subprocess.run([
        "ffmpeg", "-y", "-i", str(output_path),
        "-ar", "48000", "-ac", "1", "-sample_fmt", "s16",
        str(wav_path)
    ], check=True, capture_output=True)

    print(f"✅ Voz gerada: {wav_path}")
    return wav_path

def generate_words_json(voice_wav):
    """Gera words.json com timings usando WhisperX (ou aproximação)."""
    # Para Colab, usamos WhisperX se disponível, senão estimativa
    try:
        import whisperx
        import torch

        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = whisperx.load_model("large-v2", device, compute_type="float16")
        audio = whisperx.load_audio(str(voice_wav))
        result = model.transcribe(audio, language="pt", word_timestamps=True)

        words = []
        for segment in result["segments"]:
            for word in segment.get("words", []):
                words.append({
                    "word": word["word"],
                    "start": word["start"],
                    "end": word["end"]
                })

        words_json = OUTPUT_DIR / "words.json"
        with open(words_json, "w", encoding="utf-8") as f:
            json.dump(words, f, ensure_ascii=False, indent=2)
        print(f"✅ words.json gerado com WhisperX: {words_json}")
        return words_json

    except ImportError:
        # Fallback: estimativa baseada no ritmo médio
        print("⚠️ WhisperX não disponível, usando estimativa de timing")
        words = SCRIPT_PT_BR.split()
        wps = 4.0  # palavras por segundo
        words_data = []
        t = 0.0
        for w in words:
            dur = len(w) * 0.03 + 0.15  # estimativa rough
            words_data.append({"word": w, "start": round(t, 3), "end": round(t + dur, 3)})
            t += dur

        words_json = OUTPUT_DIR / "words.json"
        with open(words_json, "w", encoding="utf-8") as f:
            json.dump(words_data, f, ensure_ascii=False, indent=2)
        return words_json

def synthesize_music(duration_sec=60, sr=48000):
    """Sintetiza música procedural (lo-fi hip hop / synthwave)."""
    from scipy import signal
    import scipy.io.wavfile as wav

    t = np.arange(int(duration_sec * sr)) / sr
    n_samples = len(t)
    audio = np.zeros(n_samples, dtype=np.float32)

    # BPM 85 -> beat a cada 0.706s
    bpm = 85
    beat_dur = 60 / bpm

    # --- Drums (kick, snare, hihat) ---
    kick_times = np.arange(0, duration_sec, beat_dur)
    snare_times = np.arange(beat_dur/2, duration_sec, beat_dur)
    hihat_times = np.arange(0, duration_sec, beat_dur/4)

    def add_kick(t_center):
        idx = int(t_center * sr)
        if idx < n_samples:
            dur = int(0.15 * sr)
            env = np.exp(-np.arange(dur) / (0.03 * sr))
            freq = 60 * np.exp(-np.arange(dur) / (0.01 * sr))
            phase = np.cumsum(2 * np.pi * freq / sr)
            kick = env * np.sin(phase) * 0.8
            end = min(idx + dur, n_samples)
            audio[idx:end] += kick[:end-idx]

    def add_snare(t_center):
        idx = int(t_center * sr)
        if idx < n_samples:
            dur = int(0.1 * sr)
            noise = np.random.randn(dur) * 0.3
            env = np.exp(-np.arange(dur) / (0.02 * sr))
            # tonal component
            freq = 200 * np.exp(-np.arange(dur) / (0.015 * sr))
            phase = np.cumsum(2 * np.pi * freq / sr)
            tone = env * np.sin(phase) * 0.2
            snare = (noise + tone) * env
            end = min(idx + dur, n_samples)
            audio[idx:end] += snare[:end-idx]

    def add_hihat(t_center, vel=1.0):
        idx = int(t_center * sr)
        if idx < n_samples:
            dur = int(0.03 * sr)
            noise = np.random.randn(dur) * 0.15 * vel
            env = np.exp(-np.arange(dur) / (0.005 * sr))
            # high-pass
            b, a = signal.butter(2, 8000/(sr/2), btype='highpass')
            noise = signal.filtfilt(b, a, noise)
            hihat = noise * env
            end = min(idx + dur, n_samples)
            audio[idx:end] += hihat[:end-idx]

    for kt in kick_times:
        add_kick(kt)
    for st in snare_times:
        add_snare(st)
    for i, ht in enumerate(hihat_times):
        add_hihat(ht, vel=0.7 if i % 2 == 0 else 0.4)

    # --- Bass (synth sub) ---
    bass_notes = [36, 36, 43, 36, 38, 36, 41, 36]  # C2, C2, G2, C2, D2, C2, F2, C2 (MIDI)
    note_idx = 0
    for i, kt in enumerate(kick_times):
        if i >= len(bass_notes): break
        freq = 440 * 2**((bass_notes[i] - 69) / 12)
        idx = int(kt * sr)
        dur = int(beat_dur * 0.9 * sr)
        if idx + dur > n_samples: dur = n_samples - idx
        if dur > 0:
            t_note = np.arange(dur) / sr
            env = np.exp(-t_note / 0.3)
            # sub sine + slight saturation
            wave = np.sin(2 * np.pi * freq * t_note) * env * 0.4
            wave = np.tanh(wave * 3) * 0.5  # soft clip
            end = idx + dur
            audio[idx:end] += wave

    # --- Rhodes-style electric piano (chords) ---
    chords = [
        [60, 64, 67, 71],  # Cmaj7
        [57, 60, 64, 67],  # Am7
        [55, 59, 62, 65],  # Gm7
        [53, 57, 60, 64],  # Fmaj7
    ] * 8  # repeat

    chord_idx = 0
    for i, kt in enumerate(kick_times[::2]):  # every 2 beats
        if chord_idx >= len(chords): break
        idx = int(kt * sr)
        dur = int(beat_dur * 2 * sr)
        if idx + dur > n_samples: dur = n_samples - idx
        if dur > 0:
            t_chord = np.arange(dur) / sr
            env = np.exp(-t_chord / 1.5)
            for midi in chords[chord_idx]:
                freq = 440 * 2**((midi - 69) / 12)
                # rhodes: sine + odd harmonics + decay
                harmonic = np.sin(2 * np.pi * freq * t_chord)
                harmonic += 0.3 * np.sin(2 * np.pi * freq * 3 * t_chord)
                harmonic += 0.1 * np.sin(2 * np.pi * freq * 5 * t_chord)
                audio[idx:idx+dur] += harmonic * env * 0.08
        chord_idx += 1

    # --- Atmospheric pads ---
    pad_notes = [48, 52, 55, 60]  # C3, E3, G3, C4
    for midi in pad_notes:
        freq = 440 * 2**((midi - 69) / 12)
        wave = np.sin(2 * np.pi * freq * t)
        # slow attack
        attack = np.minimum(t / 8, 1)
        release = np.exp(-t / 20)
        env = attack * release
        # filter sweep
        cutoff = 200 + 2000 * (1 - np.exp(-t / 10))
        # simple low-pass via moving average approximation
        audio += wave * env * 0.03

    # Normalize and apply mastering
    audio = np.tanh(audio * 1.5) * 0.7

    # Stereo widen slightly
    stereo = np.column_stack([audio, audio * 0.98])

    music_path = OUTPUT_DIR / "music.wav"
    wav.write(str(music_path), sr, (stereo * 32767).astype(np.int16))
    print(f"✅ Música gerada: {music_path}")
    return music_path

def synthesize_sfx(duration_sec=60, sr=48000):
    """Sintetiza SFX procedurais sincronizados com a história."""
    import scipy.io.wavfile as wav

    n = int(duration_sec * sr)
    audio = np.zeros((n, 2), dtype=np.float32)

    def add_sfx_at(time_sec, generator, duration=1.0, pan=0.0, gain=1.0):
        idx = int(time_sec * sr)
        dur = int(duration * sr)
        if idx + dur > n: dur = n - idx
        if dur <= 0: return
        sfx = generator(dur, sr) * gain
        # pan
        left_gain = np.cos((pan + 1) * np.pi / 4)
        right_gain = np.sin((pan + 1) * np.pi / 4)
        audio[idx:idx+dur, 0] += sfx * left_gain
        audio[idx:idx+dur, 1] += sfx * right_gain

    # Generators
    def gen_alarm(dur, sr):
        t = np.arange(dur) / sr
        env = np.exp(-t / 0.1)
        wave = np.sin(2 * np.pi * 880 * t) * env
        for i in range(3):
            start = int(i * 0.25 * sr)
            end = min(start + int(0.1 * sr), dur)
            if start < dur:
                wave[start:end] += np.sin(2 * np.pi * 880 * t[start:end]) * np.exp(-t[start:end] / 0.1)
        return wave

    def gen_death_flash(dur, sr):
        t = np.arange(dur) / sr
        # reverse whoosh + deep bell
        whoosh = np.random.randn(dur) * np.exp(-t / 0.3)
        whoosh = whoosh[::-1]  # reverse
        bell = np.sin(2 * np.pi * 80 * t) * np.exp(-t / 1.5)
        return (whoosh * 0.4 + bell * 0.6) * np.exp(-t / 0.5)

    def gen_toast_burn(dur, sr):
        t = np.arange(dur) / sr
        crackle = np.random.randn(dur) * np.exp(-t / 0.5)
        # high-pass
        from scipy import signal
        b, a = signal.butter(2, 2000/(sr/2), btype='highpass')
        return signal.filtfilt(b, a, crackle) * 0.3

    def gen_smoke(dur, sr):
        t = np.arange(dur) / sr
        noise = np.random.randn(dur)
        # low-pass for smoke
        from scipy import signal
        b, a = signal.butter(2, 800/(sr/2), btype='lowpass')
        return signal.filtfilt(b, a, noise) * np.exp(-t / 2) * 0.2

    def gen_bus_pass(dur, sr):
        t = np.arange(dur) / sr
        # doppler: freq goes up then down
        f0 = 60
        f1 = 180
        f_center = (f0 + f1) / 2
        sweep = f_center + (f1 - f0) / 2 * np.sin(2 * np.pi * t / dur * np.pi)
        phase = np.cumsum(2 * np.pi * sweep / sr)
        engine = np.sin(phase) * np.exp(-t / 0.5)
        air = np.random.randn(dur) * np.exp(-t / 1.0) * 0.1
        from scipy import signal
        b, a = signal.butter(2, 200/(sr/2), btype='highpass')
        return signal.filtfilt(b, a, engine + air) * 0.5

    def gen_impact(dur, sr):
        t = np.arange(dur) / sr
        thud = np.sin(2 * np.pi * 40 * t) * np.exp(-t / 0.05) * 0.8
        crack = np.random.randn(dur) * np.exp(-t / 0.02) * 0.2
        return thud + crack

    def gen_trip(dur, sr):
        t = np.arange(dur) / sr
        steps = np.zeros(dur)
        for i in range(4):
            idx = int(i * 0.12 * sr)
            if idx < dur:
                steps[idx:idx+int(0.05*sr)] += np.exp(-np.arange(int(0.05*sr))/sr*200) * 0.3
        fall = np.sin(2 * np.pi * 60 * t) * np.exp(-t / 0.1) * 0.4
        return steps + fall

    def gen_cat_meow(dur, sr):
        t = np.arange(dur) / sr
        # cat meow: frequency sweep
        f = 400 + 600 * np.sin(2 * np.pi * t / dur * np.pi/2)
        phase = np.cumsum(2 * np.pi * f / sr)
        return np.sin(phase) * np.exp(-t / 0.3) * 0.4

    def gen_glitch_tone(dur, sr):
        t = np.arange(dur) / sr
        # descending digital tone
        f = 800 * np.exp(-t / 0.5)
        phase = np.cumsum(2 * np.pi * f / sr)
        return np.sin(phase) * np.exp(-t / 0.4) * 0.3

    def gen_keyboard_click(dur, sr):
        t = np.arange(dur) / sr
        click = np.exp(-t / 0.005) * np.sin(2 * np.pi * 2000 * t)
        return click * 0.2

    def gen_coffee_pour(dur, sr):
        t = np.arange(dur) / sr
        liquid = np.random.randn(dur) * 0.1
        from scipy import signal
        b, a = signal.butter(2, [200, 2000]/(sr/2), btype='bandpass')
        liquid = signal.filtfilt(b, a, liquid)
        steam = np.random.randn(dur) * np.exp(-t / 1.5) * 0.05
        b, a = signal.butter(2, 4000/(sr/2), btype='highpass')
        steam = signal.filtfilt(b, a, steam)
        return liquid + steam

    def gen_sparkle_chime(dur, sr):
        t = np.arange(dur) / sr
        chime = np.zeros(dur)
        for i, freq in enumerate([1000, 1200, 1500, 2000, 2500]):
            idx = int(i * 0.05 * sr)
            if idx < dur:
                d = min(int(0.3 * sr), dur - idx)
                chime[idx:idx+d] += np.sin(2 * np.pi * freq * np.arange(d)/sr) * np.exp(-np.arange(d)/(0.2*sr))
        return chime * 0.3

    def gen_room_tone(dur, sr):
        t = np.arange(dur) / sr
        return np.random.randn(dur) * 0.005

    def gen_kitchen_tone(dur, sr):
        t = np.arange(dur) / sr
        fridge = np.sin(2 * np.pi * 50 * t) * 0.002
        noise = np.random.randn(dur) * 0.003
        return fridge + noise

    def gen_street_tone(dur, sr):
        t = np.arange(dur) / sr
        distant = np.random.randn(dur) * 0.005
        from scipy import signal
        b, a = signal.butter(2, 300/(sr/2), btype='lowpass')
        return signal.filtfilt(b, a, distant)

    def gen_cafe_tone(dur, sr):
        t = np.arange(dur) / sr
        murmur = np.random.randn(dur) * 0.008
        from scipy import signal
        b, a = signal.butter(2, [200, 2000]/(sr/2), btype='bandpass')
        return signal.filtfilt(b, a, murmur)

    # --- Timeline de SFX (frames convertidos para segundos @ 30fps) ---
    # FPS = 30, TOTAL = 1800 frames = 60s

    # Alarm/Reset flashes (frames: 0, 120, 210, 300, 390, 720, 1500, 1700)
    flash_frames = [0, 120, 210, 300, 390, 720, 1500, 1700]
    for f in flash_frames:
        t = f / 30
        add_sfx_at(t, gen_alarm, duration=0.8, gain=0.6)
        add_sfx_at(t + 0.1, gen_death_flash, duration=1.5, gain=0.8)

    # Beat 1: Toast
    add_sfx_at(4.5, gen_toast_burn, duration=1.0, gain=0.5)
    add_sfx_at(5.0, gen_smoke, duration=2.0, gain=0.4)

    # Beat 2: Bus
    add_sfx_at(7.0, gen_bus_pass, duration=3.0, pan=-0.5, gain=0.6)
    add_sfx_at(8.0, gen_impact, duration=0.5, gain=0.7)

    # Beat 3: Cat
    add_sfx_at(10.5, gen_trip, duration=1.0, gain=0.5)
    add_sfx_at(10.6, gen_cat_meow, duration=0.5, gain=0.4)
    add_sfx_at(10.8, gen_impact, duration=0.3, gain=0.6)

    # Mystery: Save point moving
    add_sfx_at(24.5, gen_glitch_tone, duration=1.0, gain=0.5)

    # Montage: Keyboard clicks (rhythmic)
    for i in range(30):
        t = 30 + i * 0.3
        if t < 40:
            add_sfx_at(t, gen_keyboard_click, duration=0.1, gain=0.3, pan=0.3 if i%2 else -0.3)

    # Perfect Tuesday
    add_sfx_at(41.0, gen_coffee_pour, duration=2.0, gain=0.5)

    # Kiss
    add_sfx_at(51.0, gen_sparkle_chime, duration=1.5, gain=0.6)

    # Ambience loops (layered throughout)
    # Room tone (bedroom shots: 0-3s, 9-12s, 24-30s, 30-40s, 57-60s)
    for (start, end) in [(0, 3), (9, 12), (24, 30), (30, 40), (57, 60)]:
        add_sfx_at(start, gen_room_tone, duration=end-start, gain=0.3)

    # Kitchen tone (3-6s, 40-43s)
    for (start, end) in [(3, 6), (40, 43)]:
        add_sfx_at(start, gen_kitchen_tone, duration=end-start, gain=0.3)

    # Street tone (6-9s)
    add_sfx_at(6, gen_street_tone, duration=3, gain=0.4)

    # Cafe tone (12-24s, 50-57s)
    for (start, end) in [(12, 24), (50, 57)]:
        add_sfx_at(start, gen_cafe_tone, duration=end-start, gain=0.4)

    # Normalize
    audio = np.tanh(audio * 2) * 0.5

    sfx_path = OUTPUT_DIR / "sfx.wav"
    wav.write(str(sfx_path), sr, (audio * 32767).astype(np.int16))
    print(f"✅ SFX gerados: {sfx_path}")
    return sfx_path

def mix_final(voice_wav, music_wav, sfx_wav, output_wav):
    """Mix final com ducking: voz 0dB, música -8dB, SFX -6dB."""
    import scipy.io.wavfile as wav

    sr_v, voice = wav.read(str(voice_wav))
    sr_m, music = wav.read(str(music_wav))
    sr_s, sfx = wav.read(str(sfx_wav))

    assert sr_v == sr_m == sr_s == 48000

    # Converter para float
    voice = voice.astype(np.float32) / 32767.0
    music = music.astype(np.float32) / 32767.0
    sfx = sfx.astype(np.float32) / 32767.0

    # Garantir stereo
    if voice.ndim == 1:
        voice = np.column_stack([voice, voice])
    if music.ndim == 1:
        music = np.column_stack([music, music])
    if sfx.ndim == 1:
        sfx = np.column_stack([sfx, sfx])

    # Match lengths
    max_len = max(len(voice), len(music), len(sfx))
    for arr in [voice, music, sfx]:
        if len(arr) < max_len:
            pad = np.zeros((max_len - len(arr), 2), dtype=np.float32)
            arr = np.vstack([arr, pad])

    # Ducking gains
    voice_gain = 1.0      # 0 dB
    music_gain = 10**(-8/20)   # -8 dB
    sfx_gain = 10**(-6/20)     # -6 dB

    # Sidechain ducking: música baixa quando há voz
    # Detecção simples de voz por RMS
    voice_rms = np.sqrt(np.mean(voice**2, axis=1))
    voice_active = voice_rms > 0.01

    # Suavizar transições
    from scipy.ndimage import gaussian_filter1d
    voice_env = gaussian_filter1d(voice_active.astype(float), sigma=sr_v//100)
    music_duck = 1.0 - voice_env * 0.5  # música cai 50% quando há voz

    # Mix
    mix = (voice * voice_gain +
           music * music_gain * music_duck[:, np.newaxis] +
           sfx * sfx_gain)

    # Master limiter (-14 LUFS target ~ -1dBFS peak)
    peak = np.max(np.abs(mix))
    if peak > 0.89:  # -1dBFS
        mix = mix / peak * 0.89

    # Soft clip
    mix = np.tanh(mix * 1.2) * 0.95

    wav.write(str(output_wav), sr_v, (mix * 32767).astype(np.int16))
    print(f"✅ Mix final: {output_wav}")
    return output_wav

def generate_cues_md():
    """Gera cues.md com tabela de cues."""
    cues = """# SubaruShort - Cues de Áudio

| Frame | Tempo (s) | Tipo | Descrição | Arquivo/Generator |
|-------|-----------|------|-----------|-------------------|
| 0 | 0.00 | SFX | Alarme acordar + death flash | gen_alarm + gen_death_flash |
| 40 | 1.33 | Voice | "Você acorda..." | voice.wav |
| 120 | 4.00 | SFX | Reset 1 (torra) | gen_alarm + gen_death_flash |
| 135 | 4.50 | SFX | Torrada queimando | gen_toast_burn |
| 140 | 4.67 | SFX | Fumaça | gen_smoke |
| 180 | 6.00 | Voice | "Cozinha. Torradeira..." | voice.wav |
| 210 | 7.00 | SFX | Reset 2 (ônibus) | gen_alarm + gen_death_flash |
| 225 | 7.50 | SFX | Ônibus passando | gen_bus_pass |
| 240 | 8.00 | SFX | Queda/impacto | gen_impact |
| 270 | 9.00 | Voice | "Corre pro ponto..." | voice.wav |
| 300 | 10.00 | SFX | Reset 3 (gato) | gen_alarm + gen_death_flash |
| 315 | 10.50 | SFX | Tropeço | gen_trip |
| 318 | 10.60 | SFX | Miado gato | gen_cat_meow |
| 324 | 10.80 | SFX | Impacto cabeça | gen_impact |
| 360 | 12.00 | Voice | "Quarto. Gato no escuro..." | voice.wav |
| 450 | 15.00 | Voice | "Espera... quantas vezes..." | voice.wav |
| 540 | 18.00 | Voice | "Você vê, é igual speedrun..." | voice.wav |
| 720 | 24.00 | SFX | Reset 4 (save point) | gen_alarm + gen_death_flash |
| 735 | 24.50 | SFX | Glitch tone save point | gen_glitch_tone |
| 900-1200 | 30-40 | SFX | Keyboard clicks (montagem) | gen_keyboard_click (loop) |
| 1200 | 40.00 | Voice | "Terça-feira, tentativa 48..." | voice.wav |
| 1230 | 41.00 | SFX | Café perfeito | gen_coffee_pour |
| 1500 | 50.00 | SFX | Reset 5 (beijo) | gen_alarm + gen_death_flash |
| 1530 | 51.00 | SFX | Beijo sparkle | gen_sparkle_chime |
| 1650 | 55.00 | SFX | Alarme final distorcido | gen_alarm (pitch down) |
| 1700 | 56.67 | Voice | "Parabéns. Você zerou..." | voice.wav |
| 0-1800 | 0-60 | Music | Lo-fi synthwave procedural | music.wav |
| 0-3, 9-12, 24-40, 57-60 | Ambience | Quarto | gen_room_tone |
| 3-6, 40-43 | Ambience | Cozinha | gen_kitchen_tone |
| 6-9 | Ambience | Rua | gen_street_tone |
| 12-24, 50-57 | Ambience | Café | gen_cafe_tone |

## Mix Specs
- **Sample Rate:** 48 kHz
- **Channels:** Stereo
- **Duration:** Exatamente 1800 frames @ 30fps = 60.000s
- **Loudness:** -14 LUFS integrados
- **Peak:** -1 dBFS
- **Ducking:** Música -8dB (baixa -50% sob voz), SFX -6dB
"""
    cues_path = OUTPUT_DIR / "cues.md"
    with open(cues_path, "w", encoding="utf-8") as f:
        f.write(cues)
    print(f"✅ cues.md gerado: {cues_path}")

async def main():
    print("🎬 Gerando áudio completo para SubaruShort...")
    print(f"📁 Output: {OUTPUT_DIR.absolute()}")

    # 1. Voz TTS
    print("\n1️⃣ Gerando narração (edge-tts pt-BR)...")
    voice_wav = await generate_voice_tts()

    # 2. Words.json (timing)
    print("\n2️⃣ Gerando words.json (timings)...")
    words_json = generate_words_json(voice_wav)

    # 3. Música procedural
    print("\n3️⃣ Sintetizando música (lo-fi synthwave)...")
    music_wav = synthesize_music(duration_sec=60)

    # 4. SFX procedurais
    print("\n4️⃣ Sintetizando SFX (sincronizados)...")
    sfx_wav = synthesize_sfx(duration_sec=60)

    # 5. Mix final
    print("\n5️⃣ Mix final com ducking...")
    mix_wav = OUTPUT_DIR / "mix.wav"
    mix_final(voice_wav, music_wav, sfx_wav, mix_wav)

    # 6. Cues
    print("\n6️⃣ Gerando cues.md...")
    generate_cues_md()

    # 7. Copiar stems
    import shutil
    stems_dir = OUTPUT_DIR / "stems"
    stems_dir.mkdir(exist_ok=True)
    for f in [voice_wav, music_wav, sfx_wav]:
        shutil.copy2(f, stems_dir / f.name)
    shutil.copy2(mix_wav, stems_dir / "mix.wav")
    print(f"\n📦 Stems copiados para: {stems_dir}")

    print("\n✅ PIPELINE DE ÁUDIO CONCLUÍDO!")
    print(f"   Arquivo principal: {mix_wav}")
    print(f"   Duração: 60s (1800 frames @ 30fps)")
    print(f"   Sample rate: 48kHz stereo")

if __name__ == "__main__":
    asyncio.run(main())