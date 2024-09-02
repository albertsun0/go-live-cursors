import { useState, useEffect, useRef } from "react";
import Cursor from "./Cursor";

const cursorColors = ["red", "blue", "green", "purple"];

const getRandomColor = (hash) => {
  return cursorColors[hash.charCodeAt(hash.length - 1) % cursorColors.length];
};
function App() {
  const [cursors, setCursors] = useState([]);
  const [uuid, setUuid] = useState(null);
  const ws = useRef(null);

  const [rooms, setRooms] = useState([]);

  const [roomInput, setRoomInput] = useState("");

  const [currentRoom, setCurrentRoom] = useState("Lobby");

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080/ws");
    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");

    const wsCurrent = ws.current;

    return () => {
      wsCurrent.close();
    };
  }, []);

  useEffect(() => {
    if (!ws.current) {
      return;
    }
    ws.current.onmessage = (evt) => {
      const parse = JSON.parse(evt.data);
      if (parse.Action === "subscribe") {
        setUuid(parse.Msg);
        console.log("subscribe", uuid);
        return;
      } else if (parse.Action === "tick") {
        setCursors(parse.Body);
      } else if (parse.Action === "rooms") {
        setRooms(parse.Body);
      } else if (parse.Action === "joinSuccess") {
        setCurrentRoom(parse.Msg);
        setRooms([]);
      } else {
        console.log(parse);
      }
    };

    document.addEventListener("mousemove", (e) => {
      // console.log(e.pageX, e.pageY);
      ws.current.send(
        JSON.stringify({
          Action: "move",
          RoomID: "test",
          MouseX: e.pageX,
          MouseY: e.pageY,
        })
      );
    });
  }, []);

  const sendMessage = (action, RoomID) => {
    console.log("sending", action, RoomID);
    ws.current.send(
      JSON.stringify({
        Action: action,
        RoomID: RoomID,
      })
    );
  };

  if (!uuid) {
    return <div>Connecting...</div>;
  }

  return (
    <div className="p-10 space-y-4 overflow-hidden w-full h-full">
      <h1 className="text-2xl font-bold text-gray-800">{currentRoom}</h1>
      {currentRoom === "Lobby" && (
        <div>
          <div className="flex flex-row space-x-4">
            <input
              className="border-2"
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value)}
            />
            <button
              className="bg-blue-300 p-2 rounded-sm"
              onClick={() => {
                sendMessage("createRoom", roomInput);
                setRoomInput("");
              }}
            >
              Create Room
            </button>
          </div>
          <h2 className="text-xl">Rooms</h2>
          <div className="space-y-1">
            {rooms &&
              rooms.map((room) => (
                <div
                  onClick={() => sendMessage("joinRoom", room.RoomName)}
                  key={room.RoomName}
                  className="bg-blue-100 cursor-pointer"
                >
                  {room.RoomName} {room.NumUsers}
                </div>
              ))}
          </div>
        </div>
      )}
      {cursors.map((cursor) => (
        <Cursor
          key={cursor.UserID}
          color={getRandomColor(cursor.UserID)}
          x={cursor.MouseX}
          y={cursor.MouseY}
          name={cursor.UserID === uuid ? "You" : cursor.UserID}
        />
      ))}
    </div>
  );
}

export default App;
