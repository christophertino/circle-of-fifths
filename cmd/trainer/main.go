package main

import (
	"flag"
	"log"
	"net/http"

	circleoffifths "github.com/christophertino/circle-of-fifths"
)

const (
	WEB_PORT    = "8080"
	SOCKET_PORT = "8081"
)

func main() {
	var (
		showHelp = flag.Bool("h", false, "Show help menu")
	)
	flag.Parse()

	help := "--- Circle of Fifths Trainer --- \n" +
		"main.go \n" +
		"-h		Show this help menu \n"

	if *showHelp {
		log.Println(help)
		return
	}

	// Start web server
	go func() {
		fs := http.FileServer(http.Dir("./web"))
		http.Handle("/", fs)
		err := http.ListenAndServe(":"+WEB_PORT, nil)
		if err != nil {
			log.Fatal(err)
		}
	}()
	log.Printf("Web server listening on port %s\n", WEB_PORT)

	// Start websocket server
	go func() {
		// Define WebSocket route
		http.HandleFunc("/ws", circleoffifths.HandleConnections)
		err := http.ListenAndServe(":"+SOCKET_PORT, nil)
		if err != nil {
			log.Fatal(err)
		}
	}()
	log.Printf("WebSocket server listening at ws://localhost:%s/ws\n", SOCKET_PORT)

	// Broadcast messages to clients
	go circleoffifths.HandleMessages()

	// Start portaudio
	if err := circleoffifths.Start(); err != nil {
		log.Fatal("Error starting Trainer", err)
	}
}
