import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AiService {

  async solve(problem: string) {
    try {

      const response = await axios.post(
        'https://stem-ai-ai-service.onrender.com/solve',
        { problem }
      );

      return response.data;

    } catch (error) {

      return {
        error: 'AI service not available',
      };

    }
  }
}