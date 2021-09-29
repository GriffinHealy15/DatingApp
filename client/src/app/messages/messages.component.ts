import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from '../_models/message';
import { Pagination } from '../_models/pagination';
import { ConfirmService } from '../_services/confirm.service';
import { MessageService } from '../_services/message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[] = [];
  pagination: Pagination;
  container = 'Inbox';
  pageNumber = 1;
  pageSize = 5;
  loading = false;
  messageIds = [];
  checkAll = false;
  public checkboxValue: boolean;
  allSelected = false;
  constructor(private messageService: MessageService, private confirmService: ConfirmService,
    private router: Router) { }

  ngOnInit(): void {
    this.loadMessages();
    this.messageIds = [];
    this.checkAll = false;
  }

  loadMessages() {
    this.loading = true;
    this.messageService.getMessages(this.pageNumber, this.pageSize, this.container).subscribe(response => {
      this.messages = response.result;
      this.pagination = response.pagination;
      this.loading = false;
    })
  }

  deleteMessage(id: number) {
    this.confirmService.confirm('Confirm delete message', 'This cannot be undone').subscribe(result => {
      if (result) {
        this.messageService.deleteMessage(id).subscribe(() => {
          this.messages.splice(this.messages.findIndex(m => m.id == id), 1);
        })
      }
    })
  }

  markMessagesRead() {
    this.messageService.markMessagesRead(this.messageIds).subscribe(() => {
      let ele1 = document.getElementById("flexCheckDefaultAll") as HTMLInputElement;
      ele1.checked = false;
      this.allSelected = false;
      this.ngOnInit();
    })
  }

  checkMessageRead(id: number) {
    if (!this.messageIds.includes(id)) {
      this.messageIds.push(id);
      this.allSelected = true;
    } else {
      const index = this.messageIds.indexOf(id);
      if (index > -1) {
        this.messageIds.splice(index, 1);
      }
    }
    if (this.messageIds.length == 0) {
      this.allSelected = false;
    }
  }

  checkAllMessagesRead() {
    let ele = document.getElementById("flexCheckDefault") as HTMLInputElement;
    if (this.checkAll == false) {
      this.messageIds = [];
      for (let i = 0; i < this.messages.length; i++) {
        this.messageIds.push(this.messages[i].id);
      }
    }
    if (this.checkAll == true) {
      this.messageIds = [];
    }
    if (this.checkAll == false) {
      for (let x = 0; x < this.messages.length; x++) {
        ele = document.getElementById(`flexCheckDefault${this.messages[x].id}`) as HTMLInputElement;
        ele.checked = true;
      }
      this.allSelected = true;
      this.checkAll = true;
    } else if (this.checkAll == true) {
      for (let x = 0; x < this.messages.length; x++) {
        ele = document.getElementById(`flexCheckDefault${this.messages[x].id}`) as HTMLInputElement;
        ele.checked = false;
      }
      this.allSelected = false;
      this.checkAll = false;
    }
  }

  pagedChanged(event: any) {
    this.pageNumber = event.page;
    this.loadMessages();
  }

}
