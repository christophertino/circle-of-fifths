package circleoffifths

import "log"

var (
	fourths = []string{"B", "E", "A", "D", "G", "C", "F", "Bb", "Eb", "Ab", "Db", "Gb"}
	fifths  = []string{"C", "G", "D", "A", "E", "B", "Gb", "Db", "Ab", "Eb", "Bb", "F"}
)

func Start(fourths *bool, randomize *bool) error {
	if *fourths {
		log.Println("Using Circle of Fourths trainer")
	}

	if *randomize {
		log.Println("Using randomized note order")
	}

	if err := Listen(); err != nil {
		return err
	}

	return nil
}
