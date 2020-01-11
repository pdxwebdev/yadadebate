import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class SettingsService {
    remoteSettings: any;
    remoteSettingsUrl = null;
    seeds = [];
    tokens = {};
    static_groups = [];
    static_groups_by_bulletin_secret = {};
    static_groups_by_rid = {};
    groups_by_bulletin_secret = {};
    topics_by_bulletin_secret = {};
    constructor(
        public storage: Storage
    ) {
        this.remoteSettings = {};
        this.tokens = {};
        this.static_groups = [{
            "time": "1577777411",
            "rid": "eaf7190434fdfbc850dd848e3dc0e7c82fa0d3594e50a9f82d50407be5c9f139",
            "id": "MEQCIBxKsO5oeSKtsnQYhvDFfpRzIMhV966nVfx6eeFQyl2EAiBRHSN9erdoMC7qPCNxIagj+tlngUvIEDoJk8LCt40fXA==",
            "relationship": {
                "their_bulletin_secret": "MEQCIGrxWIXd75LdnaI5lnSoWzkTZhMB5LJVl4S0i7+axjImAiBbNP7IT2jLX2iessJIpiomuOjy792vqh9YajmV1g2Plw==",
                "their_public_key": "021a7869cf7f8913db58c7f7315b70b80bbd14175508c9e5d22de70741910708bc",
                "their_username": "Political",
                "their_address": "12GUAZH8i2Y5aLEPuuM8qAzgTPmak8h1mo",
                "my_bulletin_secret": "MEUCIQCSU1CuMJHbChEojQrJce4FYakrgJXJXcDZgO+o54s0egIgBLVAY1iCC4ftBjZspPS8U5VqvqbIK7qt2E8C70HYSAc=",
                "my_username": "yadacoin-regnet",
                "group": true
            },
            "public_key": "02a64546efb9993141dc45c023ba197c46d4f0d8185805c017bf174761f6288feb",
            "dh_public_key": "c63684b0534bf7c8486980fbe245eb45f1f25975360ea3c5219f16296042561f",
            "fee": 0.0,
            "hash": "d7ec9224e23607507bcb4de74f7e91eb49448e507a2dcc2a70d375389a894d76",
            "inputs": [],
            "outputs": [{
                    "to": "12GUAZH8i2Y5aLEPuuM8qAzgTPmak8h1mo",
                    "value": 0
                },
                {
                    "to": "1NhrRhWFnoSNJhLMTJi7j2w1bJ565Dt2RQ",
                    "value": 0
                }
            ]
        }];
        for (var i=0; i < this.static_groups.length; i++) {
            this.static_groups_by_bulletin_secret[this.static_groups[i]['relationship']['their_bulletin_secret']] = this.static_groups[i];
        }
        for (var i=0; i < this.static_groups.length; i++) {
            this.static_groups_by_rid[this.static_groups[i]['rid']] = this.static_groups[i];
        }
    }

    reinit() {
        return new Promise((resolve, reject) => {
            return this.storage.get('node')
            .then((value) => {
                if(value){
                    this.remoteSettingsUrl = value;
                    return resolve();
                } else {
                    return reject();
                }
            });
        })
    }
}