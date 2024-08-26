package main

import "github.com/google/uuid"

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

	if message.Action == "move" {
		c.mouseX = message.MouseX
		c.mouseY = message.MouseY
	}

	return nil
}