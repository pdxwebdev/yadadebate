import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PostPageRoutingModule } from './post-routing.module';

import { PostPage } from './post.page';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    PostPageRoutingModule
  ],
  declarations: [PostPage]
})
export class PostPageModule {}
