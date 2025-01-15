# Circle of Fifths Trainer

A guitar fretboard memorization tool using the Circle of Fifths. It can also be run using the Circle of Fourths.

## Install Dependencies

This program requires PortAudio for audio input detection.

```sh
$ brew install portaudio
```

## Running the Tool

```sh
# Start the trainer
$ go run cmd/trainer/main.go

# Open help menu
$ go run cmd/trainer/main.go -h
	"--- Circle of Fifths Trainer ---"
	"-f		Use the Circle of Fourths"
	"-r		Randomize note order"
	"-h		Show this help menu"
```

## License
MIT License. Copyright 2025-Present Christopher Tino. All rights reserved.

See [LICENSE](LICENSE)