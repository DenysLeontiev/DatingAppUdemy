import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {

  hubUrl: string = environment.hubUrl;
  private hubConnection?: HubConnection;

  // we want to subsribe to that observable so we will be notified every time something new happens
  private onlineUsersSource = new BehaviorSubject<string[]>([]);  // init as an empty array
  onlineUsers$ = this.onlineUsersSource.asObservable();

  constructor(private toastr: ToastrService) { }

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder().withUrl(this.hubUrl + "presence", {
      accessTokenFactory: () => user.token // provides an access token to the hub connection. (for server to verify the user`s identity)
    })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => {
      console.log(error);
    });

    // here we listen to methdos which we declared on the server (PresenceHub.cs class)
    this.hubConnection.on("UserIsOnline", (username) => {
      this.toastr.info(username + ' has connected');
    });

    this.hubConnection.on("UserIsOffline", (username) => {
      this.toastr.warning(username + ' has disconnected');
    });

    this.hubConnection.on("GetOnlineUsers", (usernames) => {
      this.onlineUsersSource.next(usernames);
    });
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch((error) => {
      console.log(error);
    });
  }
}
