package main

import (
	"flag"
	"log"

	circleoffifths "github.com/christophertino/circle-of-fifths"
)

func main() {
	var (
		showHelp  = flag.Bool("h", false, "Show help menu")
		fourths   = flag.Bool("f", false, "Circle of Fourths")
		randomize = flag.Bool("r", false, "Randomize")
	)
	flag.Parse()

	help := "--- Circle of Fifths Trainer --- \n" +
		"main.go \n" +
		"-f		Use the Circle of Fourths \n" +
		"-r		Randomize note order \n" +
		"-h		Show this help menu \n"

	if *showHelp {
		log.Println(help)
		return
	}

	if err := circleoffifths.Start(fourths, randomize); err != nil {
		log.Fatal("Error starting Trainer", err)
	}
}
