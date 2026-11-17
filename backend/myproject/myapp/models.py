from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


# ---------------------------------------------------------------------------
# CATEGORY  (supports parent → child hierarchy like Amazon)
# ---------------------------------------------------------------------------
class Category(models.Model):
    name        = models.CharField(max_length=100)
    slug        = models.SlugField(unique=True, blank=True)
    parent      = models.ForeignKey('self', null=True, blank=True,
                                    related_name='subcategories', on_delete=models.SET_NULL)
    description = models.TextField(blank=True)
    icon        = models.CharField(max_length=100, blank=True,
                                   help_text='Font-Awesome class or emoji')

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} › {self.name}"
        return self.name


# ---------------------------------------------------------------------------
# BRAND
# ---------------------------------------------------------------------------
class Brand(models.Model):
    name    = models.CharField(max_length=100, unique=True)
    slug    = models.SlugField(unique=True, blank=True)
    logo    = models.ImageField(upload_to='brands/', null=True, blank=True)
    website = models.URLField(blank=True)
    country = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


# ---------------------------------------------------------------------------
# PRODUCT
# ---------------------------------------------------------------------------
class Product(models.Model):
    CONDITION_CHOICES = [
        ('new',        'New'),
        ('renewed',    'Amazon Renewed'),
        ('used_like',  'Used – Like New'),
        ('used_good',  'Used – Good'),
        ('used_acc',   'Used – Acceptable'),
    ]

    # Core
    category    = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    brand       = models.ForeignKey(Brand, null=True, blank=True,
                                    related_name='products', on_delete=models.SET_NULL)
    name        = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    sku         = models.CharField(max_length=100, unique=True, blank=True, null=True)
    asin        = models.CharField(max_length=20, blank=True,
                                   verbose_name='ASIN', help_text='Amazon Standard ID')

    # Pricing
    price           = models.DecimalField(max_digits=12, decimal_places=2)
    original_price  = models.DecimalField(max_digits=12, decimal_places=2,
                                          null=True, blank=True,
                                          help_text='MRP / Crossed-out price')
    discount_percent= models.PositiveSmallIntegerField(default=0)

    # Stock
    stock        = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)
    condition    = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='new')

    # Ratings
    rating       = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    review_count = models.PositiveIntegerField(default=0)

    # Media
    image        = models.ImageField(upload_to='products/', null=True, blank=True)
    thumbnail    = models.ImageField(upload_to='thumbnails/', null=True, blank=True)

    # Shipping
    weight_kg    = models.DecimalField(max_digits=8, decimal_places=3,
                                       null=True, blank=True)
    is_prime     = models.BooleanField(default=False, verbose_name='Prime Eligible')
    free_shipping= models.BooleanField(default=False)

    # Meta
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)
    is_featured  = models.BooleanField(default=False)
    is_bestseller= models.BooleanField(default=False)
    tags         = models.CharField(max_length=500, blank=True,
                                    help_text='Comma-separated tags')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def discount_amount(self):
        if self.original_price:
            return self.original_price - self.price
        return 0


# ---------------------------------------------------------------------------
# PRODUCT IMAGES  (multiple images per product)
# ---------------------------------------------------------------------------
class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image   = models.ImageField(upload_to='product_gallery/')
    alt     = models.CharField(max_length=200, blank=True)
    order   = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.product.name} – image {self.order}"


# ---------------------------------------------------------------------------
# PRODUCT SPECIFICATION  (key-value pairs, e.g. RAM: 16 GB)
# ---------------------------------------------------------------------------
class ProductSpecification(models.Model):
    product = models.ForeignKey(Product, related_name='specifications', on_delete=models.CASCADE)
    key     = models.CharField(max_length=100)
    value   = models.CharField(max_length=500)
    group   = models.CharField(max_length=100, blank=True,
                               help_text='e.g. "Technical Details", "Connectivity"')

    class Meta:
        ordering = ['group', 'key']

    def __str__(self):
        return f"{self.product.name}: {self.key} = {self.value}"


