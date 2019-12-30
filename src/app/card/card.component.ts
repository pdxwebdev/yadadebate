import { Component, OnInit, Input } from '@angular/core';
import { NavController } from '@ionic/angular';

declare var Base64;

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
  constructor(
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    if (!this.item && !this.topic) {

    }
  }

  openTopic() {

  }
   
  openGroup() {

  }

  viewProfile() {

  }

  async isolateCard() {
    this.navCtrl.navigateForward('/post?id=' + this.item.id + '&cardType=' + this.cardType)
  }

}
