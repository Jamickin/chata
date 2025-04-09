<script>
	import { onMount } from 'svelte';

	// Using $props() instead of export
	let {
		variant = 'gradient', // "gradient", "particles", "waves", "grid"
		opacity = 0.1, // 0.0 to 1.0
		animated = true,
		colorScheme = 'blue' // "blue", "purple", "green", "amber", "pink"
	} = $props();

	// Color schemes mapping
	const colorSchemes = {
		blue: {
			primary: 'rgba(59, 130, 246, 0.7)',
			secondary: 'rgba(37, 99, 235, 0.5)',
			tertiary: 'rgba(96, 165, 250, 0.3)'
		},
		purple: {
			primary: 'rgba(139, 92, 246, 0.7)',
			secondary: 'rgba(124, 58, 237, 0.5)',
			tertiary: 'rgba(167, 139, 250, 0.3)'
		},
		green: {
			primary: 'rgba(16, 185, 129, 0.7)',
			secondary: 'rgba(5, 150, 105, 0.5)',
			tertiary: 'rgba(52, 211, 153, 0.3)'
		},
		amber: {
			primary: 'rgba(251, 191, 36, 0.7)',
			secondary: 'rgba(217, 119, 6, 0.5)',
			tertiary: 'rgba(252, 211, 77, 0.3)'
		},
		pink: {
			primary: 'rgba(236, 72, 153, 0.7)',
			secondary: 'rgba(219, 39, 119, 0.5)',
			tertiary: 'rgba(244, 114, 182, 0.3)'
		}
	};

	const colors = colorSchemes[colorScheme] || colorSchemes.blue;

	let canvasRef;
	let ctx;
	let width = $state(0);
	let height = $state(0);
	let animationFrame;
	let particles = $state([]);
	let lastTime = $state(0);

	// Initialize and resize canvas
	function setupCanvas() {
		if (!canvasRef) return;

		// Get canvas context
		ctx = canvasRef.getContext('2d');

		// Set canvas dimensions
		width = canvasRef.width = window.innerWidth;
		height = canvasRef.height = window.innerHeight;

		// Initialize particles if needed
		if (variant === 'particles') {
			initParticles();
		}

		// Render the first frame
		render();
	}

	// Initialize particles
	function initParticles() {
		particles = [];
		const particleCount = Math.floor((width * height) / 10000); // Density based on screen size

		for (let i = 0; i < particleCount; i++) {
			particles.push({
				x: Math.random() * width,
				y: Math.random() * height,
				radius: Math.random() * 2 + 1,
				color: [colors.primary, colors.secondary, colors.tertiary][Math.floor(Math.random() * 3)],
				speed: Math.random() * 0.5 + 0.1,
				direction: Math.random() * Math.PI * 2
			});
		}
	}

	// Render the canvas based on variant
	function render(timestamp = 0) {
		if (!ctx) return;

		// Calculate delta time
		const deltaTime = timestamp - lastTime;
		lastTime = timestamp;

		// Clear canvas
		ctx.clearRect(0, 0, width, height);

		// Draw based on variant
		switch (variant) {
			case 'gradient':
				drawGradient(deltaTime);
				break;
			case 'particles':
				drawParticles(deltaTime);
				break;
			case 'waves':
				drawWaves(deltaTime);
				break;
			case 'grid':
				drawGrid(deltaTime);
				break;
			default:
				drawGradient(deltaTime);
		}

		// Request next frame if animated
		if (animated) {
			animationFrame = requestAnimationFrame(render);
		}
	}

	// Draw animated gradient
	function drawGradient(deltaTime) {
		const time = Date.now() * 0.001;

		// Create gradient
		const gradient = ctx.createRadialGradient(
			width * (0.5 + 0.2 * Math.sin(time * 0.2)),
			height * (0.5 + 0.1 * Math.cos(time * 0.3)),
			0,
			width * 0.5,
			height * 0.5,
			Math.max(width, height) * (0.6 + 0.2 * Math.sin(time * 0.1))
		);

		gradient.addColorStop(0, colors.tertiary);
		gradient.addColorStop(0.5, colors.secondary);
		gradient.addColorStop(1, colors.primary);

		ctx.globalAlpha = opacity;
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);
	}

	// Draw and update particles
	function drawParticles(deltaTime) {
		ctx.globalAlpha = opacity;

		particles.forEach((particle) => {
			// Draw particle
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
			ctx.fillStyle = particle.color;
			ctx.fill();

			if (animated) {
				// Update position
				particle.x += Math.cos(particle.direction) * particle.speed;
				particle.y += Math.sin(particle.direction) * particle.speed;

				// Bounce off edges
				if (particle.x < 0 || particle.x > width) {
					particle.direction = Math.PI - particle.direction;
				}
				if (particle.y < 0 || particle.y > height) {
					particle.direction = -particle.direction;
				}

				// Random direction change
				if (Math.random() < 0.01) {
					particle.direction += (Math.random() - 0.5) * 0.2;
				}
			}
		});

		// Draw connection lines between nearby particles
		ctx.globalAlpha = opacity * 0.5;
		ctx.strokeStyle = colors.secondary;
		ctx.lineWidth = 0.5;

		for (let i = 0; i < particles.length; i++) {
			for (let j = i + 1; j < particles.length; j++) {
				const dx = particles[i].x - particles[j].x;
				const dy = particles[i].y - particles[j].y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < 100) {
					ctx.beginPath();
					ctx.moveTo(particles[i].x, particles[i].y);
					ctx.lineTo(particles[j].x, particles[j].y);
					ctx.stroke();
				}
			}
		}
	}

	// Draw animated waves
	function drawWaves(deltaTime) {
		const time = Date.now() * 0.001;
		ctx.globalAlpha = opacity;

		// Number of waves
		const waveCount = 3;

		for (let w = 0; w < waveCount; w++) {
			const waveColor = [colors.primary, colors.secondary, colors.tertiary][w % 3];
			const frequency = 0.01 - 0.002 * w;
			const amplitude = 20 + w * 10;
			const speed = 0.1 + w * 0.05;
			const offset = w * 50;

			ctx.beginPath();
			ctx.moveTo(0, height / 2);

			for (let x = 0; x < width; x += 5) {
				const y =
					height / 2 +
					amplitude * Math.sin(x * frequency + time * speed) +
					(amplitude / 2) * Math.sin(x * frequency * 2 + time * speed * 1.5);
				ctx.lineTo(x, y + offset);
			}

			ctx.lineTo(width, height);
			ctx.lineTo(0, height);
			ctx.closePath();

			ctx.fillStyle = waveColor;
			ctx.fill();
		}
	}

	// Draw animated grid
	function drawGrid(deltaTime) {
		const time = Date.now() * 0.001;
		ctx.globalAlpha = opacity;

		// Grid properties
		const cellSize = 50;
		const lineWidth = 1;

		// Offset based on time
		const offsetX = 10 * Math.sin(time * 0.2);
		const offsetY = 10 * Math.cos(time * 0.3);

		// Draw vertical lines
		ctx.strokeStyle = colors.secondary;
		ctx.lineWidth = lineWidth;

		for (let x = 0; x < width; x += cellSize) {
			const wobbleX = x + offsetX * Math.sin(x * 0.01 + time);

			ctx.beginPath();
			ctx.moveTo(wobbleX, 0);
			ctx.lineTo(wobbleX, height);
			ctx.stroke();
		}

		// Draw horizontal lines
		for (let y = 0; y < height; y += cellSize) {
			const wobbleY = y + offsetY * Math.sin(y * 0.01 + time);

			ctx.beginPath();
			ctx.moveTo(0, wobbleY);
			ctx.lineTo(width, wobbleY);
			ctx.stroke();
		}

		// Draw intersection points
		ctx.fillStyle = colors.primary;

		for (let x = 0; x < width; x += cellSize) {
			for (let y = 0; y < height; y += cellSize) {
				const wobbleX = x + offsetX * Math.sin(x * 0.01 + time);
				const wobbleY = y + offsetY * Math.sin(y * 0.01 + time);

				ctx.beginPath();
				ctx.arc(wobbleX, wobbleY, 2, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}

	onMount(() => {
		setupCanvas();

		// Resize handler
		const handleResize = () => {
			width = canvasRef.width = window.innerWidth;
			height = canvasRef.height = window.innerHeight;

			if (variant === 'particles') {
				initParticles();
			}

			if (!animated) {
				render();
			}
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});
</script>

<canvas bind:this={canvasRef} class="fixed top-0 left-0 -z-10 w-full h-full pointer-events-none"
></canvas>
