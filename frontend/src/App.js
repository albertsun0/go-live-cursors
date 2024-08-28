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
    <div className="App">
      <header className="App-header">
        <h1>Live Cursors</h1>
        <button onClick={() => sendMessage("createRoom", "test")}>
          Create room test
        </button>
        <button onClick={() => sendMessage("joinRoom", "test")}>
          join room test
        </button>
        {cursors.map((cursor) => (
          <Cursor
            key={cursor.UserID}
            color={getRandomColor(cursor.UserID)}
            x={cursor.MouseX}
            y={cursor.MouseY}
          />
        ))}
      </header>
    </div>
  );
}

export default App;
