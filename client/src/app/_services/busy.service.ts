import { Injectable } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";

@Injectable({
  providedIn: 'root'
})
export class BusyService {
  busyRequestCount: number = 0;

  constructor(private ngxSpinner: NgxSpinnerService) { }

  busy(){
    this.busyRequestCount++;
    this.ngxSpinner.show(undefined, {
      type: 'timer',
      bdColor: 'rgba(255,255,255,1)',
      color: '#333333'
    })
  }

  idle(){
    this.busyRequestCount--;
    if(this.busyRequestCount <= 0){
      this.busyRequestCount = 0;
      this.ngxSpinner.hide();
    }
  }
}
