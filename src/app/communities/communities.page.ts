import { Component, OnInit } from '@angular/core';
import { GraphService } from '../yadalib/graph.service';

@Component({
  selector: 'app-communities',
  templateUrl: './communities.page.html',
  styleUrls: ['./communities.page.scss'],
})
export class CommunitiesPage implements OnInit {
    items: any;
    pageTitle: any;
    constructor(
        private graphService: GraphService
    ) {
        this.graphService.getDistinctList('groups')
        .then((graphArray) => {
            this.makeList(graphArray);
        });
    }

    makeList(graphArray) {
        return new Promise((resolve, reject) => {
            this.items = [];
            for (let i = 0; i < graphArray.length; i++) {
                this.items.push({
                    transaction: graphArray[i]
                });
            }
            resolve();
        })
    }

    ngOnInit() {
    }

}
