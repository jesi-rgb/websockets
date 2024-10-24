const TOPIC = 'realtime'
const MESSAGES: string[] = []

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
		async open(ws) {
			ws.subscribe(TOPIC);
			server.publish(TOPIC, JSON.stringify(MESSAGES));
		},
		async message(ws, message) {
			const newMessage = `${ws.data.username}: ${message}`
			MESSAGES.push(newMessage)

			server.publish(TOPIC, JSON.stringify(MESSAGES));
		},
		close(ws) {
			const msg = `${ws.data.username} has left the chat`;
			ws.unsubscribe(TOPIC);
			server.publish(TOPIC, msg);
		},
	},
});

console.log(`Listening on ${server.hostname}:${server.port}`);
