import type { Service, Task, Worker, Testimonial } from "@/src/domain/models"

export const services: Service[] = [
  {
    id: "1",
    name: "Lawn Care & Maintenance",
    description:
      "Comprehensive lawn care including mowing, edging, trimming, and seasonal treatments.",
    image:
      "https://readdy.ai/api/search-image?query=Beautiful%20Arizona%20lawn%20care%20service%20with%20professional%20mowing%20equipment%20in%20desert%20residential%20setting%2C%20lush%20green%20grass%2C%20modern%20landscaping%20tools%2C%20natural%20outdoor%20lighting&width=600&height=400&seq=service1&orientation=landscape",
    category: "Lawn Care",
    categoryColor: "emerald",
    price: "Starting at $75/visit",
    duration: "1-3 hours",
    features: [
      "Weekly/Bi-weekly service",
      "Edging & trimming",
      "Leaf removal",
      "Seasonal treatments",
    ],
  },
  {
    id: "2",
    name: "Tree Services & Pruning",
    description:
      "Expert tree care including pruning, shaping, removal, and health assessments.",
    image:
      "https://readdy.ai/api/search-image?query=Professional%20tree%20service%20crew%20working%20on%20large%20desert%20trees%20in%20Arizona%20residential%20area%2C%20safety%20equipment%2C%20pruning%20tools%2C%20natural%20desert%20landscaping%20background&width=600&height=400&seq=service2&orientation=landscape",
    category: "Tree Services",
    categoryColor: "green",
    price: "Starting at $150/hour",
    duration: "2-8 hours",
    features: [
      "Tree pruning & shaping",
      "Tree removal",
      "Stump grinding",
      "Health assessments",
    ],
  },
  {
    id: "3",
    name: "Desert Landscaping",
    description:
      "Native plant installation and drought-resistant landscape design for Arizona homes.",
    image:
      "https://readdy.ai/api/search-image?query=Stunning%20Arizona%20desert%20landscape%20design%20with%20native%20cacti%2C%20succulents%2C%20decorative%20rocks%2C%20and%20modern%20residential%20home%2C%20professional%20landscaping%2C%20natural%20desert%20beauty&width=600&height=400&seq=service3&orientation=landscape",
    category: "Landscaping",
    categoryColor: "sage",
    price: "Starting at $500/project",
    duration: "1-3 days",
    features: [
      "Native plant selection",
      "Drought-resistant design",
      "Decorative rock installation",
      "Low-maintenance solutions",
    ],
  },
  {
    id: "4",
    name: "Irrigation Systems",
    description:
      "Water-efficient irrigation installation, repair, and maintenance services.",
    image:
      "https://readdy.ai/api/search-image?query=Modern%20irrigation%20system%20installation%20in%20Arizona%20desert%20garden%2C%20drip%20irrigation%2C%20sprinkler%20heads%2C%20water%20conservation%20technology%2C%20professional%20installation%20work&width=600&height=400&seq=service4&orientation=landscape",
    category: "Irrigation",
    categoryColor: "blue",
    price: "Starting at $200/zone",
    duration: "Half day",
    features: [
      "Drip irrigation systems",
      "Sprinkler installation",
      "System repairs",
      "Water conservation",
    ],
  },
  // {
  //   id: "5",
  //   name: "Hardscaping & Patios",
  //   description:
  //     "Custom hardscaping solutions including patios, walkways, and retaining walls.",
  //   image:
  //     "https://readdy.ai/api/search-image?query=Beautiful%20Arizona%20hardscaping%20project%20with%20flagstone%20patio%2C%20decorative%20retaining%20wall%2C%20desert%20landscape%2C%20professional%20stonework%2C%20residential%20outdoor%20living%20space&width=600&height=400&seq=service5&orientation=landscape",
  //   category: "Hardscaping",
  //   categoryColor: "stone",
  //   price: "Starting at $25/sq ft",
  //   duration: "2-5 days",
  //   features: [
  //     "Custom patio design",
  //     "Walkway installation",
  //     "Retaining walls",
  //     "Fire pit construction",
  //   ],
  // },
]

export const tasks: Task[] = [
  {
    id: "1",
    title: "Weekly Lawn Maintenance - Johnson Residence",
    description: "Mow, edge, and trim lawn. Remove clippings.",
    status: "pending",
    priority: "medium",
    assignedTo: "Mike Rodriguez",
    dueDate: "2025-01-15",
    location: "1234 Desert View Dr, Phoenix, AZ",
    estimatedDuration: "2 hours",
  },
  {
    id: "2",
    title: "Landscape Installation - Smith Property",
    description: "Install new desert landscaping with native plants",
    status: "in-progress",
    priority: "high",
    assignedTo: "Sarah Chen",
    dueDate: "2025-01-18",
    location: "5678 Cactus Rd, Phoenix, AZ",
    estimatedDuration: "6 hours",
  },
  {
    id: "3",
    title: "Tree Trimming - Office Complex",
    description: "Trim palm trees and remove dead branches",
    status: "completed",
    priority: "low",
    assignedTo: "David Wilson",
    dueDate: "2025-01-12",
    location: "9012 Business Blvd, Phoenix, AZ",
    estimatedDuration: "4 hours",
  },
]

export const workers: Worker[] = [
  {
    id: "1",
    name: "Mike Rodriguez",
    role: "Lawn Specialist",
    avatar: "/professional-lawn-worker.jpg",
    status: "available",
    rating: 4.8,
    completedTasks: 156,
  },
  {
    id: "2",
    name: "Sarah Chen",
    role: "Landscape Designer",
    avatar: "/female-landscape-designer.jpg",
    status: "busy",
    rating: 4.9,
    completedTasks: 89,
  },
  {
    id: "3",
    name: "David Wilson",
    role: "Tree Specialist",
    avatar: "/tree-specialist-worker.jpg",
    status: "available",
    rating: 4.7,
    completedTasks: 203,
  },
]

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Jennifer Martinez",
    role: "Homeowner",
    content:
      "J&J Desert Landscaping transformed our backyard into a desert oasis. Their attention to detail and professionalism is unmatched.",
    rating: 5,
    avatar: "/happy-female-customer.jpg",
  },
  {
    id: "2",
    name: "Robert Thompson",
    role: "Property Manager",
    content:
      "We've been using J&J Desert Landscaping for our commercial properties for 3 years. Always reliable and high-quality work.",
    rating: 5,
    avatar: "/professional-male-property-manager.jpg",
  },
  {
    id: "3",
    name: "Lisa Park",
    role: "Business Owner",
    content:
      "The team at J&J Desert Landscaping helped us create a welcoming entrance for our customers. Highly recommend their services!",
    rating: 5,
    avatar: "/asian-business-woman.png",
  },
]
