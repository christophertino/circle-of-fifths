package main

import (
	"flag"
	"log"
	"net/http"

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

	// Start web server
	go func() {
		fs := http.FileServer(http.Dir("./web"))
		http.Handle("/", fs)
		err := http.ListenAndServe(":8080", nil)
		if err != nil {
			log.Fatal(err)
		}
	}()
	log.Println("Web server listening on port 8080")

	// Start portaudio
	if err := circleoffifths.Start(fourths, randomize); err != nil {
		log.Fatal("Error starting Trainer", err)
	}
}
