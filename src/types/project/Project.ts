export interface Project {
  title: string
  slug: string
  category: string
  description: string
  image: string
  technologies: string[]
  liveUrl: string
  githubUrl: string
  challenge: string
  solution: string
  features: string[]
}

export interface ProjectView extends Project {
  id: string
  sort_order: number
}
