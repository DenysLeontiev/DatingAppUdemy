import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private baseUrl: string = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  getMembers() : Observable<Member[]>{
    // return this.httpClient.get<Member[]>(this.baseUrl + "users",this.getHttpOptions());
    return this.httpClient.get<Member[]>(this.baseUrl + "users");
  }

  getMember(username: string) : Observable<Member>
  {
    // return this.httpClient.get<Member>(this.baseUrl + "users/" + username, this.getHttpOptions());
    return this.httpClient.get<Member>(this.baseUrl + "users/" + username);
  }

  getHttpOptions(){
    let userString = localStorage.getItem('user');
    if(!userString) return;
    const user = JSON.parse(userString);
    return {
      header: new HttpHeaders({
        Authorization: "Bearer " + user.token,
      })
    }
  }
}
