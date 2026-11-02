import axios from 'axios'

const LOCAL_API_URL = 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || LOCAL_API_URL,
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const esRutaPublica = config.url?.includes('contacto')

  if (!esRutaPublica) {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
}, (error) => Promise.reject(error))

export default api

