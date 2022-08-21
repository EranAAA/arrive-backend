const express = require('express')
const app = express()
const http = require('http').createServer(app)

const cors = require('cors')
const path = require('path')
const cookieParser = require('cookie-parser')

const logger = require('./services/logger.service')
const authRoutes = require('./api/auth/auth.routes')
const userRoutes = require('./api/user/user.routes')
const tripRoutes = require('./api/trip/trip.routes')

// Express App Config
app.use(cookieParser())
app.use(express.json())

if (process.env.NODE_ENV === 'production') {
   // in production the backend serve the frontend after build from public directory. so no problem there
   // Express serve static files on production environment
   app.use(express.static(path.resolve(__dirname, 'public')))
} else {
   // Configuring CORS
   // in development the server need to approve the different port the frontend on. 
   const corsOptions = {
      origin: ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://localhost:3000',],
      credentials: true,
   }
   app.use(cors(corsOptions))
}

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/trip', tripRoutes)

// Last fallback
app.get('/**', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const port = process.env.PORT || 3030
http.listen(port, () => {
   logger.info('Server is running on port: ' + port)
})