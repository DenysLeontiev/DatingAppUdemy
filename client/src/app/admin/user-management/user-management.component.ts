import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { User } from 'src/app/_models/user';
import { AdminService } from 'src/app/_services/admin.service';
import { RolesModalComponent } from 'src/app/modals/roles-modal/roles-modal.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {

  users: User[] = [];
  bsModalRef: BsModalRef<RolesModalComponent> = new BsModalRef<RolesModalComponent>();

  constructor(private adminService: AdminService, private bsModalService: BsModalService) {

  }

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  getUsersWithRoles() {
    this.adminService.getUsersWithRoles().subscribe((response) => {
      this.users = response;
      console.log(response);
    })
  }

  openRolesModal() {
    const initialState: ModalOptions = {
      initialState: {
        list: [
          'Do Thing',
          'Another Thing',
          'Something else',
        ],
        title: 'Test Modal'
      }
    };
    this.bsModalRef = this.bsModalService.show(RolesModalComponent, initialState);
  }
}
