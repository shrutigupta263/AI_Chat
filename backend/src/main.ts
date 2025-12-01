import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app_module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  // In development, allow all origins for flexibility
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  
  app.enableCors({
    origin: isDevelopment ? true : frontendUrl, // Allow all origins in dev, specific in prod
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📡 CORS enabled for: ${isDevelopment ? 'all origins (dev mode)' : frontendUrl}`);
}
bootstrap();
