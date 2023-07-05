import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Message } from '../_modules/message';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  baseUrl: string = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append("Container", container);
    return getPaginatedResult<Message[]>(this.baseUrl + "message", params, this.httpClient);
  }

  getMessagesThread(username: string) {
    return this.httpClient.get<Message[]>(this.baseUrl + "message/thread/" + username);
  }

  sendMessage(username: string, content: string) {
    return this.httpClient.post<Message>(this.baseUrl + 'message', {recipientUsername: username, content: content});
  }
}
