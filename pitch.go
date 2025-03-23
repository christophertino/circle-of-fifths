package circleoffifths

import (
	"log"
	"math"
	"math/cmplx"

	"github.com/mjibson/go-dsp/fft"
)

const (
	sampleRate   = 44100
	volumeThresh = 1.0 // Threshold to filter out noise
	A4Freq       = 440.0
)

var noteNames = []string{"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"}

// Analyze the buffer for pitch
func processAudio(buffer []float32) (float64, string) {
	frequency := detectPitch(buffer)
	if frequency > 0 {
		note, diff := matchNoteToFrequency(frequency)
		log.Printf("Detected pitch: %.2f Hz (Closest Note: %s, Difference: %.2f Hz)\n", frequency, note, diff)
		return frequency, note
	}
	return 0, ""
}

// detectPitch estimates the pitch frequency from the audio buffer
func detectPitch(buffer []float32) float64 {
	// Convert buffer to a slice of complex numbers for FFT
	complexBuffer := make([]complex128, len(buffer))
	for i, sample := range buffer {
		complexBuffer[i] = complex(float64(sample), 0)
	}

	// Perform FFT
	spectrum := fft.FFT(complexBuffer)

	// Find the magnitude of each frequency component
	magnitudes := make([]float64, len(spectrum)/2)
	for i := range magnitudes {
		magnitudes[i] = cmplx.Abs(spectrum[i])
	}

	// Find the frequency with the highest magnitude
	var maxMag float64
	var maxIndex int
	for i, mag := range magnitudes {
		if mag > maxMag {
			maxMag = mag
			maxIndex = i
		}
	}

	// Calculate the frequency in Hz
	frequency := float64(maxIndex) * float64(sampleRate) / float64(len(buffer))

	// Filter out low-volume noise
	if maxMag > volumeThresh {
		return frequency
	}
	return 0
}

// matchNoteToFrequency matches a frequency to the closest Western music note
func matchNoteToFrequency(frequency float64) (string, float64) {
	if frequency <= 0 {
		return "", 0
	}

	// Calculate the number of semitones away from A4
	semitones := math.Round(12 * math.Log2(frequency/A4Freq))
	// Calculate the closest note frequency
	closestFrequency := A4Freq * math.Pow(2, semitones/12)
	// Get the note name
	noteIndex := int(math.Mod(semitones, 12))
	if noteIndex < 0 {
		noteIndex += 12
	}
	noteName := noteNames[noteIndex]

	return noteName, frequency - closestFrequency
}
