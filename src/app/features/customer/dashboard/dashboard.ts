import { Component } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { Observable, take } from 'rxjs';
import { Product, Order } from '../../../shared/models/product.model/product.model';
import { AsyncPipe, CommonModule, DecimalPipe } from '@angular/common';
import { GenerateOrderId } from '../../../core/services/generate-order-id';

type CartItem = {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, CommonModule, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  products$!: Observable<Product[]>;
  cart: CartItem[] = [];
  showCart = false;
  showSuccessModal = false;
  orderSummary = { itemCount: 0, total: 0 };

  constructor(
    private productService: ProductService,
    private orderService: OrderService
    ,
    private generateOrderId: GenerateOrderId
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  private loadProducts() {
    this.products$ = this.productService.getProducts();
  }

  toggleCart() {
    this.showCart = !this.showCart;
  }

  isInCart(productId: number): boolean {
    return this.cart.some(item => item.product.id === productId);
  }

  getCartItem(productId: number): CartItem | undefined {
    return this.cart.find(item => item.product.id === productId);
  }

  addToCart(product: Product) {
    if (product.quantity === 0) {
      alert('This product is out of stock.');
      return;
    }

    const existingItem = this.cart.find(item => item.product.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.quantity) {
        existingItem.quantity++;
      } else {
        alert('Cannot add more than available stock.');
      }
    } else {
      this.cart.push({ product, quantity: 1 });
    }
  }

  increaseQuantity(item: CartItem) {
    if (item.quantity < item.product.quantity) {
      item.quantity++;
    } else {
      alert('Cannot exceed available stock.');
    }
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeFromCart(item.product);
    }
  }

  removeFromCart(product: Product) {
    this.cart = this.cart.filter(item => item.product.id !== product.id);
  }

  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cart = [];
    }
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }

  private computeStatus(qty: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
    if (qty <= 0) return 'out-of-stock';
    if (qty < 10) return 'low-stock';
    return 'in-stock';
  }

  placeOrder() {
    if (this.cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    for (const item of this.cart) {
      if (item.quantity > item.product.quantity) {
        alert(`Insufficient stock for ${item.product.name}. Available: ${item.product.quantity}`);
        return;
      }
    }

    this.orderSummary = {
      itemCount: this.cart.reduce((sum, item) => sum + item.quantity, 0),
      total: this.getCartTotal()
    };

    this.processOrders();
  }

  private processOrders() {
    let completedOrders = 0;
    const totalOrders = this.cart.length;
    const cartCopy = [...this.cart];

    this.orderService.getOrders().pipe(take(1)).subscribe({
      next: (currentOrders) => {
        const ordersSoFar: Order[] = [...currentOrders];

        for (const item of cartCopy) {
          const newOrderId = this.generateOrderId.getNewOrderId(ordersSoFar);
          const order: Order = {
            id: newOrderId,
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.price,
            total: item.product.price * item.quantity,
            status: 'pending',
            createdAt: new Date().toISOString(),
            customer: 'Customer'
          };

          this.orderService.createOrder(order).subscribe({
            next: (createdOrder) => {
              ordersSoFar.push(createdOrder);
              console.log('Order created:', createdOrder);

              const newQty = item.product.quantity - item.quantity;
              const newStatus = this.computeStatus(newQty);

              this.productService.updateProduct(item.product.id, {
                quantity: newQty,
                status: newStatus
              }).subscribe({
                next: () => {
                  console.log(`Product ${item.product.id} stock updated to ${newQty}`);
                  completedOrders++;

                  if (completedOrders === totalOrders) {
                    this.onOrdersComplete();
                  }
                },
                error: (err) => {
                  console.error('Error updating product stock:', err);
                  alert(`Failed to update stock for ${item.product.name}. Please contact support.`);
                }
              });
            },
            error: (err) => {
              console.error('Error creating order:', err);
              alert(`Failed to create order for ${item.product.name}. Please try again.`);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error fetching orders for id generation:', err);
        alert('Failed to create orders. Please try again.');
      }
    });
  }

  private onOrdersComplete() {
    this.cart = [];
    
    this.showCart = false;
    
    this.loadProducts();
    
    this.showSuccessModal = true;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }
}