import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { PostFormComponent } from '../post-form/post-form.component';
import { SettingsService } from '../yadalib/settings.service';
import { HttpClient } from '@angular/common/http';

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
    private modalCtrl: ModalController,
    public settingsService: SettingsService,
    public ahttp: HttpClient
  ) { }

  ngOnInit() { }

  async modal(e) {
    e.preventDefault();
    e.stopPropagation();
    return this.getTopic()
    .then(() => {
      return this.getGroup();
    })
    .then(async () => {
      let modal = await this.modalCtrl.create({
        component: PostFormComponent,
        componentProps: {
          parentComponent: this.parentComponent,
          parentGroup: this.staticGroup,
          group: this.group,
          topic: this.topic,
          post: this.post
        },
        cssClass: 'my-custom-modal-css'
      });
      return await modal.present();
    });
  }

  getTopic() {
    return new Promise((resolve, reject) => {
      if (!this.post) return resolve();
      this.topic = this.settingsService.topics_by_bulletin_secret[this.post.relationship.topic_bulletin_secret];
      if(this.topic) {
        return resolve();
      } else {
        this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/get-topic?id=' + this.post.relationship.topic_bulletin_secret)
        .subscribe((res: any) => {
          this.settingsService.topics_by_bulletin_secret[this.post.relationship.topic_bulletin_secret] = res.result.txn;
          this.topic = res.result.txn;
          return resolve();
        });
      }
    });
  }

  getGroup() {
    return new Promise((resolve, reject) => {
      if (!this.post) return resolve();
      this.group = this.settingsService.groups_by_bulletin_secret[this.post.relationship.their_bulletin_secret];
      if(this.group) {
        return resolve()
      } else {
        this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/get-group?id=' + this.post.relationship.their_bulletin_secret)
        .subscribe((res: any) => {
          this.settingsService.groups_by_bulletin_secret[this.post.relationship.their_bulletin_secret] = res.result.txn;
          this.group = res.result.txn;
          return resolve();
        });
      }
    });
  }

}
