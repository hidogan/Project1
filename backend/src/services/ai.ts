import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerateContentResult } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Gemini API with error checking
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Environment variables loaded:', process.env);
  throw new Error('GEMINI_API_KEY is not set in environment variables. Please check your .env file.');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Default model configuration for cost optimization
const DEFAULT_MODEL = 'gemini-pro';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_TOP_K = 40;
const DEFAULT_TOP_P = 0.95;
const MAX_OUTPUT_TOKENS = 800;

export interface AIServiceResponse {
  content: string;
  model: string;
  provider: 'gemini';
}

interface RequestTemplate {
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
  model: string;
}

export class AIService {
  private static instance: AIService;
  private templates: Map<string, RequestTemplate>;

  private constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Template for detailed training plans (higher creativity, longer output)
    this.templates.set('detailed', {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      model: DEFAULT_MODEL,
    });

    // Template for quick responses (lower creativity, shorter output)
    this.templates.set('quick', {
      temperature: 0.3,
      topK: 20,
      topP: 0.8,
      maxOutputTokens: 400,
      model: DEFAULT_MODEL,
    });

    // Template for creative variations (higher creativity, medium output)
    this.templates.set('creative', {
      temperature: 0.9,
      topK: 60,
      topP: 0.98,
      maxOutputTokens: 600,
      model: DEFAULT_MODEL,
    });
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateTrainingPlan(
    prompt: string,
    templateType: 'detailed' | 'quick' | 'creative' = 'detailed'
  ): Promise<AIServiceResponse> {
    try {
      if (!prompt) {
        throw new Error('Prompt cannot be empty');
      }

      console.log(`Generating training plan with template: ${templateType}`);
      const template = this.templates.get(templateType) || this.templates.get('detailed')!;
      
      console.log('Initializing Gemini model with configuration:', {
        model: template.model,
        temperature: template.temperature,
        maxOutputTokens: template.maxOutputTokens
      });

      const model = genAI.getGenerativeModel({
        model: template.model,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
        generationConfig: {
          temperature: template.temperature,
          topK: template.topK,
          topP: template.topP,
          maxOutputTokens: template.maxOutputTokens,
        },
      });

      const systemPrompt = 'You are a professional swimming coach who creates personalized training plans. Be concise and focused on practical advice.';
      const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}`;
      
      console.log('Sending prompt to Gemini API with length:', fullPrompt.length);

      // Create a timeout promise
      const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000);
      });

      // Race between the API call and timeout
      console.log('Starting API call with timeout...');
      const result = await Promise.race([
        model.generateContent(fullPrompt),
        timeout
      ]) as GenerateContentResult;
      
      console.log('Received raw result from API');
      
      if (!result) {
        console.error('No result received from API');
        throw new Error('No response received from Gemini API');
      }

      console.log('Getting response from result...');
      const response = await result.response;
      console.log('Got response, extracting text...');
      const text = response.text();

      if (!text) {
        console.error('Empty text received from API');
        throw new Error('Empty response received from Gemini API');
      }

      console.log('Successfully generated training plan with length:', text.length);
      const usage = await this.estimateUsage(text);
      console.log('Estimated usage:', usage);

      return {
        content: text,
        model: template.model,
        provider: 'gemini',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error generating training plan:', {
        error: errorMessage,
        templateType,
        promptLength: prompt?.length,
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error // Log the full error object
      });
      
      // Throw a more specific error based on the type
      if (errorMessage.includes('timed out')) {
        throw new Error('The request took too long to complete. Please try again.');
      } else if (errorMessage.includes('fetch')) {
        throw new Error('Failed to connect to the AI service. Please check your internet connection and try again.');
      } else {
        throw new Error(`Failed to create training plan: ${errorMessage}`);
      }
    }
  }

  // Helper method to estimate token usage and costs
  private async estimateUsage(text: string): Promise<{ tokens: number; estimatedCost: number }> {
    // Rough estimation: 1 token ≈ 4 characters
    const estimatedTokens = Math.ceil(text.length / 4);
    // Gemini Pro costs approximately $0.00025 per 1K tokens
    const estimatedCost = (estimatedTokens / 1000) * 0.00025;
    
    return {
      tokens: estimatedTokens,
      estimatedCost,
    };
  }
}

export const aiService = AIService.getInstance(); 