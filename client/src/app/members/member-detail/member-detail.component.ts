import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { take } from 'rxjs';
import { Member } from 'src/app/_models/member';
import { User } from 'src/app/_models/user';
import { Message } from 'src/app/_modules/message';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';
import { PresenceService } from 'src/app/_services/presence.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('memberTab', { static: true }) memberTabs?: TabsetComponent;
  activeTab?: TabDirective;
  member: Member = {} as Member;
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];

  user?: User; // user, who wants to write a message(we)

  messages: Message[] = [];

  constructor(private membersService: MembersService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    public presenceService: PresenceService,
    private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe((user) => {
      if (user) {
        this.user = user;
      }
    })
  }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe((response) => {
      this.member = response['member'];
    })

    this.activatedRoute.queryParams.subscribe({
      next: params => {
        params['tab'] && this.selectTab(params['tab'])
      }
    })

    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ]
  }

  ngOnDestroy(): void { // when components is closed, we stop hubConnection(in this scenario, we wont load messages);
    this.messageService.stopHubConnection();   
  }

  getImages(): NgxGalleryImage[] {
    const imageUrls = [];
    if (this.member) {
      for (const photo of this.member.photos) {
        imageUrls.push({
          small: photo?.url,
          medium: photo?.url,
          big: photo?.url
        })
      }
    }

    return imageUrls;
  }

  loadMember() {
    const username = this.activatedRoute.snapshot.paramMap.get('username');
    if (username) {
      this.membersService.getMember(username).subscribe((member) => {
        this.member = member;
        this.galleryImages = this.getImages();
      });
    }
  }

  selectTab(heading: string) {
    if (this.memberTabs) {
      this.memberTabs.tabs.find(x => x.heading === heading)!.active = true;
    }
  }

  loadMessages() {
    if (this.member) {
      this.messageService.getMessagesThread(this.member.userName).subscribe((response) => {
        this.messages = response;
      }, error => {
        console.log(error);
      })
    }
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading === 'Messages' && this.user) {
      this.messageService.createHubConnection(this.user, this.member.userName); // load messages through signalR
    } else {
      this.messageService.stopHubConnection();
    }
  }
}
