import { Injectable } from '@angular/core';
import { BulletinSecretService } from './yadalib/bulletin-secret.service';
import { TransactionService } from './yadalib/transaction.service';
import { GraphService } from './yadalib/graph.service';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './yadalib/settings.service';


declare var foobar;
declare var X25519;
declare var forge;


@Injectable({
  providedIn: 'root'
})
export class TopicService {
  parentGroup: any;
  topicName: any;
  createForm: any;
  firstInfo: any;
  constructor(
    private bulletinSecretService: BulletinSecretService,
    private transactionService: TransactionService,
    private graphService: GraphService,
    private ahttp: HttpClient,
    private settingsService: SettingsService
  ) { }

  createTopic(parentGroup, topicName) {
      this.parentGroup = parentGroup;
      this.topicName = topicName;
      return new Promise((resolve, reject) => {
          let key = foobar.bitcoin.ECPair.makeRandom();
          let wif = key.toWIF();
          let pubKey = key.getPublicKeyBuffer().toString('hex');
          let address = key.getAddress();
          let bulletin_secret = foobar.base64.fromByteArray(key.sign(foobar.bitcoin.crypto.sha256(this.topicName)).toDER());
          var raw_dh_private_key = window.crypto.getRandomValues(new Uint8Array(32));
          var raw_dh_public_key = X25519.getPublic(raw_dh_private_key);
          var dh_private_key = this.toHex(raw_dh_private_key);
          var dh_public_key = this.toHex(raw_dh_public_key);
  
          var bulletin_secrets = [this.graphService.graph.bulletin_secret, bulletin_secret].sort(function (a, b) {
              return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          var requested_rid = forge.sha256.create().update(bulletin_secrets[0] + bulletin_secrets[1]).digest().toHex();
  
          let info: any = {
              their_public_key: pubKey,
              their_address: address,
              their_bulletin_secret: bulletin_secret,
              their_username: this.topicName,
              my_bulletin_secret: this.bulletinSecretService.generate_bulletin_secret(),
              my_username: this.bulletinSecretService.username,
              wif: wif,
              dh_public_key: dh_public_key,
              dh_private_key: dh_private_key,
              requested_rid: requested_rid,
              topic: true
          };
          this.firstInfo = info;

          return resolve(info);
      })
      .then((info) => {
          return this.createTopicWorker(info);
      })
      .then((info: any) => {
        return new Promise((resolve, reject) => {
          var raw_dh_private_key = window.crypto.getRandomValues(new Uint8Array(32));
          var raw_dh_public_key = X25519.getPublic(raw_dh_private_key);
          var dh_private_key2 = this.toHex(raw_dh_private_key);
          var dh_public_key2 = this.toHex(raw_dh_public_key);

          var bulletin_secrets = [this.graphService.graph.bulletin_secret, this.parentGroup.relationship.their_bulletin_secret].sort(function (a, b) {
              return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          var requested_rid = forge.sha256.create().update(bulletin_secrets[0] + bulletin_secrets[1]).digest().toHex();

          var bulletin_secrets = [info.relationship.their_bulletin_secret, this.graphService.graph.bulletin_secret].sort(function (a, b) {
              return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          var requester_rid = forge.sha256.create().update(bulletin_secrets[0] + bulletin_secrets[1]).digest().toHex();

          var bulletin_secrets = [info.relationship.their_bulletin_secret, this.parentGroup.relationship.their_bulletin_secret].sort(function (a, b) {
              return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          var rid = forge.sha256.create().update(bulletin_secrets[0] + bulletin_secrets[1]).digest().toHex();

          info = {
              their_bulletin_secret: this.parentGroup.relationship.their_bulletin_secret,
              their_username: this.parentGroup.relationship.their_username,
              my_bulletin_secret: info.relationship.their_bulletin_secret,
              my_username: this.topicName,
              dh_public_key: dh_public_key2,
              dh_private_key: dh_private_key2,
              requested_rid: this.parentGroup.rid,
              requester_rid: requester_rid,
              rid: rid,
              topic: true
          };
          return resolve(info);
        });
      })
      .then((info) => {
        return this.createTopicWorker(info);
      });
  }

  createTopicWorker(info: any) {
      
    return new Promise((resolve, reject) => {
      return this.transactionService.generateTransaction({
          relationship: {
              dh_private_key: info.dh_private_key,
              their_bulletin_secret: info.their_bulletin_secret,
              their_public_key: info.their_public_key,
              their_username: info.their_username,
              their_address: info.their_address,
              my_bulletin_secret: info.my_bulletin_secret ,
              my_username: info.my_username,
              wif: info.wif,
              topic: info.topic
          },
          dh_public_key: info.dh_public_key,
          to: info.their_address,
          requester_rid: this.graphService.graph.rid,
          requested_rid: info.requested_rid,
          rid: info.rid
      }).then((txn) => {
          return this.transactionService.sendTransaction();
      }).then((txn) => {
          return new Promise((resolve, reject) => {
              
              this.transactionService.transaction.relationship = {
                  dh_private_key: info.dh_private_key,
                  their_bulletin_secret: info.their_bulletin_secret,
                  their_public_key: info.their_public_key,
                  their_username: info.their_username,
                  their_address: info.their_address,
                  my_bulletin_secret: info.my_bulletin_secret ,
                  my_username: info.my_username,
                  topic: info.topic
              };
              delete this.transactionService.transaction.relationship.wif;
              delete this.transactionService.transaction.relationship.dh_private_key;
              this.ahttp.post(this.settingsService.remoteSettings.baseUrl + '/ns', {
                  txn: this.transactionService.transaction,
                  peer: {
                      host: 'me',
                      port: 0
                  }
              })
              .subscribe((res) => {
                return resolve({relationship: this.firstInfo});
              });
          })
      })
      .then((data: any) => {
          return resolve(data);
      })
      .catch((err) => {
          console.log(err);
      });
    });
  }

  toHex(byteArray) {
      var callback = function(byte) {
          return ('0' + (byte & 0xFF).toString(16)).slice(-2);
      }
      return Array.from(byteArray, callback).join('')
  }
}
