import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiRequestOptions {
  endpoint: string;
  mockPath: string;
  params?: Record<string, string | number | boolean>;
}

@Injectable()
export class ApiClientService {
  constructor(private readonly http: HttpClient) {}

  get<T>(options: ApiRequestOptions): Observable<T> {
    const url = this.resolveUrl(options);
    return this.http.get<T>(url, { params: this.toHttpParams(options.params) });
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    const url = this.resolveApiUrl(endpoint);
    return this.http.post<T>(url, body);
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    const url = this.resolveApiUrl(endpoint);
    return this.http.put<T>(url, body);
  }

  private resolveUrl(options: ApiRequestOptions): string {
    if (environment.api.useMockApi) {
      return this.resolveMockUrl(options.mockPath);
    }
    return this.resolveApiUrl(options.endpoint);
  }

  private resolveApiUrl(endpoint: string): string {
    const base = environment.api.apiBaseUrl.replace(/\/$/, '');
    const path = endpoint.replace(/^\//, '');
    return `${base}/${path}`;
  }

  private resolveMockUrl(mockPath: string): string {
    const base = environment.api.mockApiBaseUrl.replace(/\/$/, '');
    const path = mockPath.replace(/^\//, '');
    return `${base}/${path}`;
  }

  private toHttpParams(params?: Record<string, string | number | boolean>): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      httpParams = httpParams.set(key, String(value));
    });

    return httpParams;
  }
}

