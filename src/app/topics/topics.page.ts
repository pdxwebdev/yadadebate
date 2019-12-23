import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../yadalib/settings.service';
import { TransactionService } from '../yadalib/transaction.service';
import { GraphService } from '../yadalib/graph.service';
import { BulletinSecretService } from '../yadalib/bulletin-secret.service';
import { HttpClient } from '@angular/common/http';
import { NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { promise } from 'protractor';


declare var foobar;
declare var X25519;
declare var forge;
declare var Base64;

@Component({
  selector: 'app-topics',
  templateUrl: './topics.page.html',
  styleUrls: ['./topics.page.scss'],
})
export class TopicsPage implements OnInit {
  topics: any;
  createForm: any;
  topicName: any;
  parentGroup: any;
  groupSelectForm: any;
  selectedTopic: any;
  topicGroups: any;
  votes: any;
  constructor(
    private settingsService: SettingsService,
    private transactionService: TransactionService,
    private graphService: GraphService,
    private bulletinSecretService: BulletinSecretService,
    private ahttp: HttpClient,
    private navCtrl: NavController
  ) { 
    this.topicGroups = {};
  }

  ngOnInit() {
    var promises = [];

    return this.graphService.getInfo()
    .then(() => {
        for(var i=0; i < this.settingsService.static_groups.length; i++) {
            var group = this.settingsService.static_groups[i];
            promises.push(new Promise((resolve, reject) => {
                this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/ns-lookup?requested_rid=' + group.rid + '&id_type=topic&bulletin_secret=' + this.bulletinSecretService.bulletin_secret)
                .subscribe((data) => {
                    return resolve({group: group, data: data});
                });
            }));
        }
        return Promise.all(promises)
    })
    .then((promiseResults) => {
        return this.mergeTopicsAndGroups(promiseResults);
    })
    .then((items) => {
        this.topicGroups = items;
    });
  }

  mergeTopicsAndGroups(promiseResults) {
      return new Promise((resolve, reject) => {
          var items = {};
          for (let i = 0; i < promiseResults.length; i++) {
              var promiseResult = promiseResults[i];
              for (let j = 0; j < promiseResult.data.length; j++) {
                  if(!promiseResult.data[j]['txn']['relationship']['their_username'] || 
                      promiseResult.data[j]['txn']['rid'] == promiseResult.data[j]['txn']['requested_rid'] ||
                      promiseResult.data[j]['txn']['relationship']['topic'] !== true) 
                          continue
                  if (!items[promiseResult.group['rid']]) items[promiseResult.group['rid']] = [];
                  items[promiseResult.group['rid']].push({
                      group: promiseResult.group,
                      transaction: promiseResult.data[j]['txn']
                  });
              }
          }
          resolve(items);
      })
  }
}
