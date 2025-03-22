package main

import (
	"log"
	"net/http"

	circleoffifths "github.com/christophertino/circle-of-fifths"
)

const (
	WEB_PORT    = "8080"
	SOCKET_PORT = "8081"
)

func main() {
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
		http.HandleFunc("/ws", circleoffifths.HandleConnections)
		err := http.ListenAndServe(":"+SOCKET_PORT, nil)
		if err != nil {
			log.Fatal(err)
		}
	}()
	log.Printf("WebSocket server listening at ws://localhost:%s/ws\n", SOCKET_PORT)

	// Broadcast websocket messages to clients
	go circleoffifths.HandleMessages()

	// Block forever
	select {}
}
