<script lang="ts">
	import { onMount } from 'svelte';

	let socket: WebSocket;

	let inputMessage = $state('');
	let messages: string[] = $state([]);

	let inputElement: HTMLInputElement;

	// Connect to the WebSocket server when the component loads
	onMount(() => {
		socket = new WebSocket('ws://localhost:3000/chat');

		socket.onopen = (event) => {
			console.log(event);
		};

		socket.onmessage = async (event) => {
			messages = JSON.parse(event.data).reverse();
		};
	});

	function sendMessage(e) {
		e.preventDefault();
		socket.send(inputMessage);
		inputMessage = '';
		inputElement.focus();
	}
</script>

<form onsubmit={sendMessage}>
	<input
		bind:this={inputElement}
		bind:value={inputMessage}
		class="input input-bordered"
		type="text"
		onsubmit={sendMessage}
	/>
	<button class="btn">yea</button>
</form>

<ul
	class="list-disc list-inside overflow-y-scroll max-h-96 border
	border-base-content rounded-xl p-3"
>
	{#each messages as m}
		<li>
			{m}
		</li>
	{/each}
	<li></li>
</ul>
