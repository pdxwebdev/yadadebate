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

  gotoTopic(e, item) {
    e.preventDefault();
    e.stopPropagation();
    this.navCtrl.navigateForward('/topics?id=' + item.relationship.topic_bulletin_secret)
  }
   
  gotoGroup(e, item) {
    e.preventDefault();
    e.stopPropagation();
    this.navCtrl.navigateForward('/communities?id=' + item.relationship.their_bulletin_secret)
  }

  viewProfile() {

  }

  async isolateCard(e) {
    e.preventDefault();
    e.stopPropagation();
    this.navCtrl.navigateForward('/post?id=' + this.item.id + '&cardType=' + this.cardType)
  }

}
