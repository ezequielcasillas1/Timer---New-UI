#Audio Processor

A professional-grade audio processing script designed for batch processing audio files with broadcast-quality DSP. Perfect for creating seamless loops, normalizing loudness, and cleaning up audio files.

## Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   Or if you're using a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

## Quick Start

### Basic Usage

The simplest way to use the script is to set your input and output directories in the configuration section at the top of `audio_processor.py`, then run:

```bash
python audio_processor.py
```

### Command-Line Usage

You can also specify directories and options via command-line arguments:

```bash
# Basic usage with custom directories
python audio_processor.py --input_dir ./audio --output_dir ./processed

# Let output directory default to <input_dir>_processed
python audio_processor.py --input_dir ./audio

# Override specific parameters
python audio_processor.py --input_dir ./audio --target_lufs -12.0 --xfade_duration_ms 100
```

## Configuration

### Method 1: Edit the Script (Recommended)

Open `audio_processor.py` and modify the `CONFIGURATION` section at the top (lines 34-60):

```python
DEFAULT_INPUT_DIR = "/path/to/your/audio/files"
DEFAULT_OUTPUT_DIR = "/path/to/output/folder"
DEFAULT_TARGET_LUFS = -12.0
DEFAULT_XFADE_DURATION_MS = 100
# ... etc
```

### Method 2: Command-Line Arguments

All configuration values can be overridden via command-line arguments. See `--help` for full list:

```bash
python audio_processor.py --help
```

## Processing Pipeline

The script processes each audio file through the following stages:

1. **Load** - Reads audio file (supports WAV, FLAC, OGG, MP3, AIFF, etc.)
2. **Trim Silence** - Removes leading and trailing silence using RMS energy analysis
3. **Noise Reduction** - Applies soft noise gating to remove hiss and crackle (optional)
4. **Crossfade** - Creates seamless loop transitions using Equal-Power Cosine Crossfade (optional)
5. **Normalize** - Normalizes loudness using LUFS (ITU-R BS.1770) or peak normalization
6. **Loop Stabilization** - Final stage ensuring perfect seamless loops (optional)
7. **Save** - Writes processed file as 24-bit WAV

## Common Use Cases

### Processing Clock/Timer Sounds

For transient-heavy audio like clock ticks, use peak normalization to preserve transients:

```bash
python audio_processor.py --input_dir ./clocks --use_peak_normalization --target_lufs -3.0
```

### Creating Seamless Loops

For ambient or musical loops, enable all loop features:

```bash
python audio_processor.py --input_dir ./loops \
  --xfade_duration_ms 100 \
  --enforce_seamless_loop \
  --enable_loop_stabilization
```

### Quick Cleanup (No Looping)

If you just want to trim and normalize without loop processing:

```bash
python audio_processor.py --input_dir ./audio \
  --xfade_duration_ms 0 \
  --disable_seamless_loop \
  --disable_loop_stabilization
```

## Command-Line Options

### Directories
- `--input_dir`, `-i` - Input directory containing audio files
- `--output_dir`, `-o` - Output directory (defaults to `<input_dir>_processed`)

### Trimming
- `--trim_threshold_db` - RMS threshold for silence detection (default: -60.0 dBFS)
- `--min_silence_ms` - Minimum silence duration to trim (default: 2000 ms)

### Crossfading
- `--xfade_duration_ms` - Crossfade duration in milliseconds (default: 100)
- `--enforce_seamless_loop` - Enable loop-safe crossfade (default: enabled)
- `--disable_seamless_loop` - Disable loop-safe crossfade
- `--mirror_loop_start` - Copy blended seam to start of file (default: disabled)
- `--no_mirror_loop_start` - Keep raw attack at beginning

### Normalization
- `--target_lufs` - Target loudness in LUFS (default: -12.0)
- `--max_peak_dbfs` - Maximum allowed peak in dBFS (default: -1.0)
- `--use_peak_normalization` - Use peak normalization instead of LUFS (better for transients)

### Noise Reduction
- `--enable_noise_reduction` - Enable noise gate (default: enabled)
- `--disable_noise_reduction` - Disable noise gate
- `--noise_gate_threshold_db` - Gate threshold in dBFS (default: -50.0)
- `--noise_reduction_db` - Maximum attenuation in dB (default: 24.0)
- `--noise_gate_window_ms` - RMS window size in ms (default: 12.0)
- `--noise_gate_attack_ms` - Attack time in ms (default: 2.0)
- `--noise_gate_release_ms` - Release time in ms (default: 40.0)

### Loop Stabilization
- `--enable_loop_stabilization` - Enable final loop stabilization (default: enabled)
- `--disable_loop_stabilization` - Disable loop stabilization
- `--target_duration_sec` - Target duration in seconds (use "none" for auto)

## Supported Audio Formats

The script supports all formats readable by `soundfile`/`libsndfile`:
- WAV
- FLAC
- OGG
- MP3 (if libsndfile supports it)
- AIFF/AIF
- AU/SND

Output files are always saved as 24-bit WAV files with the suffix `_processed.wav`.

## Troubleshooting

### "Required libraries are not installed"

Make sure you've installed all dependencies:
```bash
pip install -r requirements.txt
```

### "Input directory does not exist"

Check that your input directory path is correct. Use absolute paths if relative paths aren't working:
```bash
python audio_processor.py --input_dir /absolute/path/to/audio
```

### "No audio files found"

The script only processes files with recognized audio extensions (.wav, .flac, .ogg, .mp3, .aiff, .aif, .au, .snd). Make sure your files have one of these extensions.

### Processing is slow

The script processes files sequentially. For large batches, this is normal. The processing includes:
- High-quality RMS analysis for silence detection
- Real-time noise gating
- ITU-R BS.1770 loudness measurement
- Cross-correlation for loop alignment

### Output files are too quiet/loud

Adjust the `--target_lufs` parameter:
- Lower values (e.g., -16.0) = quieter
- Higher values (e.g., -8.0) = louder
- For transient sounds, use `--use_peak_normalization` with `--target_lufs -3.0`

### Loops still have clicks/pops

Make sure both seamless loop features are enabled:
```bash
python audio_processor.py --input_dir ./audio \
  --enforce_seamless_loop \
  --enable_loop_stabilization
```

If clicks persist, try increasing the crossfade duration:
```bash
python audio_processor.py --input_dir ./audio --xfade_duration_ms 200
```

## Examples

### Example 1: Process all files in a folder with defaults
```bash
python audio_processor.py --input_dir ./my_audio_files
```

### Example 2: Process with custom loudness target
```bash
python audio_processor.py --input_dir ./audio --target_lufs -14.0
```

### Example 3: Process clock sounds with peak normalization
```bash
python audio_processor.py --input_dir ./clocks \
  --use_peak_normalization \
  --target_lufs -3.0 \
  --xfade_duration_ms 50
```

### Example 4: Full loop processing with all features
```bash
python audio_processor.py --input_dir ./loops \
  --xfade_duration_ms 100 \
  --enforce_seamless_loop \
  --mirror_loop_start \
  --enable_loop_stabilization \
  --target_lufs -12.0
```

## Technical Details

- **Sample Rate**: Preserved from input files
- **Bit Depth**: Output is 24-bit PCM WAV
- **Loudness Standard**: ITU-R BS.1770 (LUFS)
- **Crossfade Type**: Equal-Power Cosine Crossfade (EPCF)
- **Silence Detection**: RMS energy analysis with hybrid coarse/fine detection
- **Noise Reduction**: Soft noise gate with attack/release smoothing

## License

This script is provided as-is for audio processing tasks.

