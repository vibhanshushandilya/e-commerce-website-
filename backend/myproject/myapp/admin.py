from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count
from .models import (
    Category, Brand, Product, ProductImage, ProductSpecification,
    Review, UserProfile, Coupon, Order, OrderItem, Wishlist, Banner
)

admin.site.site_header  = "🛒 E-Commerce Admin"
admin.site.site_title   = "E-Commerce"
admin.site.index_title  = "Dashboard"


# ---------------------------------------------------------------------------
# CATEGORY
# ---------------------------------------------------------------------------
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display   = ('name', 'parent', 'product_count', 'slug')
    list_filter    = ('parent',)
    search_fields  = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    ordering       = ('name',)

    @admin.display(description='Products')
    def product_count(self, obj):
        return obj.products.count()


# ---------------------------------------------------------------------------
# BRAND
# ---------------------------------------------------------------------------
@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display  = ('name', 'country', 'website', 'product_count')
    search_fields = ('name', 'country')
    prepopulated_fields = {'slug': ('name',)}

    @admin.display(description='Products')
    def product_count(self, obj):
        return obj.products.count()


# ---------------------------------------------------------------------------
# PRODUCT IMAGES  (inline inside Product)
# ---------------------------------------------------------------------------
class ProductImageInline(admin.TabularInline):
    model  = ProductImage
    extra  = 2
    fields = ('image', 'alt', 'order', 'preview')
    readonly_fields = ('preview',)

    @admin.display(description='Preview')
    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" height="60" style="border-radius:4px"/>', obj.image.url)
        return '—'


# ---------------------------------------------------------------------------
# PRODUCT SPECIFICATIONS  (inline inside Product)
# ---------------------------------------------------------------------------
class ProductSpecInline(admin.TabularInline):
    model  = ProductSpecification
    extra  = 3
    fields = ('group', 'key', 'value')


