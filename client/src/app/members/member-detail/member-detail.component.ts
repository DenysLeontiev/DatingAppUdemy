import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryAnimation, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Member } from 'src/app/_models/member';
import { Message } from 'src/app/_modules/message';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';
import { PresenceService } from 'src/app/_services/presence.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTab', {static: true}) memberTabs?:  TabsetComponent;
  activeTab?: TabDirective;
  member: Member = {} as Member;
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];

  messages: Message[] = [];

  constructor(private membersService: MembersService, private activatedRoute: ActivatedRoute, private messageService: MessageService, public presenceService: PresenceService) { }

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

  getImages(): NgxGalleryImage[] {
    const imageUrls = [];
    if(this.member){
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

  loadMember(){
    const username = this.activatedRoute.snapshot.paramMap.get('username');
    if(username)
    {
      this.membersService.getMember(username).subscribe((member) => {
        this.member = member;
        this.galleryImages = this.getImages();
      });
    }
  }

  selectTab(heading: string) {
    if(this.memberTabs) {
      this.memberTabs.tabs.find(x => x.heading === heading)!.active = true;
    }
  }

  loadMessages() {
    if(this.member) {
      this.messageService.getMessagesThread(this.member.userName).subscribe((response) => {
        this.messages = response;
      }, error => {
        console.log(error);
      })
    }
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
    if(this.activeTab.heading === 'Messages') {
      this.loadMessages();
    }
  }
}
