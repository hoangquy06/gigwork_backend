"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const userRoutes = require("./routes/userRoutes");
const jobsRoutes = require("./routes/jobsRoutes");
const applicationsRoutes = require("./routes/applicationsRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const profilesRoutes = require("./routes/profilesRoutes");
const profileImagesRoutes = require("./routes/profileImagesRoutes");
const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const devRoutes = require("./routes/devRoutes");
const app_module_1 = require("./app.module");
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const origins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
    app.enableCors({ origin: origins.length > 0 ? origins : true, credentials: true, methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'] });
    app.setGlobalPrefix('api');
    const http = app.getHttpAdapter().getInstance();
    const express = require('express');
    const cors = require('cors');
    http.use(express.json());
    http.use(express.urlencoded({ extended: true }));
    http.use(cors({ origin: origins.length > 0 ? origins : true, credentials: true, methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'] }));
    http.use(userRoutes);
    http.use(jobsRoutes);
    http.use(applicationsRoutes);
    http.use(reviewsRoutes);
    http.use(notificationsRoutes);
    http.use(profilesRoutes);
    http.use(profileImagesRoutes);
    http.use(authRoutes);
    http.use(healthRoutes);
    http.use(devRoutes);
    const { errorHandler } = require('./middleware/errorHandler');
    http.use(errorHandler);
    http.use('/api/docs', swaggerUi.serve, swaggerUi.setup(null, { swaggerUrl: '/api/openapi.json', customOptions: { docExpansion: 'list', displayOperationId: true, filter: true, validatorUrl: null } }));
    http.get('/api/openapi.json', (req, res) => {
        const candidates = [
            path.resolve(process.cwd(), 'src', 'docs', 'openapi.json'),
            path.resolve(process.cwd(), 'dist', 'docs', 'openapi.json'),
            path.resolve(process.cwd(), 'docs', 'openapi.json')
        ];
        const found = candidates.find((p) => fs.existsSync(p));
        if (found)
            return res.sendFile(found);
        return res.status(404).json({ message: 'openapi.json not found', paths: candidates });
    });
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map