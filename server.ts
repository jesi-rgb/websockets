const TOPIC = 'realtime'
interface Cursor {
	id: number;
	position: {
		x: number; y: number
	}
}
interface Position {
	x: number; y: number
}

const CURSORS: Record<number, Position | null> = {}

const server = Bun.serve<{ username: string }>({
	fetch(req, server) {
		const url = new URL(req.url);
		if (url.pathname === "/chat") {
			console.log(`upgrade!`);
			const username = Math.floor(Math.random() * 1000);
			const success = server.upgrade(req, { data: { username } });
			return success
				? undefined
				: new Response("WebSocket upgrade error", { status: 400 });
		}

		return new Response("Hello world");
	},
	websocket: {
		open(ws) {
			const id = parseInt(ws.data.username)
			console.log(`${id} has joined the party`)
			ws.subscribe(TOPIC);
			ws.send(id.toString())
			CURSORS[id] = { x: 0, y: 0 };
		},
		message(ws, message) {
			const cursorData = JSON.parse(message as string)
			CURSORS[parseInt(cursorData.id)] = cursorData.position
			server.publish(TOPIC, JSON.stringify(CURSORS));
		},
		close(ws) {
			const id = parseInt(ws.data.username)
			console.log(`unsuscribing ${id}`, CURSORS)
			delete CURSORS[id]
			ws.unsubscribe(TOPIC);
			console.log(CURSORS)
		},
	},
});

console.log(`Listening on ${server.hostname}:${server.port}`);
