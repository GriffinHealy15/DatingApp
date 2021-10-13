import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-learnmore',
  templateUrl: './learnmore.component.html',
  styleUrls: ['./learnmore.component.css']
})
export class LearnmoreComponent implements OnInit {
  @Output() cancelLearnMore = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }


  cancel() {
    console.log("CANCEL");
    this.cancelLearnMore.emit(false);
  }
}
