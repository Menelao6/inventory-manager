import { Component } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../shared/models/product.model/product.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { error } from 'node:console';

@Component({
  selector: 'app-manage-inventory',
  imports: [AsyncPipe, RouterLink, ReactiveFormsModule ],
  templateUrl: './manage-inventory.html',
  styleUrl: './manage-inventory.css'
})
export class ManageInventory {
  form!: FormGroup;
  isEdit = false;
  selectedProductId?: number;

  products$!: Observable<Product[]>;
  constructor(private fb: FormBuilder, private productService: ProductService) {}

  ngOnInit() {
    this.products$ = this.productService.getProducts();

    this.form = this.fb.group({
      name: ['', Validators.required],
      imageUrl: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      status: ['In Stock'],
      description: ['']
    });
  }

  addProduct() {
    if (this.form.invalid) return;

    this.productService.createProduct(this.form.value).subscribe(() => {
      this.products$ = this.productService.getProducts();
      this.form.reset();
    });
  }

  editProduct(p: Product) {
    this.isEdit = true;
    this.selectedProductId = p.id;
    this.form.patchValue(p);
  }

  updateProduct() {
    if (!this.selectedProductId) return;

    this.productService.updateProduct(this.selectedProductId, this.form.value).subscribe(() => {
      this.products$ = this.productService.getProducts();
      this.isEdit = false;
      this.form.reset();
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.productService.deleteProduct(id).subscribe(() => {
      this.products$ = this.productService.getProducts();
    });
  }

  cancelEdit() {
    this.isEdit = false;
    this.selectedProductId = undefined;
    this.form.reset();
  }

}