# ---------------------------------------------------------------------------
# REVIEW
# ---------------------------------------------------------------------------
class Review(models.Model):
    RATING_CHOICES = [(i, f'{i} Star{"s" if i > 1 else ""}') for i in range(1, 6)]

    product    = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    rating     = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    title      = models.CharField(max_length=200, blank=True)
    body       = models.TextField()
    verified   = models.BooleanField(default=False,
                                     verbose_name='Verified Purchase')
    helpful    = models.PositiveIntegerField(default=0,
                                             verbose_name='Helpful votes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('product', 'user')

    def __str__(self):
        return f"{self.user.username} – {self.product.name} ({self.rating}★)"


# ---------------------------------------------------------------------------
# USER PROFILE
# ---------------------------------------------------------------------------
class UserProfile(models.Model):
    user       = models.OneToOneField(User, on_delete=models.CASCADE)
    phone      = models.CharField(max_length=15, blank=True)
    address    = models.TextField(blank=True)
    city       = models.CharField(max_length=100, blank=True)
    state      = models.CharField(max_length=100, blank=True)
    pincode    = models.CharField(max_length=10, blank=True)
    country    = models.CharField(max_length=100, blank=True, default='India')
    avatar     = models.ImageField(upload_to='avatars/', null=True, blank=True)
    is_prime   = models.BooleanField(default=False, verbose_name='Prime Member')

    def __str__(self):
        return self.user.username


# ---------------------------------------------------------------------------
# COUPON
# ---------------------------------------------------------------------------
class Coupon(models.Model):
    TYPE_CHOICES = [('percent', 'Percentage'), ('flat', 'Flat Amount')]

    code            = models.CharField(max_length=50, unique=True)
    discount_type   = models.CharField(max_length=10, choices=TYPE_CHOICES, default='percent')
    discount_value  = models.DecimalField(max_digits=8, decimal_places=2)
    min_order_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_uses        = models.PositiveIntegerField(default=100)
    times_used      = models.PositiveIntegerField(default=0)
    valid_from      = models.DateTimeField()
    valid_until     = models.DateTimeField()
    is_active       = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} ({self.discount_value}{'%' if self.discount_type == 'percent' else '₹'})"


# ---------------------------------------------------------------------------
# ORDER
# ---------------------------------------------------------------------------
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending',    'Pending'),
        ('confirmed',  'Confirmed'),
        ('processing', 'Processing'),
        ('shipped',    'Shipped'),
        ('out_for_del','Out for Delivery'),
        ('delivered',  'Delivered'),
        ('cancelled',  'Cancelled'),
        ('returned',   'Returned'),
        ('refunded',   'Refunded'),
    ]
    PAYMENT_CHOICES = [
        ('cod',    'Cash on Delivery'),
        ('upi',    'UPI'),
        ('card',   'Credit / Debit Card'),
        ('netbank','Net Banking'),
        ('wallet', 'Wallet'),
        ('emi',    'EMI'),
    ]

    user            = models.ForeignKey(User, on_delete=models.CASCADE)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method  = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='cod')
    payment_done    = models.BooleanField(default=False)
    coupon          = models.ForeignKey(Coupon, null=True, blank=True, on_delete=models.SET_NULL)
    subtotal        = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount        = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_charge = models.DecimalField(max_digits=8,  decimal_places=2, default=0)
    total_price     = models.DecimalField(max_digits=12, decimal_places=2)

    # Shipping address snapshot
    ship_name       = models.CharField(max_length=200, blank=True)
    ship_phone      = models.CharField(max_length=15,  blank=True)
    ship_address    = models.TextField(blank=True)
    ship_city       = models.CharField(max_length=100, blank=True)
    ship_state      = models.CharField(max_length=100, blank=True)
    ship_pincode    = models.CharField(max_length=10,  blank=True)

    tracking_id     = models.CharField(max_length=200, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} – {self.user.username}"


# ---------------------------------------------------------------------------
# ORDER ITEM
# ---------------------------------------------------------------------------
class OrderItem(models.Model):
    order    = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product  = models.ForeignKey(Product, related_name='order_items', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price    = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} × {self.quantity}"

    @property
    def subtotal(self):
        return self.price * self.quantity


# ---------------------------------------------------------------------------
# WISHLIST
# ---------------------------------------------------------------------------
class Wishlist(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    product    = models.ForeignKey(Product, on_delete=models.CASCADE)
    added_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username} ♥ {self.product.name}"


# ---------------------------------------------------------------------------
# BANNER / ADVERTISEMENT
# ---------------------------------------------------------------------------
class Banner(models.Model):
    POSITION_CHOICES = [
        ('hero',      'Hero / Full Width'),
        ('sidebar',   'Sidebar'),
        ('category',  'Category Page'),
        ('deal',      'Deal of the Day'),
    ]
    title      = models.CharField(max_length=200)
    image      = models.ImageField(upload_to='banners/')
    link       = models.URLField(blank=True)
    position   = models.CharField(max_length=20, choices=POSITION_CHOICES, default='hero')
    is_active  = models.BooleanField(default=True)
    order      = models.PositiveSmallIntegerField(default=0)
    valid_from = models.DateField(null=True, blank=True)
    valid_until= models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} [{self.position}]"

