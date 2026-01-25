import { testimonials } from "@/src/data/mockData"
import type { Testimonial } from "@/src/domain/models"

export const getTestimonials = (): Testimonial[] => testimonials
