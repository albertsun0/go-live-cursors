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
	Body any
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
		if hub.mainLobby != nil {
			c.sendMessage("error", "Must be in main lobby to create room")
			return nil
		}
		// Create new room if not exist
		if hub.rooms[roomID] == nil {
			hub.mu.Lock()
			newRoom := newHub()
			newRoom.mainLobby = hub
			go newRoom.run()
			hub.rooms[roomID] = newRoom
			log.Println("Created room " + roomID)
			c.sendMessage("success", "Created Room " + roomID)
			hub.mu.Unlock()
		} else{
			c.sendMessage("error", "Room " + roomID + " already exists")
		}

		hub.sendRooms()
	}

	if message.Action == "joinRoom" {
		if mainLobby.rooms[roomID] == nil {
			c.sendMessage("error", "Room " + roomID + " does not exist")
		} else {

			c.hub.unregister <- c
			c.hub = mainLobby.rooms[roomID]
			c.hub.register <- c

			// send success
			log.Println("User " + c.UserID.String() + " joined room " + roomID)
			c.sendMessage("joinSuccess", roomID)
		}
	}

	return nil
}