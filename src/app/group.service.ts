import { Injectable } from '@angular/core';
import { BulletinSecretService } from './yadalib/bulletin-secret.service';
import { TransactionService } from './yadalib/transaction.service';
import { GraphService } from './yadalib/graph.service';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from './yadalib/settings.service';
import { AlertController, ToastController } from '@ionic/angular';


declare var foobar;
declare var X25519;
declare var forge;
declare var Base64;


@Injectable({
  providedIn: 'root'
})
export class GroupService {
  parentGroup: any;
  groupName: any;
  createForm: any;
  firstInfo: any;
  constructor(
    private bulletinSecretService: BulletinSecretService,
    private transactionService: TransactionService,
    private graphService: GraphService,
    private ahttp: HttpClient,
    private settingsService: SettingsService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  createRootGroup(groupName) {
      this.groupName = groupName;
      return new Promise((resolve, reject) => {
          let key = foobar.bitcoin.ECPair.makeRandom();
          let wif = key.toWIF();
          let pubKey = key.getPublicKeyBuffer().toString('hex');
          let address = key.getAddress();
          let bulletin_secret = foobar.base64.fromByteArray(key.sign(foobar.bitcoin.crypto.sha256(this.groupName)).toDER());
          var raw_dh_private_key = window.crypto.getRandomValues(new Uint8Array(32));
          var raw_dh_public_key = X25519.getPublic(raw_dh_private_key);
          var dh_private_key = this.toHex(raw_dh_private_key);
          var dh_public_key = this.toHex(raw_dh_public_key);

          //root topic is creating the group and creating a relationship with it
          var bulletin_secrets = [bulletin_secret, this.graphService.graph.server_bulletin_secret].sort(function (a, b) {
              return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          var rid = forge.sha256.create().update(bulletin_secrets[0] + bulletin_secrets[1]).digest().toHex();
  
          let info: any = {
              their_public_key: pubKey,
              their_address: address,
              their_bulletin_secret: bulletin_secret,
              their_username: this.groupName,
              my_bulletin_secret: this.graphService.graph.server_bulletin_secret,
              my_username: this.graphService.graph.username,
              wif: wif,
              dh_public_key: dh_public_key,
              dh_private_key: dh_private_key,
              rid: rid,
              group: true
          };

          return resolve(info);
      })
      .then((info) => {
          return this.createGroupWorker(info);
      });
  }

  createGroup(parentGroup, groupName) {
      this.parentGroup = parentGroup;
      this.groupName = groupName;
      return new Promise((resolve, reject) => {
          let key = foobar.bitcoin.ECPair.makeRandom();
          let wif = key.toWIF();
          let pubKey = key.getPublicKeyBuffer().toString('hex');
          let address = key.getAddress();
          let bulletin_secret = foobar.base64.fromByteArray(key.sign(foobar.bitcoin.crypto.sha256(this.groupName)).toDER());
          var raw_dh_private_key = window.crypto.getRandomValues(new Uint8Array(32));
          var raw_dh_public_key = X25519.getPublic(raw_dh_private_key);
          var dh_private_key = this.toHex(raw_dh_private_key);
          var dh_public_key = this.toHex(raw_dh_public_key);
  
          //root topic is requesting the new group from yadacoin-regnet
          var bulletin_secrets = [this.graphService.graph.server_bulletin_secret, bulletin_secret].sort(function (a, b) {
              return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          var requested_rid = forge.sha256.create().update(bulletin_secrets[0] + bulletin_secrets[1]).digest().toHex();

          //root topic of yadacoin-regnet is requesting
          var bulletin_secrets = [this.parentGroup.relationship.their_bulletin_secret, this.graphService.graph.server_bulletin_secret].sort(function (a, b) {
              return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          var requester_rid = forge.sha256.create().update(bulletin_secrets[0] + bulletin_secrets[1]).digest().toHex();

          //root topic is creating the group and creating a relationship with it
          var bulletin_secrets = [bulletin_secret, this.parentGroup.relationship.their_bulletin_secret].sort(function (a, b) {
              return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          var rid = forge.sha256.create().update(bulletin_secrets[0] + bulletin_secrets[1]).digest().toHex();
  
          let info: any = {
              their_public_key: pubKey,
              their_address: address,
              their_bulletin_secret: bulletin_secret,
              their_username: this.groupName,
              my_bulletin_secret: this.parentGroup.relationship.their_bulletin_secret,
              my_username: this.parentGroup.relationship.their_username,
              wif: wif,
              dh_public_key: dh_public_key,
              dh_private_key: dh_private_key,
              requested_rid: requested_rid,
              requester_rid: requester_rid,
              rid: rid,
              group: true
          };

          return resolve(info);
      })
      .then((info) => {
          return this.createGroupWorker(info);
      });
  }

  createGroupWorker(info: any) {
    return new Promise((resolve, reject) => {
        this.firstInfo = {
            relationship: {
                dh_private_key: info.dh_private_key,
                their_bulletin_secret: info.their_bulletin_secret,
                their_public_key: info.their_public_key,
                their_username: info.their_username,
                their_address: info.their_address,
                my_bulletin_secret: info.my_bulletin_secret ,
                my_username: info.my_username,
                wif: info.wif,
                group: info.group
            },
            dh_public_key: info.dh_public_key,
            to: info.their_address,
            requester_rid: info.requester_rid,
            requested_rid: info.requested_rid,
            rid: info.rid
        }
      return this.transactionService.generateTransaction(this.firstInfo).then((txn) => {
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
                  group: info.group
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
                return resolve(this.firstInfo);
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

  decrypt(message) {
      var key = forge.pkcs5.pbkdf2(forge.sha256.create().update(this.bulletinSecretService.key.toWIF()).digest().toHex(), 'salt', 400, 32);
      var decipher = forge.cipher.createDecipher('AES-CBC', key);
      var enc = this.hexToBytes(message);
      decipher.start({iv: enc.slice(0,16)});
      decipher.update(forge.util.createBuffer(enc.slice(16)));
      decipher.finish();
      return decipher.output
  }

  hexToBytes(s) {
      var arr = []
      for (var i = 0; i < s.length; i += 2) {
          var c = s.substr(i, 2);
          arr.push(parseInt(c, 16));
      }
      return String.fromCharCode.apply(null, arr);
  }

  toHex(byteArray) {
      var callback = function(byte) {
          return ('0' + (byte & 0xFF).toString(16)).slice(-2);
      }
      return Array.from(byteArray, callback).join('')
  }
}
