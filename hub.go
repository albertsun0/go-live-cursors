// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
)

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[uuid.UUID] *Client

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[uuid.UUID] * Client),
	}
}

func (hub *Hub) publishPositions() {
	var positions []*MousePosition 

	for s:= range hub.clients {
		curPos := MousePosition{
			UserID: hub.clients[s].UserID,
			MouseX: hub.clients[s].mouseX,
			MouseY: hub.clients[s].mouseY,
		}
		positions = append(positions, &curPos)
	}

	message := BroadcastMessage{
		Action: "tick",
		Msg: "",
		Body: positions,
	}

	parsedResponse, err := json.Marshal(message)
	if err != nil {
		fmt.Println(err)
	}
	// fmt.Println("TICK SEND MESSAGE " + string(parsedResponse))
	hub.sendAll(parsedResponse)
}

func (h *Hub) sendAll(message []byte) {
	for client := range h.clients {
		select {
		case h.clients[client].send <- message:
		default:
			close(h.clients[client].send)
			delete(h.clients, client)
		}
	}
}

func (h *Hub) tick(ticker *time.Ticker) {
	for range ticker.C {
		h.publishPositions()
	}
}

func (h *Hub) run() {
	ticker := time.NewTicker(50 * time.Millisecond)
	go h.tick(ticker)
	
	for {
		select {
		case client := <-h.register:
			log.Printf("Client %s connected", client.UserID)
			h.clients[client.UserID] = client
		case client := <-h.unregister:
			if _, ok := h.clients[client.UserID]; ok {
				delete(h.clients, client.UserID)
				close(client.send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case h.clients[client].send <- message:
				default:
					close(h.clients[client].send)
					delete(h.clients, client)
				}
			}
		}
	}
}