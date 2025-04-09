<script>
	import { onMount } from 'svelte';

	// Props
	export let workHours = 8; // Default 8 hours of work
	export let sleepHours = 8; // Default 8 hours of sleep
	export let currentTime = new Date(); // Current time

	// Derived values
	let hoursInDay = 24;
	let hoursLeft = 0;
	let workPercentage = 0;
	let sleepPercentage = 0;
	let recreationHours = 0;
	let recreationPercentage = 0;
	let pastHours = 0;
	let pastPercentage = 0;

	// Circle segments data
	let segments = [];

	// Update the time visualization
	function updateTimeVisualization() {
		// Calculate hours passed in the day
		const now = currentTime;
		const startOfDay = new Date(now);
		startOfDay.setHours(0, 0, 0, 0);
		pastHours = (now - startOfDay) / (1000 * 60 * 60);

		// Calculate hours left
		hoursLeft = 24 - pastHours;

		// Calculate percentages
		pastPercentage = (pastHours / hoursInDay) * 100;
		workPercentage = (workHours / hoursInDay) * 100;
		sleepPercentage = (sleepHours / hoursInDay) * 100;

		// Calculate remaining time for recreation
		recreationHours = hoursInDay - workHours - sleepHours - pastHours;
		recreationHours = recreationHours < 0 ? 0 : recreationHours;
		recreationPercentage = (recreationHours / hoursInDay) * 100;

		// Create segments for visualization
		segments = [
			{
				type: 'past',
				percentage: pastPercentage,
				hours: pastHours,
				color: '#D3D3D3',
				label: 'Past'
			},
			{
				type: 'work',
				percentage: workPercentage,
				hours: workHours,
				color: '#4682B4',
				label: 'Work'
			},
			{
				type: 'recreation',
				percentage: recreationPercentage,
				hours: recreationHours,
				color: '#90EE90',
				label: 'Recreation'
			},
			{
				type: 'sleep',
				percentage: sleepPercentage,
				hours: sleepHours,
				color: '#9370DB',
				label: 'Sleep'
			}
		];

		// Filter out segments with 0 hours
		segments = segments.filter((segment) => segment.hours > 0);
	}

	// Create circle elements based on the segments
	function createCircles() {
		let circles = [];
		let totalCircles = 24; // One circle per hour
		let circlesPerSegment = {};

		// Calculate circles per segment
		segments.forEach((segment) => {
			circlesPerSegment[segment.type] = Math.round((segment.hours / hoursInDay) * totalCircles);
		});

		// Create the circles
		segments.forEach((segment) => {
			for (let i = 0; i < circlesPerSegment[segment.type]; i++) {
				circles.push({
					type: segment.type,
					color: segment.color,
					label: segment.label
				});
			}
		});

		return circles;
	}

	// Update on mount and when props change
	$: {
		updateTimeVisualization();
		circles = createCircles();
	}

	let circles = [];

	onMount(() => {
		// Update time every minute
		const interval = setInterval(() => {
			currentTime = new Date();
			updateTimeVisualization();
			circles = createCircles();
		}, 60000);

		return () => clearInterval(interval);
	});
</script>

<div class="day-visualizer">
	<h2>Your Day Visualization</h2>

	<div class="time-info">
		<p>Current time: {currentTime.toLocaleTimeString()}</p>
		<p>Hours left in day: {hoursLeft.toFixed(1)} hours</p>
	</div>

	<div class="allocation">
		<div class="form-group">
			<label for="work-hours">Work hours needed:</label>
			<input id="work-hours" type="range" min="0" max="24" step="0.5" bind:value={workHours} />
			<span>{workHours} hours</span>
		</div>

		<div class="form-group">
			<label for="sleep-hours">Sleep hours:</label>
			<input id="sleep-hours" type="range" min="0" max="24" step="0.5" bind:value={sleepHours} />
			<span>{sleepHours} hours</span>
		</div>

		<div class="recreation-info">
			<p>Time for recreation: {recreationHours.toFixed(1)} hours</p>
		</div>
	</div>

	<div class="circle-visualization">
		<div class="circles-container">
			{#each circles as circle, i}
				<div
					class="hour-circle"
					style="background-color: {circle.color};"
					title="{circle.label}: Hour {i + 1}"
				></div>
			{/each}
		</div>

		<div class="legend">
			{#each segments as segment}
				<div class="legend-item">
					<div class="legend-color" style="background-color: {segment.color};"></div>
					<div class="legend-label">{segment.label} ({segment.hours.toFixed(1)} hrs)</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.day-visualizer {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			'Open Sans', 'Helvetica Neue', sans-serif;
		max-width: 600px;
		margin: 0 auto;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	h2 {
		text-align: center;
		margin-bottom: 20px;
	}

	.time-info {
		margin-bottom: 20px;
		padding: 10px;
		background-color: #f8f9fa;
		border-radius: 5px;
	}

	.form-group {
		display: flex;
		align-items: center;
		margin-bottom: 15px;
	}

	label {
		width: 150px;
		font-weight: 500;
	}

	input[type='range'] {
		flex-grow: 1;
		margin: 0 15px;
	}

	.recreation-info {
		padding: 10px;
		background-color: #e9f7ef;
		border-radius: 5px;
		margin-top: 15px;
	}

	.recreation-info p {
		margin: 0;
		font-weight: 500;
	}

	.circle-visualization {
		margin-top: 30px;
	}

	.circles-container {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		margin-bottom: 20px;
	}

	.hour-circle {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		transition: transform 0.2s;
	}

	.hour-circle:hover {
		transform: scale(1.1);
	}

	.legend {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 15px;
	}

	.legend-item {
		display: flex;
		align-items: center;
	}

	.legend-color {
		width: 15px;
		height: 15px;
		border-radius: 50%;
		margin-right: 5px;
	}

	.legend-label {
		font-size: 14px;
	}

	@media (max-width: 480px) {
		.form-group {
			flex-direction: column;
			align-items: flex-start;
		}

		label {
			margin-bottom: 5px;
		}

		input[type='range'] {
			width: 100%;
			margin: 5px 0;
		}
	}
</style>
