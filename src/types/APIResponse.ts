// The Sainly Studio API returns resources directly (arrays / objects) and wraps
// mutations of single-document sections as { success, data }.
export interface APIResponseWithData<T> {
  success: boolean
  data: T
}

export interface APIResponseSuccess {
  success: boolean
  message?: string
}

export interface APIErrorResponse {
  message: string
  status?: number
  data?: { error?: string; message?: string } | null
}
