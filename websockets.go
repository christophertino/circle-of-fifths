package circleoffifths

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins (for testing; secure this in production)
	},
}

func SocketHandler(w http.ResponseWriter, r *http.Request) {
	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("WebSocket Upgrade Error:", err)
		return
	}
	defer conn.Close()

	log.Println("New WebSocket connection established")

	// Listen for messages from client
	for {
		messageType, msg, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read error:", err)
			break
		}
		log.Printf("Server Received: %s\n", msg)

		// Echo message back to client
		if err := conn.WriteMessage(messageType, msg); err != nil {
			log.Println("Write error:", err)
			break
		}
	}
}