# ---------------------------------------------------------------------------
# PRODUCT
# ---------------------------------------------------------------------------
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'thumbnail_preview', 'name', 'brand', 'category',
        'price', 'original_price', 'discount_percent',
        'stock', 'rating', 'review_count',
        'is_available', 'is_prime', 'is_featured', 'is_bestseller',
        'condition', 'created_at',
    )
    list_display_links = ('thumbnail_preview', 'name')
    list_filter = (
        'category', 'brand', 'condition',
        'is_available', 'is_prime', 'is_featured', 'is_bestseller', 'free_shipping',
    )
    search_fields  = ('name', 'sku', 'asin', 'tags', 'brand__name', 'category__name')
    list_editable  = ('price', 'stock', 'is_available', 'is_featured', 'is_bestseller', 'is_prime')
    prepopulated_fields = {}
    readonly_fields = ('created_at', 'updated_at', 'thumbnail_preview', 'discount_amount')
    ordering       = ('-created_at',)
    list_per_page  = 50
    date_hierarchy = 'created_at'
    inlines        = [ProductImageInline, ProductSpecInline]

    fieldsets = (
        ('🏷️ Basic Info', {
            'fields': ('name', 'category', 'brand', 'sku', 'asin', 'description', 'tags')
        }),
        ('💰 Pricing', {
            'fields': ('price', 'original_price', 'discount_percent', 'discount_amount')
        }),
        ('📦 Stock & Condition', {
            'fields': ('stock', 'is_available', 'condition', 'weight_kg')
        }),
        ('🖼️ Media', {
            'fields': ('image', 'thumbnail', 'thumbnail_preview')
        }),
        ('⭐ Ratings', {
            'fields': ('rating', 'review_count')
        }),
        ('🚚 Shipping', {
            'fields': ('is_prime', 'free_shipping')
        }),
        ('🔥 Flags', {
            'fields': ('is_featured', 'is_bestseller')
        }),
        ('📅 Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    @admin.display(description='Image')
    def thumbnail_preview(self, obj):
        img = obj.thumbnail or obj.image
        if img:
            return format_html('<img src="{}" height="50" style="border-radius:6px"/>', img.url)
        return '📦'

    @admin.display(description='Discount ₹')
    def discount_amount(self, obj):
        return obj.discount_amount


# ---------------------------------------------------------------------------
# REVIEW
# ---------------------------------------------------------------------------
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ('product', 'user', 'rating', 'title', 'verified', 'helpful', 'created_at')
    list_filter   = ('rating', 'verified')
    search_fields = ('product__name', 'user__username', 'title', 'body')
    readonly_fields = ('created_at',)
    date_hierarchy  = 'created_at'


# ---------------------------------------------------------------------------
# USER PROFILE
# ---------------------------------------------------------------------------
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display  = ('user', 'phone', 'city', 'state', 'pincode', 'is_prime')
    list_filter   = ('is_prime', 'country', 'state')
    search_fields = ('user__username', 'user__email', 'phone', 'city', 'pincode')


# ---------------------------------------------------------------------------
# COUPON
# ---------------------------------------------------------------------------
@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display  = ('code', 'discount_type', 'discount_value', 'min_order_value',
                     'times_used', 'max_uses', 'valid_from', 'valid_until', 'is_active')
    list_filter   = ('discount_type', 'is_active')
    search_fields = ('code',)
    list_editable = ('is_active',)


# ---------------------------------------------------------------------------
# ORDER ITEM  (inline inside Order)
# ---------------------------------------------------------------------------
class OrderItemInline(admin.TabularInline):
    model          = OrderItem
    extra          = 0
    readonly_fields = ('product', 'price', 'quantity', 'subtotal')

    @admin.display(description='Subtotal')
    def subtotal(self, obj):
        return f"₹{obj.subtotal}"


# ---------------------------------------------------------------------------
# ORDER
# ---------------------------------------------------------------------------
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display   = (
        'id', 'user', 'status', 'payment_method', 'payment_done',
        'total_price', 'tracking_id', 'created_at'
    )
    list_filter    = ('status', 'payment_method', 'payment_done')
    search_fields  = ('user__username', 'tracking_id', 'ship_phone', 'ship_name')
    list_editable  = ('status', 'payment_done', 'tracking_id')
    readonly_fields = ('created_at', 'updated_at', 'subtotal', 'discount')
    date_hierarchy  = 'created_at'
    ordering        = ('-created_at',)
    inlines         = [OrderItemInline]

    fieldsets = (
        ('👤 Customer', {'fields': ('user', 'coupon')}),
        ('📋 Status', {'fields': ('status', 'payment_method', 'payment_done', 'tracking_id')}),
        ('💰 Pricing', {'fields': ('subtotal', 'discount', 'shipping_charge', 'total_price')}),
        ('🏠 Shipping Address', {
            'fields': ('ship_name', 'ship_phone', 'ship_address',
                       'ship_city', 'ship_state', 'ship_pincode')
        }),
        ('📅 Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


# ---------------------------------------------------------------------------
# ORDER ITEM (standalone)
# ---------------------------------------------------------------------------
@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display  = ('order', 'product', 'quantity', 'price', 'subtotal_display')
    search_fields = ('product__name', 'order__id')
    list_filter   = ('product__category',)

    @admin.display(description='Subtotal')
    def subtotal_display(self, obj):
        return f"₹{obj.subtotal}"


# ---------------------------------------------------------------------------
# WISHLIST
# ---------------------------------------------------------------------------
@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display  = ('user', 'product', 'added_at')
    search_fields = ('user__username', 'product__name')
    list_filter   = ('product__category',)


# ---------------------------------------------------------------------------
# BANNER
# ---------------------------------------------------------------------------
@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display  = ('title', 'position', 'is_active', 'order', 'valid_from', 'valid_until', 'preview')
    list_filter   = ('position', 'is_active')
    list_editable = ('is_active', 'order')
    readonly_fields = ('preview',)

    @admin.display(description='Preview')
    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" height="60" style="border-radius:6px"/>', obj.image.url)
        return '—'

