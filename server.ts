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

const CURSORS: Record<number, { position: Position, it: boolean }> = {}
let CONNECTIONS = 0
let IT = 1;

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
			CONNECTIONS += 1
			CURSORS[id] = { position: { x: 0, y: 0 }, it: false };

			if (IT > 0 && Math.random() > 0.1) {
				CURSORS[id].it = true
				IT--;

			}

			const openMessage = { id: id.toString() }
			ws.send(JSON.stringify(openMessage))
		},
		message(ws, message) {
			const cursorData = JSON.parse(message as string)
			console.log(cursorData)

			CURSORS[parseInt(cursorData.id)] = cursorData.position
			server.publish(TOPIC, JSON.stringify({ CURSORS, connections: CONNECTIONS }));
		},
		close(ws) {
			const id = parseInt(ws.data.username)
			console.log(`unsuscribing ${id}`, CURSORS)
			delete CURSORS[id]
			ws.unsubscribe(TOPIC);
			CONNECTIONS -= 1
		},
	},
});

console.log(`Listening on ${server.hostname}:${server.port}`);
