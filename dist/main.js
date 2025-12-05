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
const authRoutes = require("./routes/authRoutes");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    const http = app.getHttpAdapter().getInstance();
    const express = require('express');
    http.use(express.json());
    http.use(express.urlencoded({ extended: true }));
    http.use(userRoutes);
    http.use(jobsRoutes);
    http.use(applicationsRoutes);
    http.use(reviewsRoutes);
    http.use(notificationsRoutes);
    http.use(profilesRoutes);
    http.use(authRoutes);
    const { errorHandler } = require('./middleware/errorHandler');
    http.use(errorHandler);
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map