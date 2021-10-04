import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  messagesTemp: Message[] = [];
  pagination: Pagination;
  container = 'Inbox';
  pageNumber = 1;
  pageSize = 5;
  loading = false;
  messageIds = [];
  checkAll = false;
  public checkboxValue: boolean;
  allSelected = false;
  totalAllMail: number;
  totalInboxMail: number;
  totalOutboxMail: number;
  totalAllMailUnread: number;
  totalInboxUnread: number;
  totalOutboxUnread: number;
  Math = Math;
  constructor(private messageService: MessageService, private confirmService: ConfirmService,
    private router: Router, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadMessages();
    this.loadMessagesInit();
    this.messageIds = [];
    this.checkAll = false;
    this.allSelected = false;
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  loadMessagesInit() {
    this.loading = true;
    this.messageService.getMessages(this.pageNumber, this.pageSize, 'AllMail').subscribe(response => {
      this.pagination = response.pagination;
      this.totalAllMail = this.pagination.totalItems;
    })
    this.messageService.getMessages(this.pageNumber, this.pageSize, 'AllMailUnread').subscribe(response => {
      this.totalAllMailUnread = response.pagination.totalItems;
    })
    this.messageService.getMessages(this.pageNumber, this.pageSize, 'Inbox').subscribe(response => {
      this.pagination = response.pagination;
      this.totalInboxMail = this.pagination.totalItems;
    })
    this.messageService.getMessages(this.pageNumber, this.pageSize, 'InboxUnread').subscribe(response => {
      this.totalInboxUnread = response.pagination.totalItems;
    })
    this.messageService.getMessages(this.pageNumber, this.pageSize, 'Outbox').subscribe(response => {
      this.pagination = response.pagination;
      this.totalOutboxMail = this.pagination.totalItems;
    })
    this.messageService.getMessages(this.pageNumber, this.pageSize, 'OutboxUnread').subscribe(response => {
      this.totalOutboxUnread = response.pagination.totalItems;
    })
  }

  loadMessages() {
    this.loading = true;
    this.messageService.getMessages(this.pageNumber, this.pageSize, this.container).subscribe(response => {
      this.messages = response.result;
      this.pagination = response.pagination;
      if (this.container == 'AllMail') {
        this.totalAllMail = this.pagination.totalItems;
      }
      if (this.container == 'Inbox') {
        this.totalInboxMail = this.pagination.totalItems;
      }
      if (this.container == 'Outbox') {
        this.totalOutboxMail = this.pagination.totalItems;
      }
      this.loading = false;
      this.allSelected = false;
      this.checkAll = false;
      this.messageIds = [];

      let ele1 = document.getElementById(`flexCheckDefaultAll${this.container}`) as HTMLInputElement;
      if (ele1 != null) {
        ele1.checked = false;
      }

    })
  }

  deleteMessage(id: number) {
    this.confirmService.confirm('Confirm delete message', 'This cannot be undone').subscribe(result => {
      if (result) {
        this.messageService.deleteMessage(id).subscribe(() => {
          this.messages.splice(this.messages.findIndex(m => m.id == id), 1);
          if (this.container == 'AllMail') {
            this.totalAllMail -= 1;
          }
          if (this.container == 'Inbox') {
            this.totalInboxMail -= 1;
          }
          if (this.container == 'Outbox') {
            this.totalOutboxMail -= 1;
          }
        })
      }
    })
  }

  markMessagesDelete(container: string) {
    this.confirmService.confirm('Confirm delete messages', 'This cannot be undone').subscribe(result => {
      if (result) {
        this.messageService.markMessagesDelete(this.messageIds).subscribe(() => {
          // this.messagesTemp = this.messages;
          // this.messages = [];
          // for (let i = 0; i <= this.messageIds.length; i++) {
          //   this.messagesTemp = this.messagesTemp.filter(m => m.id != this.messageIds[i]);
          // }
          // this.messages = this.messagesTemp;
          let ele1 = document.getElementById(`flexCheckDefaultAll${container}`) as HTMLInputElement;
          ele1.checked = false;
          this.allSelected = false;
          this.ngOnInit();
        })
      }
    })
  }

  markMessagesRead(container: string) {
    let ele1 = document.getElementById(`flexCheckDefaultAll${container}`) as HTMLInputElement;
    console.log(ele1);
    console.log(ele1.checked);
    this.messageService.markMessagesRead(this.messageIds).subscribe(() => {
      let ele1 = document.getElementById(`flexCheckDefaultAll${container}`) as HTMLInputElement;
      ele1.checked = false;
      this.allSelected = false;
      this.ngOnInit();
    })
  }

  markClickedMessagesRead() {
    this.messageService.markMessagesRead(this.messageIds).subscribe(() => {
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

  checkClickedMessageRead(id: number, setDateRead: string) {
    this.messageIds = [];
    this.messageIds.push(id);
    if (setDateRead == "No") {
      this.markClickedMessagesRead();
    }
  }
  checkAllMessagesRead() {
    let ele = document.getElementById("flexCheckDefault") as HTMLInputElement;
    if (this.checkAll
      == false) {
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
