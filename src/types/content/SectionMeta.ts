export interface SectionMeta {
  eyebrow?: string
  heading?: string
  subtext?: string
}

export interface ProjectsMeta extends SectionMeta {
  cta_label?: string
  banner_heading?: string
  banner_subtext?: string
  banner_button_text?: string
}

export interface FaqMeta extends SectionMeta {
  extra_text?: string
  extra_cta?: string
}

// Describes one editable field of a section header form
export interface SectionMetaField {
  key: string
  label: string
  multiline?: boolean
}
