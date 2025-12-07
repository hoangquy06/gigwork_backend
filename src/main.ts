import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import userRoutes = require('./routes/userRoutes')
import jobsRoutes = require('./routes/jobsRoutes')
import applicationsRoutes = require('./routes/applicationsRoutes')
import reviewsRoutes = require('./routes/reviewsRoutes')
import notificationsRoutes = require('./routes/notificationsRoutes')
import profilesRoutes = require('./routes/profilesRoutes')
import authRoutes = require('./routes/authRoutes')
import { AppModule } from './app.module'
const swaggerUi = require('swagger-ui-express')
const path = require('path')
const fs = require('fs')
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  const http = app.getHttpAdapter().getInstance()
  const express = require('express')
  http.use(express.json())
  http.use(express.urlencoded({ extended: true }))
  http.use(userRoutes)
  http.use(jobsRoutes)
  http.use(applicationsRoutes)
  http.use(reviewsRoutes)
  http.use(notificationsRoutes)
  http.use(profilesRoutes)
  http.use(authRoutes)
  const { errorHandler } = require('./middleware/errorHandler')
  http.use(errorHandler)
  http.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(null, { swaggerUrl: '/api/openapi.json', customOptions: { docExpansion: 'list', displayOperationId: true, filter: true, validatorUrl: null } })
  )
  http.get('/api/openapi.json', (req: any, res: any) => {
    res.sendFile(path.resolve(__dirname, 'docs', 'openapi.json'))
  })
  const port = process.env.PORT ? Number(process.env.PORT) : 3000
  await app.listen(port)
}

bootstrap()
