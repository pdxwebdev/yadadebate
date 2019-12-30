import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { 
  NavController,
  ModalController,
  AlertController,
  LoadingController,
  ToastController
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { GraphService } from '../yadalib/graph.service';
import { BulletinSecretService } from '../yadalib/bulletin-secret.service';
import { WalletService } from '../yadalib/wallet.service';
import { TransactionService } from '../yadalib/transaction.service';
import { SettingsService } from '../yadalib/settings.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavigationExtras } from '@angular/router';
import { IonRadioGroup } from '@ionic/angular';
import { GroupService } from '../group.service';

declare var Base64;
declare var foobar;
declare var X25519;
declare var forge;


@Component({
  selector: 'app-communities',
  templateUrl: './communities.page.html',
  styleUrls: ['./communities.page.scss'],
})
export class CommunitiesPage implements OnInit {
    @ViewChild('radioGroup', {static: false}) radioGroup: IonRadioGroup
    pageTitle: any;
    groupName: any;
    rootGroup: any;
    createForm: any;
    createTopicForm: any;
    groups: any;
    votes: any;
    constructor(
        private graphService: GraphService,
        public navCtrl: NavController,
        public storage: Storage,
        public walletService: WalletService,
        public transactionService: TransactionService,
        public alertCtrl: AlertController,
        public loadingCtrl: LoadingController,
        public bulletinSecretService: BulletinSecretService,
        public settingsService: SettingsService,
        public ahttp: HttpClient,
        public modalCtrl: ModalController,
        public toastCtrl: ToastController,
        public router: Router,
        public groupService: GroupService
    ) {}

    ngOnInit() {
        this.groups = [];
        let promises = [];

        return this.graphService.getInfo()
        .then(() => {
            for(var i=0; i < this.settingsService.static_groups.length; i++) {
                var group = this.settingsService.static_groups[i];
                promises.push(new Promise((resolve, reject) => {
                    this.ahttp.get(this.settingsService.remoteSettings.baseUrl + '/ns-lookup?requester_rid=' + group.rid + '&bulletin_secret=' + this.bulletinSecretService.bulletin_secret)
                    .subscribe((data) => {
                        return resolve({group: group, data: data});
                    });
                }));
            }

            return Promise.all(promises)
        })
        .then((graphArray) => {
            return this.makeList(graphArray);
        })
        .then((items) => {
            this.groups = items
        });
    }

    makeList(promiseResults) {
        return new Promise((resolve, reject) => {
            var items = {};
            for (let i = 0; i < promiseResults.length; i++) {
                var promiseResult = promiseResults[i];
                for (let j = 0; j < promiseResult.data.length; j++) {
                    if(!promiseResult.data[j]['txn']['relationship']['their_username'] || 
                        promiseResult.data[j]['txn']['rid'] == promiseResult.data[j]['txn']['requested_rid'] ||
                        promiseResult.data[j]['txn']['relationship']['group'] !== true) 
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

    itemTapped(event, item) {
        let navigationExtras: NavigationExtras = {
            queryParams: {
                item: Base64.encode(JSON.stringify(item.transaction))
            }
        }
        this.navCtrl.navigateForward('/community-detail', navigationExtras);
    }

    activateCreateForm() {
        this.createForm = !this.createForm;
    }

    activateCreateTopicForm() {
        this.createTopicForm = !this.createTopicForm;
    }

    groupAnswer(answer) {
        this.rootGroup = answer.detail.value;
    }

}
