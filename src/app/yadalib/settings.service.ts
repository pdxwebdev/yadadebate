import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class SettingsService {
    remoteSettings: any;
    remoteSettingsUrl = null;
    seeds = [];
    tokens = {};
    static_groups = [];
    constructor(
    ) {
        this.remoteSettings = {};
        this.tokens = {};
        this.static_groups = [{
            "rid": "4cef179f4967379a780690cd6f22e95a4b6a95ea5dce412bdb21a77618b3fe38",
            "fee": 0,
            "requester_rid": "",
            "requested_rid": "",
            "outputs": [{
                "to": "19M7JYUx4tXf34XHvZnbC3kqJPNwcaQ4Qz",
                "value": 0
            }, {
                "to": "1NhrRhWFnoSNJhLMTJi7j2w1bJ565Dt2RQ",
                "value": 0
            }],
            "time": "1577148473",
            "public_key": "02a64546efb9993141dc45c023ba197c46d4f0d8185805c017bf174761f6288feb",
            "dh_public_key": "ebded473e81cb65dc92ee0b6cdd80b99ca31d7096c452da1092e917decdba829",
            "inputs": [],
            "relationship": {
                "their_bulletin_secret": "MEQCIEQ9RamrV+GAAi6y57G6NLmR7RdE54pzumRpo4LMqPGvAiB39K8dvy7p4dUu358NKYozwLgxw28Uxy+A8zaSO9Bv/Q==",
                "their_public_key": "02943d5594a8a55702085ab5e0036f9846445f9707779867557af57eb6e3b1261f",
                "their_username": "Politics",
                "their_address": "19M7JYUx4tXf34XHvZnbC3kqJPNwcaQ4Qz",
                "my_bulletin_secret": "MEQCIBp8vPXPdOuZm0JboZDaGCqyZB5cEVuAvFv/hysejV9+AiA3N9muc4JgAJbSixn3RaEHkbETDLTb5pfV8jv2rKjuVg==",
                "my_username": "yadacoin-regnet",
                "group": true
            },
            "hash": "82a85f284d00432c9d094a639a7bbc8287bd811b8c3b60aea017d6afcd321341",
            "id": "MEUCIQCvFFyaeFoQF7x64qq0G394PmaL6CT3t7DT+xICzbJiGgIgRfaRjyzDNE4yuqGI4wQME9YPq/1v+HVoISFKaXpJNR0="
        }];
    }

    go() {
        return new Promise((resolve, reject) => {

        });
    }
}