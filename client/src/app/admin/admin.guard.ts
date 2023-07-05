import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, map, of } from 'rxjs';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate { // route guards automatically subscribes and unsubscribes to observables

  constructor(private accountService: AccountService, private toastr: ToastrService) {

  }

  canActivate(): Observable<boolean> {
    return this.accountService.currentUser$.pipe(
      map(user => {
        if (!user) return false; // check whether we have user
        if (user.roles.includes("Admin") || user.roles.includes("Moderator")) { // check if that user has particular roles
          return true; // true,if does
        }
        else {
          this.toastr.error("Can't enter this area");
          return false; // false, if doesn't
        }
      })
    )
  }

}
