<script>
	import { onMount } from 'svelte';

	// User inputs
	export let workHoursNeeded = 8; // Hours of work to complete
	export let breakTimeWanted = 2; // Hours of break time desired
	export let sleepHours = 8; // Hours of sleep
	export let bedTime = '23:00'; // Time to go to bed
	export let wakeTime = '07:00'; // Time to wake up
	export let currentTime = new Date(); // Current time

	// Derived values
	let hoursInDay = 24;
	let hoursLeft = 0;
	let segments = [];
	let timeBlocks = [];

	// Parse time string (HH:MM) to date object
	function parseTimeToDate(timeString, date = new Date()) {
		const [hours, minutes] = timeString.split(':').map(Number);
		const result = new Date(date);
		result.setHours(hours, minutes, 0, 0);
		return result;
	}

	// Determine if a time is between two other times (handles overnight periods)
	function isTimeBetween(time, start, end) {
		if (end < start) {
			// Overnight period
			return time >= start || time < end;
		}
		return time >= start && time < end;
	}

	// Format hours to hours and minutes
	function formatHours(hours) {
		const h = Math.floor(hours);
		const m = Math.round((hours - h) * 60);
		return `${h}h ${m}m`;
	}

	// Calculate angle for the arc based on hours (180 degrees = 12 hours)
	function calculateAngle(hours) {
		return (hours / 12) * 180;
	}

	// Generate SVG path for an arc
	function describeArc(x, y, radius, startAngle, endAngle) {
		const start = polarToCartesian(x, y, radius, endAngle);
		const end = polarToCartesian(x, y, radius, startAngle);
		const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

		return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
	}

	function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
		return {
			x: centerX + radius * Math.cos(angleInRadians),
			y: centerY + radius * Math.sin(angleInRadians)
		};
	}

	// Update the time visualization
	function updateTimeVisualization() {
		const now = currentTime;
		const startOfDay = new Date(now);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(startOfDay);
		endOfDay.setHours(24, 0, 0, 0);

		// Parse bed and wake times for today
		const bedTimeToday = parseTimeToDate(bedTime);
		const wakeTimeToday = parseTimeToDate(wakeTime);

		// Calculate total available waking hours
		let wakingHours;
		if (wakeTimeToday < bedTimeToday) {
			// Normal schedule (wake in morning, sleep at night)
			wakingHours = (bedTimeToday - wakeTimeToday) / (1000 * 60 * 60);
		} else {
			// Reverse schedule (night shift worker, etc.)
			wakingHours = 24 - (wakeTimeToday - bedTimeToday) / (1000 * 60 * 60);
		}

		// Calculate hours passed in the day
		const hoursPassed = (now - startOfDay) / (1000 * 60 * 60);

		// Calculate hours left in the day
		hoursLeft = 24 - hoursPassed;

		// Calculate time left before bed
		let hoursBeforeBed;
		if (now < bedTimeToday) {
			hoursBeforeBed = (bedTimeToday - now) / (1000 * 60 * 60);
		} else {
			// Already past bedtime
			hoursBeforeBed = 0;
		}

		// Calculate if we're in sleep time
		const inSleepTime =
			isTimeBetween(now, bedTimeToday, wakeTimeToday) ||
			(bedTimeToday < wakeTimeToday && (now >= bedTimeToday || now < wakeTimeToday));

		// Calculate remaining work and break time
		const remainingActiveHours = Math.max(0, hoursBeforeBed);
		const workAndBreakNeeded = workHoursNeeded + breakTimeWanted;

		// Determine if there's enough time for all planned activities
		const timeDeficit = Math.max(0, workAndBreakNeeded - remainingActiveHours);

		// Adjust work and break time proportionally if there's a deficit
		let adjustedWorkHours = workHoursNeeded;
		let adjustedBreakHours = breakTimeWanted;

		if (timeDeficit > 0) {
			const reductionFactor = remainingActiveHours / workAndBreakNeeded;
			adjustedWorkHours = workHoursNeeded * reductionFactor;
			adjustedBreakHours = breakTimeWanted * reductionFactor;
		}

		// Create segments for day visualization
		segments = [
			{
				type: 'past',
				hours: hoursPassed,
				color: '#D3D3D3',
				label: 'Past',
				startAngle: 0,
				endAngle: calculateAngle(hoursPassed > 12 ? 12 : hoursPassed)
			}
		];

		// Add night segment if we're in the second half of the day
		if (hoursPassed > 12) {
			segments.push({
				type: 'past-night',
				hours: hoursPassed - 12,
				color: '#BEBEBE',
				label: 'Past (Night)',
				startAngle: 180,
				endAngle: 180 + calculateAngle(hoursPassed - 12)
			});
		}

		// Create time blocks for planning
		timeBlocks = [];

		// Current status block
		timeBlocks.push({
			type: inSleepTime ? 'sleeping' : 'awake',
			label: inSleepTime ? 'Currently Sleeping' : 'Currently Awake',
			color: inSleepTime ? '#9370DB' : '#4682B4',
			hours: 0, // Current state, not hours
			urgent: false
		});

		// Remaining tasks blocks
		if (!inSleepTime) {
			if (timeDeficit > 0) {
				timeBlocks.push({
					type: 'warning',
					label: `Time Deficit`,
					color: '#FF6347',
					hours: timeDeficit,
					formatted: formatHours(timeDeficit),
					urgent: true
				});
			}

			timeBlocks.push({
				type: 'work',
				label: 'Work Time Available',
				color: '#4682B4',
				hours: adjustedWorkHours,
				formatted: formatHours(adjustedWorkHours),
				urgent: false
			});

			timeBlocks.push({
				type: 'break',
				label: 'Break Time Available',
				color: '#90EE90',
				hours: adjustedBreakHours,
				formatted: formatHours(adjustedBreakHours),
				urgent: false
			});

			timeBlocks.push({
				type: 'until-bed',
				label: 'Time Until Bed',
				color: '#FFD700',
				hours: hoursBeforeBed,
				formatted: formatHours(hoursBeforeBed),
				urgent: hoursBeforeBed < 1
			});
		}

		// Sleep block
		timeBlocks.push({
			type: 'sleep',
			label: 'Sleep Time',
			color: '#9370DB',
			hours: sleepHours,
			formatted: formatHours(sleepHours),
			urgent: false
		});
	}

	// Update on mount and when props change
	$: {
		updateTimeVisualization();
	}

	// Auto-update current time
	onMount(() => {
		const interval = setInterval(() => {
			currentTime = new Date();
			updateTimeVisualization();
		}, 60000);

		return () => clearInterval(interval);
	});

	// Generate circular markers
	function generateMarkers(count, radius) {
		const markers = [];
		const circumference = 2 * Math.PI * radius;
		const spacing = circumference / count;

		for (let i = 0; i < count; i++) {
			const angle = (i / count) * 360;
			const coords = polarToCartesian(250, 250, radius, angle);
			markers.push({
				x: coords.x,
				y: coords.y,
				active: i < Math.ceil(workHoursNeeded)
			});
		}

		return markers;
	}

	// Generate hour markers
	const hourMarkers = Array.from({ length: 24 }, (_, i) => ({
		hour: i,
		angle: (i / 24) * 360,
		label: i.toString().padStart(2, '0') + ':00'
	}));

	// Generate markers for work/break units
	$: workMarkers = generateMarkers(Math.ceil(workHoursNeeded + breakTimeWanted), 160);
