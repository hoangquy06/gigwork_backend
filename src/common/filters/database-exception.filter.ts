import { ArgumentsHost, BadRequestException, ConflictException, ExceptionFilter, Catch } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const err: any = exception;
    const code: string | undefined = err?.driverError?.code;
    if (code === '23505') {
      const message = 'Xung đột dữ liệu';
      const detail = err?.driverError?.detail;
      res.status(409).json({ statusCode: 409, message, detail });
      return;
    }
    if (code === '22P02') {
      res.status(400).json({ statusCode: 400, message: 'Dữ liệu không hợp lệ', code });
      return;
    }
    res.status(400).json({ statusCode: 400, message: 'Lỗi cơ sở dữ liệu', code, detail: err?.driverError?.detail });
  }
}