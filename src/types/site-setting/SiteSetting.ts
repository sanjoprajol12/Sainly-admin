export interface NavLinkItem {
  label: string
  href: string
}

export interface SiteSetting {
  site_title?: string
  meta_description?: string
  logo?: string
  favicon?: string
  og_image?: string
  primary_color?: string
  contact_email?: string
  instagram_url?: string
  whatsapp_number?: string

  // Header
  studio_name?: string
  studio_tagline?: string
  header_cta_text?: string
  header_cta_link?: string
  header_nav_links?: NavLinkItem[]

  // Footer
  footer_title?: string
  footer_tagline?: string
  footer_description?: string
  footer_availability_text?: string
  footer_copyright?: string
  footer_tagline_bottom?: string
  footer_nav_links?: NavLinkItem[]
}
