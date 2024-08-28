package main

import (
	"log"

	"github.com/google/uuid"
)

type PublishMessage struct {
	RoomID string
	Action string
	MouseX int
	MouseY int
}

type MousePosition struct {
	UserID uuid.UUID
	MouseX int
	MouseY int
}

type BroadcastMessage struct {
	Action string
	Msg    string
	Body []*MousePosition
}



func handleMessage(hub * Hub, c *Client, message PublishMessage) error {
	roomID := message.RoomID

	mainLobby := hub.mainLobby
	if hub.mainLobby == nil {
		mainLobby = hub
	}

	if message.Action == "move" {
		c.mouseX = message.MouseX
		c.mouseY = message.MouseY
	}

	if message.Action == "createRoom" {
		// Create new room if not exist
		if hub.rooms[roomID] == nil {
			newRoom := newHub()
			newRoom.mainLobby = mainLobby
			go newRoom.run()
			hub.rooms[roomID] = newRoom
			log.Println("Created room " + roomID)
		}

		// Join room
		// c.hub.unregister <- c
		// c.hub = hub.rooms[roomID]
		// c.hub.register <- c

		// // send success
		c.sendMessage("success", "Created Room " + roomID)
	}

	if message.Action == "joinRoom" {
		if hub.rooms[roomID] == nil {
			c.sendMessage("error", "Room " + roomID + " does not exist")
		} else {
			c.hub.unregister <- c
			c.hub = hub.rooms[roomID]
			c.hub.register <- c

			// send success
			c.sendMessage("success", "Joined Room " + roomID)
		}
	}

	return nil
}