import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'client';
  users:any;
  baseUrl: string = "https://localhost:5001";
  constructor(private httpClient: HttpClient){ }
  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(){
    this.httpClient.get(this.baseUrl + '/api/users').subscribe((response) => {
      this.users = response;
    }, error => {
      console.log(error);
    })
  }
}
