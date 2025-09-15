// app/components/TestimonialCard.tsx
interface Testimonial {
  id: number
  name: string
  location: string
  rating: number
  comment: string
  date: string
}

interface TestimonialCardProps {
  testimonial: Testimonial
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="card h-full">
      <div className="flex items-center mb-4">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-5 h-5 flex items-center justify-center">
              <span className="ri-star-fill text-yellow-400"></span>
            </div>
          ))}
        </div>
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">5.0</span>
      </div>

      <blockquote className="text-gray-700 dark:text-gray-300 mb-6 italic">
        &quot;{testimonial.comment}&quot;
      </blockquote>

      <div className="mt-auto">
        <div className="font-semibold text-gray-900 dark:text-white">
          {testimonial.name}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {testimonial.location}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {testimonial.date}
        </div>
      </div>
    </div>
  )
}