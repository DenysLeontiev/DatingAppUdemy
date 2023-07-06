import { NgFor } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Message } from 'src/app/_modules/message';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @ViewChild('messageForm') messageForm?: NgForm;
  @Input() username: string | null = null;
  // @Input() messages:Message[] = [];
  messageContent = '';

  constructor(public messageService: MessageService) {}

  ngOnInit(): void {
    // this.loadMessages();
  }

  sendMessage() {
    if(this.username) {
      // this.messageService.sendMessage(this.username, this.messageContent).subscribe((response) => {
      //   this.messages.push(response);
      //   this.messageForm?.reset();
      // })
      this.messageService.sendMessage(this.username, this.messageContent).then(() => {
        this.messageForm?.reset();
        console.log("message is sent");
      });
    }
  }
}
