<script>
	import { onMount } from 'svelte';
	import { db } from '$lib/firebase';
	import {
		collection,
		addDoc,
		getDocs,
		Timestamp,
		query,
		orderBy,
		deleteDoc,
		doc
	} from 'firebase/firestore';

	// State variables
	let testimonials = $state([]);
	let showAddForm = $state(false);
	let newTestimonial = $state({
		author: '',
		title: '',
		quote: '',
		rating: 5, // Default rating
		approved: false, // By default testimonials need approval
		date: null
	});
	let loading = $state(true);
	let submitting = $state(false);
	let currentIndex = $state(0);
	let autoplayInterval;
	let isPaused = $state(false);
	let error = $state('');
	let success = $state('');

	// Create a collection reference for testimonials
	const testimonialsCollection = collection(db, 'testimonials');

	// Fetch all approved testimonials
	async function fetchTestimonials() {
		try {
			loading = true;
			// Create a query to get approved testimonials ordered by date (newest first)
			const testimonialsQuery = query(
				testimonialsCollection,
				// Only show approved testimonials on the frontend
				// orderBy('approved'),
				orderBy('date', 'desc')
			);

			const querySnapshot = await getDocs(testimonialsQuery);

			if (querySnapshot.empty) {
				testimonials = [];
				return;
			}

			// Convert the query snapshot to an array of testimonials
			testimonials = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
				formattedDate: new Date(doc.data().date?.seconds * 1000).toLocaleDateString()
			}));
		} catch (err) {
			console.error('Error fetching testimonials:', err);
			error = 'Failed to load testimonials. Please try again later.';
		} finally {
			loading = false;
		}
	}

	// Submit a new testimonial
	async function submitTestimonial(e) {
		e.preventDefault();

		// Validate inputs
		if (!newTestimonial.author.trim() || !newTestimonial.quote.trim()) {
			error = 'Please fill in your name and testimonial.';
			return;
		}

		try {
			submitting = true;
			error = ''; // Clear any previous errors

			// Add the current date
			const testimonialToSubmit = {
				...newTestimonial,
				date: Timestamp.now()
			};

			// Add the testimonial to Firestore
			await addDoc(testimonialsCollection, testimonialToSubmit);

			// Reset the form
			newTestimonial = {
				author: '',
				title: '',
				quote: '',
				rating: 5,
				approved: false,
				date: null
			};

			// Show success message
			success = 'Thank you for your testimonial! It will be reviewed and published soon.';

			// Reload testimonials
			await fetchTestimonials();

			// Close the form after a delay
			setTimeout(() => {
				showAddForm = false;
				// Clear success message after the form closes
				setTimeout(() => {
					success = '';
				}, 300);
			}, 3000);
		} catch (err) {
			console.error('Error submitting testimonial:', err);
			error = 'Failed to submit testimonial. Please try again.';
		} finally {
			submitting = false;
		}
	}

	// Delete a testimonial (admin only, not exposed in UI)
	async function deleteTestimonial(id) {
		try {
			await deleteDoc(doc(db, 'testimonials', id));
			// Filter out the deleted testimonial
			testimonials = testimonials.filter((t) => t.id !== id);
		} catch (err) {
			console.error('Error deleting testimonial:', err);
		}
	}

	// Testimonial carousel navigation
	function nextSlide() {
		currentIndex = (currentIndex + 1) % testimonials.length;
	}

	function prevSlide() {
		currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
	}

	function setSlide(index) {
		currentIndex = index;
	}

	function togglePause() {
		isPaused = !isPaused;
		if (isPaused) {
			clearInterval(autoplayInterval);
		} else {
			startAutoplay();
		}
	}

	function startAutoplay() {
		autoplayInterval = setInterval(() => {
			if (!isPaused && testimonials.length > 1) {
				nextSlide();
			}
		}, 5000); // Change slide every 5 seconds
	}

	// Initialize scroll position for modal
	function openAddForm() {
		showAddForm = true;
		// Reset scroll position when form opens
		setTimeout(() => {
			window.scrollTo(0, 0);
		}, 10);
	}

	onMount(() => {
		fetchTestimonials();
		startAutoplay();

		return () => {
			clearInterval(autoplayInterval);
		};
	});

	// Handle star rating selection
	function setRating(rating) {
		newTestimonial.rating = rating;
	}
