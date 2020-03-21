import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://stresspoc.drolli.fi',
})

export default instance
