// API utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const api = {
  // Auth endpoints
  login: `${API_BASE_URL}/api/auth/login`,
  signup: `${API_BASE_URL}/api/auth/signup`,
  
  // User endpoints
  dashboard: `${API_BASE_URL}/api/users/dashboard`,
  
  // Tour endpoints
  tours: `${API_BASE_URL}/api/tours`,
  tourById: (id: string) => `${API_BASE_URL}/api/tours/${id}`,
  tourByShareUrl: (shareUrl: string) => `${API_BASE_URL}/api/tours/share/${shareUrl}`,
}

export default api
