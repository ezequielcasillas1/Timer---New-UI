#!/usr/bin/env python3
"""
Usage:
    python audio_processor.py [--input_dir <folder>] [--output_dir <folder>] [options]

    Directories and all parameters can be:
    - Set in the CONFIGURATION section at the top of this file (recommended)
    - Provided via command-line arguments (overrides config values)

Examples:
    python audio_processor.py
    python audio_processor.py --input_dir ./audio --output_dir ./processed
    python audio_processor.py --input_dir ./audio --use_peak_normalization
    python audio_processor.py --input_dir ./audio --target_lufs -12.0
"""

import sys
import argparse
from pathlib import Path
from typing import List, Optional, Tuple
import math
import json
import time

# Debug logging (Cursor debug mode)
_DEBUG_LOG_PATH = r"d:\Dev\ADHD-Timer-UI\.cursor\debug.log"

def _dbg(hypothesisId: str, location: str, message: str, data: dict) -> None:
    try:
        payload = {
            "sessionId": "debug-session",
            "runId": "audio-pop-1",
            "hypothesisId": hypothesisId,
            "location": location,
            "message": message,
            "data": data,
            "timestamp": int(time.time() * 1000),
        }
        with open(_DEBUG_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(payload, ensure_ascii=False) + "\n")
    except Exception:
        pass

try:
    import numpy as np
    import soundfile as sf
    import pyloudnorm as pyln
    from scipy import signal
except ImportError as e:
    print("Error: Required libraries are not installed.")
    print("Please run: pip install -r requirements.txt")
    print(f"Missing: {e.name}")
    sys.exit(1)

DEFAULT_INPUT_DIR = "/Freelance/Testing/Audios/original"
DEFAULT_OUTPUT_DIR = "/Freelance/Testing/Audios/processed"

DEFAULT_TRIM_THRESHOLD_DB = -60.0

DEFAULT_MIN_SILENCE_MS = 2000

DEFAULT_XFADE_DURATION_MS = 100

DEFAULT_TARGET_LUFS = -12.0

DEFAULT_MAX_PEAK_DBFS = -1.0
DEFAULT_USE_PEAK_NORMALIZATION = False

DEFAULT_ENABLE_NOISE_REDUCTION = True
DEFAULT_NOISE_GATE_THRESHOLD_DB = -50.0
DEFAULT_NOISE_REDUCTION_DB = 24.0
DEFAULT_NOISE_GATE_WINDOW_MS = 12.0
DEFAULT_NOISE_GATE_ATTACK_MS = 2.0
DEFAULT_NOISE_GATE_RELEASE_MS = 40.0

DEFAULT_ENFORCE_SEAMLESS_LOOP = True
DEFAULT_LOOP_ALIGNMENT_MS = 20.0
DEFAULT_LOOP_MIRROR_HEAD = False

DEFAULT_LOOP_STABILIZATION = True
DEFAULT_TARGET_DURATION_SEC = None  # None = use current length, otherwise target duration in seconds

def calculate_rms_energy(audio_block: np.ndarray) -> float:
    """
    Calculate Root Mean Square (RMS) energy for an audio block.

    RMS is directly proportional to signal power and perceptual loudness.
    Formula: R = sqrt(1/N * sum(x_i^2))

    Args:
        audio_block: Audio samples as numpy array

    Returns:
        RMS energy value (linear scale)
    """
    if len(audio_block) == 0:
        return 0.0
    return np.sqrt(np.mean(audio_block ** 2))

def rms_to_dbfs(rms_value: float) -> float:
    """
    Convert RMS energy value to dBFS (decibels relative to full scale).

    Args:
        rms_value: RMS energy in linear scale

    Returns:
        RMS energy in dBFS
    """
    if rms_value <= 0:
        return -np.inf
    return 20.0 * np.log10(rms_value)

def trim_silence(
    audio_data: np.ndarray,
    sample_rate: int,
    trim_threshold_db: float = -60.0,
    min_silence_ms: int = 500,
    hop_size_ms: float = 25.0,
    fine_grain_ms: float = 5.0
) -> Tuple[np.ndarray, int]:
    """
    High-fidelity silence trimming using RMS energy analysis with hybrid detection.

    Implements a two-stage approach:
    1. Coarse detection: Fast RMS calculation over moderate hop_size blocks
    2. Fine-grained refinement: Precise boundary detection near transitions

    CRITICAL: Always trims leading and trailing silence for perfect loops.
    min_silence_ms parameter is reserved for future use (middle silence detection).

    Args:
        audio_data: Audio signal as numpy array (samples x channels)
        sample_rate: Sample rate in Hz
        trim_threshold_db: RMS energy threshold in dBFS (default: -60.0)
        min_silence_ms: Reserved for future use (currently unused)
        hop_size_ms: Coarse detection block size in milliseconds (default: 25.0)
        fine_grain_ms: Fine-grained search window in milliseconds (default: 5.0)

    Returns:
        Tuple of (trimmed_audio_data, sample_rate)
    """

    if len(audio_data.shape) == 1:

        audio_data = audio_data[:, np.newaxis]
        is_mono = True
    else:
        is_mono = False

    num_samples, num_channels = audio_data.shape

    if num_channels > 1:
        mono_for_detection = np.max(np.abs(audio_data), axis=1)
    else:
        mono_for_detection = audio_data[:, 0]

    trim_threshold_linear = 10 ** (trim_threshold_db / 20.0)

    hop_size_samples = int(sample_rate * hop_size_ms / 1000.0)

    num_blocks = num_samples // hop_size_samples
    if num_blocks == 0:

        return (audio_data[:, 0] if is_mono else audio_data), sample_rate

    padded_length = num_blocks * hop_size_samples
    if padded_length < num_samples:
        pad_amount = num_samples - padded_length
        padding = np.zeros((pad_amount, num_channels))
        audio_data_padded = np.vstack([audio_data, padding])
        mono_padded = np.pad(mono_for_detection, (0, hop_size_samples - (num_samples % hop_size_samples)), 'constant')
    else:
        audio_data_padded = audio_data
        mono_padded = mono_for_detection

    blocks = mono_padded[:num_blocks * hop_size_samples].reshape(num_blocks, hop_size_samples)
    rms_values = np.sqrt(np.mean(blocks ** 2, axis=1))

    rms_dbfs = np.array([rms_to_dbfs(rms) if rms > 0 else -np.inf for rms in rms_values])

    non_silent_blocks = rms_dbfs > trim_threshold_db

    if not np.any(non_silent_blocks):

        min_samples = int(sample_rate * 0.1)
        if min_samples > num_samples:
            min_samples = num_samples
        result = audio_data[:min_samples]
        return (result[:, 0] if is_mono else result), sample_rate

    first_sound_block = np.argmax(non_silent_blocks)
    last_sound_block = len(non_silent_blocks) - 1 - np.argmax(non_silent_blocks[::-1])

    start_trim = 0
    if first_sound_block > 0:

        start_trim = first_sound_block * hop_size_samples

    end_silence_blocks = len(non_silent_blocks) - 1 - last_sound_block
    end_trim = num_samples
    if end_silence_blocks > 0:

        end_trim = min((last_sound_block + 1) * hop_size_samples, num_samples)

    coarse_start = start_trim
    coarse_end = end_trim

    fine_grain_samples = int(sample_rate * fine_grain_ms / 1000.0)
    fine_hop = max(1, int(sample_rate * 0.001))

    search_start = max(0, coarse_start - fine_grain_samples)
    search_end = min(num_samples, coarse_start + fine_grain_samples)
    search_window = mono_for_detection[search_start:search_end]

    if len(search_window) > 0:

        fine_start_offset = 0
        for i in range(0, len(search_window) - fine_hop, fine_hop):
            block = search_window[i:i + fine_hop]
            rms = calculate_rms_energy(block)
            if rms > trim_threshold_linear:
                fine_start_offset = i
                break
        refined_start = search_start + fine_start_offset
    else:
        refined_start = coarse_start

    search_start = max(0, coarse_end - fine_grain_samples)
    search_end = coarse_end
    search_window = mono_for_detection[search_start:search_end]

    if len(search_window) > 0:

        fine_end_offset = len(search_window)
        for i in range(len(search_window) - fine_hop, -1, -fine_hop):
            block = search_window[max(0, i):i + fine_hop]
            rms = calculate_rms_energy(block)
            if rms > trim_threshold_linear:
                fine_end_offset = i + fine_hop
                break
        refined_end = search_start + fine_end_offset

        refined_end = min(refined_end, coarse_end)
    else:
        refined_end = coarse_end

    if refined_start >= refined_end:

        refined_start = coarse_start
        refined_end = coarse_end

    trimmed = audio_data[refined_start:refined_end]

    if is_mono:
        trimmed = trimmed[:, 0]

    return trimmed, sample_rate

