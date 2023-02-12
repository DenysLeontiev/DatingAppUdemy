import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { of, map } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private members: Member[] = [];
  private baseUrl: string = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  getMembers() : Observable<Member[]>{
    if(this.members.length > 0) return of(this.members);
    return this.httpClient.get<Member[]>(this.baseUrl + "users").pipe(
      map((members) => {
        this.members = members;
        return members;
      })
    )
  }

  getMember(username: string) : Observable<Member>
  {
    const member = this.members.find(x => x.userName === username);
    if(member) return of(member);
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

  updateMember(member: Member){
    return this.httpClient.put(this.baseUrl + "users", member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = {...this.members[index], ...member};
      })
    )
  }

  setMainPhoto(photoId: number){
    return this.httpClient.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number){
    return this.httpClient.delete(this.baseUrl + "users/delete-photo/" + photoId);
  }
}
