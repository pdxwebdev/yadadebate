import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() item;
  @Input() topic;
  @Input() votes;
  @Input() cardType;
  @Input() parentComponent;
  constructor() { }

  ngOnInit() {}

  openTopic() {

  }
   
  openGroup() {

  }

  viewProfile() {
    
  }

}
