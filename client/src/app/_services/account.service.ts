import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs'
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { PresenceService } from './presence.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl: string = environment.apiUrl;
  private currentUserSource = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSource.asObservable();

  constructor(private httpClient: HttpClient, private presenceService: PresenceService) { }

  login(user:any){
    return this.httpClient.post<User>(this.baseUrl + 'account/login', user).pipe(
      map((response: User) => {
        const user = response;
        if(user){
          this.setCurrentUser(user);
        }
      })
    )
  }

  register(user:any){
    return this.httpClient.post<User>(this.baseUrl + 'account/register', user).pipe(
      map((response:User) => {
        const user = response;
        if(user)
        {
          this.setCurrentUser(user);
        }
        return user;
      })
    );
  };

  setCurrentUser(user: User) {
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role; // get current user's roles  
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles); // set user's roles
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);

    this.presenceService.createHubConnection(user); // start hub connection
  }

  logout(){
    localStorage.removeItem('user');
    this.currentUserSource.next(null);

    this.presenceService.stopHubConnection(); // stop hub connection
  }

  getDecodedToken(token: string) {
    return JSON.parse(atob(token.split('.')[1])); // decodes from base 64 to string(get the middle of JWT, because that store all information we need(roles,username etc.))
  }
}
