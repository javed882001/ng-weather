import { NgModule } from "@angular/core";

import { TabularSetComponent } from "./tabularset.component";
import { CommonModule } from "@angular/common";
import { TabularDirective } from "./tabular/tabular.directive";

@NgModule({
  imports: [CommonModule],
  exports: [TabularSetComponent, TabularDirective],
  declarations: [TabularSetComponent, TabularDirective],
  providers: [],
})
export class TabularSetModule {}