def generate_epcf_gains(crossfade_length: int) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate gain coefficients for Equal-Power Cosine Crossfade (EPCF).

    EPCF maintains constant perceived loudness during transitions by ensuring:
    g1(k)^2 + g2(k)^2 = 1

    Gain functions:
    g1(k) = sqrt(0.5 + 0.5 * cos(πk))  [Fade-Out]
    g2(k) = sqrt(0.5 - 0.5 * cos(πk))  [Fade-In]

    Args:
        crossfade_length: Number of samples in crossfade

    Returns:
        Tuple of (fade_out_gains, fade_in_gains) as numpy arrays
    """

    k = np.linspace(0.0, 1.0, crossfade_length)

    fade_out = np.sqrt(0.5 + 0.5 * np.cos(np.pi * k))

    fade_in = np.sqrt(0.5 - 0.5 * np.cos(np.pi * k))

    return fade_out, fade_in


def _adjust_loop_spacing(
    audio_data: np.ndarray,
    sample_rate: int
) -> np.ndarray:
    """
    Adjust audio so loop spacing matches tick spacing.
    
    Detects tick positions, measures the period between ticks,
    and adjusts the audio length so that the gap from the last tick
    to the end + gap from start to first tick equals the tick period.
    
    When padding is needed, uses background audio from between ticks
    (rather than silence) to maintain consistent low-level audio
    characteristics throughout the loop gap.
    
    Args:
        audio_data: Audio signal as numpy array (samples x channels or samples)
        sample_rate: Sample rate in Hz
        
    Returns:
        Audio signal with adjusted spacing for perfect looping
    """
    if len(audio_data.shape) == 1:
        audio_data = audio_data[:, np.newaxis]
        is_mono = True
    else:
        is_mono = False
        
    num_samples, num_channels = audio_data.shape
    
    # Convert to mono for detection
    if num_channels > 1:
        mono = np.mean(np.abs(audio_data), axis=1)
    else:
        mono = np.abs(audio_data[:, 0])
    
    # Detect peaks (ticks) using scipy
    peak_amp = np.max(mono)
    if peak_amp <= 0:
        return audio_data[:, 0] if is_mono else audio_data
    
    # Minimum distance between ticks: at least 50ms
    min_distance = max(1, int(sample_rate * 0.05))
    # Height threshold: 20% of peak
    height = peak_amp * 0.2
    
    peaks, _ = signal.find_peaks(mono, height=height, distance=min_distance)
    
    if len(peaks) < 3:
        # Not enough ticks to determine spacing, return as-is
        return audio_data[:, 0] if is_mono else audio_data
    
    # Calculate periods between ticks (skip first and last to avoid edge effects)
    if len(peaks) >= 2:
        periods = np.diff(peaks[1:-1])  # Use middle ticks for more reliable measurement
    else:
        periods = np.diff(peaks)
    
    if len(periods) == 0:
        return audio_data[:, 0] if is_mono else audio_data
    
    # Use median period as the target spacing
    target_period = int(np.median(periods))
    
    if target_period <= 0:
        return audio_data[:, 0] if is_mono else audio_data
    
    # Get first and last tick positions
    first_tick = peaks[0]
    last_tick = peaks[-1]
    
    # Calculate current gaps
    gap_before_first = first_tick
    gap_after_last = num_samples - last_tick
    current_wrap_gap = gap_before_first + gap_after_last
    
    # Calculate how much we need to adjust
    gap_adjustment = target_period - current_wrap_gap
    
    if gap_adjustment == 0:
        # Already perfect spacing
        return audio_data[:, 0] if is_mono else audio_data
    
    result = audio_data.copy()
    
    if gap_adjustment > 0:
        # Need to add samples - pad at the end with background audio from between ticks
        samples_to_add = gap_adjustment
        
        # Extract a representative sample of background audio from between ticks
        # Use a gap between middle ticks (avoiding edges) for more reliable background
        if len(peaks) >= 2:
            # Find a gap between ticks that's representative
            best_gap_start = None
            best_gap_length = 0
            
            for i in range(len(peaks) - 1):
                gap_start = peaks[i] + int(target_period * 0.1)  # Start 10% into the gap
                gap_end = peaks[i + 1] - int(target_period * 0.1)  # End 10% before next tick
                gap_length = gap_end - gap_start
                
                if gap_length > best_gap_length and gap_length > samples_to_add:
                    best_gap_start = gap_start
                    best_gap_length = gap_length
            
            if best_gap_start is not None and best_gap_length >= samples_to_add:
                # Use a sample from the middle of a representative gap (quiet background audio)
                sample_start = best_gap_start + (best_gap_length - samples_to_add) // 2
                background_sample = audio_data[sample_start:sample_start + samples_to_add].copy()
            else:
                # Fallback: use the gap after the last tick (if it exists) or before first tick
                if gap_after_last > samples_to_add:
                    # Use the quiet part after the last tick (avoid the tick itself)
                    offset = min(int(target_period * 0.1), gap_after_last - samples_to_add)
                    sample_start = last_tick + offset
                    if sample_start + samples_to_add <= num_samples:
                        background_sample = audio_data[sample_start:sample_start + samples_to_add].copy()
                    else:
                        # Adjust if we'd go out of bounds
                        background_sample = audio_data[sample_start:num_samples].copy()
                        # Pad with a looped segment if needed
                        if len(background_sample) < samples_to_add:
                            num_repeats = (samples_to_add + len(background_sample) - 1) // len(background_sample)
                            background_sample = np.tile(background_sample, (num_repeats, 1))[:samples_to_add]
                elif gap_before_first > samples_to_add:
                    # Use the quiet part before the first tick (avoid the tick itself)
                    offset = min(int(target_period * 0.1), gap_before_first - samples_to_add)
                    sample_end = first_tick - offset
                    sample_start = sample_end - samples_to_add
                    if sample_start >= 0:
                        background_sample = audio_data[sample_start:sample_end].copy()
                    else:
                        # Adjust if we'd go out of bounds
                        background_sample = audio_data[0:sample_end].copy()
                        # Pad with a looped segment if needed
                        if len(background_sample) < samples_to_add:
                            num_repeats = (samples_to_add + len(background_sample) - 1) // len(background_sample)
                            background_sample = np.tile(background_sample, (num_repeats, 1))[:samples_to_add]
                else:
                    # Last resort: find a quiet segment between ticks and loop it
                    if len(peaks) >= 2:
                        # Use middle of gap between first two ticks
                        gap_mid = (peaks[0] + peaks[1]) // 2
                        segment_length = min(samples_to_add, int(target_period * 0.3))  # Max 30% of period
                        segment_start = gap_mid - segment_length // 2
                        segment = audio_data[segment_start:segment_start + segment_length].copy()
                    else:
                        # No good gap found - use a small segment from the middle
                        mid_point = num_samples // 2
                        segment_length = min(samples_to_add, int(sample_rate * 0.1))  # Max 100ms
                        segment = audio_data[mid_point:mid_point + segment_length].copy()
                    # Tile the segment to fill the needed length
                    num_repeats = (samples_to_add + segment_length - 1) // segment_length
                    background_sample = np.tile(segment, (num_repeats, 1))[:samples_to_add]
        else:
            # Not enough ticks - use a sample from the middle of the audio
            mid_point = num_samples // 2
            segment_length = min(samples_to_add, int(sample_rate * 0.1))
            segment = audio_data[mid_point:mid_point + segment_length].copy()
            num_repeats = (samples_to_add + segment_length - 1) // segment_length
            background_sample = np.tile(segment, (num_repeats, 1))[:samples_to_add]
        
        result = np.vstack([result, background_sample])
    else:
        # Need to remove samples - trim from the end
        samples_to_remove = min(-gap_adjustment, gap_after_last)
        if samples_to_remove > 0:
            result = result[:num_samples - samples_to_remove]
    
    if is_mono:
        return result[:, 0]
    return result


def apply_crossfade(
    audio_data: np.ndarray,
    sample_rate: int,
    xfade_duration_ms: int = 100,
    pre_normalize: bool = False,
    enforce_seamless_loop: bool = True,
    mirror_loop_start: bool = DEFAULT_LOOP_MIRROR_HEAD
) -> np.ndarray:
    """
    Apply Equal-Power Cosine Crossfade (EPCF) to audio signal.

    Creates smooth transitions at loop boundaries. When enforce_seamless_loop
    is True (default) the start and end segments are blended with each other,
    so the last samples in the file are identical to the first samples, eliminating clicks
    when the audio loops infinitely.

    Optionally pre-normalizes power levels at transition points to minimize
    perceived volume jumps.

    WARNING: pre_normalize=True modifies the gain envelope and can change
    the shape of transients (e.g., clock ticks), affecting perceived timing.
    Default is False for clock-safe processing.

    Args:
        audio_data: Audio signal as numpy array (samples x channels or samples)
        sample_rate: Sample rate in Hz
        xfade_duration_ms: Crossfade duration in milliseconds (default: 100)
        pre_normalize: If True, normalize power levels before crossfade (default: False)
                      Set to False for clock/timer sounds to preserve transient shape
        mirror_loop_start: If True, writes the blended seam to both start and end

    Returns:
        Audio signal with EPCF applied
    """

    if len(audio_data.shape) == 1:
        audio_data = audio_data[:, np.newaxis]
        is_mono = True
    else:
        is_mono = False

    # Adjust spacing FIRST so loop gap matches tick spacing (before any processing)
    if enforce_seamless_loop:
        audio_data = _adjust_loop_spacing(audio_data, sample_rate)
        # _adjust_loop_spacing preserves shape (returns 1D if input was 1D, 2D if input was 2D)
        # Update is_mono flag based on current shape
        if len(audio_data.shape) == 1:
            audio_data = audio_data[:, np.newaxis]
            is_mono = True
        else:
            is_mono = False

    num_samples, num_channels = audio_data.shape

    xfade_samples = int(sample_rate * xfade_duration_ms / 1000.0)

    max_xfade = num_samples // 2
    actual_xfade = min(xfade_samples, max_xfade)

    if actual_xfade <= 0:

        return audio_data[:, 0] if is_mono else audio_data

    fade_out_gains, fade_in_gains = generate_epcf_gains(actual_xfade)

    if pre_normalize:

        fade_out_region = audio_data[-actual_xfade:]
        fade_out_rms = calculate_rms_energy(fade_out_region.flatten())

        fade_in_region = audio_data[:actual_xfade]
        fade_in_rms = calculate_rms_energy(fade_in_region.flatten())

        if fade_out_rms > 0 and fade_in_rms > 0:
            power_ratio_db = 20 * np.log10(fade_out_rms / fade_in_rms)
            if abs(power_ratio_db) > 3.0:

                if fade_out_rms < fade_in_rms:

                    gain_factor = fade_in_rms / fade_out_rms
                    ramp = np.linspace(1.0, gain_factor, actual_xfade)
                    for ch in range(num_channels):
                        audio_data[-actual_xfade:, ch] *= ramp
                else:

                    gain_factor = fade_out_rms / fade_in_rms
                    ramp = np.linspace(gain_factor, 1.0, actual_xfade)
                    for ch in range(num_channels):
                        audio_data[:actual_xfade, ch] *= ramp

    faded_audio = audio_data.copy()

    # Convert 1D gains to 2D for broadcasting (audio_data is always 2D at this point)
    fade_in_gains_2d = fade_in_gains[:, np.newaxis]
    fade_out_gains_2d = fade_out_gains[:, np.newaxis]

    if enforce_seamless_loop:

        head_segment = faded_audio[:actual_xfade].copy()
        tail_segment = faded_audio[-actual_xfade:].copy()
        crossfaded_segment = (tail_segment * fade_out_gains_2d) + (head_segment * fade_in_gains_2d)

        # Write to end, and optionally to start if mirror_loop_start is True
        faded_audio[-actual_xfade:] = crossfaded_segment
        if mirror_loop_start:
            faded_audio[:actual_xfade] = crossfaded_segment
    else:

        faded_audio[:actual_xfade] *= fade_in_gains_2d
        faded_audio[-actual_xfade:] *= fade_out_gains_2d

    if is_mono:
        faded_audio = faded_audio[:, 0]

    return faded_audio

def _smooth_gain_curve(values: np.ndarray, sample_rate: int, attack_ms: float, release_ms: float) -> np.ndarray:
    """
    Smooth an envelope using simple attack/release constants to avoid zipper noise.
    """
    if values.size == 0:
        return values

    attack_ms = max(0.1, attack_ms)
    release_ms = max(0.1, release_ms)
    attack_coeff = math.exp(-1.0 / max(1.0, sample_rate * (attack_ms / 1000.0)))
    release_coeff = math.exp(-1.0 / max(1.0, sample_rate * (release_ms / 1000.0)))

    smoothed = np.zeros_like(values)
    smoothed[0] = values[0]
    for i in range(1, len(values)):
        coeff = attack_coeff if values[i] < smoothed[i - 1] else release_coeff
        smoothed[i] = (coeff * smoothed[i - 1]) + ((1.0 - coeff) * values[i])
    return smoothed

def apply_noise_reduction(
    audio_data: np.ndarray,
    sample_rate: int,
    threshold_db: float = -50.0,
    reduction_db: float = 24.0,
    window_ms: float = 12.0,
    attack_ms: float = 2.0,
    release_ms: float = 40.0
) -> np.ndarray:
    """
    Remove low-level hiss and crackle between clock ticks using a gentle noise gate.

    Steps:
      1. Remove DC offset and sub-20 Hz rumble (prevents loop drift)
      2. Estimate short-term RMS envelope
      3. Apply a soft gate that attenuates regions below threshold without muting transients

    Args:
        audio_data: Audio signal as numpy array (samples x channels or samples)
        sample_rate: Sample rate in Hz
        threshold_db: RMS threshold in dBFS below which gating starts
        reduction_db: Maximum attenuation applied when below threshold
        window_ms: Window length for RMS envelope estimation
        attack_ms: Attack constant for gain smoothing
        release_ms: Release constant for gain smoothing

    Returns:
        Noise-reduced audio signal
    """
    if audio_data.size == 0:
        return audio_data

    # Use float64 during filtering/envelope math to avoid NaNs on some inputs.
    # Cast back to float32 at the end for saving.
    if len(audio_data.shape) == 1:
        audio_working = audio_data[:, np.newaxis].astype(np.float64)
        is_mono = True
    else:
        audio_working = audio_data.astype(np.float64)
        is_mono = False

    num_samples, num_channels = audio_working.shape

    dc_offset = np.mean(audio_working, axis=0, keepdims=True)
    audio_centered = audio_working - dc_offset

    nyquist = max(1.0, sample_rate / 2.0)
    hp_cutoff = min(40.0, nyquist * 0.9)
    hp_norm = max(1e-5, hp_cutoff / nyquist)
    b_hp, a_hp = signal.butter(2, hp_norm, btype='highpass')

    pad_len = max(len(a_hp), len(b_hp)) * 3
    if num_samples > pad_len:
        filtered = signal.filtfilt(b_hp, a_hp, audio_centered, axis=0)
    else:
        filtered = signal.lfilter(b_hp, a_hp, audio_centered, axis=0)

    # Guard against rare filter numerical issues producing NaNs/Infs.
    if not np.isfinite(filtered).all():
        filtered = np.nan_to_num(filtered, nan=0.0, posinf=0.0, neginf=0.0)

    mono_signal = np.mean(filtered, axis=1)
    window_samples = max(1, int(sample_rate * window_ms / 1000.0))
    kernel = np.ones(window_samples, dtype=np.float64) / float(window_samples)
    rms_envelope = np.sqrt(signal.convolve(mono_signal ** 2, kernel, mode='same') + 1e-12)

    threshold_linear = 10 ** (threshold_db / 20.0)
    reduction_linear = 10 ** (-abs(reduction_db) / 20.0)
    ratio = np.clip(rms_envelope / (threshold_linear + 1e-12), 0.0, 1.0)

    target_gain = reduction_linear + (1.0 - reduction_linear) * ratio
    smoothed_gain = _smooth_gain_curve(target_gain, sample_rate, attack_ms, release_ms)
    gain = smoothed_gain[:, np.newaxis] if num_channels > 1 or is_mono else smoothed_gain

    processed = filtered * gain

    if is_mono:
        processed = processed[:, 0]

    return processed.astype(np.float32)

def normalize_peak(
    audio_data: np.ndarray,
    sample_rate: int,
    target_dbfs: float = -3.0,
    max_peak_dbfs: float = -1.0
) -> np.ndarray:
    """
    Normalize audio to target peak level using simple peak detection.

    Peak normalization preserves transients better than LUFS for short sounds
    like clock ticks, as it doesn't apply K-weighting filters that can soften attacks.

    Args:
        audio_data: Audio signal as numpy array (samples x channels or samples)
        sample_rate: Sample rate in Hz
        target_dbfs: Target peak level in dBFS (default: -3.0)
        max_peak_dbfs: Maximum allowed peak in dBFS (default: -1.0, True Peak limit)

    Returns:
        Peak-normalized audio signal
    """

    if len(audio_data.shape) == 1:
        audio_data = audio_data[:, np.newaxis]
        is_mono = True
    else:
        is_mono = False

    if audio_data.dtype != np.float32:

        if audio_data.dtype == np.int16:
            audio_data = audio_data.astype(np.float32) / 32768.0
        elif audio_data.dtype == np.int32:
            audio_data = audio_data.astype(np.float32) / 2147483648.0
        else:
            audio_data = audio_data.astype(np.float32)

            audio_data = np.clip(audio_data, -1.0, 1.0)

    peak_value = np.max(np.abs(audio_data))

    if peak_value <= 0:

        return audio_data[:, 0] if is_mono else audio_data

    target_linear = 10 ** (target_dbfs / 20.0)
    gain = target_linear / peak_value

    normalized = audio_data * gain

    max_peak_linear = 10 ** (max_peak_dbfs / 20.0)
    new_peak = np.max(np.abs(normalized))

    if new_peak > max_peak_linear:

        attenuation_factor = max_peak_linear / new_peak
        normalized = normalized * attenuation_factor

    if is_mono:
        normalized = normalized[:, 0]

    return normalized

def normalize_lufs(
    audio_data: np.ndarray,
    sample_rate: int,
    target_lufs: float = -12.0,
    max_peak_dbfs: float = -1.0
) -> np.ndarray:
    """
    Normalize audio to target LUFS using ITU-R BS.1770 standard.

    Implements broadcast-quality loudness normalization with True Peak limiting.
    Uses pyloudnorm for K-weighting, gating, and integrated loudness calculation.

    Args:
        audio_data: Audio signal as numpy array (samples x channels or samples)
        sample_rate: Sample rate in Hz
        target_lufs: Target loudness in LUFS (default: -12.0, louder playback)
        max_peak_dbfs: Maximum allowed peak in dBFS (default: -1.0, True Peak limit)

    Returns:
        Loudness-normalized audio signal
    """

    if len(audio_data.shape) == 1:
        audio_data = audio_data[:, np.newaxis]
        is_mono = True
    else:
        is_mono = False

    if audio_data.dtype != np.float32:

        if audio_data.dtype == np.int16:
            audio_data = audio_data.astype(np.float32) / 32768.0
        elif audio_data.dtype == np.int32:
            audio_data = audio_data.astype(np.float32) / 2147483648.0
        else:
            audio_data = audio_data.astype(np.float32)

            audio_data = np.clip(audio_data, -1.0, 1.0)

    audio_for_meter = audio_data.T

    meter = pyln.Meter(sample_rate)

    try:
        measured_loudness = meter.integrated_loudness(audio_for_meter)

        if not np.isfinite(measured_loudness):

            return audio_data[:, 0] if is_mono else audio_data

        normalized = pyln.normalize.loudness(audio_for_meter, measured_loudness, target_lufs)

        normalized = normalized.T

    except Exception as e:

        print(f"    Warning: LUFS measurement failed ({str(e)}), using peak normalization")
        peak = np.max(np.abs(audio_data))
        if peak > 0:
            target_linear = 10 ** (target_lufs / 20.0)
            gain = target_linear / peak
            normalized = audio_data * gain
        else:
            normalized = audio_data

    max_peak_linear = 10 ** (max_peak_dbfs / 20.0)
    peak_value = np.max(np.abs(normalized))

    if peak_value > max_peak_linear:

        attenuation_factor = max_peak_linear / peak_value
        normalized = normalized * attenuation_factor
        print(f"    Applied True Peak limiting: {peak_value:.4f} -> {max_peak_linear:.4f}")

    if is_mono:
        normalized = normalized[:, 0]

    return normalized

def _detect_audio_character(
    audio_data: np.ndarray,
    sample_rate: int
) -> str:
    """
    Detect if audio is transient-heavy (like clock ticks) or sustained/ambient.
    
    Uses spectral analysis and transient detection to determine audio character.
    
    Args:
        audio_data: Audio signal as numpy array (samples x channels or samples)
        sample_rate: Sample rate in Hz
        
    Returns:
        'transient' for transient-heavy material, 'sustained' for ambience/sustained textures
    """
    if len(audio_data.shape) == 1:
        mono = audio_data
    else:
        mono = np.mean(audio_data, axis=1)
    
    # Calculate RMS energy and peak statistics
    window_samples = int(sample_rate * 0.01)  # 10ms windows
    num_windows = len(mono) // window_samples
    if num_windows < 10:
        return 'sustained'  # Default for very short audio
    
    rms_values = []
    peak_values = []
    
    for i in range(num_windows):
        window = mono[i * window_samples:(i + 1) * window_samples]
        rms = calculate_rms_energy(window)
        peak = np.max(np.abs(window))
        rms_values.append(rms)
        peak_values.append(peak)
    
    rms_values = np.array(rms_values)
    peak_values = np.array(peak_values)
    
    # Calculate peak-to-RMS ratio (crest factor)
    avg_rms = np.mean(rms_values)
    avg_peak = np.mean(peak_values)
    
    if avg_rms > 0:
        crest_factor = avg_peak / (avg_rms + 1e-10)
    else:
        crest_factor = 0
    
    # High crest factor = transient-heavy (clicks, ticks, drums)
    # Low crest factor = sustained (ambient, pads, textures)
    return 'transient' if crest_factor > 5.0 else 'sustained'

def stabilize_loop(
    audio_data: np.ndarray,
    sample_rate: int,
    target_duration_sec: Optional[float] = None,
    comparison_window_ms: float = 50.0
) -> np.ndarray:
    """
    Universal loop stabilization stage for perfectly seamless loops.
    
    This is the final stage of processing that ensures any audio will loop seamlessly:
    1. Forces exact target duration (padding or trimming)
    2. Detects timing offsets by comparing start/end windows
    3. Applies minimal circular shift if needed for alignment
    4. Applies adaptive micro-crossfade (short for transients, longer for ambience)
    
    Args:
        audio_data: Audio signal as numpy array (samples x channels or samples)
        sample_rate: Sample rate in Hz
        target_duration_sec: Target duration in seconds (None = use current length)
        comparison_window_ms: Window size in ms for comparing start/end (default: 50ms)
        
    Returns:
        Loop-stabilized audio signal
    """
    if len(audio_data.shape) == 1:
        audio_data = audio_data[:, np.newaxis]
        is_mono = True
    else:
        is_mono = False
    
    num_samples, num_channels = audio_data.shape
    
    # Step 1: Force exact target duration
    if target_duration_sec is not None and target_duration_sec > 0:
        target_samples = int(target_duration_sec * sample_rate)
        if target_samples != num_samples:
            if target_samples > num_samples:
                # Pad with background audio from the end (maintains low-level audio characteristics)
                padding_samples = target_samples - num_samples
                # Use a sample from near the end (avoiding the very last samples which might be crossfaded)
                sample_start = max(0, num_samples - min(padding_samples * 2, int(sample_rate * 0.2)))
                sample_length = min(padding_samples, num_samples - sample_start)
                if sample_length > 0:
                    background_sample = audio_data[sample_start:sample_start + sample_length].copy()
                    # Tile the sample if needed to fill the padding length
                    if padding_samples > sample_length:
                        num_repeats = (padding_samples + sample_length - 1) // sample_length
                        background_sample = np.tile(background_sample, (num_repeats, 1))[:padding_samples]
                    else:
                        background_sample = background_sample[:padding_samples]
                else:
                    # Fallback: use a small segment from the middle
                    mid_point = num_samples // 2
                    segment_length = min(padding_samples, int(sample_rate * 0.1))
                    segment = audio_data[mid_point:mid_point + segment_length].copy()
                    num_repeats = (padding_samples + segment_length - 1) // segment_length
                    background_sample = np.tile(segment, (num_repeats, 1))[:padding_samples]
                audio_data = np.vstack([audio_data, background_sample])
            else:
                # Trim from the end
                audio_data = audio_data[:target_samples]
            num_samples = target_samples
    
    # Step 2: Compare start and end windows to detect timing offset
    comparison_samples = int(sample_rate * comparison_window_ms / 1000.0)
    comparison_samples = min(comparison_samples, num_samples // 4)  # Don't use more than 25% of audio
    
    if num_samples < comparison_samples * 2:
        # Audio too short, skip stabilization
        return audio_data[:, 0] if is_mono else audio_data
    
    # Extract windows for comparison
    start_window = audio_data[:comparison_samples]
    end_window = audio_data[-comparison_samples:]
    
    # Convert to mono for comparison
    if num_channels > 1:
        start_mono = np.mean(start_window, axis=1)
        end_mono = np.mean(end_window, axis=1)
    else:
        start_mono = start_window[:, 0]
        end_mono = end_window[:, 0]
    
    # Cross-correlate to find best alignment
    correlation = np.correlate(end_mono, start_mono, mode='full')
    best_offset = np.argmax(correlation) - (len(end_mono) - 1)
    
    # Only apply shift if there's a significant offset (more than a few samples)
    max_shift = min(comparison_samples // 4, int(sample_rate * 0.01))  # Max 10ms shift
    if abs(best_offset) > 3 and abs(best_offset) <= max_shift:
        # Apply circular shift
        audio_data = np.roll(audio_data, -best_offset, axis=0)
    
    # Step 3: Detect audio character and apply adaptive micro-crossfade
    audio_character = _detect_audio_character(audio_data, sample_rate)
    
    if audio_character == 'transient':
        # Short crossfade for transient-heavy material (preserve transients)
        xfade_ms = 10.0  # Very short, just enough to eliminate clicks
    else:
        # Longer crossfade for sustained/ambient material (smooth blending)
        xfade_ms = 50.0  # Longer for smoother transitions
    
    xfade_samples = int(sample_rate * xfade_ms / 1000.0)
    max_xfade = num_samples // 2
    actual_xfade = min(xfade_samples, max_xfade)
    
    if actual_xfade > 1:
        # Generate crossfade gains
        fade_out_gains, fade_in_gains = generate_epcf_gains(actual_xfade)
        
        # Convert 1D gains to 2D for broadcasting (audio_data is always 2D at this point)
        fade_in_gains_2d = fade_in_gains[:, np.newaxis]
        fade_out_gains_2d = fade_out_gains[:, np.newaxis]
        
        # Create crossfaded segment
        head_seg = audio_data[:actual_xfade]
        tail_seg = audio_data[-actual_xfade:]
        crossfaded = (tail_seg * fade_out_gains_2d) + (head_seg * fade_in_gains_2d)
        
        # Apply to both ends for seamless loop
        audio_data[:actual_xfade] = crossfaded
        audio_data[-actual_xfade:] = crossfaded
    
    if is_mono:
        return audio_data[:, 0]
    return audio_data

def load_audio_file(file_path: Path) -> Tuple[np.ndarray, int]:
    """
    Load audio file using soundfile.

    Args:
        file_path: Path to audio file

    Returns:
        Tuple of (audio_data, sample_rate)
    """
    try:
        data, samplerate = sf.read(str(file_path), always_2d=False)
        return data, samplerate
    except Exception as e:
        raise IOError(f"Failed to load audio file: {str(e)}")

def save_audio_file(
    audio_data: np.ndarray,
    sample_rate: int,
    output_path: Path,
    format: str = 'WAV',
    subtype: str = 'PCM_24'
) -> None:
    """
    Save audio file using soundfile.

    Args:
        audio_data: Audio signal as numpy array
        sample_rate: Sample rate in Hz
        output_path: Path to save file
        format: File format (default: 'WAV')
        subtype: Subtype/bit depth (default: 'PCM_24' for 24-bit)
    """

    output_path.parent.mkdir(parents=True, exist_ok=True)

    if len(audio_data.shape) == 1:

        pass
    elif len(audio_data.shape) == 2 and audio_data.shape[1] == 1:

        audio_data = audio_data[:, 0]

    if audio_data.dtype != np.float32:
        audio_data = audio_data.astype(np.float32)

    audio_data = np.clip(audio_data, -1.0, 1.0)

    try:
        sf.write(str(output_path), audio_data, sample_rate, format=format, subtype=subtype)
    except Exception as e:
        raise IOError(f"Failed to save audio file: {str(e)}")

def get_audio_files(folder_path: Path) -> List[Path]:
    """
    Get all audio files from a folder.

    Supports formats readable by soundfile/libsndfile:
    WAV, FLAC, OGG, MP3 (if libsndfile supports it)

    Args:
        folder_path: Path to folder containing audio files

    Returns:
        List of Path objects for audio files found
    """

    audio_extensions = {'.wav', '.flac', '.ogg', '.mp3', '.aiff', '.aif', '.au', '.snd'}

    audio_files = []

    for file_path in folder_path.rglob('*'):
        if file_path.is_file() and file_path.suffix.lower() in audio_extensions:
            audio_files.append(file_path)

    return sorted(audio_files)

def process_audio_file(
    input_path: Path,
    output_path: Path,
    trim_threshold_db: float = -60.0,
    min_silence_ms: int = 500,
    xfade_duration_ms: Optional[int] = None,
    target_lufs: float = -12.0,
    max_peak_dbfs: float = -1.0,
    use_peak_normalization: bool = False,
    enable_noise_reduction: bool = DEFAULT_ENABLE_NOISE_REDUCTION,
    noise_gate_threshold_db: float = DEFAULT_NOISE_GATE_THRESHOLD_DB,
    noise_reduction_db: float = DEFAULT_NOISE_REDUCTION_DB,
    noise_gate_window_ms: float = DEFAULT_NOISE_GATE_WINDOW_MS,
    noise_gate_attack_ms: float = DEFAULT_NOISE_GATE_ATTACK_MS,
    noise_gate_release_ms: float = DEFAULT_NOISE_GATE_RELEASE_MS,
    enforce_seamless_loop: bool = DEFAULT_ENFORCE_SEAMLESS_LOOP,
    mirror_loop_start: bool = DEFAULT_LOOP_MIRROR_HEAD,
    enable_loop_stabilization: bool = DEFAULT_LOOP_STABILIZATION,
    target_duration_sec: Optional[float] = DEFAULT_TARGET_DURATION_SEC
) -> bool:
    """
    Process a single audio file through the complete HQABP pipeline.

    Processing sequence: Load -> Trim -> Noise reduction -> Crossfade (if enabled) -> Normalize -> Loop Stabilization (if enabled) -> Write

    Args:
        input_path: Path to input audio file
        output_path: Path to save processed file
        trim_threshold_db: RMS threshold for silence detection in dBFS
        min_silence_ms: Minimum silence duration to trim
        xfade_duration_ms: Crossfade duration in milliseconds (None = disabled)
        target_lufs: Target loudness in LUFS (used if use_peak_normalization=False)
        max_peak_dbfs: Maximum allowed peak in dBFS
        use_peak_normalization: If True, use peak normalization instead of LUFS
                               (better for clock/timer sounds - preserves transients)
        enable_noise_reduction: If True, apply soft noise gating/declicking before looping
        noise_gate_threshold_db: Threshold for the noise gate envelope in dBFS
        noise_reduction_db: Maximum attenuation applied by the noise gate
        noise_gate_window_ms: Window size for RMS envelope used by the gate
        noise_gate_attack_ms: Attack constant for the gate smoothing envelope
        noise_gate_release_ms: Release constant for the gate smoothing envelope
        enforce_seamless_loop: Forces crossfade to mirror start/end segments for perfect loops
        mirror_loop_start: If True, writes the blended seam onto the head of the file
        enable_loop_stabilization: If True, applies universal loop stabilization at the end (recommended)
        target_duration_sec: Target duration in seconds for loop stabilization (None = use current length)

    Returns:
        True if processing was successful, False otherwise
    """
    try:

        print(f"  Loading: {input_path.name}")
        audio_data, sample_rate = load_audio_file(input_path)
        if input_path.name == "classic-clock-tick.wav":
            # #region agent log
            _dbg("H1", "audio_processor.py:process_audio_file", "Loaded input", {
                "file": input_path.name,
                "sample_rate": int(sample_rate),
                "shape": list(getattr(audio_data, "shape", [])),
                "dtype": str(getattr(audio_data, "dtype", "")),
                "nan": bool(np.isnan(audio_data).any()) if hasattr(audio_data, "__array__") else None,
                "inf": bool(np.isinf(audio_data).any()) if hasattr(audio_data, "__array__") else None,
                "min": float(np.min(audio_data)) if hasattr(audio_data, "__array__") else None,
                "max": float(np.max(audio_data)) if hasattr(audio_data, "__array__") else None,
                "std": float(np.std(audio_data)) if hasattr(audio_data, "__array__") else None,
            })
            # #endregion
        original_shape = audio_data.shape
        print(f"    Sample rate: {sample_rate} Hz, Shape: {original_shape}, Duration: {len(audio_data)/sample_rate:.2f}s")

        print(f"    Trimming silence (threshold: {trim_threshold_db} dBFS)...")
        audio_data, sample_rate = trim_silence(
            audio_data,
            sample_rate,
            trim_threshold_db=trim_threshold_db,
            min_silence_ms=min_silence_ms
        )
        print(f"    Trimmed duration: {len(audio_data)/sample_rate:.2f}s")
        if input_path.name == "classic-clock-tick.wav":
            # #region agent log
            _dbg("H1", "audio_processor.py:process_audio_file", "After trim_silence", {
                "file": input_path.name,
                "shape": list(getattr(audio_data, "shape", [])),
                "dtype": str(getattr(audio_data, "dtype", "")),
                "nan": bool(np.isnan(audio_data).any()),
                "inf": bool(np.isinf(audio_data).any()),
                "min": float(np.min(audio_data)),
                "max": float(np.max(audio_data)),
                "std": float(np.std(audio_data)),
            })
            # #endregion

        if enable_noise_reduction:
            print(f"    Noise reduction (threshold {noise_gate_threshold_db} dBFS, reduction {noise_reduction_db} dB)...")
            audio_data = apply_noise_reduction(
                audio_data,
                sample_rate,
                threshold_db=noise_gate_threshold_db,
                reduction_db=noise_reduction_db,
                window_ms=noise_gate_window_ms,
                attack_ms=noise_gate_attack_ms,
                release_ms=noise_gate_release_ms
            )
            if input_path.name == "classic-clock-tick.wav":
                # #region agent log
                _dbg("H2", "audio_processor.py:process_audio_file", "After apply_noise_reduction", {
                    "file": input_path.name,
                    "shape": list(getattr(audio_data, "shape", [])),
                    "dtype": str(getattr(audio_data, "dtype", "")),
                    "nan": bool(np.isnan(audio_data).any()),
                    "inf": bool(np.isinf(audio_data).any()),
                    "min": float(np.min(audio_data)),
                    "max": float(np.max(audio_data)),
                    "std": float(np.std(audio_data)),
                })
                # #endregion

        if xfade_duration_ms is not None and xfade_duration_ms > 0:
            print(f"    Applying {xfade_duration_ms}ms Equal-Power Cosine Crossfade...")
            audio_data = apply_crossfade(
                audio_data,
                sample_rate,
                xfade_duration_ms,
                pre_normalize=False,
                enforce_seamless_loop=enforce_seamless_loop,
                mirror_loop_start=mirror_loop_start
            )
            if input_path.name == "classic-clock-tick.wav":
                # #region agent log
                _dbg("H3", "audio_processor.py:process_audio_file", "After apply_crossfade", {
                    "file": input_path.name,
                    "shape": list(getattr(audio_data, "shape", [])),
                    "dtype": str(getattr(audio_data, "dtype", "")),
                    "nan": bool(np.isnan(audio_data).any()),
                    "inf": bool(np.isinf(audio_data).any()),
                    "min": float(np.min(audio_data)),
                    "max": float(np.max(audio_data)),
                    "std": float(np.std(audio_data)),
                })
                # #endregion

        if use_peak_normalization:
            target_peak_db = target_lufs
            print(f"    Normalizing to {target_peak_db} dBFS peak (preserves transients)...")
            audio_data = normalize_peak(
                audio_data,
                sample_rate,
                target_dbfs=target_peak_db,
                max_peak_dbfs=max_peak_dbfs
            )
            if input_path.name == "classic-clock-tick.wav":
                # #region agent log
                _dbg("H4", "audio_processor.py:process_audio_file", "After normalize_peak", {
                    "file": input_path.name,
                    "shape": list(getattr(audio_data, "shape", [])),
                    "dtype": str(getattr(audio_data, "dtype", "")),
                    "nan": bool(np.isnan(audio_data).any()),
                    "inf": bool(np.isinf(audio_data).any()),
                    "min": float(np.min(audio_data)),
                    "max": float(np.max(audio_data)),
                    "std": float(np.std(audio_data)),
                })
                # #endregion
        else:
            print(f"    Normalizing to {target_lufs} LUFS (ITU-R BS.1770)...")
            audio_data = normalize_lufs(
                audio_data,
                sample_rate,
                target_lufs=target_lufs,
                max_peak_dbfs=max_peak_dbfs
            )

        # Universal loop stabilization stage (final step before saving)
        if enable_loop_stabilization:
            print(f"    Applying loop stabilization (target duration: {target_duration_sec or 'auto'}s)...")
            audio_data = stabilize_loop(
                audio_data,
                sample_rate,
                target_duration_sec=target_duration_sec
            )
            if input_path.name == "classic-clock-tick.wav":
                # #region agent log
                _dbg("H5", "audio_processor.py:process_audio_file", "After stabilize_loop", {
                    "file": input_path.name,
                    "shape": list(getattr(audio_data, "shape", [])),
                    "dtype": str(getattr(audio_data, "dtype", "")),
                    "nan": bool(np.isnan(audio_data).any()),
                    "inf": bool(np.isinf(audio_data).any()),
                    "min": float(np.min(audio_data)),
                    "max": float(np.max(audio_data)),
                    "std": float(np.std(audio_data)),
                })
                # #endregion

        stem = output_path.stem
        output_wav_path = output_path.parent / f"{stem}_processed.wav"
        save_audio_file(audio_data, sample_rate, output_wav_path)

        print(f"    [OK] Saved: {output_wav_path.name}")
        return True

    except Exception as e:
        print(f"    [ERROR] Error processing {input_path.name}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """
    Main execution block: CLI argument parsing and batch processing orchestration.
    """
    parser = argparse.ArgumentParser(
        description='High-Quality Audio Batch Processor (HQABP) - Broadcast-quality DSP',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # If DEFAULT_INPUT_DIR is set in config, you can run with no arguments:
  python audio_processor.py

  # Or specify directories via command line:
  python audio_processor.py --input_dir ./audio --output_dir ./processed

  # Let output_dir default to <input_dir>_processed:
  python audio_processor.py --input_dir ./audio

  # Override specific parameters via command line (others use config defaults):
  python audio_processor.py --input_dir ./audio --target_lufs -12.0 --xfade_duration_ms 100

  # All parameters can be adjusted in the CONFIGURATION section at the top of this file
  # Command-line arguments override config values when provided
        """
    )

    parser.add_argument(
        '--input_dir', '-i',
        type=str,
        default=DEFAULT_INPUT_DIR,
        help=f'Input directory containing audio files to process (optional if set in config: {DEFAULT_INPUT_DIR or "not set"})'
    )

    parser.add_argument(
        '--output_dir', '-o',
        type=str,
        default=DEFAULT_OUTPUT_DIR,
        help=f'Output directory for processed files (optional: defaults to <input_dir>_processed or config: {DEFAULT_OUTPUT_DIR or "auto"})'
    )

    parser.add_argument(
        '--trim_threshold_db',
        type=float,
        default=DEFAULT_TRIM_THRESHOLD_DB,
        metavar='dB',
        help=f'RMS energy threshold for silence detection in dBFS (default from config: {DEFAULT_TRIM_THRESHOLD_DB})'
    )

    parser.add_argument(
        '--min_silence_ms',
        type=int,
        default=DEFAULT_MIN_SILENCE_MS,
        metavar='MS',
        help=f'Minimum silence duration to trim in milliseconds (default from config: {DEFAULT_MIN_SILENCE_MS})'
    )

    parser.add_argument(
        '--xfade_duration_ms',
        type=int,
        default=DEFAULT_XFADE_DURATION_MS,
        metavar='MS',
        help=f'Equal-Power Cosine Crossfade duration in milliseconds (default from config: {DEFAULT_XFADE_DURATION_MS or "disabled"})'
    )

    parser.set_defaults(enable_noise_reduction=DEFAULT_ENABLE_NOISE_REDUCTION)
    parser.add_argument(
        '--enable_noise_reduction',
        dest='enable_noise_reduction',
        action='store_true',
        help=f'Enable soft noise gate/declicker (default from config: {DEFAULT_ENABLE_NOISE_REDUCTION})'
    )
    parser.add_argument(
        '--disable_noise_reduction',
        dest='enable_noise_reduction',
        action='store_false',
        help='Disable noise reduction stage'
    )
    parser.add_argument(
        '--noise_gate_threshold_db',
        type=float,
        default=DEFAULT_NOISE_GATE_THRESHOLD_DB,
        metavar='dB',
        help=f'Noise gate threshold in dBFS (default from config: {DEFAULT_NOISE_GATE_THRESHOLD_DB})'
    )
    parser.add_argument(
        '--noise_reduction_db',
        type=float,
        default=DEFAULT_NOISE_REDUCTION_DB,
        metavar='dB',
        help=f'Max attenuation applied by noise gate in dB (default from config: {DEFAULT_NOISE_REDUCTION_DB})'
    )
    parser.add_argument(
        '--noise_gate_window_ms',
        type=float,
        default=DEFAULT_NOISE_GATE_WINDOW_MS,
        metavar='MS',
        help=f'RMS window size for noise gate in milliseconds (default from config: {DEFAULT_NOISE_GATE_WINDOW_MS})'
    )
    parser.add_argument(
        '--noise_gate_attack_ms',
        type=float,
        default=DEFAULT_NOISE_GATE_ATTACK_MS,
        metavar='MS',
        help=f'Noise gate attack time in milliseconds (default from config: {DEFAULT_NOISE_GATE_ATTACK_MS})'
    )
    parser.add_argument(
        '--noise_gate_release_ms',
        type=float,
        default=DEFAULT_NOISE_GATE_RELEASE_MS,
        metavar='MS',
        help=f'Noise gate release time in milliseconds (default from config: {DEFAULT_NOISE_GATE_RELEASE_MS})'
    )

    parser.set_defaults(enforce_seamless_loop=DEFAULT_ENFORCE_SEAMLESS_LOOP)
    parser.add_argument(
        '--enforce_seamless_loop',
        dest='enforce_seamless_loop',
        action='store_true',
        help=f'Force loop-safe crossfade (default from config: {DEFAULT_ENFORCE_SEAMLESS_LOOP})'
    )
    parser.add_argument(
        '--disable_seamless_loop',
        dest='enforce_seamless_loop',
        action='store_false',
        help='Disable loop-safe crossfade and use legacy fade in/out behavior'
    )
    parser.set_defaults(mirror_loop_start=DEFAULT_LOOP_MIRROR_HEAD)
    parser.add_argument(
        '--mirror_loop_start',
        dest='mirror_loop_start',
        action='store_true',
        help=f'Copy blended seam onto the start of the file (default from config: {DEFAULT_LOOP_MIRROR_HEAD})'
    )
    parser.add_argument(
        '--no_mirror_loop_start',
        dest='mirror_loop_start',
        action='store_false',
        help='Keep the raw attack at the beginning of the file'
    )
    parser.set_defaults(enable_loop_stabilization=DEFAULT_LOOP_STABILIZATION)
    parser.add_argument(
        '--enable_loop_stabilization',
        dest='enable_loop_stabilization',
        action='store_true',
        help=f'Enable universal loop stabilization (final stage for perfect seamless loops) (default from config: {DEFAULT_LOOP_STABILIZATION})'
    )
    parser.add_argument(
        '--disable_loop_stabilization',
        dest='enable_loop_stabilization',
        action='store_false',
        help='Disable loop stabilization stage'
    )
    parser.add_argument(
        '--target_duration_sec',
        type=lambda x: None if x.lower() == 'none' else float(x),
        default=DEFAULT_TARGET_DURATION_SEC,
        metavar='SECONDS',
        help=f'Target duration in seconds for loop stabilization (use "none" for auto/current length) (default from config: {DEFAULT_TARGET_DURATION_SEC})'
    )

    parser.add_argument(
        '--target_lufs',
        type=float,
        default=DEFAULT_TARGET_LUFS,
        metavar='LUFS',
        help=f'Target loudness in LUFS (ITU-R BS.1770) (default from config: {DEFAULT_TARGET_LUFS})'
    )

    parser.add_argument(
        '--max_peak_dbfs',
        type=float,
        default=DEFAULT_MAX_PEAK_DBFS,
        metavar='dB',
        help=f'Maximum allowed peak in dBFS for True Peak limiting (default from config: {DEFAULT_MAX_PEAK_DBFS})'
    )

    parser.add_argument(
        '--use_peak_normalization',
        action='store_true',
        default=DEFAULT_USE_PEAK_NORMALIZATION,
        help=f'Use peak normalization instead of LUFS (better for clock/timer sounds - preserves transients) (default: {DEFAULT_USE_PEAK_NORMALIZATION})'
    )

    args = parser.parse_args()

    if args.input_dir is None:
        print("Error: Input directory not specified.")
        print("Please either:")
        print("  1. Set DEFAULT_INPUT_DIR in the CONFIGURATION section at the top of this file, or")
        print("  2. Provide --input_dir via command line: python audio_processor.py --input_dir <path>")
        sys.exit(1)

    input_dir = Path(args.input_dir)
    if not input_dir.exists():
        print(f"Error: Input directory does not exist: {input_dir}")
        sys.exit(1)

    if not input_dir.is_dir():
        print(f"Error: Input path is not a directory: {input_dir}")
        sys.exit(1)

    if args.output_dir:
        output_dir = Path(args.output_dir)
    else:
        output_dir = input_dir.parent / f"{input_dir.name}_processed"

    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Scanning for audio files in: {input_dir}")
    audio_files = get_audio_files(input_dir)

    if not audio_files:
        print(f"No audio files found in: {input_dir}")
        print("Supported formats: WAV, FLAC, OGG, MP3 (if libsndfile supports it)")
        sys.exit(1)

    print(f"Found {len(audio_files)} audio file(s)")
    print(f"Output directory: {output_dir}")
    print(f"Configuration:")
    print(f"  Trim threshold: {args.trim_threshold_db} dBFS")
    print(f"  Min silence: {args.min_silence_ms} ms")
    if args.xfade_duration_ms:
        print(f"  Crossfade: {args.xfade_duration_ms} ms (EPCF, pre-normalize disabled)")
    else:
        print(f"  Crossfade: Disabled")
    if args.use_peak_normalization:
        print(f"  Normalization: Peak to {args.target_lufs} dBFS (preserves transients)")
    else:
        print(f"  Normalization: LUFS to {args.target_lufs} (ITU-R BS.1770)")
    print(f"  Max peak: {args.max_peak_dbfs} dBFS (True Peak limit)")
    if args.enable_noise_reduction:
        print(f"  Noise reduction: threshold {args.noise_gate_threshold_db} dBFS, reduction {args.noise_reduction_db} dB, window {args.noise_gate_window_ms} ms")
    else:
        print("  Noise reduction: Disabled")
    print(f"  Seamless loop enforcement: {'Enabled' if args.enforce_seamless_loop else 'Disabled'}")
    if args.enforce_seamless_loop:
        print(f"  Mirror blended seam onto start: {'Yes' if args.mirror_loop_start else 'No'}")
    print(f"  Loop stabilization: {'Enabled' if args.enable_loop_stabilization else 'Disabled'}")
    if args.enable_loop_stabilization:
        print(f"  Target duration: {args.target_duration_sec or 'auto'} seconds")
    print("-" * 70)

    successful = 0
    failed = 0

    for i, input_file in enumerate(audio_files, 1):
        print(f"\n[{i}/{len(audio_files)}] Processing: {input_file.name}")

        relative_path = input_file.relative_to(input_dir)
        output_file = output_dir / relative_path

        if process_audio_file(
            input_file,
            output_file,
            trim_threshold_db=args.trim_threshold_db,
            min_silence_ms=args.min_silence_ms,
            xfade_duration_ms=args.xfade_duration_ms,
            target_lufs=args.target_lufs,
            max_peak_dbfs=args.max_peak_dbfs,
            use_peak_normalization=args.use_peak_normalization,
            enable_noise_reduction=args.enable_noise_reduction,
            noise_gate_threshold_db=args.noise_gate_threshold_db,
            noise_reduction_db=args.noise_reduction_db,
            noise_gate_window_ms=args.noise_gate_window_ms,
            noise_gate_attack_ms=args.noise_gate_attack_ms,
            noise_gate_release_ms=args.noise_gate_release_ms,
            enforce_seamless_loop=args.enforce_seamless_loop,
            mirror_loop_start=args.mirror_loop_start,
            enable_loop_stabilization=args.enable_loop_stabilization,
            target_duration_sec=args.target_duration_sec
        ):
            successful += 1
        else:
            failed += 1

    print("\n" + "=" * 70)
    print(f"Batch processing complete!")
    print(f"  Successful: {successful}")
    print(f"  Failed: {failed}")
    print(f"  Output directory: {output_dir}")
    print("=" * 70)

if __name__ == '__main__':
    main()
