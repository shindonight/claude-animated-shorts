# Subaru Short Script - "E se você tivesse o poder do Subaru na vida real"

**Duração alvo:** 55-70 segundos (~1800 frames @ 30fps = 60s)
**Ritmo:** 3.7 palavras/segundo (estilo STYLE_BIBLE)
**Idioma:** Português do Brasil

---

## ROTEIRO COMPLETO

### HOOK (Frame 0-90 | 0-3s)
"Você acorda, queima a torrada, perde o ônibus, tropeça no gato... e volta no tempo. De novo. E de novo. E de novo."

### SETTING (Frame 90-180 | 3-6s)
"São 7 da manhã. Terça-feira. Você é um cara comum. Mas hoje, pela quadragésima sétima vez, seu alarme toca."

### ESCALAÇÃO - BEAT 1: TORRADA (Frame 180-270 | 6-9s)
"Cozinha. Torradeira. Três segundos de distração e... carvão. A fumaça dispara o alarme. Você morre intoxicado. Acorda. 7 da manhã."

### ESCALAÇÃO - BEAT 2: ÔNIBUS (Frame 270-360 | 9-12s)
"Corre pra ponto. O ônibus passa na sua frente. Motorista não vê. Você corre, escorrega, cai na frente do próximo. Acorda. 7 da manhã."

### ESCALAÇÃO - BEAT 3: GATO (Frame 360-450 | 12-15s)
"Quarto. Gato no escuro. Você tropeça, bate a cabeça na quina da mesa. Acorda. 7 da manhã. O gato te olha. Ele sabe."

### MISTÉRIO (Frame 450-540 | 15-18s)
"Espera... quantas vezes já foi? Você para de contar depois de vinte. O ponto de salvamento... ele tá se movendo?"

### PIVÔ - "Você vê," (Frame 540-720 | 18-24s)
"Você vê, é igual speedrun. Cada morte ensina o padrão. A torrada: 3.2 segundos. O ônibus: sai às 7:14 exatas. O gato: sempre dorme no tapete da esquerda. O segredo não é evitar a morte. É decorar a fase."

### MONTAGEM DE APRENDIZADO (Frame 720-1200 | 24-40s)
"Terça-feira, tentativa quarenta e oito. Torrada perfeita. Ônibus pegue. Gato evitado. Chega no café. A garota do caixa sorri. Você sabe o que ela vai dizer. Você sabe a piada que ela vai fazer. Você sabe o cheiro do café antes de entrar."

### PAYOFF IRÔNICO (Frame 1200-1500 | 40-50s)
"Você se inclina. Beija ela. O mundo explode em luz. Alarme. 7 da manhã. Quarta-feira. O ponto de salvamento... avançou."

### TWIST FINAL (Frame 1500-1800 | 50-60s)
"Parabéns. Você zerou a terça-feira. Agora começa a quarta. Boa sorte."

---

## CONTAGEM DE PALAVRAS E TEMPO ESTIMADO

| Seção | Palavras | Tempo @ 3.7 w/s |
|-------|----------|-----------------|
| Hook | 32 | 8.6s |
| Setting | 22 | 5.9s |
| Beat 1 | 34 | 9.2s |
| Beat 2 | 35 | 9.5s |
| Beat 3 | 30 | 8.1s |
| Mistério | 22 | 5.9s |
| Pivô | 68 | 18.4s |
| Montagem | 62 | 16.8s |
| Payoff | 32 | 8.6s |
| Twist | 18 | 4.9s |
| **TOTAL** | **355** | **~96s** |

**NOTA:** O roteiro está ~30s acima do alvo. Na gravação, acelerar para ~4.0 w/s ou cortar ~100 palavras. O pipeline de áudio vai ajustar automaticamente.

---

## INSTRUÇÕES DE ÁUDIO

### Voz (TTS - edge-tts pt-BR)
- **Voz:** `pt-BR-AntonioNeural` (masculino, natural, bom ritmo)
- **Taxa:** +10% (para ~4.0 w/s)
- **Volume:** +2dB
- **Arquivo:** `voice.wav` (48kHz, mono)

### Trilha Sonora (Síntese procedural - templates/audio/music.py)
- **Estilo:** Lo-fi hip hop / synthwave leve
- **BPM:** 85 (meio-tempo, "chill")
- **Instrumentos:** Piano elétrico (Rhodes), baixo sintetizado, bateria leve, pads atmosféricos
- **Estrutura:**
  - Intro (0-3s): Apenas pads + heartbeat sutil
  - Verses (3-18s): Piano + baixo, bateria entra no beat 2
  - Pivô (18-24s): Harmonia muda para maior, "revelação"
  - Montagem (24-40s): Energia sobe, arpejos de synth
  - Payoff (40-50s): Climax emocional, melodia principal
  - Twist (50-60s): Volta ao tema inicial, fade out

### Efeitos Sonoros (SFX - templates/audio/sfx_gen.py + sfx.py)
| Evento | Frame | SFX | Detalhes |
|--------|-------|-----|----------|
| Acordar (alarme) | 0, 120, 210, 300, 390, 720, 1500, 1700 | `alarm_beep` | Tom suave, 3 bips |
| Morte/Reset (flash) | Mesmo do alarme | `death_flash` | Whoosh reverso + sino grave |
| Torrada queimando | ~135 | `toast_burn` | Chiado + estalo |
| Fumaça | ~140 | `smoke_hiss` | Ruído branco filtrado |
| Ônibus passando | ~225 | `bus_pass` | Doppler grave + ar |
| Queda/impacto | ~240 | `body_impact` | Thud abafado |
| Tropeço no gato | ~315 | `trip_stumble` | Passos rápidos + thud |
| Miado do gato | ~318 | `cat_meow` | Curto, irritado |
| "Save point moving" | ~735 | `glitch_tone` | Tom descendente digital |
| Speedrun / aprendizado | 900-1200 | `keyboard_clicks` | Clicks rítmicos (padrão) |
| Café perfeito | ~1230 | `coffee_pour` | Líquido + vapor |
| Beijo | ~1530 | `sparkle_chime` | Sino brilhante ascendente |
| Alarme final | ~1650 | `alarm_beep` | Mesmo do início, mas distorcido |
| Ambiente quarto | Loop | `room_tone` | Silêncio com HVAC sutil |
| Ambiente cozinha | Loop | `kitchen_tone` | Geladeira + ruído distante |
| Ambiente rua | Loop | `street_tone` | Carros passando, vento |
| Ambiente café | Loop | `cafe_tone` | Conversa abafada, xícaras |

### Ducking (Mix)
- **Voz:** 0 dB (referência)
- **Música:** -8 dB (sob a voz), -4 dB (pausas)
- **SFX:** -6 dB (pontuais), -12 dB (ambientes)
- **Loudness final:** -14 LUFS integrados

---

## ARQUIVOS DE SAÍDA ESPERADOS

```
subaru-short/
├── voice.wav          # Narração TTS (48kHz, mono, ~60s)
├── words.json         # Timings por palavra (WhisperX ou similar)
├── music.wav          # Trilha sintetizada (48kHz, stereo, 1800 frames)
├── sfx.wav            # SFX mixados (48kHz, stereo, 1800 frames)
├── mix.wav            # Mix final (48kHz, stereo, exato 1800 frames)
├── stems/
│   ├── voice.wav
│   ├── music.wav
│   ├── sfx.wav
│   └── ambience.wav
└── cues.md            # Tabela de cues (frame, tipo, descrição)
```