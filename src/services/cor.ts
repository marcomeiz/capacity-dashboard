import { config } from '../scripts/migrateConfig';
import type { CORTask } from '../types/cor';

export class CORService {
  private accessToken: string | null = null;

  private async getToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    const url = `https://api.projectcor.com/v1/oauth/token?grant_type=client_credentials`;
    const basicCreds = btoa(`${config.cor.apiKey}:${config.cor.clientSecret}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicCreds}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get token: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.access_token) {
      throw new Error('No access token received from COR API');
    }

    this.accessToken = data.access_token;
    return data.access_token; // Devolvemos directamente data.access_token en lugar de this.accessToken

  }

  async getAllTasks(): Promise<CORTask[]> {
    const token = await this.getToken();
    let allTasks: CORTask[] = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      const url = `https://api.projectcor.com/v1/tasks?page=${page}&perPage=${perPage}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }

      const data = await response.json();
      const tasks = data.data as CORTask[];
      
      if (!tasks.length) break;
      
      allTasks = [...allTasks, ...tasks];
      console.log(`Fetched ${allTasks.length} tasks so far...`);
      
      if (tasks.length < perPage) break;
      
      page++;
    }

    return allTasks;
  }
}

export const corService = new CORService();