import { Component } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../shared/models/product.model/product.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-manage-inventory',
  imports: [AsyncPipe, RouterLink, ReactiveFormsModule],
  templateUrl: './manage-inventory.html',
  styleUrl: './manage-inventory.css'
})
export class ManageInventory {
  form!: FormGroup;
  isEdit = false;
  selectedProductId?: number;
  showModal = false;

  products$!: Observable<Product[]>;
  
  constructor(private fb: FormBuilder, private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
    this.initForm();
  }

  private initForm() {
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

  private loadProducts() {
    this.products$ = this.productService.getProducts();
  }

  openAddModal() {
    this.isEdit = false;
    this.form.reset({
      status: 'In Stock',
      price: 0,
      quantity: 0
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEdit = false;
    this.selectedProductId = undefined;
    this.form.reset();
  }

  addProduct() {
    if (this.form.invalid) return;

    this.productService.createProduct(this.form.value).subscribe({
      next: () => {
        console.log('Product added successfully');
        this.loadProducts();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error adding product:', err);
        alert('Failed to add product. Please try again.');
      }
    });
  }

  editProduct(p: Product) {
    this.isEdit = true;
    this.selectedProductId = p.id;
    this.form.patchValue(p);
    this.showModal = true;
  }

  updateProduct() {
    if (!this.selectedProductId || this.form.invalid) return;

    this.productService.updateProduct(this.selectedProductId, this.form.value).subscribe({
      next: () => {
        console.log('Product updated successfully');
        this.loadProducts();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error updating product:', err);
        alert('Failed to update product. Please try again.');
      }
    });
  }

  deleteProduct(id: number) {
    const confirmed = confirm('Are you sure you want to delete this product? This action cannot be undone.');
    
    if (!confirmed) return;

    this.productService.deleteProduct(id).subscribe({
      next: () => {
        console.log(`Product ${id} deleted successfully`);
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      }
    });
  }

  cancelEdit() {
    this.closeModal();
  }
}