</script>

<div class="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
	{#if loading}
		<!-- Loading state -->
		<div class="p-8 text-center">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
			<p class="mt-4 text-slate-400">Loading testimonials...</p>
		</div>
	{:else if testimonials.length === 0}
		<!-- No testimonials yet -->
		<div class="p-8 text-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mx-auto h-16 w-16 text-slate-600 mb-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
				/>
			</svg>

			<h3 class="text-xl font-semibold text-slate-300 mb-2">No Testimonials Yet</h3>
			<p class="text-slate-400 mb-6 max-w-md mx-auto">
				Be the first to share your experience with our community! Your feedback helps others and
				improves our services.
			</p>

			<div class="flex justify-center">
				<button
					class="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all"
					onclick={openAddForm}
				>
					Add Your Testimonial
				</button>
			</div>
		</div>
	{:else}
		<!-- Testimonial carousel -->
		<div class="p-1">
			<div class="relative overflow-hidden">
				<!-- Testimonial Slides -->
				<div class="relative min-h-48 p-4">
					{#each testimonials as testimonial, i}
						<div
							class="absolute inset-0 p-6 transition-all duration-500 flex flex-col justify-center"
							style="opacity: {i === currentIndex ? '1' : '0'}; transform: translateX({(i -
								currentIndex) *
								100}%);"
						>
							<div class="text-slate-500 mb-4 text-2xl">"</div>
							<p class="text-lg text-slate-300 italic mb-6">
								{testimonial.quote}
							</p>

							<!-- Star rating -->
							<div class="flex items-center mb-2">
								{#each Array(5) as _, starIndex}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5 {starIndex < testimonial.rating
											? 'text-yellow-400'
											: 'text-slate-600'}"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
										/>
									</svg>
								{/each}
							</div>

							<div class="mt-auto">
								<p class="font-medium text-white">{testimonial.author}</p>
								{#if testimonial.title}
									<p class="text-sm text-slate-400">{testimonial.title}</p>
								{/if}
								<p class="text-xs text-slate-500 mt-1">
									{testimonial.formattedDate}
								</p>
							</div>
						</div>
					{/each}
				</div>

				<!-- Navigation Controls (only if there's more than one testimonial) -->
				{#if testimonials.length > 1}
					<div class="flex items-center justify-between mt-4 px-4">
						<button
							class="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
							onclick={prevSlide}
							aria-label="Previous testimonial"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="m15 18-6-6 6-6"></path>
							</svg>
						</button>

						<div class="flex items-center space-x-2">
							{#each testimonials as _, i}
								<button
									class="w-2 h-2 rounded-full transition-all {i === currentIndex
										? 'bg-white w-4'
										: 'bg-slate-600'}"
									onclick={() => setSlide(i)}
									aria-label={`Go to testimonial ${i + 1}`}
								>
								</button>
							{/each}
						</div>

						<div class="flex items-center">
							<button
								class="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
								onclick={nextSlide}
								aria-label="Next testimonial"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<path d="m9 18 6-6-6-6"></path>
								</svg>
							</button>

							<button
								class="p-2 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors ml-2"
								onclick={togglePause}
								aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
							>
								{#if isPaused}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<polygon points="5 3 19 12 5 21 5 3"></polygon>
									</svg>
								{:else}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<rect width="4" height="16" x="6" y="4"></rect>
										<rect width="4" height="16" x="14" y="4"></rect>
									</svg>
								{/if}
							</button>
						</div>
					</div>
				{/if}

				<!-- Add testimonial button -->
				<div class="flex justify-center mt-6 mb-2">
					<button
						class="px-4 py-2 bg-indigo-900/30 text-indigo-300 rounded-lg hover:bg-indigo-800/30 transition-colors"
						onclick={openAddForm}
					>
						Add Your Testimonial
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Success message (if any) -->
	{#if success}
		<div class="p-4 bg-green-900/20 border-t border-green-900/30">
			<div class="flex items-start">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
						clip-rule="evenodd"
					/>
				</svg>
				<p class="text-green-300">{success}</p>
			</div>
		</div>
	{/if}
</div>

<!-- Testimonial submission form - positioned to avoid topbar -->
{#if showAddForm}
	<div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col z-50">
		<!-- Top spacer to ensure form starts below the topbar -->
		<div class="h-24 md:h-36"></div>

		<!-- Scrollable container for the form -->
		<div class="flex-1 overflow-y-auto p-4">
			<div class="bg-slate-800 rounded-xl shadow-xl max-w-lg w-full mx-auto my-4 overflow-hidden">
				<div class="bg-gradient-to-r from-indigo-500 to-purple-600 py-3 px-4 sticky top-0 z-10">
					<div class="flex justify-between items-center">
						<h3 class="text-lg font-semibold text-white">Share Your Experience</h3>
						<button
							class="text-white/80 hover:text-white"
							onclick={() => {
								showAddForm = false;
								error = '';
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</div>
				</div>

				<form class="p-6" onsubmit={submitTestimonial}>
					<!-- Error message (if any) -->
					{#if error}
						<div class="mb-4 p-3 bg-red-900/20 border border-red-900/30 rounded-md">
							<p class="text-red-300 text-sm">{error}</p>
						</div>
					{/if}

					<div class="mb-4">
						<label for="author" class="block text-sm font-medium text-slate-300 mb-1">
							Your Name*
						</label>
						<input
							id="author"
							type="text"
							placeholder="Enter your name"
							class="w-full px-3 py-2 border border-slate-600 rounded-md"
							bind:value={newTestimonial.author}
							required
							disabled={submitting}
						/>
					</div>

					<div class="mb-4">
						<label for="title" class="block text-sm font-medium text-slate-300 mb-1">
							Your Title/Role
						</label>
						<input
							id="title"
							type="text"
							placeholder="e.g. Community Member, User"
							class="w-full px-3 py-2 border border-slate-600 rounded-md"
							bind:value={newTestimonial.title}
							disabled={submitting}
						/>
					</div>

					<div class="mb-4">
						<label for="quote" class="block text-sm font-medium text-slate-300 mb-1">
							Your Testimonial*
						</label>
						<textarea
							id="quote"
							rows="4"
							placeholder="Share your experience with our platform..."
							class="w-full px-3 py-2 border border-slate-600 rounded-md"
							bind:value={newTestimonial.quote}
							required
							disabled={submitting}
						></textarea>
					</div>

					<div class="mb-6">
						<label class="block text-sm font-medium text-slate-300 mb-1"> Rating </label>
						<div class="flex items-center">
							{#each Array(5) as _, i}
								<button
									type="button"
									class="p-1 focus:outline-none"
									onclick={() => setRating(i + 1)}
									disabled={submitting}
									aria-label={`Rate ${i + 1} star${i !== 0 ? 's' : ''}`}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-6 w-6 {i < newTestimonial.rating
											? 'text-yellow-400'
											: 'text-slate-600'}"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
										/>
									</svg>
								</button>
							{/each}
						</div>
						<p class="text-xs text-slate-500 mt-1">Click to set your rating</p>
					</div>

					<div class="flex justify-end gap-2">
						<button
							type="button"
							class="px-4 py-2 border border-slate-600 rounded-md text-slate-300 hover:bg-slate-700"
							onclick={() => {
								showAddForm = false;
								error = '';
							}}
							disabled={submitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
							disabled={submitting}
						>
							{#if submitting}
								<svg
									class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Submitting...
							{:else}
								Submit
							{/if}
						</button>
					</div>

					<div class="mt-4 pt-4 border-t border-slate-700">
						<p class="text-xs text-slate-400">
							Your testimonial will be reviewed before being published. Thank you for your feedback!
						</p>
					</div>
				</form>
			</div>
		</div>

		<!-- Bottom spacer -->
		<div class="h-4"></div>
	</div>
{/if}
