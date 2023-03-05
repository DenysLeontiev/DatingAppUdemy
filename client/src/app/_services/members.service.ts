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

    let params = this.getPaginationHeaders(userParamas.pageNumber, userParamas.pageSize);

    params = params.append("gender", userParamas.gender);
    params = params.append("minAge", userParamas.minAge);
    params = params.append("maxAge", userParamas.maxAge);
    params = params.append("orderBy", userParamas.orderBy);
    // if(this.members.length > 0) return of(this.members);
    return this.getPaginatedResult<Member[]>(this.baseUrl + 'users', params).pipe(
      map((response) => {
        this.memberCache.set(Object.values(userParamas).join('-'), response);
        return response;
      })
    );
  }

  private getPaginatedResult<T>(url: string, params: HttpParams) {
    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>;
    return this.httpClient.get<T>(url, { observe: 'response', params }).pipe(
      map((response) => {
        if (response.body) {
          paginatedResult.result = response.body;
        }
        const pagination = response.headers.get('Pagination');
        if (pagination) {
          paginatedResult.pagination = JSON.parse(pagination);
        }
        console.log(paginatedResult);
        return paginatedResult;
      })
    );
  }

  private getPaginationHeaders(pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    params = params.append('pageNumber', pageNumber);
    params = params.append("pageSize", pageSize);
    return params;
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
}
