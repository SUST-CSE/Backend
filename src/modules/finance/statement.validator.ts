import { z } from 'zod';
import { StatementType } from './statement.interface';

export const createStatementSchema = z.object({
  title: z.string({ required_error: 'Title is required' }).min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  fiscalYear: z.string({ required_error: 'Fiscal year is required' }).min(4, 'Invalid fiscal year'),
  statementType: z.nativeEnum(StatementType, { required_error: 'Statement type is required' }),
});

export const updateStatementSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  fiscalYear: z.string().min(4).optional(),
  statementType: z.nativeEnum(StatementType).optional(),
  isPublished: z.boolean().optional(),
});
