package main

import "github.com/google/uuid"

type PublishMessage struct {
	UserID  uuid.UUID
	RoomID string
	Action string
	MouseX int16
	MouseY int16
}

type MousePosition struct {
	UserID uuid.UUID
	MouseX int16
	MouseY int16
}

type BroadcastMessage struct {
	Action string
	Msg    string
	Body []*MousePosition
}

func handleMessage(cs *chatServer, message PublishMessage) error {

	if message.Action == "move" {
		cs.subscribers[message.UserID].mouseX = message.MouseX
		cs.subscribers[message.UserID].mouseY = message.MouseY
	}

	return nil
}