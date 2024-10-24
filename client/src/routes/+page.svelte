<script lang="ts">
	import { onMount } from 'svelte';

	let cursors = $state({});
	let socket: WebSocket;

	let id = $state('');
	let position = $state({});

	onMount(() => {
		socket = new WebSocket('ws://localhost:3000/chat');

		socket.onmessage = (event) => {
			if (parseInt(event.data)) {
				id = event.data;
				console.log(id);
				return;
			}

			cursors = JSON.parse(event.data);
		};

		window.addEventListener('mousemove', (e) => {
			position = { x: e.clientX, y: e.clientY };
			const message = JSON.stringify({ id, position });
			socket.send(message);
		});
	});
</script>

<div>
	{#each Object.entries(cursors) as [id, position]}
		<div
			class="absolute bg-secondary size-10 rounded-full"
			style="left: {position.x}px; top: {position.y}px"
			{id}
		></div>
	{/each}
</div>
