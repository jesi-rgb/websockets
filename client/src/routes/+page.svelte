<script lang="ts">
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';

	interface Position {
		x: number;
		y: number;
	}

	let cursors = $state<Record<number, { position: Position; it: boolean }>>({});
	let socket: WebSocket;

	let id = $state(0);
	let tweenedPos = tweened<Position>({ x: 0, y: 0 }, { duration: 5700 });
	let position: Position;
	let connections = $state(0);
	let it = $state(false);

	function sendPosition() {
		console.log({ id: id, position: $tweenedPos });
		const message = JSON.stringify({ id, position: $tweenedPos });
		socket.send(message);
	}

	let start: number;

	function step(timestamp: number) {
		const elapsed = timestamp - start;

		if (elapsed % 1000 == 0) {
			sendPosition();
		}
		requestAnimationFrame(step);
	}

	onMount(() => {
		socket = new WebSocket('ws://localhost:3000/chat');

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);

			if (parseInt(data.id)) {
				id = parseInt(data.id);
				return;
			}

			cursors = data.CURSORS;

			it = cursors[id].it;
			connections = data.connections;
		};

		requestAnimationFrame((timestamp) => {
			start = timestamp;
			step(timestamp);
		});

		window.addEventListener('mousemove', (event) => {
			position = { x: event.clientX, y: event.clientY };
		});
	});
</script>

<div>{connections}</div>
<div>
	{#each Object.entries(cursors) as [id, pos]}
		<div
			class="absolute bg-secondary size-10 rounded-full"
			style="left: {pos.position.x}px; top: {pos.position.y}px; background-color: {it
				? 'var(--player-it)'
				: 'var(--player-normal)'}"
			{id}
		></div>
	{/each}
</div>

<style>
	:root {
		--player-normal: steelblue;
		--player-it: red;
	}
</style>
