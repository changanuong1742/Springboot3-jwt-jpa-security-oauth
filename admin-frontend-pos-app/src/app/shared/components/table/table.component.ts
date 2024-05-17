import {Component, EventEmitter, Input, Output} from '@angular/core';
import {MatTableModule} from "@angular/material/table";
import {MatSortModule} from "@angular/material/sort";
import {MatPaginatorModule} from "@angular/material/paginator";
import {CommonModule} from "@angular/common";
import {MatButton, MatIconButton} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import {CookieService} from "ngx-cookie-service";

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, CommonModule, MatIconButton, RouterLink, MatButton],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  @Input() displayedColumns!: string[];
  @Input() dataTable!: any[];
  @Input() action: any;
  @Input() nameRoute?: string;
  @Output() removeRecord = new EventEmitter<any>();


  constructor(private cookieService: CookieService) {

  }

  removeRecordEmit(obj: any) {
    this.removeRecord.emit(obj);
  }
}
