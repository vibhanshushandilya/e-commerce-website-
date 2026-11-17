from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework import viewsets, generics, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import (
    Category, Brand, Product, Review, UserProfile,
    Order, OrderItem, Wishlist, Banner
)
from .serializers import (
    CategorySerializer, BrandSerializer, ProductListSerializer,
    ProductDetailSerializer, ReviewSerializer, UserProfileSerializer,
    OrderSerializer, WishlistSerializer, BannerSerializer, RegisterSerializer
)


# ---------------------------------------------------------------------------
# FILTERS
# ---------------------------------------------------------------------------
class ProductFilter(django_filters.FilterSet):
    min_price  = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price  = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    category   = django_filters.CharFilter(field_name='category__slug')
    brand      = django_filters.CharFilter(field_name='brand__slug')
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')

    class Meta:
        model = Product
        fields = ['is_prime', 'is_featured', 'is_bestseller', 'is_available', 'condition']


# ---------------------------------------------------------------------------
# CATEGORY
# ---------------------------------------------------------------------------
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset         = Category.objects.filter(parent=None)
    serializer_class = CategorySerializer
    lookup_field     = 'slug'

    @action(detail=False, url_path='all')
    def all_flat(self, request):
        qs = Category.objects.all().order_by('name')
        return Response(CategorySerializer(qs, many=True).data)


# ---------------------------------------------------------------------------
# BRAND
# ---------------------------------------------------------------------------
class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset         = Brand.objects.all()
    serializer_class = BrandSerializer
    lookup_field     = 'slug'
    filter_backends  = [filters.SearchFilter]
    search_fields    = ['name']


# ---------------------------------------------------------------------------
# PRODUCT
# ---------------------------------------------------------------------------
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_available=True).select_related('category', 'brand')
    filter_backends  = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class  = ProductFilter
    search_fields    = ['name', 'brand__name', 'tags', 'description']
    ordering_fields  = ['price', 'rating', 'created_at', 'discount_percent']
    ordering         = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    @action(detail=False)
    def featured(self, request):
        qs = self.get_queryset().filter(is_featured=True)[:12]
        return Response(ProductListSerializer(qs, many=True).data)

    @action(detail=False)
    def bestsellers(self, request):
        qs = self.get_queryset().filter(is_bestseller=True)[:12]
        return Response(ProductListSerializer(qs, many=True).data)

    @action(detail=False)
    def new_arrivals(self, request):
        qs = self.get_queryset().order_by('-created_at')[:12]
        return Response(ProductListSerializer(qs, many=True).data)

    @action(detail=False)
    def deals(self, request):
        qs = self.get_queryset().filter(discount_percent__gte=20).order_by('-discount_percent')[:12]
        return Response(ProductListSerializer(qs, many=True).data)


# ---------------------------------------------------------------------------
# REVIEW
# ---------------------------------------------------------------------------
class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        return Review.objects.filter(product_id=self.kwargs['product_pk'])

    def perform_create(self, serializer):
        product_id = self.kwargs['product_pk']
        serializer.save(user=self.request.user, product_id=product_id)


# ---------------------------------------------------------------------------
# BANNER
# ---------------------------------------------------------------------------
class BannerListView(generics.ListAPIView):
    queryset         = Banner.objects.filter(is_active=True)
    serializer_class = BannerSerializer
    permission_classes = [AllowAny]


# ---------------------------------------------------------------------------
# AUTH
# ---------------------------------------------------------------------------
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': {'id': user.id, 'username': user.username, 'email': user.email},
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass
        return Response({'detail': 'Logged out.'})


# ---------------------------------------------------------------------------
# USER PROFILE
# ---------------------------------------------------------------------------
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


# ---------------------------------------------------------------------------
# CART  (session-based, no model needed)
# ---------------------------------------------------------------------------
def get_cart(request):
    return request.session.get('cart', {})

def save_cart(request, cart):
    request.session['cart'] = cart
    request.session.modified  = True


class CartView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cart = get_cart(request)
        items = []
        total = 0
        for pid, qty in cart.items():
            try:
                p = Product.objects.get(pk=int(pid))
                subtotal = float(p.price) * qty
                total += subtotal
                items.append({
                    'product_id': p.id,
                    'name':       p.name,
                    'price':      float(p.price),
                    'image':      request.build_absolute_uri(p.image.url) if p.image else None,
                    'quantity':   qty,
                    'subtotal':   subtotal,
                    'stock':      p.stock,
                })
            except Product.DoesNotExist:
                pass
        item_count = sum(item['quantity'] for item in items)
        return Response({'items': items, 'total': round(total, 2), 'count': item_count})

    def post(self, request):
        action = request.data.get('action')
        pid    = str(request.data.get('product_id', ''))
        qty    = int(request.data.get('quantity', 1))
        cart   = get_cart(request)

        if action == 'add':
            cart[pid] = cart.get(pid, 0) + qty
        elif action == 'remove':
            cart.pop(pid, None)
        elif action == 'update':
            if qty <= 0:
                cart.pop(pid, None)
            else:
                cart[pid] = qty
        elif action == 'clear':
            cart = {}

        save_cart(request, cart)
        return Response({'detail': 'Cart updated.', 'count': sum(cart.values())})


# ---------------------------------------------------------------------------
# ORDERS
# ---------------------------------------------------------------------------
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class   = OrderSerializer
    permission_classes = [IsAuthenticated]
    http_method_names  = ['get', 'post']

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')

    def create(self, request, *args, **kwargs):
        cart = get_cart(request)
        if not cart:
            return Response({'detail': 'Cart is empty.'}, status=400)

        total = 0
        order = Order.objects.create(
            user=request.user,
            total_price=0,
            payment_method=request.data.get('payment_method', 'cod'),
            ship_name=request.data.get('name', ''),
            ship_phone=request.data.get('phone', ''),
            ship_address=request.data.get('address', ''),
            ship_city=request.data.get('city', ''),
            ship_state=request.data.get('state', ''),
            ship_pincode=request.data.get('pincode', ''),
        )
        for pid, qty in cart.items():
            try:
                p = Product.objects.get(pk=int(pid))
                OrderItem.objects.create(order=order, product=p, quantity=qty, price=p.price)
                total += float(p.price) * qty
            except Product.DoesNotExist:
                pass

        order.total_price = total
        order.subtotal    = total
        order.save()
        save_cart(request, {})
        return Response(OrderSerializer(order).data, status=201)


# ---------------------------------------------------------------------------
# WISHLIST
# ---------------------------------------------------------------------------
class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class   = WishlistSerializer
    permission_classes = [IsAuthenticated]
    http_method_names  = ['get', 'post', 'delete']

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

