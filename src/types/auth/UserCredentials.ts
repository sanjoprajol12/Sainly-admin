export interface UserCredentials {
  username: string
  password: string
}

export interface ChangeCredentialsPayload {
  currentPassword: string
  newUsername?: string
  newPassword?: string
}
