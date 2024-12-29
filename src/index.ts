import express from 'express';
import swaggerUi from 'swagger-ui-express';
import type { Request, Response } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Chat API Documentation',
      version: '1.0.0',
      description: 'API documentation for AI chat interactions',
    },
    servers: [
      {
        url: 'http://localhost:3001',
      },
    ],
    components: {
      schemas: {
        ChatRequest: {
          type: 'object',
          required: ['message', 'context'],
          properties: {
            message: {
              type: 'string',
              description: 'User input message'
            },
            context: {
              type: 'object',
              description: 'Additional context for AI processing'
            }
          }
        },
        ChatResponse: {
          type: 'object',
          properties: {
            response: {
              type: 'string',
              description: 'AI generated response'
            },
            metadata: {
              type: 'object',
              description: 'Additional information about the response'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Test endpoint
app.get('/test', (req: Request, res: Response) => {
  console.log('Test endpoint hit!');
  res.json({ message: 'Server is working!' });
});

interface ChatRequest {
  message: string;
  context: Record<string, unknown>;
}

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send a message to the AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 */
app.post('/api/chat', [
  body('message').isString().notEmpty(),
  body('context').isObject(),
], async (req: Request<{}, {}, ChatRequest>, res: Response) => {
  try {
    console.log('Received request body:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, context } = req.body;
    console.log('Processing message:', message);
    console.log('With context:', context);

    // AI processing logic would go here
    const response = {
      response: "AI response would go here",
      metadata: {
        processed_at: new Date().toISOString(),
        request_message: message,
        request_context: context
      }
    };

    console.log('Sending response:', response);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      error: 'AI processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
});