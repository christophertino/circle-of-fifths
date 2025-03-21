package circleoffifths

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// Define WebSocket options
var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins for development
		},
	}
	clients   = make(map[*websocket.Conn]bool) // Connected clients
	broadcast = make(chan string)              // Channel for messages
	mutex     = &sync.Mutex{}                  // Mutex to synchronize access
)

// HandleConnections handles WebSocket connections
func HandleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket Upgrade Error:", err)
		return
	}
	defer conn.Close()

	// Register the new client
	mutex.Lock()
	clients[conn] = true
	mutex.Unlock()

	log.Println("New WebSocket client connected")

	// Keep the connection open to listen for messages
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Client disconnected:", err)
			mutex.Lock()
			delete(clients, conn)
			mutex.Unlock()
			break
		}

		// Parse JSON message
		var m struct {
			Name string `json:"name"`
			Data string `json:"data"`
		}
		if err := json.Unmarshal(msg, &m); err != nil {
			log.Println("Error parsing JSON:", err)
			continue
		}

		// Print received message
		fmt.Printf("Received: %+v\n", m)

		// Broadcast the message to all clients
		broadcast <- string(msg)
	}
}

// HandleMessages sends a message to the WebSocket client from the broadcast channel
func HandleMessages() {
	for {
		msg := <-broadcast
		mutex.Lock()
		for client := range clients {
			err := client.WriteMessage(websocket.TextMessage, []byte(msg))
			if err != nil {
				log.Println("Write error:", err)
				client.Close()
				delete(clients, client)
			}
		}
		mutex.Unlock()
	}
}
