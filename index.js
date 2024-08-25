(() => {
  // expectingMessage is set to true
  // if the user has just submitted a message
  // and so we should scroll the next message into view when received.
  let expectingMessage = false;
  function dial() {
    const conn = new WebSocket(`ws://${location.host}/subscribe`);

    conn.addEventListener("close", (ev) => {
      appendLog(
        `WebSocket Disconnected code: ${ev.code}, reason: ${ev.reason}`,
        true
      );
      if (ev.code !== 1001) {
        appendLog("Reconnecting in 1s", true);
        setTimeout(dial, 1000);
      }
    });
    conn.addEventListener("open", (ev) => {
      console.info("websocket connected");
    });

    // This is where we handle messages received.
    conn.addEventListener("message", (ev) => {
      console.log("Message from server:", ev.data);
      if (typeof ev.data !== "string") {
        console.error("unexpected message type", typeof ev.data);
        return;
      }
      parse = JSON.parse(ev.data);
      console.log(parse);
      if (parse.Action == "subscribe") {
        uuid = parse.Msg;
        console.log("subscribe", uuid);
        return;
      }

      if (parse.Action == "tick") {
        // TODO: Clean up dead cursors
        for (let i = 0; i < parse.Body.length; i++) {
          if (parse.Body[i].UserID == uuid) {
            continue;
          }
          var cursorElement = document.getElementById(parse.Body[i].UserID);
          if (cursorElement) {
            cursorElement.style.left = parse.Body[i].MouseX + "px";
            cursorElement.style.top = parse.Body[i].MouseY + "px";
          } else {
            const newCursor = document.createElement("div");
            const newContent = document.createTextNode("x");
            newCursor.appendChild(newContent);
            newCursor.setAttribute("id", parse.Body[i].UserID);
            newCursor.style.left = parse.Body[i].MouseX + "px";
            newCursor.style.top = parse.Body[i].MouseY + "px";
            newCursor.style.position = "absolute";
            newCursor.style.transition = "all 0.2s ease-out";
            document.body.appendChild(newCursor);
          }
        }
        return;
      }

      const p = appendLog(ev.data);
      if (expectingMessage) {
        p.scrollIntoView();
        expectingMessage = false;
      }
    });
  }

  dial();

  const messageLog = document.getElementById("message-log");
  const publishForm = document.getElementById("publish-form");
  const messageInput = document.getElementById("message-input");

  let uuid = null;

  // appendLog appends the passed text to messageLog.
  function appendLog(text, error) {
    const p = document.createElement("p");
    // Adding a timestamp to each message makes the log easier to read.
    p.innerText = `${new Date().toLocaleTimeString()}: ${text}`;
    if (error) {
      p.style.color = "red";
      p.style.fontStyle = "bold";
    }
    messageLog.append(p);
    return p;
  }
  appendLog("Submit a message to get started!");

  const sendMousePos = async (posX, posY) => {
    try {
      const resp = await fetch("/publish", {
        method: "POST",
        body: JSON.stringify({
          UserID: uuid,
          Action: "move",
          RoomID: "test",
          MouseX: posX,
          MouseY: posY,
        }),
      });
      if (resp.status !== 202) {
        throw new Error(
          `Unexpected HTTP Status ${resp.status} ${resp.statusText}`
        );
      }
    } catch (err) {
      appendLog(`Publish failed: ${err.message}`, true);
    }
  };

  document.addEventListener("mousemove", (e) =>
    sendMousePos(e.clientX, e.clientY)
  );
})();
