<script lang="ts">
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';

	interface Position {
		x: number;
		y: number;
	}

	let cursors = $state<Record<number, { position: Position; it: boolean }>>({});
	let socket: WebSocket;

	let id = $state('');
	let tweenedPos = tweened<Position>({ x: 0, y: 0 }, { duration: 5700 });
	let position: Position = { x: 0, y: 0 };
	let connections = $state(0);
	let it = $state(false);

	onMount(() => {
		socket = new WebSocket('ws://localhost:3000/chat');

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log(data);

			if (parseInt(data.id)) {
				id = data.id;
				return;
			}

			cursors = data.CURSORS;
			it = cursors[parseInt(id)].it;
			connections = data.connections;
		};

		window.addEventListener('mousemove', (e) => {
			position = { x: e.clientX, y: e.clientY };
			tweenedPos.set(position);

			const message = JSON.stringify({ id, position: $tweenedPos });
			socket.send(message);
		});
	});
</script>

<div>{connections}</div>
<div>
	{#each Object.entries(cursors) as [id, pos]}
		<div
			class="absolute bg-secondary size-10 rounded-full"
			style="left: {pos.x}px; top: {pos.y}px; background-color: {it
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
