import { config } from 'dotenv';
config();

import '@/ai/flows/image-moderation.ts';
import '@/ai/flows/summarize-reports.ts';
import '@/ai/flows/classify-report.ts';
