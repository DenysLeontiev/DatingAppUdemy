import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { of, map, take } from 'rxjs'
import { PaginatedResult } from '../_models/pagination';
import { HttpParams } from '@angular/common/http'
import { UserParamas } from '../_models/userParams';
import { AccountService } from './account.service';
import { User } from '../_models/user';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  private members: Member[] = [];
  private baseUrl: string = environment.apiUrl;
  memberCache = new Map();
  user: User | undefined;
  userParams: UserParamas | undefined;

  constructor(private httpClient: HttpClient, private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe((user) => { // take(1) - means we do not need to unsubscribe
      if (user) {
        this.userParams = new UserParamas(user);
        this.user = user;
      }
    })
  }

  getUserParams() {
    return this.userParams;
  }

  setUserParams(params: UserParamas) {
    this.userParams = params;
  }

  resetUserParams() {
    if(this.user) {
      this.userParams = new UserParamas(this.user);
      return this.userParams;
    }

    return;
  }

  getMembers(userParamas: UserParamas) {
    const response = this.memberCache.get(Object.values(userParamas).join('-'));

    if (response) {
      return of(response);
    }

    let params = getPaginationHeaders(userParamas.pageNumber, userParamas.pageSize);

    params = params.append("gender", userParamas.gender);
    params = params.append("minAge", userParamas.minAge);
    params = params.append("maxAge", userParamas.maxAge);
    params = params.append("orderBy", userParamas.orderBy);
    // if(this.members.length > 0) return of(this.members);
    return getPaginatedResult<Member[]>(this.baseUrl + 'users', params, this.httpClient).pipe(
      map((response) => {
        this.memberCache.set(Object.values(userParamas).join('-'), response);
        return response;
      })
    );
  }

  getMember(username: string): Observable<Member> {
    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((member: Member) => member.userName === username);

    if (member) return of(member);

    return this.httpClient.get<Member>(this.baseUrl + "users/" + username);
  }

  getHttpOptions() {
    let userString = localStorage.getItem('user');
    if (!userString) return;
    const user = JSON.parse(userString);
    return {
      header: new HttpHeaders({
        Authorization: "Bearer " + user.token,
      })
    }
  }

  updateMember(member: Member) {
    return this.httpClient.put(this.baseUrl + "users", member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = { ...this.members[index], ...member };
      })
    )
  }

  setMainPhoto(photoId: number) {
    return this.httpClient.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
    return this.httpClient.delete(this.baseUrl + "users/delete-photo/" + photoId);
  }

  addLike(username: string) {
    return this.httpClient.post(this.baseUrl + "likes/" + username, {});
  }

  getLikes(predicate: string, pageNumber: number, pageSize: number) {
    let params = getPaginationHeaders(pageNumber, pageSize); 

    params = params.append('predicate', predicate);

    return getPaginatedResult<Member[]>(this.baseUrl + 'likes', params, this.httpClient);
  }
}
