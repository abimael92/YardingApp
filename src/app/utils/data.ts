// app/utils/data.ts
export interface Service {
	id: number;
	title: string;
	category: string;
	description: string;
	price: string;
	duration: string;
	features: string[];
	image: string;
}

export interface Testimonial {
	id: number;
	name: string;
	location: string;
	rating: number;
	comment: string;
	date: string;
}

export const services: Service[] = [
	{
		id: 1,
		title: 'Lawn Care & Maintenance',
		category: 'Lawn Care',
		description:
			'Comprehensive lawn care including mowing, edging, trimming, and seasonal treatments.',
		price: 'Starting at $75/visit',
		duration: '1-3 hours',
		features: [
			'Weekly/Bi-weekly service',
			'Edging & trimming',
			'Leaf removal',
			'Seasonal treatments',
		],
		image: '/images/lawn-care.jpg',
	},
	{
		id: 2,
		title: 'Tree Services & Pruning',
		category: 'Tree Services',
		description:
			'Expert tree care including pruning, shaping, removal, and health assessments.',
		price: 'Starting at $150/hour',
		duration: '2-8 hours',
		features: [
			'Tree pruning & shaping',
			'Tree removal',
			'Stump grinding',
			'Health assessments',
		],
		image: '/images/tree-services.jpg',
	},
	// Add more services...
];

export const testimonials: Testimonial[] = [
	{
		id: 1,
		name: 'Sarah Johnson',
		location: 'Phoenix, AZ',
		rating: 5,
		comment:
			'Exceptional service! The team transformed our desert landscape into a beautiful, water-efficient garden.',
		date: '1/9/2024',
	},
	{
		id: 2,
		name: 'Michael Chen',
		location: 'Scottsdale, AZ',
		rating: 5,
		comment:
			'Professional, reliable, and knowledgeable. Our irrigation system works perfectly now.',
		date: '1/7/2024',
	},
	// Add more testimonials...
];
