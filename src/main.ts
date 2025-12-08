import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import userRoutes = require('./routes/userRoutes')
import jobsRoutes = require('./routes/jobsRoutes')
import applicationsRoutes = require('./routes/applicationsRoutes')
import reviewsRoutes = require('./routes/reviewsRoutes')
import notificationsRoutes = require('./routes/notificationsRoutes')
import profilesRoutes = require('./routes/profilesRoutes')
import profileImagesRoutes = require('./routes/profileImagesRoutes')
import authRoutes = require('./routes/authRoutes')
import healthRoutes = require('./routes/healthRoutes')
import { AppModule } from './app.module'
const swaggerUi = require('swagger-ui-express')
const path = require('path')
const fs = require('fs')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const origins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean)
  app.enableCors({ origin: origins.length > 0 ? origins : true, credentials: true, methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'] })
  app.setGlobalPrefix('api')
  const http = app.getHttpAdapter().getInstance()
  const express = require('express')
  const cors = require('cors')
  http.use(express.json())
  http.use(express.urlencoded({ extended: true }))
  http.use(cors({ origin: origins.length > 0 ? origins : true, credentials: true, methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'] }))
  http.use(userRoutes)
  http.use(jobsRoutes)
  http.use(applicationsRoutes)
  http.use(reviewsRoutes)
  http.use(notificationsRoutes)
  http.use(profilesRoutes)
  http.use(profileImagesRoutes)
  http.use(authRoutes)
  http.use(healthRoutes)
  const { errorHandler } = require('./middleware/errorHandler')
  http.use(errorHandler)
  http.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(null, { swaggerUrl: '/api/openapi.json', customOptions: { docExpansion: 'list', displayOperationId: true, filter: true, validatorUrl: null } })
  )
  http.get('/api/openapi.json', (req: any, res: any) => {
    const candidates = [
      path.resolve(process.cwd(), 'src', 'docs', 'openapi.json'),
      path.resolve(process.cwd(), 'dist', 'docs', 'openapi.json'),
      path.resolve(process.cwd(), 'docs', 'openapi.json')
    ]
    const found = candidates.find((p) => fs.existsSync(p))
    if (found) return res.sendFile(found)
    return res.status(404).json({ message: 'openapi.json not found', paths: candidates })
  })
  const port = process.env.PORT ? Number(process.env.PORT) : 3000
  await app.listen(port)
}

bootstrap()
