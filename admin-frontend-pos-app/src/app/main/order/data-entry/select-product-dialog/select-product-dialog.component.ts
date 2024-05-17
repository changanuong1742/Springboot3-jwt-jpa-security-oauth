import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";
import {environment} from "../../../../../../environments/environment";

@Component({
  selector: 'app-select-product-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    NgIf,
    NgForOf,
  ],
  templateUrl: './select-product-dialog.component.html',
  styleUrl: './select-product-dialog.component.scss'
})
export class SelectProductDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<SelectProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  searchProduct: any = '';
  filteredProducts: any[] = [];
  productSelect: any = null;
  quantity: number = 1;

  onNoClick(): void {
    this.dialogRef.close();
  }

  submit() {
    this.productSelect['quantity'] = this.quantity;
  }

  selectProduct(product: any) {
    this.productSelect = product;
    this.searchProduct = '';
  }

  filterProducts(value: any) {
    this.searchProduct = value.target.value;
    this.filteredProducts = this.data.filter((product: { name: string; }) =>
      product.name.toLowerCase().includes(this.searchProduct.toLowerCase())
    );
  }

  deleteProduct() {
    this.productSelect = null;
  }

  protected readonly environment = environment;
}
