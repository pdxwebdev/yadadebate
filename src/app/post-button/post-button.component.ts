import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { PostFormComponent } from '../post-form/post-form.component';

@Component({
  selector: 'app-post-button',
  templateUrl: './post-button.component.html',
  styleUrls: ['./post-button.component.scss'],
})
export class PostButtonComponent implements OnInit {
  @Input() parentComponent;
  @Input() staticGroup;
  @Input() group;
  @Input() topic;
  @Input() post;
  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  async modal() {
    let modal = await this.modalCtrl.create({
      component: PostFormComponent,
      componentProps: {
        parentComponent: this.parentComponent,
        parentGroup: this.staticGroup,
        group: this.group,
        topic: this.topic,
        post: this.post
      }
    });
    return await modal.present();
  }

}
