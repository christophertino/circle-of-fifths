package circleoffifths

import (
	"fmt"
	"math"
	"math/cmplx"
	"time"

	"github.com/gordonklaus/portaudio"
	"github.com/mjibson/go-dsp/fft"
)

const (
	sampleRate   = 44100
	bufferSize   = 2048
	volumeThresh = 0.01 // Threshold to filter out noise
	A4Freq       = 440.0
)

var noteNames = []string{"C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"}

// Listen uses portaudio to detect notes via the device microphone
func Listen() error {
	// Initialize PortAudio
	if err := portaudio.Initialize(); err != nil {
		return err
	}
	defer portaudio.Terminate()

	// Create audio input stream
	buffer := make([]float32, bufferSize)
	stream, err := portaudio.OpenDefaultStream(1, 0, float64(sampleRate), len(buffer), buffer)
	if err != nil {
		return err
	}
	defer stream.Close()

	if err := stream.Start(); err != nil {
		return err
	}
	defer stream.Stop()

	fmt.Println("Listening for notes...")

	// Process audio data in real-time
	for {
		// Read audio data into the buffer
		if err := stream.Read(); err != nil {
			return err
		}

		// Analyze the buffer for pitch
		frequency := detectPitch(buffer, sampleRate)
		if frequency > 0 {
			note, diff := matchNoteToFrequency(frequency)
			fmt.Printf("Detected pitch: %.2f Hz (Closest Note: %s, Difference: %.2f Hz)\n", frequency, note, diff)
		}

		time.Sleep(100 * time.Millisecond) // Avoid spamming the console
	}
}

// detectPitch estimates the pitch frequency from the audio buffer
func detectPitch(buffer []float32, sampleRate int) float64 {
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
