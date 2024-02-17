import {
  AfterContentChecked,
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Query,
  QueryList,
  TemplateRef,
} from "@angular/core";
import { TabularDirective } from "./tabular/tabular.directive";

@Component({
  selector: "tabular-set",
  templateUrl: "./tabularset.component.html",
  styleUrls: ['./tabularset.component.css']
})
export class TabularSetComponent implements AfterContentChecked {
  @Input()
  closable = false;

  @Input()
  activeTabIndex = 0;

  @Output()
  activeTabIndexChange = new EventEmitter<number>();

  @Output()
  closeTab = new EventEmitter<number>();

  @ContentChildren(TabularDirective)
  tabs?: QueryList<TabularDirective>;

  get titles() {
    return this.tabs.map((tab) => tab.title);
  }

  private treatActiveTab() {
    this.tabs?.forEach((tab, index) => {
      if (index === this.activeTabIndex)
        tab.elementRef.nativeElement.style.display = "block";
      else tab.elementRef.nativeElement.style.display = "none";
    });
  }

  chooseTab(index: number) {
    this.activeTabIndex = index;
    this.activeTabIndexChange.emit(index);
  }

  close(e: PointerEvent, index: number) {
    e.stopPropagation();
    this.closeTab.emit(index);
  }

  isTitleString(title: string | TemplateRef<any>): title is string {
    return typeof title === "string";
  }

  ngAfterContentChecked(): void {
    this.treatActiveTab();
  }
}
