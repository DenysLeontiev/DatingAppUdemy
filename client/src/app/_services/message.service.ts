import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Message } from '../_modules/message';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { User } from '../_models/user';
import { BehaviorSubject, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  baseUrl: string = environment.apiUrl;
  hubUrl: string = environment.hubUrl;

  private hubConnection?: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageSource$ = this.messageThreadSource.asObservable();

  constructor(private httpClient: HttpClient) { }

  createHubConnection(user: User, otherUserName: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + "message?user=" + otherUserName, {accessTokenFactory: () => user.token})
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => {
      console.log(error);
    });

    this.hubConnection.on("RecieveMessageThread", (messageThread) => {
      this.messageThreadSource.next(messageThread);
    });

    this.hubConnection.on("NewMessage", (message) => {
      this.messageSource$.pipe(take(1)).subscribe((messages) => { // take(1) gets an array form this.messageSource$
        this.messageThreadSource.next([...messages, message])
      })
    });
  }

  stopHubConnection() {
    if(this.hubConnection) {
      this.hubConnection.stop().catch((error) => {
        console.log(error);
      })
    }
  }

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append("Container", container);
    return getPaginatedResult<Message[]>(this.baseUrl + "message", params, this.httpClient);
  }

  getMessagesThread(username: string) {
    return this.httpClient.get<Message[]>(this.baseUrl + "message/thread/" + username);
  }

  // SendMessage is what we called method on the server MessageHub.cs class
  async sendMessage(username: string, content: string) { // async guarantees that we return a Promise from this method
    // return this.httpClient.post<Message>(this.baseUrl + 'message', {recipientUsername: username, content: content});
    this.hubConnection?.invoke("SendMessage", {recipientUsername: username, content: content}).catch((error => {
      console.log(error);
    }));
  }
}
