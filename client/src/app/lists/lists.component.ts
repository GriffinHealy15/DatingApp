import { Component, OnInit } from '@angular/core';
import { Member } from '../_models/member';
import { Pagination } from '../_models/pagination';
import { MembersService } from '../_services/members.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css']
})
export class ListsComponent implements OnInit {
  members: Partial<Member[]>;
  matchesLiked: Partial<Member[]>;
  matchesLikedBy: Partial<Member[]>;
  predicate = 'matches';
  pageNumber = 1;
  pageSize = 5;
  pagination: Pagination;

  constructor(private memberService: MembersService) { }

  ngOnInit(): void {
    this.loadLikes();
    this.loadLikesMatches();
  }

  loadLikes() {
    this.memberService.getLikes(this.predicate, this.pageNumber, this.pageSize).subscribe(response => {
      this.members = response.result;
      this.pagination = response.pagination;
    })
  }

  loadLikesMatches() {
    this.memberService.getLikes('liked', this.pageNumber, this.pageSize).subscribe(response => {
      this.matchesLiked = response.result;
      this.pagination = response.pagination;
    })

    this.memberService.getLikes('likedBy', this.pageNumber, this.pageSize).subscribe(response => {
      this.matchesLikedBy = response.result;
      this.pagination = response.pagination;
    })
    this.members = [];
    if (this.matchesLiked != null && this.matchesLikedBy != null) {
      for (let i = 0; i < this.matchesLikedBy.length; i++) {
        if (this.matchesLiked.filter(u => u.username === this.matchesLikedBy[i].username).length > 0) {
          this.members.push(this.matchesLikedBy[i]);
        }
      }
    }
  }


  pagedChanged(event: any) {
    this.pageNumber = event.page;
    this.loadLikes();
    this.loadLikesMatches();
  }
}