</script>

<div class="day-visualizer">
	<h2>Your Day Visualization</h2>

	<div class="time-info">
		<p class="current-time">Current time: {currentTime.toLocaleTimeString()}</p>
		<p>Hours left in day: {hoursLeft.toFixed(1)} hours</p>
	</div>

	<div class="inputs-container">
		<div class="input-group">
			<label for="work-hours">Work hours needed:</label>
			<input
				id="work-hours"
				type="range"
				min="0"
				max="16"
				step="0.5"
				bind:value={workHoursNeeded}
			/>
			<span>{workHoursNeeded} hours</span>
		</div>

		<div class="input-group">
			<label for="break-time">Break time wanted:</label>
			<input id="break-time" type="range" min="0" max="8" step="0.5" bind:value={breakTimeWanted} />
			<span>{breakTimeWanted} hours</span>
		</div>

		<div class="input-group">
			<label for="sleep-hours">Sleep hours:</label>
			<input id="sleep-hours" type="range" min="4" max="12" step="0.5" bind:value={sleepHours} />
			<span>{sleepHours} hours</span>
		</div>

		<div class="time-inputs">
			<div class="input-group time">
				<label for="bed-time">Bedtime:</label>
				<input id="bed-time" type="time" bind:value={bedTime} />
			</div>

			<div class="input-group time">
				<label for="wake-time">Wake time:</label>
				<input id="wake-time" type="time" bind:value={wakeTime} />
			</div>
		</div>
	</div>

	<div class="visualization-container">
		<svg viewBox="0 0 500 500" class="day-circle">
			<!-- Day arc (top semicircle) -->
			<path d="M 50 250 A 200 200 0 0 1 450 250" fill="none" stroke="#E0E0E0" stroke-width="30" />

			<!-- Night arc (bottom semicircle) -->
			<path d="M 450 250 A 200 200 0 0 1 50 250" fill="none" stroke="#D0D0D0" stroke-width="30" />

			<!-- Time segments -->
			{#each segments as segment}
				<path
					d={describeArc(250, 250, 200, segment.startAngle, segment.endAngle)}
					fill="none"
					stroke={segment.color}
					stroke-width="30"
				/>
			{/each}

			<!-- Work/Break unit circles -->
			{#each workMarkers as marker, i}
				<circle
					cx={marker.x}
					cy={marker.y}
					r="10"
					fill={marker.active
						? i < Math.ceil(workHoursNeeded)
							? '#4682B4'
							: '#90EE90'
						: '#E0E0E0'}
					stroke="#FFF"
					stroke-width="2"
				/>
			{/each}

			<!-- Hour markers -->
			{#each hourMarkers as marker}
				<g transform={`rotate(${marker.angle} 250 250)`}>
					<line x1="250" y1="50" x2="250" y2="70" stroke="#333" stroke-width="2" />
					<text
						x="250"
						y="45"
						text-anchor="middle"
						font-size="12"
						transform={`rotate(${-marker.angle} 250 45)`}
					>
						{marker.label}
					</text>
				</g>
			{/each}

			<!-- Center text -->
			<text x="250" y="240" text-anchor="middle" font-size="16" font-weight="bold">
				{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
			</text>
			<text x="250" y="265" text-anchor="middle" font-size="14">
				{currentTime.toLocaleDateString()}
			</text>
		</svg>

		<div class="time-blocks">
			{#each timeBlocks as block}
				<div class="time-block" class:urgent={block.urgent}>
					<div class="block-color" style="background-color: {block.color};"></div>
					<div class="block-info">
						<div class="block-label">{block.label}</div>
						{#if block.hours > 0}
							<div class="block-hours">{block.formatted}</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.day-visualizer {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			'Open Sans', 'Helvetica Neue', sans-serif;
		max-width: 800px;
		margin: 0 auto;
		padding: 20px;
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.time-info {
		margin-bottom: 20px;
		padding: 15px;
		border-radius: 8px;
		text-align: center;
	}

	.current-time {
		font-size: 1.2em;
		font-weight: 500;
	}

	.inputs-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 15px;
		margin-bottom: 30px;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		margin-bottom: 10px;
	}

	.input-group.time {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.input-group.time label {
		width: 80px;
	}

	label {
		font-weight: 500;
		margin-bottom: 5px;
	}

	input[type='range'] {
		width: 100%;
		margin: 5px 0;
	}

	.time-inputs {
		grid-column: span 2;
		display: flex;
		justify-content: space-between;
		gap: 20px;
	}

	.visualization-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20px;
		align-items: center;
	}

	.day-circle {
		width: 100%;
		height: auto;
	}

	.time-blocks {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.time-block {
		display: flex;
		align-items: center;
		padding: 10px;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}

	.time-block:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.time-block.urgent {
		border-left: 4px solid #ff6347;
	}

	.block-color {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		margin-right: 15px;
	}

	.block-info {
		flex-grow: 1;
	}

	.block-label {
		font-weight: 500;
	}

	.block-hours {
		font-size: 0.9em;
	}

	@media (max-width: 768px) {
		.inputs-container {
			grid-template-columns: 1fr;
		}

		.time-inputs {
			grid-column: span 1;
			flex-direction: column;
			gap: 10px;
		}

		.visualization-container {
			grid-template-columns: 1fr;
		}
	}
</style>
